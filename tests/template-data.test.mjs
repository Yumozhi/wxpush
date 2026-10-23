import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const env = { API_TOKEN:'test-token', WX_APPID:'old-app', WX_SECRET:'old-secret', WX_USERID:'user1', WX_TEMPLATE_ID:'old-template', WX_BASE_URL:'https://example.test/skin' };
async function send(input, options={}) {
  const sent=[]; const original=globalThis.fetch;
  globalThis.fetch=async (url,init)=>{
    if (url.endsWith('/stable_token')) return Response.json({access_token:'test-access'});
    const body=JSON.parse(init.body); sent.push(body);
    return Response.json(options.failSecond && body.touser==='user2' ? {errcode:1,errmsg:'test failure'} : {errcode:0,errmsg:'ok'});
  };
  try {
    const method=options.method || 'POST';
    const req=new Request('https://worker.test/wxsend'+(method==='GET'?'?'+new URLSearchParams(input):''),{
      method, headers:{'Content-Type':options.raw?'text/plain':'application/json','Authorization':options.auth ?? 'Bearer test-token'},
      ...(method==='GET'?{}:{body: options.raw ? JSON.stringify(input) : JSON.stringify(input)}),
    });
    const result=await worker.fetch(req,{...env,...options.env},{});
    return {status:result.status,response:await result.json(),sent};
  } finally {globalThis.fetch=original;}
}

test('unchanged polytope request preserves default template, recipients, title/content and detail link',async()=>{
 const r=await send({title:'Order Filled',content:'strategy: s1',base_url:'https://example.test/skin'});
 assert.equal(r.status,200);assert.equal(r.sent[0].template_id,'old-template');assert.equal(r.sent[0].touser,'user1');
 assert.deepEqual(r.sent[0].data,{title:{value:'Order Filled'},content:{value:'strategy: s1'}});
 assert.ok(r.sent[0].url.startsWith('https://example.test/skin?message='));
});
test('specified template_id plus template_data supports event/message',async()=>{
 const r=await send({title:'legacy',content:'legacy details',template_id:'new-template',template_data:{event:'止损生效',message:{value:'ADAUSDT 全仓止损',color:'#00ff00'}}});
 assert.equal(r.status,200);assert.equal(r.sent[0].template_id,'new-template');
 assert.deepEqual(r.sent[0].data,{event:{value:'止损生效'},message:{value:'ADAUSDT 全仓止损',color:'#00ff00'}});
});
test('custom-only WeChat envelope data preserves explicit template',async()=>{
 const r=await send({template_id:'new-template',data:{event:'run',message:'ready',zero:0,flag:false}});
 assert.equal(r.status,200);assert.equal(r.sent[0].template_id,'new-template');
 assert.deepEqual(r.sent[0].data,{event:{value:'run'},message:{value:'ready'},zero:{value:'0'},flag:{value:'false'}});
});
test('legacy nested data wrapper remains valid',async()=>{
 const r=await send({data:{title:'old',content:'old details'}});assert.equal(r.status,200);assert.equal(r.sent[0].data.title.value,'old');
});
test('legacy nested params and raw JSON fallback remain valid',async()=>{
 for(const raw of [false,true]) {const r=await send({params:{title:'old',content:'old details'}},{raw});assert.equal(r.status,200);assert.equal(r.sent[0].data.content.value,'old details');}
});
test('GET can pass template_data as JSON text',async()=>{
 const r=await send({token:'test-token',template_id:'get-template',template_data:JSON.stringify({event:'GET',message:'works'})},{method:'GET'});
 assert.equal(r.status,200);assert.equal(r.sent[0].template_id,'get-template');assert.equal(r.sent[0].data.event.value,'GET');
});
test('invalid custom data fails before any WeChat call',async()=>{
 for(const data of [[],{},null,{event:null},{event:{nested:'bad'}},{event:{value:'bad',color:'javascript:bad'}},'{bad',JSON.parse('{"__proto__":"bad"}')]) {
  const r=await send({title:'old',content:'details',template_data:data});assert.equal(r.status,400);assert.equal(r.sent.length,0);
 }
});
test('invalid auth does not call WeChat even with custom fields',async()=>{
 const r=await send({template_data:{event:'x'}},{auth:'Bearer wrong'});assert.equal(r.status,403);assert.equal(r.sent.length,0);
});
test('partial recipient failure keeps existing status/message but exposes counts',async()=>{
 const r=await send({title:'old',content:'details'},{env:{WX_USERID:'user1|user2'},failSecond:true});
 assert.equal(r.status,200);assert.ok(r.response.msg.startsWith('Successfully sent messages to 1'));
 assert.equal(r.response.successful,1);assert.equal(r.response.failed,1);
});

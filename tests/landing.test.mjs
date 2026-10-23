import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import worker from '../src/index.js';

const html=await readFile(new URL('../src/landing/index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function render(url){
 const nodes=new Map();
 const element=()=>({textContent:'',hidden:false,children:[],append(...items){this.children.push(...items);},replaceChildren(){this.children=[];},set innerHTML(_){throw Error('untrusted HTML assignment');}});
 const document={title:'',getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:element};
 const u=new URL(url),location={search:u.search,hash:u.hash};
 const listeners={};const window={addEventListener(name,callback){listeners[name]=callback;}};
 vm.runInNewContext(script,{document,location,window,URLSearchParams,navigator:{clipboard:{writeText:async()=>{}}}});
 return {nodes,location,listeners};
}

test('Worker skin matches the standalone HTML and needs no remote libraries',async()=>{
 const r=await worker.fetch(new Request('https://example.test/skin'),{},{});
 assert.equal(await r.text(),html);assert.equal(r.headers.get('Referrer-Policy'),'no-referrer');
 assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+href=|@import|fetch\(/i);
});
test('legacy detail URLs keep title message and date',()=>{
 const {nodes}=render('https://example.test/skin?'+new URLSearchParams({title:'Order Filled',message:'line1\nline2',date:'2026-10-23 12:22:40'}));
 assert.equal(nodes.get('heading').textContent,'Order Filled');assert.equal(nodes.get('message').textContent,'line1\nline2');
 assert.equal(nodes.get('date').hidden,false);
});
test('every template field has the same role and untrusted values stay text',()=>{
 const fields={strategy:{value:'UTC0 Short'},event:'执行结果',message:'<img src=x onerror=alert(1)>',content:'business value',title:'business title',date:'business date',zero:0,flag:false};
 const {nodes}=render('https://example.test/index.html#'+new URLSearchParams({data:JSON.stringify({title:'outer title',date:'today',template_data:fields})}));
 assert.equal(nodes.get('heading').textContent,'outer title');assert.equal(nodes.get('date').textContent,'today');
 assert.equal(nodes.get('message-section').hidden,true);
 assert.deepEqual(nodes.get('fields').children.map(r=>r.children.map(n=>n.textContent)),
  Object.entries(fields).map(([key,value])=>[key,String(typeof value==='object'?value.value:value)]));
});
test('explicit outer content wins over template data without interpreting message',()=>{
 const {nodes}=render('https://example.test/#'+new URLSearchParams({data:JSON.stringify({content:'full body',template_data:{message:'short card',event:'any'}})}));
 assert.equal(nodes.get('message').textContent,'full body');assert.equal(nodes.get('extra-section').hidden,true);
 assert.equal(nodes.get('fields').children.length,0);
});
test('hash changes can switch between content and generic fields without stale rows',()=>{
 const view=render('https://example.test/#'+new URLSearchParams({data:JSON.stringify({content:'first body',template_data:{strategy:'old'}})}));
 assert.equal(view.nodes.get('extra-section').hidden,true);
 view.location.hash='#'+new URLSearchParams({data:JSON.stringify({template_data:{event:'two',message:'new'}})});view.listeners.hashchange();
 assert.equal(view.nodes.get('heading').textContent,'消息详情');assert.equal(view.nodes.get('message-section').hidden,true);
 assert.deepEqual(view.nodes.get('fields').children.map(r=>r.children.map(n=>n.textContent)),[['event','two'],['message','new']]);
 view.location.hash='#'+new URLSearchParams({data:JSON.stringify({content:'second body'})});view.listeners.hashchange();
 assert.equal(view.nodes.get('fields').children.length,0);assert.equal(view.nodes.get('message').textContent,'second body');
});
test('direct named parameters and malformed JSON degrade without breaking the page',()=>{
 const {nodes}=render('https://example.test/?data=not-json&title=通知&symbol=ADAUSDT&token=secret');
 assert.equal(nodes.get('heading').textContent,'通知');assert.deepEqual(nodes.get('fields').children[0].children.map(n=>n.textContent),['symbol','ADAUSDT']);
});

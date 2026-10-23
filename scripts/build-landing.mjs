// Keep the Worker single-file deployment flow; the standalone HTML can also be hosted separately.
import { readFile, writeFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const html=await readFile(new URL('src/landing/index.html',root),'utf8');
const file=new URL('src/index.js',root);
const source=await readFile(file,'utf8');
const block='// BEGIN GENERATED LANDING\nconst DETAIL_HTML = '+JSON.stringify(html.split('\n'),null,2)+'.join("\\n");\n// END GENERATED LANDING';
const pattern=/\/\/ BEGIN GENERATED LANDING[\s\S]*?\/\/ END GENERATED LANDING/;
const output=pattern.test(source)?source.replace(pattern,()=>block):block+'\n\n'+source;
await writeFile(file,output);

// Bounded editorial migration. Never changes numbers, object keys, links or headings.
import fs from 'node:fs';
import ts from 'typescript';
const replacements=['docs/copyedit-replacements.json','docs/copyedit-replacements-residual.json'].flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8'))).sort((a,b)=>b.from.length-a.from.length);
const files=[
 'data/san-francisco/hope-v2-report.json','data/bay/recares-v2-narrative.json',
 'data/san-francisco/phc-v2-report.json','data/sf/fuf-v2-report.json',
 'data/san-francisco/spur-v2-narrative.json','data/san-francisco/hac-v2-narrative.json',
 'data/san-francisco/hac-v2-report.json','data/san-francisco/glide-v2-report.json',
 'data/san-francisco/nems-v2-report.json','data/bay/pacific-hearing-v2-report.json',
 'data/san-francisco/breathe-v2-narrative.json',
 'data/san-francisco/breathe-v2-sources.json','data/bay/recares-v2-sources.json',
 'data/san-francisco/hope-v2-sources.json','data/san-francisco/spur-v2-sources.json',
 'data/san-francisco/sfaf-portfolio-report.json','data/san-francisco/code-tenderloin-report.json',
 'data/bay/melp-report.json',
 ...['recares','hope','phc','fuf','spur','hac','glide','nems','pacific-hearing','breathe'].map(n=>'docs/reports/'+n+'-v2.md'),
 ...['hearing-and-speech-center','compass-family-services','hamilton-families'].map(n=>'app/charities/'+n+'/page.tsx'),
];
function copy(text){
 return text.split(/(https?:\/\/[^\s<>"\)]+|^#{1,6} .*$)/m).map((chunk,i)=>{
   if(i%2)return chunk;
   for(const {from,to} of replacements)chunk=chunk.replaceAll(from,to);
   return chunk;
 }).join('');
}
function visit(value,key='',parent={}){
 if(typeof value==='string')return /(?:url|href|id|version|key|slug)$/i.test(key)||(key==='title'&&'markdown' in parent)?value:copy(value);
 if(Array.isArray(value))return value.map(v=>visit(v,key));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,visit(v,k,value)]));
 return value;
}
let count=0;
for(const file of files){
 const old=fs.readFileSync(file,'utf8');let next;
 if(file.endsWith('.json'))next=JSON.stringify(visit(JSON.parse(old)),null,2)+'\n';
 else if(file.endsWith('.tsx')){
   const source=ts.createSourceFile(file,old,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),edits=[];
   function walk(node){
     if(ts.isStringLiteral(node)){
       const updated=copy(node.text);
       if(updated!==node.text)edits.push({start:node.getStart(source),end:node.end,value:JSON.stringify(updated)});
     }
     ts.forEachChild(node,walk);
   }
   walk(source);next=old;
   for(const e of edits.sort((a,b)=>b.start-a.start))next=next.slice(0,e.start)+e.value+next.slice(e.end);
 }else next=copy(old);
 if(next!==old){count++;if(process.argv.includes('--write'))fs.writeFileSync(file,next);console.log(file);}
}
console.log(count+' files '+(process.argv.includes('--write')?'updated':'would change'));

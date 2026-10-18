import assert from 'node:assert/strict';
import data from '../data/geography-reports.json' with {type:'json'};
import {reportPrice,formatEditionMoney} from '../lib/geography-reports.mjs';
const results=[];
await Promise.all(['https://market-for-impact.rhyslindmark.chatgpt.site','https://ai.rhyslindmark.com/givebetter'].map(async base=>{
 for(const path of ['/houston/all','/houston/charities/crisis-intervention-of-houston','/houston/charities/fort-bend-women-s-center']){
  const response=await fetch(base+path,{signal:AbortSignal.timeout(25000)});assert.equal(response.status,200);
  const html=(await response.text()).replace(/<!--[\s\S]*?-->/g,'').replaceAll('&#x27;',"'").replaceAll('&#39;',"'");
  const rows=data.reports.filter(r=>r.edition==='houston'&&(path.endsWith('/all')||path.endsWith('/'+r.slug)));
  assert.equal(rows.length,path.endsWith('/all')?14:1);
  for(const r of rows){assert.ok(html.includes(r.organization));assert.ok(html.includes(formatEditionMoney(reportPrice(r))));}
  if(!path.endsWith('/all'))assert.ok(html.includes('GPT-6.1 Sol'));
  results.push({base,path,status:response.status,pass:true});
 }
}));
console.log(JSON.stringify({verifiedAt:new Date().toISOString(),checks:results.length,results}));

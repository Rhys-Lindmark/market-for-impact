import assert from 'node:assert/strict';
import data from '../data/geography-reports.json' with {type:'json'};
import {reportPrice,researchListPrice,formatEditionMoney} from '../lib/geography-reports.mjs';
const results=[];
await Promise.all(['https://market-for-impact.rhyslindmark.chatgpt.site','https://ai.rhyslindmark.com/givebetter'].map(async base=>{
 for(const path of ['/denver/all','/denver/charities/bicycle-colorado','/denver/charities/thriving-families']){
  const response=await fetch(base+path,{signal:AbortSignal.timeout(25000)});assert.equal(response.status,200);
  const html=(await response.text()).replace(/<!--[\s\S]*?-->/g,'').replaceAll('&#x27;',"'").replaceAll('&#39;',"'").replaceAll('&amp;','&');
  const rows=data.reports.filter(r=>r.edition==='denver'&&(path.endsWith('/all')||path.endsWith('/'+r.slug)));
  assert.equal(rows.length,path.endsWith('/all')?8:1);
  for(const r of rows){assert.ok(html.includes(r.organization),r.organization);assert.ok(html.includes(formatEditionMoney(path.endsWith('/all')?researchListPrice(r):reportPrice(r))),r.slug+' price');}
  if(!path.endsWith('/all'))assert.ok(html.includes('GPT-6.1 Sol'));
  results.push({base,path,status:response.status,pass:true});
 }
 const res=await fetch(base+'/all',{signal:AbortSignal.timeout(25000)});assert.equal(res.status,200);const html=await res.text();assert.match(html,/8(?:<!-- -->)?\/25/);results.push({base,path:'/all',status:res.status,pass:true,denver:'8/25 initial · 0/10 deep'});
}));
console.log(JSON.stringify({verifiedAt:new Date().toISOString(),checks:results.length,results}));

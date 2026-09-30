import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEditionReports,reportPrice,reportsForEdition} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const data=read('data/geography-reports.json'),progress=read('docs/geography-progress.json');
validateEditionReports(data,progress);
const usa=progress.editions.find(e=>e.id==='usa');
assert.equal(usa.selectedAlphaIds.length,25);
assert.equal(usa.supplementalAlphaIds.length,3);
assert.equal(usa.alphaPublished,28);
const expected=[
 ['institute-for-progress',3079238,100000*.1*.5*.25*.1*.15*.5*.9,.003],
 ['1day-sooner',2424138,100000*.1*.5*.25*.1*.2*.5*.6,.0025],
 ['foundation-for-american-innovation',3719664,10*1*.5*2*15*.25*.1*.2,.000075]
];
for(const [slug,cost,q,low] of expected){
 const r=data.reports.find(r=>r.edition==='usa'&&r.slug===slug);
 assert.ok(r);
 assert.equal(r.stage,'alpha');
 assert.ok(Math.abs(r.model.scenarios.find(s=>s.id==='central').editionQalys-q)<1e-10);
 assert.equal(r.model.scenarios.find(s=>s.id==='low').editionQalys,low);
 assert.ok(Math.abs(reportPrice(r)-cost*10/q)<1e-6);
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 assert.equal(r.annualExpenses.length,3);
 for(const id of r.sessionIds){
  const s=data.sessions.find(s=>s.id===id);
  assert.equal(s.model.id,'gpt-6.1-sol');
  assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));
 }
}
assert.ok(reportsForEdition(data,'usa').slice(0,4).every(r=>!expected.some(([slug])=>slug===r.slug)));
console.log('USA abundance supplement, estimates, timing and unchanged top four passed.');

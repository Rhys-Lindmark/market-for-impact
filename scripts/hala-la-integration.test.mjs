import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {central,cases,calculate} from '../lib/hala-la-calibrated-model.mjs';
import {reportPrice,editionResearchEffort} from '../lib/geography-reports.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} vs ${b}`);
test('HALA report current price, 40 cases, full history and six actual sessions agree',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const r=d.reports.find(x=>x.edition==='los-angeles'&&x.slug==='hunger-action-los-angeles');
 const old=JSON.parse(fs.readFileSync(new URL('../data/los-angeles/hala-la-pre-recalibration-model.json',import.meta.url)));
 assert.deepEqual(r.historicalModel,old.model);
 assert.equal(r.model.scenarios.length,41);
 for(const [id,v] of Object.entries(cases)){
  const p={...central,...v},o=calculate(p),s=r.model.scenarios.find(x=>x.id===id);
  assert.deepEqual(s.parameters,p);assert.deepEqual(s.nativeOutputs,o);
  if(o.resourcesLocal===null)assert.equal(s.incomeUnknown,true);
  else close(s.incomePathways.reduce((q,f)=>q+incomeHealthyYearEquivalent(f),0),o.resourcesLocal);
 }
 close(reportPrice(r),10050431.271134442);
 assert.equal(r.sessionIds.length,6);assert.equal(new Set(r.sessionIds).size,6);
 const label=editionResearchEffort(d,r).label;
 for(const text of ['16 min on GPT-6 Astra Medium','10 min on GPT-6.1 Sol'])assert.ok(label.includes(text),label);
 const registry=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url)));
 assert.deepEqual(registry.organizations[r.organizationId].sessions,r.sessionIds.map(id=>d.sessions.find(s=>s.id===id)));
});

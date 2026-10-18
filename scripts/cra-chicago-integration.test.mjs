import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {central,cases,calculate} from '../lib/cra-chicago-calibrated-model.mjs';
import {reportPrice,editionResearchEffort} from '../lib/geography-reports.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} vs ${b}`);
test('CRA report reflects all43 current cases, full16 history and eight actual sessions',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const r=d.reports.find(x=>x.edition==='chicago'&&x.slug==='chicago-recovery-alliance');
 const old=JSON.parse(fs.readFileSync(new URL('../data/chicago/cra-pre-recalibration-model.json',import.meta.url)));
 assert.deepEqual(r.historicalModel,old.model);assert.equal(r.model.scenarios.length,44);
 assert.deepEqual(r.annualExpenses.map(y=>[y.year,y.amount,y.sourceId,y.comparable]),[[2022,1642030,'audit2022',true],[2023,2385530,'audit2023',true],[2024,3908692,'audit24',false]]);
 for(const [id,v] of Object.entries(cases)){
  const p={...central,...v},o=calculate(p),s=r.model.scenarios.find(x=>x.id===id);
  assert.deepEqual(s.parameters,p);assert.deepEqual(s.nativeOutputs,o);
  if(o.resourcesLocal===null)assert.equal(s.incomeUnknown,true);
  else close(s.incomePathways.reduce((q,f)=>q+incomeHealthyYearEquivalent(f),0),o.resourcesLocal);
 }
 close(reportPrice(r),2637009.4823574596);
 assert.equal(r.summary.what.length,3);assert.equal(r.summary.strengths.length,3);assert.equal(r.summary.reservations.length,3);
 assert.ok(r.sections.cost.includes('$2.64 million'));assert.ok(r.sections.cost.includes('−$3.83'));
 assert.ok(r.sections.funding.includes('current 35% funding-response'));assert.ok(!r.sections.funding.includes('The 50% funding-response'));
 assert.equal(r.sessionIds.length,8);assert.equal(new Set(r.sessionIds).size,8);
 const label=editionResearchEffort(d,r).label;
 for(const text of ['5 min on GPT-6 Astra Light','37 min on GPT-6 Astra Medium','13 min on GPT-6.1 Sol'])assert.ok(label.includes(text),label);
 const registry=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url)));
 assert.deepEqual(registry.organizations[r.organizationId].sessions,r.sessionIds.map(id=>d.sessions.find(s=>s.id===id)));
});

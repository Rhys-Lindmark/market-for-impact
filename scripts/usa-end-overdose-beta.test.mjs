import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage,editionResearchEffort} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const r=data.reports.find(r=>r.edition==='usa'&&r.slug==='end-overdose');
test('USA deep review reproduces finite delivery and survivor scenarios',()=>{
 for(const s of r.historicalModel.scenarios.filter(s=>s.parameters)){
  const p=s.parameters;let survival=1,life=0;
  for(let y=1;y<=p.T;y++){const next=survival*(1-(y===1?p.m1:p.m));life+=p.u*(survival+next)/2/1.03**(y-.5+p.delay);survival=next;}
  const delivered=p.G*p.a/p.c*p.b*p.q;
  const administrations=delivered*p.e*p.k*p.t*p.d;
  const all=administrations*(p.f*life-p.h);
  assert.ok(Math.abs(all-s.allPopulationQalys)<1e-10,s.id);
  assert.ok(Math.abs(all*p.g-s.editionQalys)<1e-10,s.id);
  assert.equal(s.nativeOutputs.delivered,delivered);
  assert.equal(s.nativeOutputs.doses,2*delivered);
 }
 const historical={...r,model:r.historicalModel};
 assert.ok(Math.abs(reportPrice(historical)-1759484.5799377698)<1e-6);
 assert.equal(r.historicalModel.scenarios.find(s=>s.id==='no-additionality').editionQalys,0);
 assert.ok(r.historicalModel.scenarios.find(s=>s.id==='harm-only').editionQalys<0);
 assert.match(r.priceScope,/full donation/);
 assert.ok(Math.abs(expenseAverage(r)-809773.6666666666)<1e-6);
});
test('USA deep-review provenance retains Light and Medium separately',()=>{
 assert.equal(r.stage,'beta');assert.equal(r.sessionIds.length,8);
 const sessions=data.sessions.filter(s=>r.sessionIds.includes(s.id)&&s.model.id!=='gpt-6.1-sol');
 assert.deepEqual(sessions.map(s=>s.model.reasoningEffort).sort(),['low','medium']);
 assert.equal(sessions.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0),2820);
 const label=editionResearchEffort(data,r).label;
 assert.match(label,/7 min on GPT-6 Astra Light/);
 assert.match(label,/40 min on GPT-6 Astra Medium/);
 assert.match(label,/5 min on GPT-6.1 Sol/);
});

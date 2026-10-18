import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,definitions} from '../docs/geography-discovery/nyc-wang-held-batch-20261005/wang-model.mjs';
import {validateEditionReports,reportPrice,scenarioIncomeEquivalent} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const path='docs/geography-discovery/nyc-wang-held-batch-20261005/';
test('held Wang packet preserves historical evidence and signed health/income contract',()=>{
 const held=read(path+'wang-accepted-report.json'),initial=read(path+'wang-initial-diagnostic.json');
 assert.deepEqual(held.model.historicalAlphaModel,initial.model);
 assert.deepEqual(held.historical.historicalAlphaScenarioOutputs,initial.model.scenarios);
 assert.equal(reportPrice(held),24342393.233082708);
 for(const [id,,overrides] of definitions){
  const s=held.model.scenarios.find(x=>x.id===id),x=calculate(overrides);
  assert.equal(s.editionQalys,x.editionHealthQalys);
  if(s.incomeUnknown)assert.equal(scenarioIncomeEquivalent(s),null);
  else assert.ok(Math.abs(scenarioIncomeEquivalent(s)-x.editionIncomeHealthyYears)<1e-11);
 }
 assert.equal(held.model.scenarios.find(s=>s.id==='financial-only').editionQalys,0);
 assert.ok(scenarioIncomeEquivalent(held.model.scenarios.find(s=>s.id==='financial-only'))>0);
 assert.ok(scenarioIncomeEquivalent(held.model.scenarios.find(s=>s.id==='financial-downside'))<0);
 const data=read('data/geography-reports.json'),progress=read('docs/geography-progress.json');
 const old=data.reports.find(r=>r.organizationId===held.organizationId&&r.edition===held.edition);
 if(old.stage==='alpha'){
  assert.deepEqual(old.model,initial.model);
  data.reports[data.reports.indexOf(old)]=held;
  data.sessions.push(...read(path+'wang-sessions.json'));
  const e=progress.editions.find(e=>e.id===held.edition);e.betaIds.push(held.organizationId);e.betaAcceptedPublished++;
 }else{assert.deepEqual(old.model,held.model);}
 validateEditionReports(data,progress);
 const sessions=read(path+'wang-sessions.json');
 assert.equal(new Set(sessions.map(s=>s.id)).size,3);
 assert.ok(sessions.every(s=>s.endedAt&&s.model.id==='gpt-6.1-sol'));
 assert.ok(sessions.every(s=>!s.evidence.startsWith('/private/')));
});

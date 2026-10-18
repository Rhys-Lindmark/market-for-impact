import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {scenarios} from '../docs/geography-discovery/nyc-onpoint-held-batch-20261005/model.mjs';
import {reportPrice,scenarioIncomeEquivalent,formatEditionSensitivity,validateEditionReports} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const dir='docs/geography-discovery/nyc-onpoint-held-batch-20261005/';
test('held OnPoint packet keeps complete history and combined sensitivity prices',()=>{
 const r=read(dir+'report.json'),initial=read(dir+'initial-diagnostic.json');
 assert.deepEqual(r.model.historicalAlphaModel,initial.report.model);
 assert.deepEqual(r.historical.scenarios,initial.report.model.scenarios);
 assert.deepEqual(r.historical.sensitivity,initial.report.model.sensitivity);
 assert.ok(Math.abs(reportPrice(r)-29433332.807810593)<1e-6);
 for(const expected of scenarios()){
  const s=r.model.scenarios.find(s=>s.id===expected.id);
  assert.equal(s.editionQalys,expected.editionQalys);
  const income=scenarioIncomeEquivalent(s);
  if(expected.incomeUnknown)assert.equal(income,null);
  else assert.ok(Math.abs(income-expected.incomeEquivalentHealthyYears)<1e-10);
  if(s.id!=='central'){
   const sensitivity=r.model.sensitivity.find(x=>x.id===s.id);
   assert.equal(sensitivity.pricePer10Qalys,expected.pricePer10WelfareEquivalent);
  }
 }
 const financial=r.model.scenarios.find(s=>s.id==='clinical-null');assert.equal(financial.editionQalys,0);assert.ok(scenarioIncomeEquivalent(financial)>0);
 assert.ok(!formatEditionSensitivity(r.model.sensitivity.find(s=>s.id===financial.id)).includes('no finite positive'));
 assert.equal(r.summary.what.length,3);assert.ok(r.summary.what.every(s=>!s.includes('million')));
 const data=read('data/geography-reports.json'),progress=read('docs/geography-progress.json');
 const old=data.reports.find(x=>x.edition===r.edition&&x.organizationId===r.organizationId);
 if(old.stage==='alpha'){
  assert.deepEqual(old.model,initial.report.model);
  data.reports[data.reports.indexOf(old)]=r;data.sessions.push(...read(dir+'sessions.json'));
  const e=progress.editions.find(e=>e.id===r.edition);e.betaIds.push(r.organizationId);e.betaAcceptedPublished++;
 }else assert.deepEqual(old.model,r.model);
 validateEditionReports(data,progress);
 const sessions=read(dir+'sessions.json');assert.equal(sessions.length,3);
 assert.ok(sessions.every(s=>s.endedAt&&s.model.id==='gpt-6.1-sol'));
 assert.ok(!r.sessionIds.includes('8acc30f1-a664-4418-aaae-ca363e822a5b'));
});

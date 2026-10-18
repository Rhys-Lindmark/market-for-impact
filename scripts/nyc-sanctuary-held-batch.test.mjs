import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selftest,calculate,specs} from '../docs/geography-discovery/nyc-sanctuary-held-batch-20261005/model.mjs';
import {reportPrice,validateEditionReports} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const dir='docs/geography-discovery/nyc-sanctuary-held-batch-20261005/';
test('Sanctuary preserves complete initial model and signed financial burdens',()=>{
 const r=read(dir+'report.json'),initial=read(dir+'initial-diagnostic.json');
 assert.deepEqual(r.model.historicalAlphaModel,initial.report.model);
 assert.deepEqual(r.historical.historicalAlphaScenarioOutputs,initial.report.model.scenarios);
 assert.deepEqual(r.historical.historicalAlphaSensitivities,initial.report.model.sensitivity);
 selftest(r,initial);assert.equal(reportPrice(r),207106665.84292608);
 const full=calculate(specs.find(s=>s.id==='full-resource-cost'));assert.ok(full.pricePer10Qalys>reportPrice(r));
 const reg=read('data/geography-reports.json'),progress=read('docs/geography-progress.json');
 const old=reg.reports.find(x=>x.edition===r.edition&&x.organizationId===r.organizationId);
 if(old.stage==='alpha'){
  assert.deepEqual(old.model,initial.report.model);
  reg.reports[reg.reports.indexOf(old)]=r;reg.sessions.push(...read(dir+'sessions.json'));
  const e=progress.editions.find(e=>e.id===r.edition);e.betaIds.push(r.organizationId);e.betaAcceptedPublished++;
 }else assert.deepEqual(old.model,r.model);
 validateEditionReports(reg,progress);
});

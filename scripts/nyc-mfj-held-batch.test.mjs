import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,scenarioIncomeEquivalent,validateEditionReports} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const dir='docs/geography-discovery/nyc-mfj-held-batch-20261005/';
test('MFJ accepted held packet preserves complete history and signed recipient welfare',()=>{
 const r=read(dir+'report.json'),old=read(dir+'initial-diagnostic.json');
 assert.deepEqual(r.model.historicalAlphaModel,old.report.model);
 assert.deepEqual(r.historical.report,old.report);assert.deepEqual(r.historical.sessions,old.sessions);
 assert.equal(r.summary.what.length,3);assert.ok(r.summary.what.every(s=>!s.includes('million')));
 const c=r.model.scenarios.find(s=>s.id==='central');
 assert.equal(c.editionQalys,old.report.model.scenarios[0].editionQalys);
 assert.ok(scenarioIncomeEquivalent(c)<0);assert.ok(Math.abs(reportPrice(r)-44104947.263534434)<1e-6);
 assert.match(r.model.welfarePerimeter.counterpartyWelfare,/Unknown signed/);
 assert.match(r.model.welfarePerimeter.delayPopulation,/not the same fixed/);
 assert.deepEqual(r.model.scenarios.find(s=>s.id==='clinical-null').incomePathways,c.incomePathways);
 const registry=read('data/geography-reports.json'),progress=read('docs/geography-progress.json');
 for(const packetDir of [dir,'docs/geography-discovery/nyc-onpoint-held-batch-20261005/']){
  const packet=read(packetDir+'integration-packet.json'),nr=packet.acceptedReports[0];
  const index=registry.reports.findIndex(x=>x.organizationId===nr.organizationId&&x.edition===nr.edition);
  registry.reports[index]=nr;
  for(const s of packet.sessions)if(!registry.sessions.some(x=>x.id===s.id))registry.sessions.push(s);
  const e=progress.editions.find(e=>e.id===nr.edition);if(!e.betaIds.includes(nr.organizationId))e.betaIds.push(nr.organizationId);
  e.betaAcceptedPublished=registry.reports.filter(x=>x.edition===nr.edition&&x.stage==='beta').length;
 }
 validateEditionReports(registry,progress);
 const e=progress.editions.find(e=>e.id==='new-york-city');assert.ok(e.betaAcceptedPublished>=9);
 const ss=read(dir+'sessions.json');assert.equal(ss.length,4);assert.ok(ss.every(s=>s.endedAt&&s.model.id==='gpt-6.1-sol'));
});

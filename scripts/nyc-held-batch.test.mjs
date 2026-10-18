import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEditionReports,reportPrice,editionResearchEffort} from '../lib/geography-reports.mjs';
import {scenarios} from '../docs/geography-discovery/nyc-deep-batch-20261005/sachr-model.mjs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));
const batch='docs/geography-discovery/nyc-deep-batch-20261005/';
test('Accepted SACHR packet passes virtual or integrated publication with exact provenance',()=>{
 const data=read('data/geography-reports.json'),progress=read('docs/geography-progress.json');
 const report=read(batch+'sachr-accepted-report.json');
 const nyc=progress.editions.find(e=>e.id==='new-york-city');
 const publicReport=data.reports.find(r=>r.edition===report.edition&&r.slug===report.slug);
 assert.ok(['alpha','beta'].includes(publicReport.stage));
 assert.equal(report.stage,'beta');
 assert.equal(report.acceptance.status,'accepted');
 assert.deepEqual(report.model.scenarios.filter(s=>!s.id.startsWith('historical-alpha-')),scenarios());
 assert.deepEqual(report.model.historicalAlphaModel,read('data/new-york-city/sachr-pre-beta-model-20261005.json'));
 const author=read(batch+'sachr-author-sessions.json').sessions;
 const audit=read('docs/geography-discovery/nyc-sachr-root-source-audit-20261005.json').session;
 Object.assign(audit,{edition:report.edition,stage:'beta',organizationId:report.organizationId});
 audit.model.evidence='User-confirmed model assignment for current work; raw runtime identity not independently verified';
 if(publicReport.stage==='alpha'){
  data.sessions.push(...author,audit);
  data.reports[data.reports.indexOf(publicReport)]=report;
  nyc.betaIds.push(report.organizationId);nyc.betaAcceptedPublished++;
 }else{
  assert.deepEqual(publicReport.model,report.model);
  assert.ok(nyc.betaIds.includes(report.organizationId));
  for(const s of [...author,audit])assert.equal(data.sessions.filter(x=>x.id===s.id).length,1);
 }
 validateEditionReports(data,progress);
 assert.ok(Math.abs(reportPrice(report)-22327983.69610787)<.01);
 const newMinutes=[...author,audit].reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/60000,0);
 assert.ok(Math.abs(newMinutes-15.169783333333333)<1e-10);
 assert.match(editionResearchEffort(data,report).label,/min on GPT-6.1 Sol/);
});

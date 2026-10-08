import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,validateEditionReports} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const dir='docs/geography-discovery/nyc-glwd-beta-20261005/';
test('GLWD current acceptance preserves null, signed burdens, complete history and model clocks',()=>{
 const r=read(dir+'report.json'),old=read(dir+'initial-diagnostic.json');
 assert.equal(r.acceptance.status,'accepted');assert.deepEqual(r.historical.report,old.report);assert.deepEqual(r.historical.sessions,old.sessions);assert.deepEqual(r.model.historicalAlphaModel,old.report.model);
 const c=r.model.scenarios.find(s=>s.id==='central');assert.ok(Math.abs(reportPrice(r)-41079886.481353484)<1e-6);
 const n=r.model.scenarios.find(s=>s.id==='clinical-null');assert.equal(n.editionQalys,0);assert.deepEqual(n.incomePathways,c.incomePathways);
 const zero=r.model.scenarios.find(s=>s.id==='consumption-zero');assert.equal(zero.editionQalys,0);assert.ok(zero.incomeEquivalentHealthyYears<0);assert.equal(zero.pricePer10Qalys,null);
 const overlap=r.model.scenarios.find(s=>s.id==='complete-overlap');assert.ok(overlap.incomeEquivalentHealthyYears<0);
 const data=read('data/geography-reports.json'),p=read('docs/geography-progress.json');validateEditionReports(data,p);
 assert.equal(p.editions.find(e=>e.id==='new-york-city').betaAcceptedPublished,10);
 for(const id of r.sessionIds){const s=data.sessions.find(s=>s.id===id);assert.ok(s.endedAt);assert.equal(s.organizationId,r.organizationId);}
 const fy25=r.annualExpenses.find(x=>x.year===2025);assert.equal(fy25.amount,51256141);assert.equal(fy25.comparable,false);assert.match(fy25.accountingBasis,/excludes depreciation/);
});

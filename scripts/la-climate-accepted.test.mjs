import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateEditionReports,reportPrice,scenarioIncomeEquivalent} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
test('Climate Resolve preserves initial diagnostics, signed resource costs and actual author intervals',()=>{
 const d=read('data/geography-reports.json'),p=read('docs/geography-progress.json'),r=d.reports.find(x=>x.edition==='los-angeles'&&x.slug==='climate-resolve');
 assert.deepEqual(r,read('docs/geography-discovery/la-climate-accepted-packet-20261005.json').acceptedReports[0]);
 assert.deepEqual(r.model.historicalAlphaModel,read(r.historical.initialReport).report.model);
 assert.ok(Math.abs(reportPrice(r)-22867008.06294294)<1e-6);
 const cases=Object.fromEntries(r.model.scenarios.map(x=>[x.id,x]));
 assert.ok(scenarioIncomeEquivalent(cases.central)<0);assert.equal(cases['clinical-null'].editionQalys,0);assert.equal(cases['clinical-null'].costPer10Qalys,null);
 assert.ok(cases['failed-expansion-induced-loss'].incomeEquivalentYears<0);
 assert.equal(cases['upfront-capital'].incomePathways[1].annualIncomeGainUSD,-1900);
 assert.equal(cases['upfront-with-catchup-relief'].incomePathways[4].delayYears,4);
 assert.ok(r.sections.cost.includes('unknown and unpriced'));assert.doesNotMatch(r.sections.cost,/\d(?:million|finite|utility|years)/);
 assert.equal(r.timeCoverage,'partial');assert.ok(r.sessionIds.includes('3a4cc668-e1c8-4f7c-a875-bd0f9468b407'));
 validateEditionReports(d,p);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,central,diagnostics} from '../lib/csbha-ca-calibrated-model.mjs';
import {scenarioIncomeEquivalent,reportPrice,researchListPrice,expenseAverage} from '../lib/geography-reports.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const geo=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const r=geo.reports.find(x=>x.edition==='california'&&x.slug==='california-school-based-health-alliance');
test('independent accepted central and finite additional-course chain reproduce',()=>{
 near(central.price10,111720543.62069258);near(central.healthYears,.007874208579798939);near(central.incomeYears,.0010766966663762394);
 near(central.initiated,2.100546018447335);near(central.completed,1.4703822129131343);near(central.added+central.relocated,central.completed);
 near(central.combinedYears,central.healthYears+central.incomeYears);assert.equal(central.completePortfolioPrice10,null);assert.equal(central.identifiedDonorPrice10,null);
});
test('all serialized diagnostics match signed health and household-resource calculator',()=>{
 for(const[id,z]of Object.entries(diagnostics())){const s=r.model.scenarios.find(x=>x.id===id);assert.ok(s,id);z.healthYears===null?assert.equal(s.editionQalys,null):near(s.editionQalys,z.healthYears);z.incomeYears===null?assert.equal(scenarioIncomeEquivalent(s),null):near(scenarioIncomeEquivalent(s),z.incomeYears);z.price10===null?assert.equal(s.costPer10Qalys,null):near(s.costPer10Qalys,z.price10);}
 near(reportPrice(r),central.price10);near(researchListPrice(r),central.price10);near(expenseAverage(r),2091817);
 const old=r.model.scenarios.find(x=>x.id==='historical-alpha-central');near(10*old.costUSD/old.editionQalys,26853571.42857143);
});
test('zeroes, signed harms, unknowns and independent horizons stay distinct',()=>{
 assert.equal(calculate({fundingResponse:0}).combinedYears,0);assert.ok(calculate({completion:0}).combinedYears<0);
 assert.ok(calculate({fundingResponse:0,independentHealthHarm:.005,independentCashHarm:500}).combinedYears<0);
 for(const key of ['healthUnknown','incomeUnknown'])assert.equal(calculate({[key]:true}).price10,null);
 const longer=calculate({healthDays:224});near(longer.incomeYears,central.incomeYears);
 near(calculate({resourceYears:.5}).healthYears,central.healthYears);
 assert.ok(calculate({overlap:1}).healthYears<0);assert.ok(calculate({withActivation:.4}).combinedYears<0);
});
test('strict override domain rejects inherited keys and nonfinite parameters',()=>{
 for(const o of [null,[],{constructor:1},{toString:1},{foo:1},{gift:0},{withActivation:1.1},{healthDays:Infinity}])assert.throws(()=>calculate(o));
});
test('closed intervals imported once; historical sessions and model preserved',()=>{
 const effort=JSON.parse(readFileSync(new URL('../data/research-effort.json',import.meta.url)));
 const author=JSON.parse(readFileSync(new URL('../docs/geography-discovery/csbha-ca-recalibration-2026-10-02.closed.json',import.meta.url)));
 const root=JSON.parse(readFileSync(new URL('../docs/geography-discovery/csbha-ca-root-clinical-source-2026-10-02.closed.json',import.meta.url)));
 let seconds=0;for(const s of [...author.sessions,root.session]){assert.equal(r.sessionIds.filter(x=>x===s.id).length,1);for(const list of [geo.sessions,effort.organizations[r.organization].sessions]){const found=list.filter(x=>x.id===s.id);assert.equal(found.length,1);assert.equal(found[0].startedAt,s.startedAt);assert.equal(found[0].endedAt,s.endedAt);assert.match(found[0].model.evidence,/user-confirmed model assignment/i);assert.doesNotMatch(found[0].evidence,/private\/tmp/);}seconds+=(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000;}near(seconds,735.518);
 assert.equal(r.historicalModel.version,'ca-school-alliance-bottleneck-beta-v3');assert.equal(r.model.scenarios.find(x=>x.id==='portfolio').editionQalys,null);
 assert.match(r.sections.cost,/not a quoted donation purchase or a complete-portfolio return/);
});

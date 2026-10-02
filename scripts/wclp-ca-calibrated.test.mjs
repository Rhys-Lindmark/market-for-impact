import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,diagnostics} from '../lib/wclp-ca-calibrated-model.mjs';
import {readFileSync} from 'node:fs';
import {reportPrice,scenarioIncomeEquivalent} from '../lib/geography-reports.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Annual TA central independently reconstructs named output, finite health and household resources',()=>{
 const r=calculate();const n=1208*(2154071/7409717)*.25*5*(.8-.6);
 const f=(90/365)/1.03**(90/365/2);
 near(r.additionalHouseholds,n);near(r.healthYears,n*.05*f);
 near(r.incomeEquivalentYears,.5*n*Math.log(1+569/(9214*2.91))*f);
 near(r.price10,54391316.714552514);assert.equal(r.costUSD,7097648);
});
test('Household resources improve the estimate without reusing public medical spending',()=>{
 const both=calculate(),health=calculate({annualNetResources:0}),income=calculate({healthPerYear:0});
 near(both.totalEquivalentYears,health.healthYears+income.incomeEquivalentYears);
 assert.ok(both.price10<health.price10);assert.ok(income.incomeEquivalentYears>0);
});
test('Replacement and no incremental resolution preserve costs without creating benefits',()=>{
 for(const i of [{replacement:1},{withResolution:.6},{coverageDays:0},{responses:0}]){
  const r=calculate(i);assert.equal(r.totalEquivalentYears,0);assert.equal(r.price10,null);assert.equal(r.costUSD,7097648);
 }
});
test('Signed harms survive full overlap and failed access',()=>{
 const adverse=calculate({healthPerYear:-.01,annualNetResources:-569,overlap:1});
 assert.ok(adverse.healthYears<0&&adverse.incomeEquivalentYears<0);assert.equal(adverse.price10,null);
 const loss=calculate({withResolution:.6,burdenHouseholds:1,oneOffBurden:50});
 assert.ok(loss.incomeEquivalentYears<0);assert.equal(loss.price10,null);
 assert.ok(calculate({withResolution:.5}).totalEquivalentYears<0);
 assert.ok(calculate({overlap:1,independentHealthHarm:1}).healthYears<0);
});
test('Annual resource flow has fractional exposure once and separate cost timing',()=>{
 const r=calculate({coverageDays:365,delay:.5});
 near(r.flowDiscount,1/1.03);assert.equal(r.costUSD,7097648);
 assert.ok(calculate({delay:.5}).price10>calculate().price10);
});
test('Every bounded scenario is finite; invalid inputs reject rather than silently clamp',()=>{
 for(const r of Object.values(diagnostics()))for(const[k,v]of Object.entries(r))if(typeof v==='number')assert.ok(Number.isFinite(v),k);
 for(const i of [{annualCost:0},{annualCost:-1},{responses:-1},{uniqueAdults:-1},{coverageDays:366},{discount:-1},{annualNetResources:-26812.74},{withResolution:1.1},{overlap:2},{oneOffBurden:26812.74},{healthPerYear:Infinity},{unknown:1}])assert.throws(()=>calculate(i));
});
test('All current registry cases reproduce independent health and income ledgers',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const r=d.reports.find(r=>r.edition==='california'&&r.slug==='western-center-on-law-and-poverty');
 for(const[id,result]of Object.entries(diagnostics())){
  const s=r.model.scenarios.find(s=>s.id===id);assert.ok(s,id);
  near(s.editionQalys,result.healthYears);near(scenarioIncomeEquivalent(s),result.incomeEquivalentYears);
  if(result.price10===null)assert.equal(s.costPer10Qalys,null);else near(s.costPer10Qalys,result.price10);
 }
 near(reportPrice(r),calculate().price10);
 assert.equal(r.model.scenarios.find(s=>s.id==='historical-alpha-central').incomePathways.length,0);
});
test('Focused provenance excludes overlapping clock envelope and preserves historical sessions',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const r=d.reports.find(r=>r.edition==='california'&&r.slug==='western-center-on-law-and-poverty');
 const fresh=d.sessions.filter(s=>r.sessionIds.includes(s.id)&&s.startedAt.startsWith('2026-10-02'));
 near(fresh.reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0),753.842);
 assert.equal(fresh.length,4);assert.ok(fresh.every(s=>s.model.id==='gpt-6.1-sol'));
 assert.ok(r.sessionIds.includes('ca-wclp-alpha-20260913-213351'));
 assert.ok(!fresh.some(s=>s.startedAt.includes('09:05:18')));
});

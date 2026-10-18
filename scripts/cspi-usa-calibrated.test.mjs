import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,cases,results,tests} from '../lib/cspi-usa-calibrated-model.mjs';
import {readFileSync} from 'node:fs';
import {scenarioIncomeEquivalent,reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('CSPI independent finite health and signed resource reconstruction matches',()=>{
 const c=calculate();
 near(c.healthYears,.09149462556827334);near(c.medicalWorkIncome,.0000455238257793144);
 near(c.foodIncome,-.0026824595313028605);near(c.price10,1125395.001315707);
 near(c.combinedYears,c.healthYears+c.incomeYears);
 assert.equal(c.completePortfolioPrice10,null);assert.equal(c.identifiedDonorPrice10,null);
});
test('all 54 diagnostic cases execute and strict signed/unknown guards pass',()=>{
 assert.equal(tests(),'26 assertions passed');
 assert.equal(Object.keys(cases).length,54);
 for(const o of Object.values(cases)) assert.doesNotThrow(()=>calculate(o));
 for(const o of [{withProbability:.25,independentHealthHarm:.1},{capacityWorkYears:0,independentCashHarm:500}]){
  assert.ok(calculate(o).combinedYears<0);
 }
 assert.equal(calculate({incomeUnknown:true}).price10,null);
});
test('one-off resources use their own exposure timing, not clinical utility or repeated cash',()=>{
 const c=calculate();
 near(calculate({healthSign:0}).incomeYears,c.incomeYears);
 near(calculate({resourceYears:.5}).healthYears,c.healthYears);
 near(calculate({caseHorizon:10}).healthYears,c.healthYears);
 assert.ok(calculate({consumedSodium:0}).incomeYears<0);
 near(results().meanExpense,(18005982+17289504+17926322)/3);
});

test('all serialized diagnostics match the calculator and preserve the original price',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const r=d.reports.find(r=>r.edition==='usa'&&r.slug==='center-for-science-in-the-public-interest');
 for(const[id,o]of Object.entries(cases)){
  const z=calculate(o),s=r.model.scenarios.find(s=>s.id===id);assert.ok(s,id);
  z.healthYears===null?assert.equal(s.editionQalys,null):near(s.editionQalys,z.healthYears);
  z.incomeYears===null?assert.equal(scenarioIncomeEquivalent(s),null):near(scenarioIncomeEquivalent(s),z.incomeYears);
  z.price10===null?assert.equal(s.costPer10Qalys,null):near(s.costPer10Qalys,z.price10);
 }
 near(reportPrice(r),calculate().price10);near(researchListPrice(r),calculate().price10);
 assert.equal(r.historicalModel.version,'usa-cspi-sodium-partial-health-beta-v2');
 const old=r.model.scenarios.find(s=>s.id==='historical-alpha-central');near(10*old.costUSD/old.editionQalys,484088.1877269368);
});

test('actual source/model intervals are imported once with original endpoints',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const r=d.reports.find(r=>r.edition==='usa'&&r.slug==='center-for-science-in-the-public-interest');
 const effort=JSON.parse(readFileSync(new URL('../data/research-effort.json',import.meta.url)));
 const a=JSON.parse(readFileSync(new URL('../docs/geography-discovery/cspi-usa-recalibration-2026-10-02.closed.json',import.meta.url)));
 const b=JSON.parse(readFileSync(new URL('../docs/geography-discovery/cspi-usa-root-primary-2026-10-02.closed.json',import.meta.url)));
 let seconds=0;for(const s of [...a.sessions,b.session]){
  assert.equal(r.sessionIds.filter(id=>id===s.id).length,1);
  for(const list of [d.sessions,effort.organizations[r.organization].sessions]){
   const matches=list.filter(x=>x.id===s.id);assert.equal(matches.length,1);
   assert.equal(matches[0].startedAt,s.startedAt);assert.equal(matches[0].endedAt,s.endedAt);
   assert.match(matches[0].model.evidence,/user-confirmed model assignment/i);
  }
  seconds+=(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000;
 }
 near(seconds,511.098);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,cases,results,tests} from '../lib/cspi-usa-calibrated-model.mjs';
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

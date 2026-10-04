import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,runSelfTests,netConsumption,incomePriors} from '../lib/heppac-legacy-current.mjs';
import {calculate as historical} from '../lib/heppac-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)));
test('HEPPAC current candidate retains complete historical health and explicit unknowns',()=>{
 const r=calculate();assert.deepEqual(r.healthOnly,historical());
 assert.equal(r.measuredWholeGiftExpectedValue,null);
 assert.equal(r.conditionalOrdinaryGiftWeighted.completeGrossResourceCostUSD,null);
 near(r.conditionalOrdinaryGiftWeighted.bayDonorPer10HealthyYearEquivalent,7988917.899119561);
 assert.equal(runSelfTests().checks,47);
});
test('HEPPAC positive-only overlap never hides signed household costs',()=>{
 near(netConsumption(incomePriors[1]),45);
 near(netConsumption(incomePriors[1],{positiveIncomeIndependentScale:0}),-90);
 near(netConsumption(incomePriors[0]),-180);
 const r=calculate({positiveIncomeIndependentScale:0});
 assert.ok(r.rows.every(x=>x.annualIncomeHealthyYearEquivalent<0));
 assert.ok(r.conditionalOrdinaryGiftWeighted.bayDonorPer10HealthyYearEquivalent>historical().conditionalOrdinaryGiftWeighted.bayDonorPer10Qaly);
});
test('HEPPAC one annual cohort, finite delay and adverse cases remain inspectable',()=>{
 const r=calculate(),half=calculate({giftUSD:50000});
 near(half.conditionalOrdinaryGiftWeighted.weightedGiftCombinedHealthyYearEquivalent,r.conditionalOrdinaryGiftWeighted.weightedGiftCombinedHealthyYearEquivalent/2);
 near(half.conditionalOrdinaryGiftWeighted.bayDonorPer10HealthyYearEquivalent,r.conditionalOrdinaryGiftWeighted.bayDonorPer10HealthyYearEquivalent);
 assert.ok(calculate({healthDelayYears:5}).conditionalOrdinaryGiftWeighted.weightedGiftHealthQaly<r.conditionalOrdinaryGiftWeighted.weightedGiftHealthQaly);
 assert.equal(calculate({healthMultiplier:-1,incomeScale:0}).conditionalOrdinaryGiftWeighted.donorPer10HealthyYearEquivalent,null);
});
test('HEPPAC mortality overlap never attenuates adverse channels or independent harms',()=>{
 const r=calculate({healthOptions:{rescueIncrement:-1},incomeScale:0});
 for(const row of r.rows){
  const h=r.healthOnly.results.find(x=>x.name===row.name);
  const q=h.pathwayQalyRaw;
  const expected=[q.naloxone,q.moud,q.drugChecking].reduce((sum,v)=>sum+(v>0?v*h.inputs.mortalityOverlapAdjustment:v),0)+q.syringe-h.independentHarmQaly;
  near(row.annualHealthQaly,expected);
 }
 const noPositive=calculate({healthOptions:{rescueIncrement:-1,harmPerPerson:0.01},incomeScale:0,mortalityPositiveOverlapScale:0});
 for(const row of noPositive.rows){
  const h=noPositive.healthOnly.results.find(x=>x.name===row.name);
  near(row.annualHealthQaly,Math.min(0,h.pathwayQalyRaw.naloxone)+Math.min(0,h.pathwayQalyRaw.moud)+Math.min(0,h.pathwayQalyRaw.drugChecking)+h.pathwayQalyRaw.syringe-h.independentHarmQaly);
 }
 assert.ok(calculate({healthMultiplier:0,healthOptions:{harmPerPerson:0.01},incomeScale:0}).rows.every(x=>x.annualHealthQaly<0));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {central,calculate,resourceFlows,scenarios} from '../lib/bvmi-nyc-calibrated-model.mjs';
import {calculate as proposal} from '../docs/geography-discovery/bvmi-nyc-recalibration-2026-10-02.calculate.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
test('BVMI all24 candidate cases and signed public ledger reproduce',()=>{
 for(const [id,o] of Object.entries(scenarios)){
  const p={...central,...o},v=calculate(p);assert.deepEqual(v,proposal(p),id);
  const flows=resourceFlows(p);
  if(v.resourcesNYC===null)assert.equal(flows,null,id);
  else near(flows.reduce((sum,f)=>sum+incomeHealthyYearEquivalent(f),0),v.resourcesNYC);
 }
 near(calculate(central).donorCombinedPrice10,29386406.728908814);
 const offered=central.gift/central.cashLikeCost*central.patients*central.funding;
 const newCare=offered*central.completion*(1-central.purchasers-central.otherFree);
 const clinical=(newCare*(1-central.mentalPatients/central.patients)*central.physicalResponse*central.physicalUtility*central.physicalYears+newCare*central.mentalPatients/central.patients*central.mentalResponse*central.mentalUtility*central.mentalYears-newCare*central.treatmentHarm-offered*central.offerHarm)/(1+central.discount)**central.clinicalDelay;
 near(calculate(central).healthNYC,clinical);
});
test('BVMI guards separate unknown values, absent work and raw pay from welfare',()=>{
 const run=o=>calculate({...central,...o});
 assert.throws(()=>run({toString:1}));assert.throws(()=>run({purchasers:.8,otherFree:.8}));
 assert.equal(run({reachKnown:false,patients:0,mentalPatients:0}).combinedNYC,null);
 for(const o of [{gift:0},{funding:0}])assert.equal(run({...o,reachKnown:false,healthKnown:false,cashKnown:false,earningsKnown:false}).combinedNYC,0);
 for(const o of [{workerShare:0},{completion:0}])assert.equal(run({...o,healthKnown:false,cashKnown:false,earningsKnown:false}).earningsEquivalentNYC,0);
 assert.equal(run({recoveryPay:0,earningsKnown:false}).earningsEquivalentNYC,null);
 assert.equal(run({recoveryPay:0,earningsKnown:true,healthKnown:false,cashKnown:false}).earningsEquivalentNYC,0);
 assert.equal(run({physicalResponse:0,mentalResponse:0,healthKnown:false}).earningsEquivalentNYC,null);
 const overlap=run({recoveryIndependent:0,healthKnown:false});assert.equal(overlap.earningsEquivalentNYC,0);assert.equal(overlap.householdNetPayPVNYC,null);
 assert.ok(resourceFlows({...central,recoveryIndependent:0,healthKnown:false}).every(f=>f.channel!=='pay'));
 assert.ok(run({recoveryPay:-600,recoveryIndependent:0}).earningsEquivalentNYC<0);
 assert.equal(run({recoveryPay:-600,recoveryIndependent:0,healthKnown:false}).earningsEquivalentNYC,null);
 const unknownCash=run({cashKnown:false});assert.equal(unknownCash.earningsEquivalentNYC,null);assert.ok(unknownCash.householdNetPayPVNYC>0);
 assert.equal(run({healthKnown:false}).healthNYC,null);assert.ok(run({healthKnown:false}).completedPatients>0);
 assert.ok(run(scenarios.failedOnly).combinedNYC<0);assert.equal(run(scenarios.failedOnly).donorCombinedPrice10,null);
 assert.equal(run(scenarios.equivalentAlternativeNoBurden).combinedNYC,0);
});

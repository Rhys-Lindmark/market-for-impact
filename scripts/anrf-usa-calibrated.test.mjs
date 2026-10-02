import test from 'node:test';
import assert from 'node:assert/strict';
import {central,calculate,scenarios,resourceFlows} from '../lib/anrf-usa-calibrated-model.mjs';
import {calculate as proposal} from '../docs/geography-discovery/anrf-usa-recalibration-2026-10-02.calculate.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
test('ANRF reviewed24 scenarios and independent signed public ledger reproduce',()=>{
 for(const [id,o] of Object.entries(scenarios)){
  const p={...central,...o},v=calculate(p),old=proposal(p);
  for(const k of Object.keys(v))if(k!=='finiteLifeQALYs'){
   if(id==='healthUnknown'&&['attemptEquivalentUSA','householdAttemptPVUSDUSA'].includes(k))assert.ok(v[k]<0);
   else old[k]===null?assert.equal(v[k],null):near(v[k],old[k]);
  }
  if(v.resourcesUSA!==null)near(resourceFlows(p).reduce((s,f)=>s+incomeHealthyYearEquivalent(f),0),v.resourcesUSA);
 }
 const c=calculate(central);near(c.donorCombinedPrice10,67579293.48805918);
 near(c.healthUSA,.0035041382818365436);near(c.resourcesUSA,-.00202439508183299);
 near(c.donorHealthPrice10,28537686.57428362);
 near(calculate({...central,wageRate:0}).donorCombinedPrice10,28545905.333810598);
 near(calculate({...central,wageRate:.001}).donorCombinedPrice10,18101207.87160693);
});
test('ANRF unknown placeholders do not manufacture zero and absent pathways stay zero',()=>{
 const run=o=>calculate({...central,...o});
 assert.equal(run({reachKnown:false,N:0}).combinedUSA,null);
 for(const o of [{G:0},{f:0},{a:0},{dp:0,attemptShare:0},{e:0,attemptShare:0}]){
  const v=run({...o,healthKnown:false,reachKnown:false,resourcesKnown:false,grossKnown:false});
  assert.equal(v.healthUSA,0);assert.equal(v.resourcesUSA,0);assert.equal(v.combinedUSA,0);
 }
 const failure=run({dp:0,healthKnown:false});assert.equal(failure.healthUSA,0);assert.ok(failure.resourcesUSA<0);
 const unknownHealth=run({healthKnown:false});assert.equal(unknownHealth.combinedUSA,null);assert.ok(unknownHealth.attemptEquivalentUSA<0);
 assert.equal(unknownHealth.finiteLifeQALYs,null);
 const onlyWage=run({healthKnown:false,medicalCash:0,recoveryPay:0});assert.ok(onlyWage.earningsEquivalentUSA<0);assert.equal(onlyWage.medicalEquivalentUSA,0);
 const rawUnknown=run({healthKnown:false,medicalCash:0,recoveryIndependent:0});assert.ok(rawUnknown.resourcesUSA<0);assert.equal(rawUnknown.householdPayPVUSDUSA,null);
 assert.ok(resourceFlows({...central,healthKnown:false,medicalCash:0,recoveryIndependent:0}).every(f=>!f.id.startsWith('recovery')));
 const noResources=run({rM:0,workerShare:0,attemptShare:0,resourcesKnown:false});assert.equal(noResources.resourcesUSA,0);assert.ok(noResources.healthUSA>0);
 assert.equal(run({rM:0,healthKnown:false,workerShare:0,attemptShare:0,resourcesKnown:false}).resourcesUSA,null);
 assert.throws(()=>run({G:25001}));assert.throws(()=>run({income:0}));assert.throws(()=>run({unknown:1}));
 assert.throws(()=>run({toString:1}));
});

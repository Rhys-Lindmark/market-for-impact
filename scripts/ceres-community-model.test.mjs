import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,inputs,scenarios,finiteSurvivalQalys} from '../lib/ceres-community-model.mjs';
test('Ceres whole-gift scale uses the lower client bound, not duplicated meal courses',()=>{
 const r=calculate();
 assert.ok(Math.abs(r.clientBoundedNominalCourses-1489*100000/5975906)<1e-12);
 assert.ok(r.nominalTrialCourses>r.clientBoundedNominalCourses);
 assert.ok(r.weighted.modeledOrdinaryGiftCostPer10Qaly>258e6&&r.weighted.modeledOrdinaryGiftCostPer10Qaly<259e6);
 assert.equal(r.weighted.verifiedMarginalGiftCostPer10Qaly,null);
});
test('Ceres finite survival, scenario null and funding counterfactual reproduce independently',()=>{
 const s=scenarios[1];const ratio=s.annualSubsequentSurvival/1.03;
 const expected=s.healthUtility*Math.sqrt(ratio)*(1-ratio**s.survivalHorizonYears)/(1-ratio)/1.03**s.eventDelayYears;
 assert.ok(Math.abs(finiteSurvivalQalys(s)-expected)<1e-12);
 const r=calculate(); assert.equal(r.scenarios[0].giftQaly,0);
 assert.equal(scenarios[0].weight,.6);
 const zero=calculate(inputs,scenarios.map(s=>({...s,fundingAdditionality:0})));
 assert.equal(zero.weighted.giftQaly,0);assert.equal(zero.weighted.modeledOrdinaryGiftCostPer10Qaly,null);
});
test('Ceres resources and geography remain explicit and nested',()=>{
 const r=calculate();for(const s of r.scenarios){
 assert.ok(s.bayQaly>=s.sfQaly&&s.bayQaly<=s.giftQaly);
 assert.ok(Math.abs(s.grossResourceMultiplier-(5975906+1037591)/5975906)<1e-12);
 assert.equal(s.sfQaly,0);
 }assert.ok(r.weighted.bayImpactShare>.99&&r.weighted.bayImpactShare<=1);
});

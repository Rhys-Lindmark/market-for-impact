import test from 'node:test';import assert from 'node:assert/strict';import {calculate,inputs} from '../lib/california-immunization-model.mjs';
test('CIC matches MMR coverage to MMR-only health, not the full vaccination schedule',()=>{
 const r=calculate(),s=r.scenarios[2];assert.equal(r.benchmarkCoverageAffectedChildEquivalents,16500);
 const expected=(87600*30+222581000*.002+15417000*.03)/117000000;
 assert.ok(Math.abs(s.historicalMmrQalyUpperCalibration-expected)<1e-12);
 assert.ok(Math.abs(s.qalyPerCoverageAffectedChild-expected*.05)<1e-12);
 assert.ok(r.weighted.donorCostPer10Qaly>41e6&&r.weighted.donorCostPer10Qaly<43e6);
});
test('CIC keeps full gift and explicit high-side resource proxy',()=>{
 const r=calculate();for(const s of r.scenarios){
 assert.ok(Math.abs(s.grossResources-inputs.gift-Math.abs(s.giftCoverageAffectedChildEquivalents)*2050)<1e-8);
 assert.ok(Math.abs(s.sfQaly-s.giftQaly*.02)<1e-12);
 assert.ok(Math.abs(s.bayQaly-s.giftQaly*.2)<1e-12);
 }
});
test('CIC signed null/harm and favorable-tail sensitivity persist',()=>{
 const r=calculate();assert.ok(r.scenarios[0].giftQaly<0);assert.equal(r.scenarios[1].giftQaly,0);
 assert.ok(r.weighted.favorableShareOfSignedExpectedQaly>.91);
 assert.ok(r.noFavorable.donorCostPer10Qaly>480e6);
});

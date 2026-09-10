import test from 'node:test';import assert from 'node:assert/strict';import {calculate,modelScenario,scenarios,inputs} from '../lib/safe-sound-model.mjs';
test('Safe & Sound retains whole expense and audited gross-resource boundary',()=>{
 const r=calculate(),c=r.scenarios[2];const q=333*.6*(.3*.03*.5+.2*.02*.5)*.3*(100000/13205575)*.3*.85;
 assert.ok(Math.abs(c.giftQaly-q)<1e-12);assert.equal(inputs.fy2024ResourceOutlayBeforeDirectDonorBenefits-inputs.fy2024Expense,257998);
 assert.ok(r.weighted.donorCostPer10Qaly>504e6&&r.weighted.donorCostPer10Qaly<506e6);
 assert.ok(r.weighted.grossCostPer10Qaly>521e6&&r.weighted.grossCostPer10Qaly<522e6);
});
test('Safe & Sound retains signed null/harm and favorable-tail dependence',()=>{
 const r=calculate();assert.ok(r.scenarios[0].giftQaly<0);assert.equal(r.scenarios[1].giftQaly,0);
 assert.ok(r.weighted.favorableShareOfSignedExpectedQaly>.818&&r.weighted.favorableShareOfSignedExpectedQaly<.82);
 assert.equal(r.weighted.bayImpactShare,1);assert.ok(r.weighted.sfImpactShare<1);
 assert.ok(r.zeroFavorable.donorCostPer10Qaly>2.6e9);
});
test('Safe & Sound no deployment gives no attributed gain',()=>{
 for(const s of scenarios){const r=modelScenario({...s,giftDeployability:0});assert.ok(r.giftQaly===0);assert.equal(r.donorCostPer10Qaly,null);}
});

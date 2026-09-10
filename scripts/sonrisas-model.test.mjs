import test from 'node:test';import assert from 'node:assert/strict';
import {calculate,inputs,scenarios,finiteDurationQaly} from '../lib/sonrisas-model.mjs';
test('Sonrisas uses clinic patients, full expense and finite symptom state once',()=>{
 const r=calculate(),s=scenarios.find(s=>s.name==='central');
 assert.ok(Math.abs(r.giftLinkedReportedClinicPatients-5000*100000/6354606)<1e-10);
 assert.ok(Math.abs(finiteDurationQaly(s)-.010*.75/1.03**(.10+.75/2))<1e-12);
 assert.ok(r.weighted.modeledOrdinaryGiftCostPer10Qaly>34e6&&r.weighted.modeledOrdinaryGiftCostPer10Qaly<35e6);
 assert.equal(r.weighted.verifiedMarginalGiftCostPer10Qaly,null);
});
test('Sonrisas signed harm, null and favorable-tail dominance stay visible',()=>{
 const r=calculate();assert.ok(r.scenarios[0].netQaly<0);assert.equal(r.scenarios[1].netQaly,0);
 assert.ok(Math.abs(r.weighted.favorableTailShareOfNetQaly-.7690872773799525)<1e-12);
 assert.equal(r.weighted.bayImpactShare,1);assert.equal(r.weighted.sfImpactShare,0);
});
test('Sonrisas zero funding gives zero attributed benefit, not a free offer',()=>{
 const r=calculate(inputs,scenarios.map(s=>({...s,fundingAdditionality:0})));
 assert.equal(r.weighted.netQaly,0);assert.equal(r.weighted.modeledOrdinaryGiftCostPer10Qaly,null);
});

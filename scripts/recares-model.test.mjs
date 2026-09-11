import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,inputs,scenarios} from '../lib/recares-model.mjs';
import report from '../data/bay/recares-report.json' with {type:'json'};
test('ReCARES full expense and signed Bay expectation match independent audit',()=>{
 const r=calculate();assert.equal(r.inputs.totalExpenseUsd,111205);assert.equal(r.inputs.reportedRecipientEquivalents,9770);
 assert.ok(Math.abs(r.weighted.bayDonorCostPer10Qaly-185910.27585974694)<1e-7);
 assert.equal(r.verifiedMarginalFundingOffer,null);assert.equal(r.completeSocietalResourcesUsd,null);
 assert.ok(r.rows.find(s=>s.name==='harm').bayQaly<0);assert.equal(r.rows.find(s=>s.name==='null').bayQaly,0);
 const q=scenarios.reduce((sum,s)=>sum+s.weight*(10000*9770/111205)*s.throughput*s.uniqueFraction*(s.mix.reduce((a,d)=>a+d.share*d.unmet*d.safeUse*d.utility*d.years,0)-s.harmPerUnique)*s.bayShare,0);
 assert.ok(Math.abs(q-r.weighted.bayQaly)<1e-12);
 assert.ok(r.weighted.favorableShareOfNetBayQaly>.69);assert.ok(r.noFavorable.bayDonorCostPer10Qaly>574000);
});
test('ReCARES preserves zero, scale bound and complete report evidence',()=>{
 assert.equal(calculate({...inputs,giftUsd:0}).weighted.bayDonorCostPer10Qaly,null);
 assert.throws(()=>calculate({...inputs,giftUsd:100000}),RangeError);
 assert.throws(()=>calculate({...inputs,maxModeledGiftUsd:100000,giftUsd:100000}),RangeError);
 for(const key of ['paymentFeeUsd','totalExpenseUsd','reportedRecipientEquivalents'])for(const value of [NaN,Infinity])assert.throws(()=>calculate({...inputs,[key]:value}),RangeError);
 assert.ok(report.evidence.length>=4);assert.ok(report.evidence.some(r=>r.key==='controlled-aids'));
 assert.equal(new Set(report.sources.map(s=>s.url)).size,report.sources.length);
 assert.ok(report.nutshell.body.includes('$185,910'));
});

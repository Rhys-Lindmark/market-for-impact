import test from 'node:test';import assert from 'node:assert/strict';
import {calculate,calculateScenario,scenarios} from '../lib/sisterweb-model.mjs';
test('SisterWeb retains whole-project gift cost and finite morbidity only',()=>{
 const r=calculate(),s=scenarios.find(s=>s.name==='central'),c=calculateScenario(s);
 const expected=103*.8*(.015*.03+.3*.04*.25+.001*.5)*(100000/1200000)*.45*.85;
 assert.ok(Math.abs(c.giftQaly-expected)<1e-12);
 assert.ok(Math.abs(c.qalyPerCompletedCourse-.00395)<1e-12);
 assert.ok(r.weighted.donorPer10Qaly>63e6&&r.weighted.donorPer10Qaly<64e6);
});
test('SisterWeb signed null/harm and geography are preserved',()=>{
 const r=calculate();assert.ok(r.results[0].giftQaly<0);assert.equal(r.results[1].giftQaly,0);
 assert.equal(r.results[0].donorPer10Qaly,null);
 const signed=r.results.reduce((a,s)=>a+s.inputs.weight*s.giftQaly,0);
 assert.equal(signed,r.weighted.weightedGiftQaly);assert.equal(r.weighted.assumedBayShareOfSignedQaly,1);
 assert.ok(r.weighted.assumedSfShareOfSignedQaly<1);
 assert.ok(Math.abs(r.weighted.illustrativeGrossResources-116000)<1e-8);
});
test('SisterWeb no gift deployability means no attributed benefit',()=>{
 for(const s of scenarios){const r=calculateScenario({...s,giftDeployability:0});assert.ok(r.giftQaly===0);assert.equal(r.donorPer10Qaly,null);}
});

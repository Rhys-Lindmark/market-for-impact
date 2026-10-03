import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash}from 'node:crypto';
import {calculate,scenarios,historical}from '../lib/operation-access-calibrated-model.mjs';
import frozen from '../data/san-francisco/operation-access-legacy-pre-recalibration-model.json' with {type:'json'};
const near=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
// Candidate remains scientifically unaccepted until these reviewer gates are resolved.
test.todo('buyer savings retain full welfare because matching clinical benefit already cancels');
test.todo('worker and treatment-success incidence split households before nonlinear log valuation');
test.todo('sequential positive/negative flows preserve full travel and lost-pay burdens');
test.todo('response knowledge controls success-dependent medicine/pay while known independent routes remain visible');
test('unweighted center retains distinct US/Bay/SF and signed cash/pay ledgers',()=>{
 const r=calculate();near(r.regions.bay.price10,7669354.470890867);near(r.regions.sf.price10,57520158.5316815);
 near(r.resourcesUS,r.cashEquivalentUS+r.payEquivalentUS);assert(r.resourcesUS<0);
 for(const z of Object.values(r.regions))near(z.combined,z.health+z.resources);
 near(r.native.buyerPeople+r.native.equivalentFreePeople+r.native.newCarePeople,r.native.uniqueCompletedCourseEquivalents);
 assert.equal(r.completeEconomicCost,null);assert.equal(r.identifiedExpectedValue,null);
});
test('all current cases are finite and knowledge placeholders do not prove absence',()=>{
 assert(Object.keys(scenarios).length>=36);
 for(const inputs of Object.values(scenarios))calculate(inputs);
 for(const id of ['unknownFundingZero','unknownCapacityZero','healthUnknown','cashUnknown','payUnknown','reachUnknown'])assert.equal(calculate(scenarios[id]).regions.bay.combined,null);
 for(const id of ['fundingZero','giftZero','noCapacity','zeroGiftHarm'])assert.equal(calculate(scenarios[id]).regions.us.combined,0);
 assert.equal(calculate(scenarios.noLocal).regions.bay.combined,0);
 assert.equal(calculate(scenarios.noWorkerUnknownReach).payEquivalentUS,0);
});
test('independent donation-induced harms survive known funding absence but not zero gift',()=>{
 const r=calculate({funding:0,healthHarm:1,resourceHarm:1});assert.equal(r.regions.us.combined,-2);assert.equal(r.regions.us.price10,null);
 assert.equal(calculate({gift:0,healthHarm:1,resourceHarm:1}).regions.us.combined,0);
});
test('purchased/free clinical counterfactuals cancel matching clinical benefit and harms',()=>{
 assert.equal(calculate(scenarios.allPurchased).healthUS,0);assert.equal(calculate(scenarios.allFree).healthUS,0);
 assert(calculate(scenarios.allFree).cashEquivalentUS<0);
 assert(calculate(scenarios.payLoss).payEquivalentUS<calculate().payEquivalentUS);
});
test('resource timing controls do not silently change fixed clinical evidence timing',()=>{
 const r=calculate(),t=calculate({resourceDelay:1,resourceDiscount:.1});near(t.healthUS,r.healthUS);assert.notEqual(t.resourcesUS,r.resourcesUS);
 assert.throws(()=>calculate({delay:1}));assert.throws(()=>calculate({discount:.1}));
});
test('all nine complete historical result hashes remain exact',()=>{
 const h=historical();assert.equal(Object.keys(h).length,9);
 for(const f of frozen.scenarios){const r=h[f.id];assert.equal(createHash('sha256').update(JSON.stringify(r)).digest('hex'),f.resultSha256);assert.deepEqual(r.regions,f.regions);}
});
test('finite own-key inputs reject symbols, malformed shares and invalid resource consumption',()=>{
 for(const x of [null,[],Object.create(null),{[Symbol('x')]:1},{unknown:1},{gift:25001},{bay:.1,sf:.2},{buyer:.9,free:.2},{cost:Infinity},{healthKnown:0},{baseline:1000,lostDays:100,netDay:1000}])assert.throws(()=>calculate(x));
});

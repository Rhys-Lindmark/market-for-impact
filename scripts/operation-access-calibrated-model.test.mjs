import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash}from 'node:crypto';
import {calculate,central,scenarios,historical}from '../lib/operation-access-calibrated-model.mjs';
import {resourceLedger}from '../lib/operation-access-resource-ledger.mjs';
import frozen from '../data/san-francisco/operation-access-legacy-pre-recalibration-model.json' with {type:'json'};
const near=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
const fixture=(overrides={},path={})=>resourceLedger({...central,buyer:0,free:0,worker:.5,travel:0,medicine:0,lostDays:0,resourceDelay:0,resourceDiscount:0,positiveIndependent:1,...overrides},[{id:'general_cyst',people:1,treatment_success:.5,mortality_hazard:0,...path}],{known:true,inactive:false});
test('buyer savings retain full welfare because matching clinical benefit already cancels',()=>{
 const a=fixture({buyer:1,worker:0,paidPrice:500,positiveIndependent:0});
 near(a.cash,.5*Math.log1p(500/central.baseline));near(a.pay,0);
});
test('worker and treatment-success incidence split households before nonlinear log valuation',()=>{
 const a=fixture({netDay:100,recoveredDays:5});
 near(a.pay,.25*.5*Math.log1p(500/central.baseline));
 assert(Math.abs(a.pay-.5*Math.log1p(125/central.baseline))>1e-6);
 const joint=fixture({medicine:60,netDay:100,recoveredDays:5});
 near(joint.cash,.5*.5*Math.log1p(60/central.baseline));
 near(joint.pay,.25*.5*Math.log1p(500/(central.baseline+60)));
});
test('sequential positive/negative flows preserve full travel and lost-pay burdens',()=>{
 const a=fixture({travel:25,medicine:60,lostDays:1,recoveredDays:5,positiveIndependent:0});
 const travel=25*1529/1130;
 near(a.cash,.5*Math.log1p(-travel/central.baseline));
 near(a.pay,.25*.5*Math.log1p(-100/(central.baseline-travel+60))+.25*.5*Math.log1p(-100/(central.baseline-travel)));
 const full=fixture({travel:25,medicine:60,lostDays:1,recoveredDays:5});
 const independentlySummed=full.rows.reduce((s,row)=>s+.5*row.people*Math.log(row.afterUSD/central.baseline),0);
 near(full.cash+full.pay,independentlySummed);
});
test('response knowledge controls success-dependent medicine/pay while known independent routes remain visible',()=>{
 const r=calculate({responseKnown:false});assert.equal(r.healthUS,null);assert.equal(r.cashEquivalentUS,null);assert.equal(r.payEquivalentUS,null);
 assert(r.knownMoneyComponents.some(x=>x.role==='buyerSaving'&&x.presentValueUSD>0));
 assert(r.knownMoneyComponents.some(x=>x.role==='lostPay'&&x.presentValueUSD<0));
 const omitted=calculate({responseKnown:false,medicine:0,positiveIndependent:0});
 assert(omitted.payEquivalentUS<0);assert.equal(omitted.rawPayPVUS,null);
 assert.equal(calculate({responseKnown:false,buyer:1,free:0}).healthUS,0);
 assert.equal(calculate({responseKnown:false,worker:0}).payEquivalentUS,0);
 assert.equal(calculate({healthKnown:false}).cashEquivalentUS,calculate().cashEquivalentUS);
});
test('unweighted center retains distinct US/Bay/SF and signed cash/pay ledgers',()=>{
 const r=calculate();near(r.regions.bay.price10,7632848.400820726);near(r.regions.sf.price10,57246363.00615544);
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

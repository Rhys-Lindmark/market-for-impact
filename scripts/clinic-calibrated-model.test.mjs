import assert from 'node:assert/strict';
import test from 'node:test';
import {calculate,cases,groups,historical} from '../lib/clinic-calibrated-model.mjs';
import frozen from '../data/san-francisco/clinic-legacy-pre-recalibration-model.json' with {type:'json'};
const near=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
test('current center reconstructs native courses and signed components',()=>{
 const r=calculate();near(r.donorBayPrice10,17490721.53021219);near(r.donorSFPrice10,24986745.043160275);
 near(r.combinedBay,r.healthBay+r.resourcesBay);assert(r.resourcesBay<0);assert(r.donorSFPrice10>r.healthSFPrice10);
 near(Object.values(groups).reduce((a,g)=>a+g.share,0),1);
 for(const n of r.native){near(n.completedCare,n.purchaserCare+n.otherwiseFreeCare+n.unmetCare);assert(n.uniqueOfferedHouseholds>=n.completedCare);}
 assert.equal(r.wholePortfolioCombined,null);assert.equal(r.comprehensiveGrossPrice10,null);
});
test('all38 deterministic cases are finite and retain signed resources',()=>{
 assert.equal(Object.keys(cases).length,38);
 for(const inputs of Object.values(cases)){const r=calculate(inputs);for(const v of Object.values(r))if(typeof v==='number')assert(Number.isFinite(v));}
 const n=calculate(cases.negativeWork),p=calculate(cases.positiveWork);assert(n.resourcesBay<calculate().resourcesBay);assert(p.resourcesBay>calculate().resourcesBay);
 near(n.payEquivalentAll,calculate(cases.negativeWorkNoOverlap).payEquivalentAll);
});
test('zeroes and unknowns have different semantics',()=>{
 for(const id of ['zeroGift','zeroFunding','zeroUnique']){const r=calculate(cases[id]);assert.equal(r.combinedSF,0);assert.equal(r.donorSFPrice10,null);}
 for(const id of ['unknownReach','unknownClinical','unknownCash','unknownPay'])assert.equal(calculate(cases[id]).combinedSF,null);
 assert.equal(calculate(cases.localZeroUnknown).combinedSF,0);
 assert.equal(calculate(cases.noWorkersUnknownReach).payEquivalentAll,0);
});
test('independent harm survives known no additional funded care',()=>{
 const r=calculate({funding:0,independentHarm:.1});assert(r.combinedBay<0);assert.equal(r.donorBayPrice10,null);
 near(calculate({funding:0,independentHarm:.1,positiveCashIndependent:0,positivePayIndependent:0}).combinedBay,r.combinedBay);
});
test('purchaser and equivalent free care are not additional clinical success',()=>{
 assert(calculate(cases.allBuyer).healthAll<0);assert(calculate(cases.allFree).healthAll<0);
 assert(calculate(cases.noCompletion).resourcesAll<0);
});
test('cash-cost scaling and region attribution remain distinct',()=>{
 const r=calculate(),gross=calculate(cases.grossOnly),sf=calculate(cases.SFhalf);
 near(gross.combinedBay,r.combinedBay);near(gross.donorBayPrice10,r.donorBayPrice10);assert(gross.capturedGrossSFPrice10>r.capturedGrossSFPrice10);
 near(sf.combinedBay,r.combinedBay);near(sf.combinedSF/r.combinedSF,.5/.7);
});
test('historical34 scenarios and weighted expectation are exact, not current inputs',()=>{
 const h=historical();assert.equal(h.scenarios.length,34);assert.deepEqual(h.weighted,frozen.expected);
 for(const s of h.scenarios)assert.deepEqual(s.output,frozen.scenarios.find(x=>x.id===s.id).result);
 assert.equal(h.weightSensitivities.length,3);
});
test('strict malformed inputs are rejected',()=>{
 for(const x of [{gift:10001},{baseline:0},{purchaser:.8,otherwiseFree:.4},{sfHealth:1,bayHealth:.5},{funding:NaN},{unknown:1},{clinicalKnown:0}])assert.throws(()=>calculate(x));
 assert.throws(()=>calculate(Object.create(null)));assert.throws(()=>calculate({[Symbol('x')]:1}));
});

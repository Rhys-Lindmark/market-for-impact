import assert from 'node:assert/strict';
import test from 'node:test';
import {calculate,central,cases,historical,utilityYears} from '../docs/geography-discovery/pacific-hearing-legacy-recalibration-2026-10-02.calculate.mjs';
import frozen from '../data/bay/pacific-hearing-legacy-pre-recalibration-model.json' with {type:'json'};
const close=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Candidate central and all43 finite scenarios retain signed components',()=>{
 assert.equal(Object.keys(cases).length,43);
 for(const x of Object.values(cases)){const r=calculate(x);if(r.combinedBay!==null){close(r.combinedBay,r.healthBay+r.resourcesBay);assert.equal(r.donorPrice10!==null,r.combinedBay>0);}}
 const r=calculate();close(r.donorPrice10,9718636.68369033);assert(r.resourcesBay<0);assert.equal(r.healthSF,null);assert.equal(r.resourcesSF,null);assert.equal(r.comprehensiveGrossPrice10,null);assert.equal(r.wholePortfolioCombined,null);
 close(r.native.offered,r.native.completedFits/(central.completion*(1-central.mortality)**central.delay));
 close(r.native.completedFits,r.native.purchaserFits+r.native.equivalentFreeFits+r.native.unmetFits);
});
test('Independent midpoint quadrature verifies clinical ramp, delay, catchup and finite horizon',()=>{
 for(const x of [{},{ramp:0},{years:.1},{ramp:3,years:2},{mortality:0,discount:0,nonuseHazard:0,catchupHazard:0},{delay:1,mortality:.15}]){
  const p={...central,...x};let integral=0;const n=100000,dt=p.years/n;
  for(let i=0;i<n;i++){const t=(i+.5)*dt;integral+=Math.min(1,p.ramp===0?1:t/p.ramp)*Math.exp(-(p.nonuseHazard+p.catchupHazard)*t)*(1-p.mortality)**(p.delay+t)/(1+p.discount)**(p.delay+t)*dt;}
  close(utilityYears(p),integral,2e-9);
 }
});
test('Unknown placeholders are not zero; structural zero and independent harms stay distinct',()=>{
 assert.equal(calculate({clinicalKnown:false,utility:0}).healthBay,null);
 assert.equal(calculate({reachKnown:false,offers:0}).combinedBay,null);
 assert.equal(calculate({payKnown:false}).resourcesBay,null);
 assert.equal(calculate({gift:0,reachKnown:false,cashKnown:false,payKnown:false,clinicalKnown:false}).combinedBay,0);
 assert(calculate({funding:0,donorHarm:.1}).healthBay<0);
 assert(calculate({completion:0}).resourcesBay<0);
 assert(calculate({purchaser:1,otherwiseFree:0}).healthBay<=0);
 assert(calculate({recoveryPay:-500,positivePayIndependent:0}).payEquivalentAll<0);
 assert.throws(()=>calculate({mortality:1}));assert.throws(()=>calculate([]));assert.throws(()=>calculate({madeUp:0}));
});
test('Portable candidate preserves all13 diagnostic objects and accounting-only offers',()=>{
 const h=historical();assert.equal(h.worlds.length,6);assert.equal(Object.keys(h.diagnostics).length,13);
 for(const [id,r] of Object.entries(h.diagnostics))assert.deepEqual(r,frozen.diagnostics.cases[id]);
 const r=calculate(),a=calculate(cases.inventoryCostOnly);close(a.native.offered,r.native.offered);close(a.healthBay,r.healthBay);close(a.resourcesBay,r.resourcesBay);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,scenarios,test as embedded} from '../lib/kacs-usa-calibrated-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)));
test('independent finite clinical and signed acquisition-timing reconstruction',()=>{
 const c=calculate(),p=c.parameters;
 const delta=(p.pWith-p.pWithout)*Math.min(p.gift/p.cost,p.capacity);
 let exposure=0,purchases=0,undiscounted=0;
 const f=(t,l)=>Math.min(p.coverageCap,Math.max(0,p.annualCoverage*(t-l+1)));
 for(let t=1;t<=c.horizon;t++){
  exposure+=(f(t,p.early)-f(t,p.late))/(1+p.discount)**t;
  const acquisitions=(f(t,p.early)-f(t-1,p.early))-(f(t,p.late)-f(t-1,p.late));
  purchases+=acquisitions/(1+p.discount)**t;undiscounted+=acquisitions;
 }
 near(undiscounted,0);near(exposure,.5580188228822568);near(purchases,.016252975423755065);
 const fatal=delta*p.deaths*p.effectiveness*exposure;
 let life=0;for(let t=1;t<=60;t++)life+=.95/1.03**t;
 near(c.healthYears,fatal*(life+.2-.05));
 const resource=delta*1e8*.5*Math.log1p(-25/50000)*purchases+fatal*.5*(Math.log1p(1000/50000)+Math.log1p(-2500/50000));
 near(c.incomeYears,resource);near(c.combinedYears,-.02576410645909554);
 assert.equal(c.price10,null);assert.ok(c.healthOnlyPrice10>0);
 assert.ok(calculate({deviceCash:15}).combinedYears>0);
});
test('response cap and effective probability cannot be exceeded by large gifts',()=>{
 assert.throws(()=>calculate({capacity:1.00001}));
 assert.throws(()=>calculate({gift:1e10,cost:1,capacity:1e10}));
 const r=calculate({gift:1e10,cost:1});
 assert.equal(r.workYears,1);near(r.directProbabilityDifference,.005);
 for(const pWithout of [0,.25,1])for(const pWith of [0,.255,1]){
  const r=calculate({pWithout,pWith,gift:1e10,cost:1});
  assert.ok(pWithout+r.directProbabilityDifference>=0&&pWithout+r.directProbabilityDifference<=1);
 }
});
test('signed costs, independent harms, unknowns and overlap remain separate',()=>{
 assert.equal(embedded(),'assertions passed');assert.equal(Object.keys(scenarios()).length,27);
 near(calculate({discount:0}).technologyIncome,0);
 assert.ok(calculate({early:7}).healthYears<0);
 assert.ok(calculate({lifeUtility:0,nonfatalUtility:0}).incomeYears<0);
 assert.ok(calculate({pWith:.25,independentHealthHarm:.01,independentCashHarm:100}).combinedYears<0);
 assert.equal(calculate({incomeKnown:false}).combinedYears,null);
 assert.equal(calculate({overlap:1,nonfatalCash:-100}).overlapRemoved,0);
 const c=calculate(),overlap=calculate({overlap:1});
 near(overlap.overlapRemoved,c.nonfatal*.2);near(overlap.rescueHealthHarm,c.rescueHealthHarm);
 assert.ok(overlap.healthYears>0);assert.equal(overlap.technologyIncome,c.technologyIncome);
});

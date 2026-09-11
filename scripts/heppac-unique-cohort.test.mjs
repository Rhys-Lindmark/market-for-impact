import assert from 'node:assert/strict';
import {uniqueCohort} from '../lib/heppac-unique-cohort.mjs';
const p={uniquePeople:1,opportunitiesPerPersonYear:100,otherwiseFatal:.1,baselineRescue:0,rescueIncrement:1,otherHazard:.2,postHazard:.25,activeYears:1,horizonYears:10,utility:.7,discount:.03,delayYears:0};
const r=uniqueCohort(p);assert(r.qaly<=r.maximumAbsoluteQaly);
assert.equal(uniqueCohort({...p,rescueIncrement:0}).qaly,0);
assert.equal(uniqueCohort({...p,uniquePeople:0}).qaly,0);
assert.equal(uniqueCohort({...p,activeYears:0}).qaly,0);
assert(uniqueCohort({...p,baselineRescue:1,rescueIncrement:-1}).qaly<0);
for(const v of[null,[],42,{}])assert.throws(()=>uniqueCohort(v));
for(const[k]of Object.entries(p))for(const v of[NaN,Infinity])assert.throws(()=>uniqueCohort({...p,[k]:v}));
assert.throws(()=>uniqueCohort({...p,baselineRescue:1}));
assert.throws(()=>uniqueCohort({...p,activeYears:2,horizonYears:1}));
// Independent midpoint integration of unique-person survival difference.
const dt=1e-4;let q=0;
for(let t=dt/2;t<p.horizonYears;t+=dt){
 const sw=t<1?Math.exp(-r.supportedHazard*t):Math.exp(-r.supportedHazard)*Math.exp(-p.postHazard*(t-1));
 const sn=t<1?Math.exp(-r.baseHazard*t):Math.exp(-r.baseHazard)*Math.exp(-p.postHazard*(t-1));
 q+=(sw-sn)*p.utility/(1+p.discount)**t*dt;
}
assert(Math.abs(q-r.qaly)<1e-8);
console.log('PASS: explicit required inputs, zero/null, signed harm, invalid bounds, 100-opportunity person bound, independent numerical integral');

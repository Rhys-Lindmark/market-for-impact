import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,keys,trajectory} from '../lib/sirum-model.mjs';
const m=JSON.parse(fs.readFileSync(new URL('../data/us/sirum-model-v1.json',import.meta.url)));
let checks=0;const ok=(x)=>{assert.ok(x);checks++;};
const close=(a,b,t=1e-8)=>ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)));
const walk=x=>{for(const v of Object.values(x)){if(v&&typeof v==='object')walk(v);else if(typeof v==='number')ok(Number.isFinite(v));}};
for(const s of m.scenarios){const p={...m.central,...s.overrides},r=calculate(p);walk(r);close(r.clinicalQ,Object.values(r.branches).reduce((a,b)=>a+b.q,0));close(r.totalQ,r.clinicalQ-r.drugHarm-r.independentHarmQ-r.displacedAlternativeQ);close(r.nominalOutside,r.nominalPublicOutside+r.nominalPrivateOutside);for(const [region,z] of Object.entries(r.regions)){close(z.q,r.totalQ*(region==='total'?1:p[region+'_share']));if(z.q>0){close(z.donorPer10Q*z.q,p.gift*10);close(z.grossResourcePer10Q*z.q,r.grossResources*10);close(z.netResourcePer10Q*z.q,r.netResources*10);}else ok(z.donorPer10Q===null&&z.grossResourcePer10Q===null&&z.netResourcePer10Q===null);}for(const b of Object.values(r.branches))ok(Math.abs(b.q)<=b.additionalPeople*p.horizon+1e-8);}
for(const k of keys){const p={...m.central};delete p[k];assert.throws(()=>calculate(p));checks++;for(const n of [NaN,Infinity,-Infinity]){assert.throws(()=>calculate({...m.central,[k]:n}));checks++;}}
for(const p of [{sf_share:.1},{bp_month_share:.9,statin_month_share:.2},{cash_per_shipped_rx:0},{funded_years:0},{months_per_rx:13},{gift:1e100},{residual_utility_gain:1.1}]){assert.throws(()=>calculate({...m.central,...p}));checks++;}
let seed=373;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
for(let i=0;i<300;i++){const p={...m.central,delivery_allocation:rand(),dispensed_fraction:rand(),financing_additionality:rand(),treatment_contrast:rand(),funded_years:.1+4*rand(),horizon:rand()*20,bp_transfer:rand(),statin_transfer:rand(),residual_utility_gain:(rand()-.3)*.1};const r=calculate(p);walk(r);ok(r.regions.sf.q===0);}
// Independent midpoint integration of discounted event-free-state difference,
// including catch-up after funded treatment stops. Events are first events only.
for(const [h,ht,T,H,mort,d]of [[.017,.012,1,10,.05,.03],[.06,.05,3,10,.04,.03],[0,0,1,10,0,0],[.2,.1,5,2,.1,0]]){
 const n=50000,dt=H/n;let q=0,e=0;
 for(let i=0;i<n;i++){const t=(i+.5)*dt,st=Math.exp(-ht*Math.min(t,T)-h*Math.max(0,t-T)),sc=Math.exp(-h*t),f=Math.exp(-(mort+d)*t);q+=f*(st-sc)*dt;e+=f*((t<T?ht:h)*st-h*sc)*dt;}
 const a=trajectory(h,ht,T,H,mort,d);close(a.healthyDifference,q,2e-7);close(a.eventsDifference,e,2e-7);
}
const nullP={...m.central,bp_transfer:0,statin_transfer:0,residual_utility_gain:0,other_harm_per_filled_rx:0,displaced_alternative_q:0};close(calculate(nullP).totalQ,0);close(calculate({...m.central,horizon:0,other_harm_per_filled_rx:0,displaced_alternative_q:0}).totalQ,0);
console.log(JSON.stringify({status:'pass',scenarios:m.scenarios.length,checks}));


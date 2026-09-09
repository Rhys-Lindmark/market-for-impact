import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,INPUT_BOUNDS} from '../lib/sfphf-model.mjs';
const m=JSON.parse(readFileSync(new URL('../data/san-francisco/sfphf-model-v1.json',import.meta.url)));
const p=m.scenarios[0].inputs;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
const finite=x=>{if(typeof x==='number')assert.ok(Number.isFinite(x));else if(x&&typeof x==='object')Object.values(x).forEach(finite);};
for(const s of m.scenarios)test(`exact accepted ledger: ${s.id}`,()=>assert.deepEqual(calculate(s.inputs),s.outputs));
test('all required numbers reject missing, coerced, nonfinite and out-of-bounds values',()=>{
 for(const [key,[min,max]] of Object.entries(INPUT_BOUNDS)){
  const missing={...p};delete missing[key];assert.throws(()=>calculate(missing),TypeError);
  for(const v of [NaN,Infinity,-Infinity,'1',null,undefined,true])assert.throws(()=>calculate({...p,[key]:v}),TypeError);
  for(const v of [min-1,max+1])assert.throws(()=>calculate({...p,[key]:v}),RangeError);
 }
});
test('container, integer horizon, cure/start and geography constraints',()=>{
 for(const v of [null,undefined,[],1,'input'])assert.throws(()=>calculate(v));
 for(const change of [{health_years:2.5},{sf_share:1},{incremental_cure_probability:.2}])assert.throws(()=>calculate({...p,...change}),RangeError);
});
test('normalized reference is not discounted twice and delay is applied once',()=>{
 const clean={...p,reinfection_hazard:0,excess_mortality_hazard:0,later_cure_probability:0,gift_to_cure_years:0};
 near(calculate(clean).retained_qaly_per_cure_at_gift,p.reference_qaly_per_cure);
 near(calculate({...clean,gift_to_cure_years:1}).retained_qaly_per_cure_at_gift,p.reference_qaly_per_cure/1.035);
});
test('immediate catch-up, zero horizon and zero reference retain costs and independent harm',()=>{
 for(const change of [{later_cure_probability:1,later_cure_years:0},{health_years:0},{reference_qaly_per_cure:0}]){
  const r=calculate({...p,...change,independent_harm_q:.1});
  assert.equal(r.retained_qaly_per_cure_at_gift,0);assert.equal(r.us.qaly,-.1);assert.equal(r.us.donor_per_10q,null);assert.equal(r.gross_resource_usd,113000);
 }
});
test('replacement removes shared harm but not independent harm; no gain can be harmful',()=>{
 assert.equal(calculate({...p,funding_additionality:0,shared_harm_q_per_offer:1}).us.qaly,0);
 assert.equal(calculate({...p,funding_additionality:0,shared_harm_q_per_offer:1,independent_harm_q:.1}).us.qaly,-.1);
 assert.equal(calculate({...p,incremental_cure_probability:0,shared_harm_q_per_offer:.01}).us.qaly,-.025);
});
test('donor-paid medication enters cash once, reducing affordable offers',()=>{
 const r=calculate({...p,donor_daa_share:1});
 near(r.offers,10000/2200);near(r.gross_resource_usd,100000+r.offers*100);
 near(calculate(p).gross_resource_usd,100000+10*(100+.08*15000));
});
test('signed nested geography preserves the whole gift numerator',()=>{
 const r=calculate(p);near(r.sf.qaly,r.us.qaly*.95);near(r.bay.qaly,r.us.qaly*.98);near(r.sf.qaly*r.sf.donor_per_10q,1000000);
 const harm=calculate({...p,funding_additionality:0,independent_harm_q:1});assert.equal(harm.sf.qaly,-.95);
 const zero=calculate({...p,sf_share:0});assert.equal(zero.sf.qaly,0);assert.equal(zero.sf.donor_per_10q,null);
});
test('extreme bounded values remain finite, immutable and JSON-safe',()=>{
 const max=Object.fromEntries(Object.entries(INPUT_BOUNDS).map(([k,b])=>[k,b[1]]));
 max.navigation_cash_per_offer=.01;max.donor_daa_share=0;
 for(const v of [max,{...max,discount:0,reinfection_hazard:0,excess_mortality_hazard:0,later_cure_probability:0},{...p,gift_usd:0}]){
  const snapshot={...v};const r=calculate(Object.freeze(v));finite(r);assert.deepEqual(v,snapshot);assert.deepEqual(JSON.parse(JSON.stringify(r)),r);
 }
 assert.equal(calculate({...p,sf_share:Number.MIN_VALUE}).sf.donor_per_10q,null);
});

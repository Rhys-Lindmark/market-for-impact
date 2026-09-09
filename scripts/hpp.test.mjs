import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,INPUT_BOUNDS} from '../lib/hpp-model.mjs';
const m=JSON.parse(readFileSync(new URL('../data/san-francisco/hpp-model-v1.json',import.meta.url)));
const p=m.scenarios[0].inputs;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11*Math.max(1,Math.abs(a),Math.abs(b)));
for(const s of m.scenarios)test('scenario parity '+s.id,()=>assert.deepEqual(calculate(s.inputs),s.outputs));
test('required finite bounded inputs and nested residence',()=>{
 for(const [key,[lo,hi]] of Object.entries(INPUT_BOUNDS)){
  const missing={...p};delete missing[key];assert.throws(()=>calculate(missing),TypeError);
  for(const v of [NaN,Infinity,-Infinity,'1',null,undefined,true])assert.throws(()=>calculate({...p,[key]:v}),TypeError);
  for(const v of [lo-1,hi+1])assert.throws(()=>calculate({...p,[key]:v}),RangeError);
 }
 for(const v of [null,[],undefined,2,'x'])assert.throws(()=>calculate(v));
 for(const change of [{observation_days:2.5},{incremental_depression_free_days:549},{sf_share:1}])assert.throws(()=>calculate({...p,...change}),RangeError);
});
test('independent geometric discount reconstruction',()=>{
 const r=Math.exp(-Math.log1p(p.discount)/365);
 const mean=Math.exp(-Math.log1p(p.discount)*(p.gift_to_start_years+.5/365))*(-Math.expm1(p.observation_days*Math.log(r)))/(1-r)/p.observation_days;
 const result=calculate(p);near(result.discounted_day_fraction,mean);
 near(result.us.qaly,6*.4*30/365*.2*mean);
});
test('signed days, zero utility and replacement preserve full gift',()=>{
 const a=calculate(p),b=calculate({...p,incremental_depression_free_days:-30});
 near(a.us.qaly,-b.us.qaly);assert.equal(b.us.donor_per_10q,null);
 for(const change of [{maternal_depression_allocation:0},{funding_additionality:0},{utility_gain_per_depression_free_day:0},{incremental_depression_free_days:0}]){
  const r=calculate({...p,...change});assert.equal(r.us.qaly,0);assert.equal(r.us.donor_per_10q,null);assert.ok(r.gross_resource_usd>=p.gift_usd);
 }
});
test('zero activity erases shared harm but retains independent loss',()=>{
 assert.equal(calculate({...p,funding_additionality:0,shared_harm_q_per_offer:1}).us.qaly,0);
 assert.equal(calculate({...p,funding_additionality:0,shared_harm_q_per_offer:1,independent_harm_q:.1}).us.qaly,-.1);
 assert.ok(calculate({...p,shared_harm_q_per_offer:.02}).us.qaly<0);
});
test('daily discount is applied once, with no lifetime health',()=>{
 const zero=calculate({...p,discount:0});near(zero.qaly_per_incremental_offer,30/365*.2);
 const delayed=calculate({...p,gift_to_start_years:p.gift_to_start_years+1});near(delayed.us.qaly,calculate(p).us.qaly/1.035);
 // Observation window changes timing only for a fixed net-day assumption: no new health tail.
 near(calculate({...p,discount:0,observation_days:30}).us.qaly,zero.us.qaly);
});
test('whole-gift costs and outside care counted once',()=>{
 const r=calculate(p);assert.equal(r.offers,6);assert.equal(r.gross_resource_usd,103000);
 near(r.sf.qaly*r.sf.donor_per_10q,1000000);near(r.sf.qaly/r.us.qaly,.95);near(r.bay.qaly/r.us.qaly,.98);
 const donor=calculate({...p,cash_per_offer:3000,extra_resource_per_offer:0});assert.equal(donor.offers,5);assert.equal(donor.gross_resource_usd,100000);
});
test('all outputs finite immutable JSON-safe under bounds',()=>{
 const max=Object.fromEntries(Object.entries(INPUT_BOUNDS).map(([k,v])=>[k,v[1]]));max.cash_per_offer=.01;
 const finite=x=>{if(typeof x==='number')assert.ok(Number.isFinite(x));else if(x&&typeof x==='object')Object.values(x).forEach(finite);};
 for(const v of [max,{...max,discount:0},p,{...p,gift_usd:0},{...p,sf_share:0}]){
  const copy={...v};const r=calculate(Object.freeze(v));finite(r);assert.deepEqual(v,copy);assert.deepEqual(JSON.parse(JSON.stringify(r)),r);
 }
 assert.equal(calculate({...p,sf_share:Number.MIN_VALUE}).sf.donor_per_10q,null);
});

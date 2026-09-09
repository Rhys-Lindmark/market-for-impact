import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/california/cca-model-v1.json' with {type:'json'};
import {calculate,INPUT_BOUNDS} from '../lib/cca-model.mjs';
const p=data.scenarios[0].inputs;
for(const s of data.scenarios)test('CCA production parity: '+s.id,()=>assert.deepEqual(calculate(s.inputs),s.outputs));
test('CCA rejects missing/coerced/nonfinite/out-of-bound inputs',()=>{
 for(const [k,[lo,hi]] of Object.entries(INPUT_BOUNDS)){
  const missing={...p};delete missing[k];assert.throws(()=>calculate(missing));
  for(const bad of [null,undefined,NaN,Infinity,-Infinity,'1',true,lo-1,hi+1])assert.throws(()=>calculate({...p,[k]:bad}));
 }
 for(const bad of [null,[],{}, {...p,acceleration_years:1.5},{...p,health_tail_years:2.5},{...p,target_sf_share:1,target_bay_share:0}])assert.throws(()=>calculate(bad));
});
test('CCA keeps displacement when target operation fails and nested zero-SF effects',()=>{
 assert.ok(calculate({...p,enabled_clean_operation_fraction:0}).us.qaly<0);
 assert.equal(calculate({...p,target_sf_share:0,displaced_sf_share:0,independent_harm_sf_share:0}).sf.qaly,0);
 const q=calculate({...p,discount_rate:0,annual_competing_mortality:0});
 assert.ok(Number.isFinite(q.sf.donor_usd_per_10_qaly));
});

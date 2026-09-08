import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dentalAccessModel} from '../lib/dental-access-model.mjs';
const d=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/clinic-dental-cea-v1.json',import.meta.url)));
test('Dental central applies additionality to net relief and harm',()=>{
 const r=dentalAccessModel(d.scenarios[1]);assert(Math.abs(r.netQalys-.00375)<1e-12);
 assert(Math.abs(r.costPerTenQalys-933333.3333333334)<1e-6);
 assert.equal(r.maximumCostFor100k,37.5);
});
test('Dental identical replacement adds no benefit or harm',()=>{
 const r=dentalAccessModel({...d.scenarios[1],fundingAdditionality:0});
 assert.equal(r.netQalys,0);assert.equal(r.costPerTenQalys,null);
 const h=dentalAccessModel({...d.scenarios[1],harmQalys:1});
 assert(h.netQalys<0);assert.equal(h.costPerTenQalys,null);
});
test('Dental model rejects nonfinite and impossible fractions',()=>{
 for(const x of [{cost:NaN},{painYears:-1},{resolution:1.1},{utilityGain:2}])
 assert.throws(()=>dentalAccessModel({...d.scenarios[1],...x}),RangeError);
});

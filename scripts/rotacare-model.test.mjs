import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {rotacareModel} from '../lib/rotacare-model.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/bay/rotacare-cea-v2.json',import.meta.url)));
function compare(actual,expected){if(expected===null)return assert.equal(actual,null);if(typeof expected==='number')return assert.ok(Math.abs(actual-expected)<1e-9*Math.max(1,Math.abs(expected)));for(const key of Object.keys(expected))compare(actual[key],expected[key]);}
test('RotaCare recomputes ten audited scenarios including clipped health windows',()=>{for(const s of data.scenarios)compare(rotacareModel(s.inputs),s.outputs);});
test('RotaCare rejects malformed probability, horizon and cost inputs',()=>{
 const p=data.scenarios[0].inputs;
 for(const k of Object.keys(p).filter(k=>typeof p[k]==='number')){assert.throws(()=>rotacareModel({...p,[k]:NaN}));const missing={...p};delete missing[k];assert.throws(()=>rotacareModel(missing));}
 for(const patch of [{gift_usd:0},{annual_cash_cost_usd:0},{fatal_years:151},{stroke_years:1.5},{funding_additionality:2},{sf_health_share:.5,rest_bay_health_share:.7},{fatal_event_share:.5},{rr_per_10_mm_hg:1.1}])assert.throws(()=>rotacareModel({...p,...patch}));
 const zero=rotacareModel({...p,bp_allocation_fraction:0});
 assert.equal(zero.global.qaly,0);assert.equal(zero.global.donor_usd_per_10_qaly,null);assert.equal(zero.gross_resource_usd,p.gift_usd);
 const noDiscount=rotacareModel({...p,discount:0,fatal_annual_competing_mortality:0});
 assert.ok(Number.isFinite(noDiscount.global.qaly));
 const harm=rotacareModel(data.scenarios.find(s=>s.id==='independent_donor_harm').inputs);
 assert.ok(harm.global.qaly<0);assert.equal(harm.global.donor_usd_per_10_qaly,null);
});

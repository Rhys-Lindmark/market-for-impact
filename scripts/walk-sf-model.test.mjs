import test from 'node:test';import assert from 'node:assert/strict';
import data from '../data/san-francisco/walk-sf-cea-v1.json' with {type:'json'};
import {walkSfModel} from '../lib/walk-sf-model.mjs';
test('Walk SF integrated calculator agrees with independently audited scenarios',()=>{
 for(const s of data.scenarios){const r=walkSfModel(s,data.giftUsd);for(const key of ['sfNetQaly','bayIncludingSfNetQaly','sfUsdPer10Qaly','bayUsdPer10Qaly','timingResourceUsd','grossForwardResourceStressUsd']){if(s.outputs[key]===null)assert.equal(r[key],null);else assert.ok(Math.abs(r[key]-s.outputs[key])<1e-8*Math.max(1,Math.abs(s.outputs[key])),s.id+key);}assert.equal(r.donorCostUsd,100000);}
});

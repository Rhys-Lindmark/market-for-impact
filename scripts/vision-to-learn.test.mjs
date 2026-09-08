import assert from 'node:assert/strict';
import {visionToLearn as m,visionToLearnModel as calc} from '../lib/vision-to-learn-model.mjs';
for(const s of m.scenarios){const r=calc(s.inputs);for(const[k,v]of Object.entries(r)){if(v===null)assert.equal(s.outputs[k],null);else assert.ok(Math.abs(v-s.outputs[k])<1e-8*Math.max(1,Math.abs(v)),k);}}
assert.equal(m.scenarios.length,11);
assert.ok(calc(m.scenarios.find(s=>s.id==='zero_additionality_independent_harm').inputs).us_qaly<0);
assert.throws(()=>calc({...m.scenarios[0].inputs,sf_share:2}));
for(const key of Object.keys(m.scenarios[0].inputs)){const i={...m.scenarios[0].inputs};delete i[key];assert.throws(()=>calc(i),RangeError,key);}

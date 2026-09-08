import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cessationModel,asthmaModel} from '../lib/breathe-model.mjs';
const d=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/breathe-cea-v1.json',import.meta.url)));
test('Cessation central uses enrollee effect and lifetime calibration exactly once',()=>{
 const s=d.scenarios[1],r=cessationModel(s);
 assert.equal(r.netQalys,.00375); assert(Math.abs(r.costPerTenQalys-533333.3333333334)<1e-6);
 assert.equal(r.maximumCostFor100k,37.5);
 assert.equal(cessationModel({...s,cost:300}).costPerTenQalys,800000);
});
test('Asthma central and favorable use no unproven second year',()=>{
 const [a,b]=d.asthmaScenarios.map(asthmaModel);
 assert(Math.abs(a.costPerTenQalys-253472.22222222222)<1e-6);
 assert(Math.abs(b.costPerTenQalys-5983606.55737705)<1e-6);
 assert.throws(()=>asthmaModel({...d.asthmaScenarios[1],equivalentYears:2}),RangeError);
});
test('Breathe null and harms preserve signed health rather than bargains',()=>{
 for(const [fn,s]of [[cessationModel,d.scenarios[1]],[asthmaModel,d.asthmaScenarios[1]]]){
  assert.equal(fn({...s,fundingAdditionality:0}).costPerTenQalys,null);
  assert(fn({...s,harmQalys:1}).netQalys<0);
  assert.equal(fn({...s,harmQalys:1}).donorCost,s.cost);
 }
});
test('Breathe bounds reject invalid probability utility and nonfinite inputs',()=>{
 assert.throws(()=>cessationModel({...d.scenarios[1],extraQuitProbability:1.1}),RangeError);
 assert.throws(()=>asthmaModel({...d.asthmaScenarios[1],extraSymptomFreeDays:366}),RangeError);
 assert.throws(()=>cessationModel({...d.scenarios[1],cost:NaN}),RangeError);
});

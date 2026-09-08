import {test} from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/san-francisco/pvf-cataract-cea-v1.json' with {type:'json'};
import oa from '../data/san-francisco/oa-colonoscopy-cea-v1.json' with {type:'json'};
import {cataractAccessModel,colonoscopyAccessModel} from '../lib/surgical-access-model.mjs';
test('colonoscopy: all stored signed results and resource costs reproduce',()=>{
 for(const s of oa.scenarios){
  const r=colonoscopyAccessModel(s,oa.resourceSensitivity);
  assert.equal(r.netQalys,s.netQalyPerPathway);
  assert.equal(r.costPerTenQalys,s.donorUsdPer10Qaly);
  assert.equal(r.expandedCost,s.expandedCost);
  assert.equal(r.expandedResourcePrice,s.expandedUsdPer10Qaly);
 }
 assert.throws(()=>colonoscopyAccessModel({...oa.scenarios[0],marginallyEnabledFraction:2}));
});
test('cataract: every stored result reproduces from live formula',()=>{
 for(const s of [...data.coreScenarios,...data.separateScenarios]){
  const r=cataractAccessModel(s.inputs);
  for(const [actual,expected] of [[r.netQalys,s.result.netQalys],[r.costPerTenQalys,s.result.donorUsdPerTenQalys],[r.directResourcePrice,s.result.directResourceDiagnosticUsdPerTenQalys]]){
   if(expected===null)assert.equal(actual,null);else assert.ok(Math.abs(actual-expected)<Math.max(1,Math.abs(expected))*1e-10,s.id);
  }
 }
});
test('cataract: no duration or completion double multiplication; signed harm remains',()=>{
 const s=data.coreScenarios[0].inputs;
 assert.equal(cataractAccessModel(s).netQalys,.014);
 assert.equal(cataractAccessModel({...s,fundingAdditionality:0}).costPerTenQalys,null);
 assert.equal(cataractAccessModel({...s,fundingAdditionality:0,donorSpecificHarmQaly:.02}).netQalys,-.02);
 assert.throws(()=>cataractAccessModel({...s,fundingAdditionality:2}));
 assert.throws(()=>cataractAccessModel({...s,donorCashCostUsd:NaN}));
 assert.throws(()=>cataractAccessModel({...s,completeDirectResourceCostUsd:1}));
});

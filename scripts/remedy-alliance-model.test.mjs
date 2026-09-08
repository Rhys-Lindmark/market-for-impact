import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {remedyAllianceModel} from '../lib/remedy-alliance-model.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/us/remedy-alliance-cea-v1.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
test('Remedy recomputes all archived outputs and preserves unknown local health',()=>{
 for(const s of data.scenarios){
  const r=remedyAllianceModel(s,data.giftUsd);
  for(const [key,value] of Object.entries(s.outputs)) value===null?assert.equal(r[key],null):close(r[key],value);
  assert.equal(r.bayHealthShare,null);assert.equal(r.bayUsdPer10Qaly,null);assert.equal(r.sfUsdPer10Qaly,null);
  // Independent direct calendar-year calculation, not the factorized implementation.
  let q=0;
  for(let k=1;k<=s.survivalYears;k++) q+=data.giftUsd*s.coreAllocation/s.cashPerBundle*s.fundingOutputAdditionality*s.responseProbabilityWithinYear*s.survivalDifferencePerResponse*s.utility*s.annualSurvival**(k-.5)/(1+s.discount)**(s.delayYears+k);
  q-=data.giftUsd*s.coreAllocation/s.cashPerBundle*s.fundingOutputAdditionality*s.sharedHarmPerBundle/(1+s.discount)**(s.delayYears+.5)+s.independentGiftHarm;
  close(r.netOverallQaly,q);
 }
});
test('Remedy guards malformed inputs, keeps null/harm and all gift costs',()=>{
 const s=data.scenarios[0];
 for(const key of Object.keys(s).filter(k=>typeof s[k]==='number')){
  assert.throws(()=>remedyAllianceModel({...s,[key]:NaN}));
  const missing={...s};delete missing[key];assert.throws(()=>remedyAllianceModel(missing));
 }
 for(const key of ['coreAllocation','responseProbabilityWithinYear','survivalDifferencePerResponse','fundingOutputAdditionality','annualSurvival','utility']) assert.throws(()=>remedyAllianceModel({...s,[key]:1.1}));
 assert.throws(()=>remedyAllianceModel({...s,cashPerBundle:0}));
 assert.throws(()=>remedyAllianceModel({...s,survivalYears:1500}));
 assert.throws(()=>remedyAllianceModel({...s,survivalYears:1.5}));
 assert.throws(()=>remedyAllianceModel(s,0));
 const noCore=remedyAllianceModel({...s,coreAllocation:0});
 assert.equal(noCore.netOverallQaly,0);assert.equal(noCore.donorCashUsd,10000);assert.equal(noCore.donorUsdPer10Qaly,null);
 const harm=remedyAllianceModel(data.scenarios.find(s=>s.id==='independentNetHarm'));
 assert.ok(harm.netOverallQaly<0);assert.equal(harm.donorUsdPer10Qaly,null);
 close(remedyAllianceModel(s,20000).netOverallQaly,2*remedyAllianceModel(s).netOverallQaly);
});

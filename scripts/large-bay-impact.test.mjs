import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {foodAccessModel, benefitAccessModel, foodPharmacyModel, diabetesPreventionModel} from '../lib/large-bay-impact-model.mjs';
const food={cost:325,exitProbability:.05,secureShare:.35,adults:1,utility:.023,transfer:.5,effectiveYears:.5,fundingAdditionality:.5,harmQalys:0};
const benefits={cost:500,approval:.7,enrollmentAdditionality:.4,securityEffect:.05,adults:1,utility:.023,transfer:.5,effectiveYears:.25,fundingAdditionality:.5,harmQalys:0};
const pharmacy={cost:600,scoreImprovement:.49,utilityPerPoint:.01,transfer:.5,effectiveYears:.25,fundingAdditionality:.5,harmQalys:0};
const dpp={cost:600,extraKg:2.3,utilityPerKg:.0014,transfer:.75,retention:[.5,1,.75,.25],fundingAdditionality:.5,harmQalys:0};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6*Math.max(1,Math.abs(b)));
test('published YMCA inputs use the same central model and retain provenance and no-offer status',()=>{
  const published=JSON.parse(fs.readFileSync('data/san-francisco/ymca-dpp-cea-v1.json','utf8'));
  assert.equal(published.verifiedMarginalOffer,false);
  const {name,...inputs}=published.scenarios[1];
  assert.equal(name,'Central best guess');assert.deepEqual(inputs,dpp);
  assert.equal(published.sources.length,6);
  for(const source of published.sources){assert.ok(new URL(source.url));assert.ok(source.retrieved);assert.ok(source.sourceType);}
});
test('large Bay central health models reproduce the independently audited formulas',()=>{
  close(foodAccessModel(food).costPerTenQalys,64596273.29192547);
  close(benefitAccessModel(benefits).costPerTenQalys,248447204.9689441);
  close(foodPharmacyModel(pharmacy).costPerTenQalys,19591836.734693877);
  close(diabetesPreventionModel(dpp).costPerTenQalys,2095451.938066746);
});
test('DPP favorable is conditional on price, utility and six-year decay, not a central sub100k finding',()=>{
  const r=diabetesPreventionModel({...dpp,cost:200,extraKg:3.4,utilityPerKg:.002,transfer:1,retention:[.5,1,1,1,1,.5],fundingAdditionality:.8});
  close(r.costPerTenQalys,80268.649228);
  assert.ok(diabetesPreventionModel(dpp).costPerTenQalys>100000);
});
test('every Bay model preserves funding nulls and signed harm',()=>{
  for(const [fn,s] of [[foodAccessModel,food],[benefitAccessModel,benefits],[foodPharmacyModel,pharmacy],[diabetesPreventionModel,dpp]]){
    assert.equal(fn({...s,fundingAdditionality:0}).netQalys,0);
    assert.equal(fn({...s,fundingAdditionality:0,harmQalys:1}).netQalys,0);
    assert.equal(fn({...s,fundingAdditionality:0}).costPerTenQalys,null);
    const harmed=fn({...s,harmQalys:1});
    assert.ok(harmed.netQalys<0);assert.equal(harmed.costPerTenQalys,null);
    assert.throws(()=>fn({...s,cost:NaN}),RangeError);
    assert.throws(()=>fn({...s,fundingAdditionality:1.1}),RangeError);
    close(fn({...s,cost:s.cost*2}).costPerTenQalys,fn(s).costPerTenQalys*2);
  }
});
test('benefit health onset is distinct from six months of benefit receipts',()=>{
  close(benefitAccessModel({...benefits,effectiveYears:.5}).netQalys,benefitAccessModel(benefits).netQalys*2);
  assert.throws(()=>diabetesPreventionModel({...dpp,retention:[NaN]}),RangeError);
  assert.throws(()=>benefitAccessModel({...benefits,approval:2}),RangeError);
});

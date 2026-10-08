import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {researchCostRanking as rows} from '../lib/research-cost-ranking.mjs';
import {localResearchEstimate} from '../lib/local-research-estimate.mjs';
import {calculate as hpp} from '../lib/hpp-model.mjs';
import {calculate as felton} from '../lib/felton-model.mjs';
import {calculate as sfphf} from '../lib/sfphf-model.mjs';
import {walkSfModel} from '../lib/walk-sf-model.mjs';
import {calculate as hac} from '../lib/hac-calibrated-model.mjs';
import {scenarios as glide} from '../lib/glide-calibrated-model.mjs';
import {diagnostics as breathe} from '../lib/breathe-calibrated-model.mjs';
import {calculate as pvf} from '../lib/pvf-calibrated-model.mjs';
import {calculate as code} from '../lib/code-tenderloin-calibrated-model.mjs';
import {calculate as spur} from '../lib/spur-calibrated-model.mjs';
import {calculate as oa} from '../lib/operation-access-calibrated-model.mjs';
import {calculate as ymca} from '../lib/ymca-current-calibrated-model.mjs';
import {calculate as clinic} from '../lib/clinic-calibrated-model.mjs';
import {calculate as sfaf} from '../lib/sfaf-calibrated-model.mjs';
import {calculate as phc} from '../lib/phc-calibrated-model.mjs';
import {hearingCalibratedModel as hearing} from '../lib/hearing-calibrated-model.mjs';
import {calculate as compass,central as compassInputs} from '../lib/compass-calibrated-model.mjs';
import {calculate as hamilton,central as hamiltonInputs} from '../lib/hamilton-calibrated-model.mjs';
import {calculate as fuf,central as fufInputs} from '../lib/fuf-calibrated-model.mjs';
import {calculate as selfhelp} from '../lib/selfhelp-current-model.mjs';
import {calculate as huckleberry} from '../lib/huckleberry-current-model.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../data/san-francisco/'+name,import.meta.url)));
const central=d=>d.scenarios.find(s=>s.id==='central');
test('all current Bay adapters match the selected current calculators, not historical diagnostics',()=>{
 const h=read('hpp-model-v1.json'),f=read('felton-model-v1.json'),p=read('sfphf-model-v1.json'),w=read('walk-sf-cea-v1.json');
 const expected={
  'housing-action-coalition':hac().donorPriceBay,
  glide:glide().find(s=>s.id==='conditional_center').result.bay.donorPer10HealthyYears,
  'breathe-california':breathe().central.ledgers.bay.conditionalDonorPer10,
  'pacific-vision-foundation':pvf().regions.bay.donorPrice10,
  'homeless-prenatal-program':hpp(central(h).inputs).bay.donor_per_10q,
  'felton-institute':felton({...f.central_inputs,...central(f).overrides}).donor_bay_per_10q,
  'sf-public-health-foundation':sfphf(central(p).inputs).bay.donor_per_10q,
  'code-tenderloin':code().bayUsdPerBetterLife,
  'walk-san-francisco':walkSfModel(central(w),w.giftUsd).bayUsdPer10Qaly,
  spur:spur().regions.bay.price10,
  'operation-access':oa().regions.bay.price10,
  'ymca-greater-sf':ymca().geography.bayIncludingSF.donorUSDPer10CombinedEquivalentYears,
  'clinic-by-the-bay':clinic().donorBayPrice10,
  'san-francisco-aids-foundation':sfaf().bayUsdPerBetterLife,
  'project-homeless-connect':phc().donor_bay_per_10q,
  'hearing-and-speech-center':hearing({}).bayCostPerTenQalys,
  'compass-family-services':compass(compassInputs).bay.costPerBetterLifeUSD,
  'hamilton-families':hamilton(hamiltonInputs).bay.costPerBetterLifeUSD,
  'friends-of-the-urban-forest':fuf(fufInputs).bay.costPerBetterLifeUSD,
  'self-help-for-the-elderly':selfhelp().bay.usdPerBetterLife,
  'huckleberry-youth-programs':huckleberry().bay.usdPerBetterLife,
  'north-east-medical-services':null,
  'new-door-ventures':null,
 };
 const adapters=rows.filter(r=>Object.hasOwn(r,'bayUsdPerTenQalys'));
 assert.equal(new Set(adapters.map(r=>r.slug)).size,adapters.length);
 assert.deepEqual(adapters.map(r=>r.slug).sort(),Object.keys(expected).sort());
 for(const[slug,value]of Object.entries(expected)){
  assert.ok(value===null||(Number.isFinite(value)&&value>0),slug);
  const row=adapters.find(r=>r.slug===slug);assert.equal(row.bayUsdPerTenQalys,value,slug);
  assert.equal(localResearchEstimate(row).localUsdPerTenQalys,value,slug);
  assert.equal(localResearchEstimate(row).estimateGeography,'Bay Area');
 }
 assert.equal(rows.find(r=>r.slug==='new-door-ventures').estimateStatus,'conditional-net-harm');
 assert.match(localResearchEstimate(rows.find(r=>r.slug==='new-door-ventures')).localStatus,/ordinary-donation EV remains unknown/);
 assert.equal(rows.find(r=>r.slug==='self-help-for-the-elderly').estimateStatus,'conditional-course');
 assert.match(localResearchEstimate(rows.find(r=>r.slug==='self-help-for-the-elderly')).localStatus,/ordinary-donation EV/);
 assert.equal(rows.find(r=>r.slug==='project-homeless-connect').centralUsdPerTenQalys,phc().donor_sf_per_10q);
});
test('Bay selection distinguishes missing model from explicit null, independent of price or scope',()=>{
 assert.equal(localResearchEstimate({centralUsdPerTenQalys:10}).localUsdPerTenQalys,10);
 assert.equal(localResearchEstimate({centralUsdPerTenQalys:10}).estimateGeography,'San Francisco');
 assert.equal(localResearchEstimate({centralUsdPerTenQalys:10,bayUsdPerTenQalys:null}).localUsdPerTenQalys,null);
 assert.equal(localResearchEstimate({centralUsdPerTenQalys:10,bayUsdPerTenQalys:20,scope:'SF'}).localUsdPerTenQalys,20);
});

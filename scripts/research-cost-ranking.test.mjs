import test from 'node:test';
import assert from 'node:assert/strict';
import { researchCostRanking as rows } from '../lib/research-cost-ranking.mjs';
import {calculate as sfafModel,scenarios as sfafScenarios} from '../lib/sfaf-calibrated-model.mjs';
import {calculate as phcModel,scenarios as phcScenarios} from '../lib/phc-calibrated-model.mjs';
import {calculate as pvfModel,scenarios as pvfScenarios} from '../lib/pvf-calibrated-model.mjs';

test('current calibrated positive ranges use every positive scenario, not historical engines',()=>{
  for(const [slug,values] of [
    ['san-francisco-aids-foundation',sfafScenarios().map(s=>sfafModel(s.overrides).sfUsdPerBetterLife)],
    ['project-homeless-connect',phcScenarios.map(s=>phcModel(s.inputs,s.resources).donor_sf_per_10q)]
  ]){
    const positive=values.filter(x=>Number.isFinite(x)&&x>0);
    assert.deepEqual(rows.find(r=>r.slug===slug).positiveEffectRangeUsd,{low:Math.min(...positive),high:Math.max(...positive)});
  }
});

test('all 51 SF ranking entries have unique, ascending conditional prices with nulls last', () => {
  assert.equal(rows.length, 51);
  assert.equal(new Set(rows.map(r => r.slug)).size, 51);
  rows.forEach((r, i) => {
    assert.ok(r.centralUsdPerTenQalys===null || (Number.isFinite(r.centralUsdPerTenQalys) && r.centralUsdPerTenQalys > 0));
    if (i) assert.ok((rows[i - 1].centralUsdPerTenQalys??Infinity) <= (r.centralUsdPerTenQalys??Infinity));
  });
  assert.equal(rows.find(r=>r.slug==='north-east-medical-services').centralUsdPerTenQalys,null);
  assert.equal(rows.find(r=>r.slug==='new-door-ventures').centralUsdPerTenQalys,null);
  assert.equal(rows.find(r=>r.slug==='new-door-ventures').estimateStatus,'conditional-net-harm');
  assert.equal(rows.find(r=>r.slug==='pacific-vision-foundation').bayUsdPerTenQalys,pvfModel(pvfScenarios.central).regions.bay.donorPrice10);
  assert.equal(rows.find(r=>r.slug==='san-francisco-aids-foundation').centralUsdPerTenQalys,sfafModel(sfafScenarios().find(s=>/central/i.test(s.name)).overrides).sfUsdPerBetterLife);
  const phcCenter=phcScenarios.find(s=>/central/i.test(s.name));
  assert.equal(rows.find(r=>r.slug==='project-homeless-connect').centralUsdPerTenQalys,phcModel(phcCenter.inputs,phcCenter.resources).donor_sf_per_10q);
});

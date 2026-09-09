import test from 'node:test';
import assert from 'node:assert/strict';
import { researchCostRanking as rows } from '../lib/research-cost-ranking.mjs';
import sfaf from '../data/san-francisco/sfaf-portfolio-model-v1.json' with {type:'json'};
import phc from '../data/san-francisco/phc-portfolio-model-v1.json' with {type:'json'};
import {calculate as sfafModel} from '../lib/sfaf-portfolio-model.mjs';
import {calculate as phcModel,inputsFor} from '../lib/phc-portfolio-model.mjs';

test('whole-gift positive ranges use every positive scenario, not the central value alone',()=>{
  for(const [slug,values] of [
    ['san-francisco-aids-foundation',sfaf.scenarios.map(s=>sfafModel(s.inputs).sf.donor_per_10q)],
    ['project-homeless-connect',phc.scenarios.map(s=>phcModel(inputsFor(phc,s)).donor_sf_per_10q)]
  ]){
    const positive=values.filter(x=>Number.isFinite(x)&&x>0);
    assert.deepEqual(rows.find(r=>r.slug===slug).positiveEffectRangeUsd,{low:Math.min(...positive),high:Math.max(...positive)});
  }
});

test('all 50 SF reviews have unique, ascending central 10-QALY estimates', () => {
  assert.equal(rows.length, 50);
  assert.equal(new Set(rows.map(r => r.slug)).size, 50);
  rows.forEach((r, i) => {
    assert.ok(Number.isFinite(r.centralUsdPerTenQalys) && r.centralUsdPerTenQalys > 0);
    if (i) assert.ok(rows[i - 1].centralUsdPerTenQalys <= r.centralUsdPerTenQalys);
  });
  assert.deepEqual(rows.slice(0, 4).map(r => r.slug), ['glide', 'breathe-california', 'operation-access', 'pacific-vision-foundation']);
  assert.ok(Math.abs(rows.find(r=>r.slug==='san-francisco-aids-foundation').centralUsdPerTenQalys - 2018525) < 1);
  assert.ok(Math.abs(rows.find(r=>r.slug==='project-homeless-connect').centralUsdPerTenQalys - 798863.340389) < .001);
});

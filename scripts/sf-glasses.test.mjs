import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { glassesDecisionModel } from '../lib/glasses-model.mjs';
const model = JSON.parse(readFileSync(new URL('../data/san-francisco/phc-glasses-cea-v1.json', import.meta.url)));
test('PHC central and positive scenarios reconcile to explicit 10-QALY arithmetic', () => {
  const results = model.scenarios.map(glassesDecisionModel);
  assert.ok(Math.abs(results[1].costPerTenQalys - 71111.111111) < 0.01);
  assert.equal(results[1].qalysPerPair, 0.014062499999999999);
  assert.ok(Math.abs(results[0].costPerTenQalys - 8888.888889) < 0.01);
  assert.equal(results[2].costPerTenQalys, 4000000);
  assert.ok(Math.abs(results[1].maximumCostFor100k - 140.625) < 0.001);
});
test('PHC zero benefit is not a finite price and invalid inputs fail', () => {
  for (const key of ['utilityGain', 'effectiveUseYears', 'additionality']) assert.equal(glassesDecisionModel({ ...model.scenarios[1], [key]: 0 }).costPerTenQalys, null);
  for (const bad of [-1, NaN, Infinity]) assert.throws(() => glassesDecisionModel({ ...model.scenarios[1], costPerDispensedPair: bad }));
  assert.throws(() => glassesDecisionModel({ ...model.scenarios[1], additionality: 1.1 }));
  assert.throws(() => glassesDecisionModel({ ...model.scenarios[1], effectiveUseYears: 1.1 }));
});
test('PHC source and donation boundaries remain inspectable', () => {
  assert.equal(model.fundingRoom.verifiedUsd, null);
  assert.equal(model.confidence, 'very-low');
  assert.equal(model.entity.sponsorEin, '94-3255070');
  assert.equal(model.anchors.localPresentations / model.anchors.localReferrals, 0.35);
  for (const s of model.sources) assert.ok(s.url.startsWith('https://') && s.retrieved && s.published);
});

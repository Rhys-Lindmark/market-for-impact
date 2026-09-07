import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { discountedSurvivalQalys, naloxoneDecisionModel } from '../lib/naloxone-model.mjs';

const inputs = { costPerDose: 20, reportedReversals: 2852, distributedDoses: 41399, marginalYieldRetention: 0.5, additionalSurvivalPerReversal: 0.02, qalysPerDeathPrevented: discountedSurvivalQalys({ utility: 0.7, annualHazard: 0.08, horizonYears: 15, discountRate: 0.03 }) };
test('published scenario data reproduces central and downside prices', () => {
  const m = JSON.parse(readFileSync(new URL('../data/san-francisco/sfaf-naloxone-cea-v1.json', import.meta.url), 'utf8'));
  const prices = m.scenarios.map((s) => naloxoneDecisionModel({ ...s, reportedReversals: m.reported.reversals, distributedDoses: m.reported.doses, qalysPerDeathPrevented: discountedSurvivalQalys(s) }).costPerTenQalys);
  [5015.90, 56327.57, 1666845.02].forEach((expected, i) => assert.ok(Math.abs(prices[i] - expected) < 0.02));
  assert.equal(m.fundingRoom.verifiedUsd, null);
  assert.equal(m.confidence, 'very-low');
  assert.ok(m.sources.every((s) => s.url.startsWith('https://') && s.retrieved === '2026-09-07'));
});
test('naloxone price uses incremental survival, not reported reversals as deaths prevented', () => {
  const result = naloxoneDecisionModel(inputs);
  assert.ok(result.costPerTenQalys > 56000 && result.costPerTenQalys < 57000);
  assert.equal(result.costPerTenQalys, result.costPerQaly * 10);
  assert.ok(Math.abs(result.additionalQalys * result.costPerQaly - 100000) < 1e-8);
  assert.equal(result.incrementalDeathsPreventedPerDose, (2852 / 41399) * 0.5 * 0.02);
});
test('zero additionality has no finite price, never a zero-dollar claim', () => {
  const result = naloxoneDecisionModel({ ...inputs, marginalYieldRetention: 0 });
  assert.equal(result.costPerTenQalys, null);
  assert.equal(result.finitePrice, false);
  assert.equal(result.additionalQalys, 0);
});
test('survival integral and model reject invalid parameters', () => {
  assert.equal(discountedSurvivalQalys({ utility: 0.7, annualHazard: 0, horizonYears: 10, discountRate: 0 }), 7);
  assert.throws(() => naloxoneDecisionModel({ ...inputs, distributedDoses: 0 }), RangeError);
  assert.throws(() => naloxoneDecisionModel({ ...inputs, marginalYieldRetention: 2 }), RangeError);
  assert.throws(() => discountedSurvivalQalys({ utility: NaN, annualHazard: 0, horizonYears: 10, discountRate: 0 }), RangeError);
});
test('higher delivery cost worsens price and higher attributable benefit improves it', () => {
  const base = naloxoneDecisionModel(inputs).costPerTenQalys;
  assert.equal(naloxoneDecisionModel({ ...inputs, costPerDose: 40 }).costPerTenQalys, base * 2);
  assert.equal(naloxoneDecisionModel({ ...inputs, additionalSurvivalPerReversal: 0.04 }).costPerTenQalys, base / 2);
});

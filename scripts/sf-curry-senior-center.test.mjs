import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/curry-senior-center-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/curry-senior-center-cea-v1.json', 'utf8'));

function normalCdf(value) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const erf = sign * (1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)));
  return 0.5 * (1 + erf);
}

test('Curry review separates favorable pre/post change from causal impact', () => {
  assert.equal(review.evidence.length, 4);
  assert.match(review.evidence[0].result, /d=-0.24/);
  assert.match(review.evidence[0].transfer, /no comparison group/i);
  assert.match(review.evidence[2].result, /not statistically significant/i);
  assert.match(review.decision.costEffectiveness, /Exploratory: about \$170,000/);
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Curry exploratory model exposes its distributional judgment and null-effect boundary', () => {
  const byKey = new Map(model.inputs.map((input) => [input.key, input]));
  const cost = byKey.get('marginal_cost_per_participant_usd');
  const effect = byKey.get('causal_mean_shift_sd');
  const threshold = byKey.get('meaningful_change_threshold_sd');
  const probability = byKey.get('incremental_meaningful_improvement_probability');
  const recalculatedProbability = normalCdf(-threshold.best + effect.best) - normalCdf(-threshold.best);
  assert.equal(model.status, 'exploratory-model-not-funding-recommendation');
  assert.equal(model.bottomLine.costPerAdditionalMeaningfulImprovementUsd, 167217);
  assert.ok(Math.abs(recalculatedProbability - probability.best) < 0.00001);
  assert.ok(Math.abs(cost.best / probability.best - model.bottomLine.costPerAdditionalMeaningfulImprovementUsd) < 2);
  assert.equal(model.sensitivity.length, 3);
  assert.match(model.formula.incrementalMeaningfulImprovementProbability, /normal_cdf/);
  assert.match(model.formula.distributionAssumption, /MFI approximation/);
  assert.match(model.nullEffectBoundary, /null or harmful effect/i);
  assert.match(model.fundingRoom.boundary, /not evidence that Curry can add 21/i);
  assert.ok(model.sources.every((source) => source.url && source.role));
});

test('Curry review keeps periods, outputs, and conditional grants bounded', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 10598408);
  assert.equal(review.financialContext.programServicesExpenseUsd, 7433744);
  assert.match(review.financialContext.boundary, /FY2024 audited finances and FY2025 service scale must not be combined/i);
  assert.match(review.financialContext.boundary, /not cash on hand/i);
  assert.ok(review.nativeScale.every((row) => /not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

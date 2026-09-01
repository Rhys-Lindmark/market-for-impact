import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/project-open-hand-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/project-open-hand-mtm-cea-v1.json', 'utf8'));
const bridge = JSON.parse(fs.readFileSync('data/san-francisco/heart-failure-hospitalization-qaly-bridge-v1.json', 'utf8'));

test('Project Open Hand review preserves mixed evidence and the null primary endpoint', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].result, /primary.*not improved/i);
  assert.match(review.evidence[0].result, /27\.1% with meals versus 24\.6% with usual care/i);
  assert.match(review.evidence[0].result, /-5\.3-point difference/i);
  assert.match(review.decision.costEffectiveness, /Primary endpoint: no demonstrated benefit/i);
  assert.equal(review.decision.roomForMoreFunding, 'Not published for the modeled pathway');
  assert.equal(review.model.missingInputs.length, 6);
  assert.match(review.model.qalyBoundary, /separate v0\.1 bridge/i);
});

test('Project Open Hand QALY bridge normalizes to ten QALYs without hiding the null', () => {
  const byKey = new Map(bridge.inputs.map((input) => [input.key, input]));
  const nativeCost = byKey.get('cost_per_heart_failure_hospitalization_averted_usd');
  const qaly = byKey.get('qaly_per_heart_failure_hospitalization_averted');
  const denominator = byKey.get('qalys_per_better_life');
  assert.equal(bridge.comparisonOutcome, '10 incremental QALYs (one better life)');
  assert.equal(bridge.bottomLine.costPerQalyUsd, nativeCost.best / qaly.best);
  assert.equal(bridge.bottomLine.costPerTenQalysUsd, bridge.bottomLine.costPerQalyUsd * denominator.best);
  assert.equal(bridge.bottomLine.conditionalPositiveEffectRangeUsd.low, Math.round(nativeCost.low / qaly.high * 10));
  assert.equal(bridge.bottomLine.conditionalPositiveEffectRangeUsd.high, Math.round(nativeCost.high / qaly.low * 10));
  assert.match(bridge.nullEffectBoundary, /no finite upper bound/i);
  assert.match(bridge.scope.overlapControls, /excludes mortality/i);
  assert.equal(bridge.sources.length, 4);
  assert.ok(bridge.sources.every((source) => source.url && source.published && source.retrieved && source.role));
});

test('Project Open Hand heart-failure model is reproducible and explicitly conditional', () => {
  const byKey = new Map(model.inputs.map((input) => [input.key, input]));
  const cost = byKey.get('modeled_marginal_cost_per_course_usd');
  const primary = byKey.get('kp_nourish_all_cause_hospitalization_risk_difference');
  const effect = byKey.get('causal_heart_failure_hospitalization_reduction');
  assert.equal(model.status, 'exploratory-model-not-funding-recommendation');
  assert.equal(primary.best, 0.026);
  assert.equal(model.bottomLine.costPerAdditionalHeartFailureHospitalizationAvertedUsd, cost.best / effect.best);
  assert.ok(Math.abs(model.bottomLine.giftUsd / cost.best - model.bottomLine.estimatedMealCourses) < 0.01);
  assert.ok(Math.abs(model.bottomLine.estimatedMealCourses * effect.best - model.bottomLine.estimatedAdditionalHeartFailureHospitalizationsAverted) < 0.01);
  assert.deepEqual(model.bottomLine.conditionalPositiveEffectRangeUsd, { low: 56604, high: 1400000 });
  assert.match(model.formula.primaryEndpointBoundary, /null/i);
  assert.match(model.nullEffectBoundary, /no finite upper bound/i);
  assert.match(model.fundingRoom.boundary, /illustrative/i);
  assert.ok(model.excludedBenefits.some((item) => /All-cause hospitalization reduction/i.test(item)));
});

test('Project Open Hand scale and finances stay descriptive', () => {
  assert.equal(review.nativeScale.length, 3);
  assert.ok(review.nativeScale.every((row) => /not|service output/i.test(row.semantics)));
  assert.match(review.financialContext.boundary, /not the cost/);
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const model = read('data/san-francisco/sf-lgbt-center-employment-cea-v1.json');
const review = read('data/san-francisco/sf-lgbt-center-employment-review-v1.json');
const bridge = read('data/san-francisco/sf-lgbt-center-employment-qaly-bridge-audit-v1.json');

test('keeps the Center employment accounting and conditional attribution inspectable', () => {
  const expense = model.inputs.find((row) => row.key === 'fy2024_economic_development_expense_usd');
  const placements = model.inputs.find((row) => row.key === 'reported_living_wage_placements');
  const attribution = model.inputs.find((row) => row.key === 'conditional_center_attribution_share');
  assert.equal(Math.round(expense.best / placements.best), model.bottomLine.reportedGrossCostPerPlacementBenchmarkUsd);
  assert.equal(Math.round(expense.best / (placements.best * attribution.best)), model.bottomLine.conditionalMidpointCostPerAdditionalPlacementUsd);
  assert.match(expense.basis, /not an employment-program budget/i);
  assert.match(model.nullEffectBoundary, /no finite positive cost-effectiveness estimate/i);
  assert.match(model.fundingRoom.boundary, /illustrative and linear/i);
});

test('keeps employment fail-closed against the 10-QALY better-life denominator', () => {
  assert.equal(bridge.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridge.sharedDenominator.publishedPriceUsd, null);
  assert.equal(bridge.status, 'not-yet-convertible');
  assert.equal(bridge.candidateEvidence.qalyPerPlacement, null);
  assert.equal(bridge.failedGates.length, 7);
  assert.equal(bridge.illustrativeCounterfactual.status, 'not-calculable');
  assert.equal(bridge.illustrativeCounterfactual.resultUsd, null);
  assert.match(bridge.decision, /Employment is not itself a health state/i);
  assert.match(bridge.illustrativeCounterfactual.publicationBoundary, /fabricate the central input/i);
});

test('does not relabel reported placements, program reach, or QALYs as causal impact', () => {
  assert.match(model.status, /conditional-scenario/i);
  assert.match(model.decisionUnit, /additional living-wage job placement attributable/i);
  assert.equal(model.excludedBenefits.some((row) => /10-QALY/i.test(row)), true);
  assert.equal(review.evidence.length, 4);
  assert.equal(new Set(review.sources.map((source) => source.url)).size, review.sources.length);
  assert.match(review.reservations.join(' '), /without a reporting period/i);
});

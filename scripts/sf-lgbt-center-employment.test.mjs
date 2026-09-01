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

test('publishes an inspectable employment-to-QALY decision model without treating employment as a health state', () => {
  assert.equal(bridge.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridge.status, 'exploratory-employment-health-utility-transfer-model');
  assert.equal(bridge.sourceEvidence.absoluteEmploymentEffect, 0.049);
  assert.equal(bridge.sourceEvidence.incrementalQalyPerParticipant.best, 0.01);
  const m = bridge.modeledBridge;
  const expectedQaly = bridge.sourceEvidence.incrementalQalyPerParticipant.best
    / bridge.sourceEvidence.absoluteEmploymentEffect
    * m.retainedShareForProgramPopulationAndMediationTransfer.best
    * m.retainedShareForPlacementDurability.best;
  assert.ok(Math.abs(expectedQaly - m.qalyPerAdditionalPlacement.best) < 1e-12);
  const expectedPrice = m.conditionalCostPerAdditionalPlacementUsd.best / expectedQaly * 10;
  assert.ok(Math.abs(expectedPrice - m.bestCostPerTenQalysUsd) < 1e-6);
  assert.equal(expectedPrice, bridge.sharedDenominator.publishedPriceUsd);
  assert.equal(m.sensitivity.length, 3);
  for (const row of m.sensitivity) {
    assert.ok(Math.abs(row.costPerAdditionalPlacementUsd / row.qalyPerAdditionalPlacement * 10 - row.costPerTenQalysUsd) < 1e-4);
  }
  assert.match(m.externalImpliedQalyPerAdditionalJobStart.basis, /not a causal mediation estimate/i);
  assert.match(m.nullBoundary, /no finite positive upper bound/i);
  assert.match(bridge.decision, /not a measured Center effect/i);
});

test('does not relabel reported placements, program reach, or QALYs as causal impact', () => {
  assert.match(model.status, /conditional-scenario/i);
  assert.match(model.decisionUnit, /additional living-wage job placement attributable/i);
  assert.equal(bridge.excludedBenefits.some((row) => /Earnings/i.test(row)), true);
  assert.equal(review.evidence.length, 4);
  assert.equal(new Set(review.sources.map((source) => source.url)).size, review.sources.length);
  assert.match(review.reservations.join(' '), /without a reporting period/i);
});

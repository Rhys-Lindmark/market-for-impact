import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const model = read('data/san-francisco/sf-marin-food-bank-community-market-cea-v1.json');
const review = read('data/san-francisco/sf-marin-food-bank-review-v1.json');
const bridge = read('data/san-francisco/sf-marin-food-bank-qaly-bridge-audit-v1.json');

test('keeps the food-bank model arithmetic and accounting boundary inspectable', () => {
  const cost = model.inputs.find((row) => row.key === 'modeled_cash_cost_per_26_week_household_course_usd');
  const effect = model.inputs.find((row) => row.key === 'causal_absolute_very_low_food_security_reduction');
  assert.equal(cost.best / effect.best, model.bottomLine.costPerAdditionalHouseholdNotExperiencingVeryLowFoodSecurityUsd);
  assert.match(cost.basis, /does not value donated food at zero/i);
  assert.match(model.nullEffectBoundary, /no finite positive cost-effectiveness estimate/i);
  assert.match(model.fundingRoom.boundary, /illustrative/i);
});

test('does not smuggle meals or QALYs into the native outcome', () => {
  assert.match(model.decisionUnit, /household not experiencing very low food security/i);
  assert.equal(model.excludedBenefits.some((row) => /10-QALY/i.test(row)), true);
  assert.equal(review.evidence.length, 3);
  assert.equal(new Set(review.sources.map((source) => source.url)).size, review.sources.length);
});

test('publishes an inspectable, bounded 10-QALY decision model without collapsing the food-security states', () => {
  assert.equal(bridge.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridge.status, 'exploratory-food-security-health-utility-transfer-model');
  assert.equal(bridge.sourceEvidence.qalyPerAdultYear.best, 0.008);
  const m = bridge.modeledBridge;
  const expectedQaly = m.causalExitFromVeryLowFoodSecurityProbability.best
    * m.shareOfExitsReachingFullHouseholdFoodSecurity.best
    * m.adultEquivalentBeneficiariesPerHousehold.best
    * bridge.sourceEvidence.qalyPerAdultYear.best
    * m.retainedShareOfObservedUtilityEffect.best
    * m.effectiveDurationYears.best;
  assert.ok(Math.abs(expectedQaly - m.qalyPerHouseholdCourse.best) < 1e-12);
  const expectedPrice = m.modeledDonorCostPerHouseholdCourseUsd.best / expectedQaly * 10;
  assert.ok(Math.abs(expectedPrice - m.bestCostPerTenQalysUsd) < 1e-6);
  assert.ok(Math.abs(expectedPrice - bridge.sharedDenominator.publishedPriceUsd) < 1e-6);
  assert.equal(m.sensitivity.length, 3);
  for (const row of m.sensitivity) {
    assert.ok(Math.abs(row.donorCostPerHouseholdCourseUsd / row.qalyPerHouseholdCourse * 10 - row.costPerTenQalysUsd) < 1e-4);
  }
  assert.match(m.shareOfExitsReachingFullHouseholdFoodSecurity.basis, /35%.*judgment/i);
  assert.match(m.nullBoundary, /no finite positive upper bound/i);
  assert.match(bridge.decision, /not a measured SFMFB effect/i);
});

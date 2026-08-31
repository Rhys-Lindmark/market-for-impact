import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const model = read('data/san-francisco/sf-marin-food-bank-community-market-cea-v1.json');
const review = read('data/san-francisco/sf-marin-food-bank-review-v1.json');

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

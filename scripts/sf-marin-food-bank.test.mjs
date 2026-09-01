import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const model = read('data/san-francisco/sf-marin-food-bank-community-market-cea-v1.json');
const review = read('data/san-francisco/sf-marin-food-bank-review-v1.json');
const bridgeAudit = read('data/san-francisco/sf-marin-food-bank-qaly-bridge-audit-v1.json');

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

test('fails closed on the 10-QALY comparison until the native outcome matches the evidence', () => {
  assert.equal(bridgeAudit.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridgeAudit.status, 'not-yet-convertible');
  assert.equal(bridgeAudit.sharedDenominator.publishedPriceUsd, null);
  assert.equal(bridgeAudit.failedGates.length, 4);
  assert.equal(bridgeAudit.failedGates.every((gate) => gate.status === 'failed'), true);
  assert.match(bridgeAudit.failedGates.find((gate) => gate.key === 'health_state_transition').why, /low and very low.*food insecure/i);
  assert.match(bridgeAudit.failedGates.find((gate) => gate.key === 'person_allocation').why, /household.*people/i);
  assert.equal(bridgeAudit.candidateEvidence.qalyPerAdultYear.best, 0.008);
  assert.equal(bridgeAudit.illustrativeCounterfactual.nativeCostPerOutcomeUsd / bridgeAudit.illustrativeCounterfactual.qalyPerOutcome * 10, bridgeAudit.illustrativeCounterfactual.resultUsd);
  assert.equal(bridgeAudit.illustrativeCounterfactual.status, 'not-a-comparison-price');
  assert.match(bridgeAudit.illustrativeCounterfactual.publicationBoundary, /must not appear.*comparison price/i);
});

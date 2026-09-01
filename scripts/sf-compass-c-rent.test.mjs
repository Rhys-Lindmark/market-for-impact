import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/compass-family-services-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/compass-c-rent-cea-v1.json', 'utf8'));
const bridgeAudit = JSON.parse(fs.readFileSync('data/san-francisco/compass-c-rent-qaly-bridge-audit-v1.json', 'utf8'));
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('Compass C-Rent accounting model reconciles exactly', () => {
  const expense = model.inputs.find((input) => input.key === 'audited_c_rent_program_expense_usd').best;
  const assistance = model.inputs.find((input) => input.key === 'audited_c_rent_housing_assistance_usd').best;
  const families = model.inputs.find((input) => input.key === 'reported_prevention_classified_families').best;
  const cost = model.inputs.find((input) => input.key === 'gross_accounting_cost_per_reported_family_usd').best;
  assert.equal(expense, assistance + model.accountingReconciliation.nonHousingProgramExpenseUsd);
  close(cost, expense / families);
  close(model.accountingReconciliation.housingAssistancePerReportedFamilyUsd, assistance / families);
  close(model.accountingReconciliation.nonHousingProgramExpensePerReportedFamilyUsd, model.accountingReconciliation.nonHousingProgramExpenseUsd / families);
});

test('Compass C-Rent impact model is reproducible and preserves the null case', () => {
  const cost = model.inputs.find((input) => input.key === 'gross_accounting_cost_per_reported_family_usd').best;
  const effect = model.inputs.find((input) => input.key === 'causal_six_month_homelessness_reduction').best;
  close(model.bottomLine.historicalEquivalentFamilyCases, model.bottomLine.giftUsd / cost);
  close(model.bottomLine.estimatedAdditionalHomelessnessEpisodesAverted, model.bottomLine.historicalEquivalentFamilyCases * effect);
  close(model.bottomLine.costPerAdditionalHomelessnessEpisodeAvertedUsd, cost / effect);
  assert.match(model.nullEffectBoundary, /no finite upper bound/i);
  assert.match(model.fundingRoom.boundary, /not annual flow|life-to-date/i);
  assert.ok(!model.excludedBenefits.some((item) => /QALYs|10-QALY/i.test(item)));
});

test('Compass C-Rent evidence and sources preserve causal and funding boundaries', () => {
  assert.ok(review.evidence.some((item) => item.key === 'compass-c-rent-audit' && /not a causal/i.test(item.transfer)));
  assert.ok(review.evidence.some((item) => item.key === 'santa-clara-prevention-rct' && /indirect/i.test(item.transfer)));
  assert.ok(review.evidence.some((item) => item.key === 'compass-prevention-public-contract' && /not.*verified room for more funding/i.test(item.transfer)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
  assert.equal(model.fundingRoom.publicContractContext.remainingAuthorityUsd, 1805364.7);
});

test('Compass 10-QALY bridge publishes a bounded decision estimate without hiding a plausible null', () => {
  assert.equal(bridgeAudit.status, 'exploratory-housing-health-transfer-model');
  assert.equal(bridgeAudit.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridgeAudit.sourceEvidence.incrementalQalysPerRecipient, 0.144);
  assert.equal(bridgeAudit.sourceEvidence.publishedCostPerQalyUsd, 29751);
  assert.equal(bridgeAudit.modeledBridge.qalyPerAssistedFamily.best, 0.072);
  const expected = bridgeAudit.modeledBridge.modeledDonorCostPerAssistedFamilyUsd.best / bridgeAudit.modeledBridge.qalyPerAssistedFamily.best * 10;
  close(bridgeAudit.modeledBridge.bestCostPerTenQalysUsd, expected);
  close(bridgeAudit.sharedDenominator.publishedPriceUsd, expected);
  assert.deepEqual(bridgeAudit.modeledBridge.positiveEffectRangeUsd, { low: 367681.49490069784, high: 17361111.111111112 });
  assert.equal(bridgeAudit.evidenceWeaknesses.length, 5);
  assert.match(bridgeAudit.modeledBridge.nullBoundary, /no finite upper bound/i);
  assert.match(bridgeAudit.sourceEvidence.compassQalysPerAssistedFamily.basis, /one adult-equivalent/i);
  assert.ok(bridgeAudit.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

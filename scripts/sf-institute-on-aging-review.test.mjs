import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/institute-on-aging-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/institute-on-aging-cea-v1.json', 'utf8'));
const bridgeAudit = JSON.parse(fs.readFileSync('data/san-francisco/institute-on-aging-qaly-bridge-audit-v1.json', 'utf8'));

test('Institute on Aging review separates relevant research from causal impact', () => {
  assert.equal(review.evidence.length, 5);
  assert.match(review.evidence[0].transfer, /different units and may include repeat contacts/i);
  assert.match(review.evidence[1].transfer, /no concurrent control group/i);
  assert.match(review.evidence[2].transfer, /self-selected rather than assigned/i);
  assert.match(review.evidence[3].transfer, /not IOA's Community Living Fund/i);
  assert.match(review.evidence[4].transfer, /not the same as IOA's multilingual 24\/7 warm line/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Institute on Aging exploratory model exposes formulas, sensitivity, and funding-room limits', () => {
  assert.equal(model.bottomLine.costPerAdditionalSixMonthRemissionUsd, 14857);
  assert.deepEqual(model.bottomLine.plausibleRangeUsd, { low: 5000, high: 78000 });
  assert.equal(model.inputs.find((input) => input.key === 'observed_six_month_loneliness_change').best, 0.18);
  assert.equal(model.inputs.find((input) => input.key === 'causal_six_month_remission_probability').best, 0.07);
  assert.equal(model.sensitivity.length, 3);
  assert.match(model.formula.costPerAdditionalRemission, /marginal_cost_per_participant_usd/);
  assert.match(model.fundingRoom.boundary, /illustrative denominator/i);
  assert.equal(model.status, 'exploratory-model-not-funding-recommendation');
});

test('Institute on Aging review preserves program, period, payer, and public-finance boundaries', () => {
  assert.equal(review.financialContext.sourceNativeRevenueUsd, 100033280);
  assert.equal(review.financialContext.sourceNativeAssetAmountUsd, 60214362);
  assert.equal(review.financialContext.fy2025ReportedExpensesUsd, 96914403);
  assert.equal(review.financialContext.fy2025ReportedContributionsUsd, 29471977);
  assert.equal(review.financialContext.fy2025ReportedProgramServiceRevenueUsd, 69708046);
  assert.equal(review.financialContext.activeSfPrimeContractCount, 10);
  assert.equal(review.financialContext.activeSfPrimeContractAwardAuthorityUsd, 37137887);
  assert.equal(review.financialContext.activeSfPrimeContractPaymentsUsd, 21222931.11);
  assert.equal(review.financialContext.activeSfPrimeContractRemainingAuthorityUsd, 7925372);
  assert.match(review.financialContext.boundary, /different accounting fields, not interchangeable funding gaps/i);
  assert.ok(review.nativeScale.every((row) => /not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

test('Institute on Aging fails closed on the 10-QALY comparison', () => {
  assert.equal(bridgeAudit.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridgeAudit.status, 'not-yet-convertible');
  assert.equal(bridgeAudit.sharedDenominator.publishedPriceUsd, null);
  assert.equal(bridgeAudit.failedGates.length, 5);
  assert.equal(bridgeAudit.failedGates.every((gate) => gate.status === 'failed'), true);
  assert.match(bridgeAudit.failedGates.find((gate) => gate.key === 'outcome_mapping').why, /3-item UCLA/i);
  assert.match(bridgeAudit.failedGates.find((gate) => gate.key === 'program_effect').why, /78 completed the six-month/i);
  assert.equal(bridgeAudit.candidateEvidence.annualUtilityGap, 0.04);
  assert.equal(bridgeAudit.candidateEvidence.candidateSixMonthQalyPerRemission, 0.02);
  assert.equal(bridgeAudit.illustrativeCounterfactual.nativeCostPerOutcomeUsd / bridgeAudit.illustrativeCounterfactual.qalyPerOutcome * 10, bridgeAudit.illustrativeCounterfactual.resultUsd);
  assert.equal(bridgeAudit.illustrativeCounterfactual.status, 'not-a-comparison-price');
  assert.match(bridgeAudit.illustrativeCounterfactual.publicationBoundary, /must not appear.*comparison price/i);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/hamilton-families-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/hamilton-prevention-cea-v1.json', 'utf8'));
const bridgeAudit = JSON.parse(fs.readFileSync('data/san-francisco/hamilton-prevention-qaly-bridge-audit-v1.json', 'utf8'));

test('Hamilton review separates reported housing outcomes from additional impact', () => {
  assert.equal(review.evidence.length, 7);
  assert.match(review.evidence[0].transfer, /subset of 344, not an additional outcome count/i);
  assert.match(review.evidence[1].transfer, /127-family count is not a causal estimate/i);
  assert.match(review.evidence[2].result, /3.8 points from a 4.1% control rate/i);
  assert.match(review.evidence[3].transfer, /not an outcome evaluation/i);
  assert.match(review.evidence[4].result, /no outcome results/i);
  assert.match(review.evidence[5].result, /long-term housing subsidies produced the broadest benefits/i);
  assert.match(review.evidence[6].transfer, /without a comparison/i);
  assert.match(review.decision.costEffectiveness, /approximately \$500,000/i);
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Hamilton prevention model is arithmetically reproducible and preserves the null-effect boundary', () => {
  const modeledCost = model.inputs.find((input) => input.key === 'modeled_marginal_cost_per_family_usd');
  const effect = model.inputs.find((input) => input.key === 'causal_six_month_homelessness_reduction');
  assert.equal(modeledCost.best / effect.best, model.bottomLine.costPerAdditionalHomelessnessEpisodeAvertedUsd);
  assert.equal(model.bottomLine.giftUsd / modeledCost.best, model.bottomLine.estimatedAssistanceCases);
  assert.equal(model.bottomLine.estimatedAssistanceCases * effect.best, model.bottomLine.estimatedAdditionalHomelessnessEpisodesAverted);
  assert.deepEqual(model.bottomLine.conditionalPositiveEffectRangeUsd, { low: 100000, high: 12500000 });
  assert.match(model.nullEffectBoundary, /no finite upper bound/i);
  assert.match(model.fundingRoom.boundary, /illustrative/i);
  assert.ok(model.excludedBenefits.some((item) => /QALYs/i.test(item)));
});

test('Hamilton review preserves portfolio, public-funding, and overlap boundaries', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 17410740);
  assert.equal(review.financialContext.governmentRevenueUsd, 11730764);
  assert.equal(review.financialContext.totalExpensesUsd, 18799001);
  assert.equal(review.financialContext.activeSfPrimeContractCount, 8);
  assert.equal(review.financialContext.activeSfPrimeContractAwardAuthorityUsd, 60051037);
  assert.match(review.financialContext.boundary, /none is a private-donation gap/i);
  assert.ok(review.reservations.some((item) => /included within the 344/i.test(item)));
  assert.ok(review.nativeScale.every((row) => /not|no published/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

test('Hamilton 10-QALY audit keeps the VA comparator external and fails closed', () => {
  assert.equal(bridgeAudit.status, 'not-yet-convertible');
  assert.equal(bridgeAudit.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridgeAudit.sharedDenominator.publishedPriceUsd, null);
  assert.equal(bridgeAudit.failedGates.length, 8);
  assert.ok(bridgeAudit.failedGates.every((gate) => gate.status === 'failed'));
  assert.equal(bridgeAudit.candidateEvidence.incrementalQalys, 0.144);
  assert.equal(bridgeAudit.candidateEvidence.publishedCostPerQalyUsd, 29751);
  assert.equal(bridgeAudit.candidateEvidence.publishedCostPerTenQalysUsd, 297510);
  assert.equal(bridgeAudit.candidateEvidence.hamiltonQalysPerAdditionalFamilyAvoidingHomelessness, null);
  assert.equal(bridgeAudit.illustrativeCounterfactual.nativeCostPerOutcomeUsd, model.bottomLine.costPerAdditionalHomelessnessEpisodeAvertedUsd);
  assert.equal(bridgeAudit.illustrativeCounterfactual.resultUsd, null);
  assert.match(bridgeAudit.candidateEvidence.boundary, /not Hamilton's philanthropic price/i);
  assert.match(bridgeAudit.illustrativeCounterfactual.publicationBoundary, /displayed separately as external evidence/i);
  assert.ok(bridgeAudit.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

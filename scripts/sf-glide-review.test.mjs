import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/glide-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/glide-rental-assistance-cea-v1.json', 'utf8'));
const bridge = JSON.parse(fs.readFileSync('data/san-francisco/glide-rental-assistance-qaly-bridge-audit-v1.json', 'utf8'));

test('GLIDE review separates service outputs and external evidence from organization impact', () => {
  const evidence = new Map(review.evidence.map((item) => [item.key, item]));
  assert.equal(review.evidence.length, 8);
  assert.match(evidence.get('glide-rental-fy2025').transfer, /different denominators/i);
  assert.match(evidence.get('homelessness-prevention-quasi-experiment').result, /1.6 percentage points/i);
  assert.match(evidence.get('glide-reporting').transfer, /different service or administrative events/i);
  assert.match(evidence.get('glide-city-monitoring').transfer, /establish compliance, not reduced food insecurity/i);
  assert.equal(evidence.get('food-insecurity-review').result.includes('0.53'), true);
  assert.match(evidence.get('homelessness-case-management-review').transfer, /cannot be transferred without identifying service intensity/i);
  assert.match(evidence.get('contingency-management-review').transfer, /not GLIDE's broader HEAT portfolio/i);
  assert.match(review.decision.costEffectiveness, /Exploratory: about \$154,000/);
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /\$427,000 per 10 QALYs/);
});

test('GLIDE rental-assistance model is arithmetically reproducible and preserves the null-effect boundary', () => {
  const byKey = new Map(model.inputs.map((input) => [input.key, input]));
  const cost = byKey.get('marginal_cost_per_assistance_case_usd');
  const effect = byKey.get('causal_six_month_shelter_entry_reduction');
  assert.equal(model.status, 'exploratory-model-not-funding-recommendation');
  assert.equal(model.bottomLine.costPerAdditionalShelterEntryAvertedUsd, 153850);
  assert.ok(Math.abs(cost.best / effect.best - model.bottomLine.costPerAdditionalShelterEntryAvertedUsd) < 1);
  assert.ok(Math.abs(model.bottomLine.giftUsd / cost.best - model.bottomLine.estimatedAssistanceCases) < 0.01);
  assert.ok(Math.abs(model.bottomLine.estimatedAssistanceCases * effect.best - model.bottomLine.estimatedAdditionalShelterEntriesAverted) < 0.01);
  assert.equal(model.sensitivity.length, 3);
  assert.match(model.formula.denominatorBoundary, /not combined/i);
  assert.match(model.nullEffectBoundary, /no finite upper bound/i);
  assert.match(model.fundingRoom.boundary, /not evidence that GLIDE can productively add/i);
  assert.ok(model.sources.every((source) => source.url && source.role));
});

test('GLIDE publishes a bounded 10-QALY decision estimate without hiding a plausible null', () => {
  assert.equal(bridge.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridge.status, 'exploratory-housing-health-transfer-model');
  assert.equal(bridge.sourceEvidence.incrementalQalysPerRecipient, 0.144);
  assert.equal(bridge.modeledBridge.qalyPerAssistedHousehold.best, 0.072);
  const expected = bridge.modeledBridge.modeledDonorCostPerAssistedHouseholdUsd.best / bridge.modeledBridge.qalyPerAssistedHousehold.best * 10;
  assert.ok(Math.abs(bridge.modeledBridge.bestCostPerTenQalysUsd - expected) < 1e-8);
  assert.ok(Math.abs(bridge.sharedDenominator.publishedPriceUsd - expected) < 1e-8);
  assert.deepEqual(bridge.modeledBridge.positiveEffectRangeUsd, { low: 178055.55555555556, high: 3472222.222222222 });
  assert.equal(bridge.evidenceWeaknesses.length, 5);
  assert.match(bridge.modeledBridge.nullBoundary, /no finite upper bound/i);
  assert.match(bridge.sourceEvidence.glideQalysPerAssistedHousehold.basis, /one adult-equivalent/i);
  assert.equal(new Set(bridge.sources.map((source) => source.url)).size, bridge.sources.length);
  assert.ok(bridge.sources.every((source) => source.published && source.retrieved && source.sourceType));
});

test('GLIDE review preserves consolidated finances and city accounting boundaries', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 30436763);
  assert.equal(review.financialContext.contractRevenueUsd, 10826230);
  assert.equal(review.financialContext.totalExpensesUsd, 30766602);
  assert.equal(review.financialContext.activeSfPrimeContractCount, 14);
  assert.equal(review.financialContext.activeSfPrimeContractAwardAuthorityUsd, 50205192);
  assert.match(review.financialContext.boundary, /none is a private-donation gap/i);
  assert.ok(review.nativeScale.every((row) => /not|no published|does not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

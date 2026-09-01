import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/eviction-defense-collaborative-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/edc-full-scope-legal-defense-cea-v1.json', 'utf8'));
const bridge = JSON.parse(fs.readFileSync('data/san-francisco/edc-legal-defense-qaly-bridge-audit-v1.json', 'utf8'));

test('EDC review preserves mixed evidence and labels its exploratory estimate', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].transfer, /not an EDC-specific causal estimate/i);
  assert.match(review.evidence[2].result, /did not improve substantive outcomes/i);
  assert.match(review.decision.costEffectiveness, /126,000/);
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('EDC financial and outcome boundaries prevent false per-family calculations', () => {
  assert.equal(review.financialContext.rentalAndClientAssistanceUsd, 8018851);
  assert.match(review.financialContext.boundary, /transfers must remain separate/i);
  assert.ok(review.nativeScale.every((row) => /not|different cost categories/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

test('EDC model reconciles the city cost anchor and keeps a null outside the conditional range', () => {
  const teamCost = model.inputs.find((input) => input.key === 'city_fully_loaded_team_cost_usd');
  const cases = model.inputs.find((input) => input.key === 'city_team_case_deliverable');
  const unitCost = model.inputs.find((input) => input.key === 'historical_cost_per_full_scope_case_usd');
  const effect = model.inputs.find((input) => input.key === 'causal_retained_possession_effect');
  assert.equal(teamCost.best / cases.best, unitCost.best);
  assert.equal(unitCost.best / effect.best, model.bottomLine.costPerAdditionalRetainedPossessionOutcomeUsd);
  assert.equal(model.bottomLine.giftUsd / unitCost.best * effect.best, model.bottomLine.estimatedAdditionalRetainedPossessionOutcomes);
  assert.equal(model.sensitivity.length, 3);
  assert.match(model.nullEffectBoundary, /no finite upper bound/i);
  assert.match(model.fundingRoom.boundary, /not an EDC philanthropic gap/i);
  assert.ok(model.excludedBenefits.some((item) => /10-QALY/i.test(item)));
});

test('EDC model does not turn descriptive SF outcomes into a causal input', () => {
  const sfDescriptive = model.inputs.find((input) => input.key === 'sf_unadjusted_stayed_home_difference');
  const effect = model.inputs.find((input) => input.key === 'causal_retained_possession_effect');
  assert.equal(sfDescriptive.best, 0.18);
  assert.equal(effect.best, 0.05);
  assert.match(sfDescriptive.basis, /not reported as randomized or adjusted/i);
  assert.match(effect.basis, /Massachusetts Housing Court experiment found no/i);
});

test('EDC uses 10 QALYs as the shared denominator but fails closed on conversion', () => {
  assert.equal(bridge.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridge.sharedDenominator.publishedPriceUsd, null);
  assert.equal(bridge.status, 'not-yet-convertible');
  assert.equal(bridge.failedGates.length, 8);
  assert.ok(bridge.failedGates.every((gate) => gate.status === 'failed'));
  assert.equal(bridge.illustrativeCounterfactual.nativeCostPerOutcomeUsd, model.bottomLine.costPerAdditionalRetainedPossessionOutcomeUsd);
  assert.equal(bridge.illustrativeCounterfactual.qalyPerOutcome, null);
  assert.equal(bridge.illustrativeCounterfactual.resultUsd, null);
  assert.match(bridge.decision, /retaining possession is a legal and housing outcome/i);
  assert.match(bridge.candidateEvidence.boundary, /does not estimate causal QALYs/i);
});

test('EDC donor-facing pages show the common better-life denominator without inventing a price', () => {
  const report = fs.readFileSync('app/charities/eviction-defense-collaborative/page.tsx', 'utf8');
  const sfPage = fs.readFileSync('app/san-francisco/page.tsx', 'utf8');
  assert.match(report, /\$ PER 10 QALYS · ONE BETTER LIFE/);
  assert.match(report, /Not yet convertible/);
  assert.match(report, /No \$ \/ QALY estimate/);
  assert.match(sfPage, /Eviction Defense Collaborative[\s\S]*betterLifePrice: 'Not yet convertible'/);
  assert.match(sfPage, /Eight evidence gates failed/);
});

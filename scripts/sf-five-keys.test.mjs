import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/five-keys-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/five-keys-credential-cea-v1.json', 'utf8'));
const bridge = JSON.parse(fs.readFileSync('data/san-francisco/five-keys-credential-qaly-bridge-v1.json', 'utf8'));

test('Five Keys review separates service scale and in-house comparison from causal impact', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].transfer, /not impact/i);
  assert.match(review.evidence[1].transfer, /cannot be interpreted as a Five Keys causal reduction/i);
  assert.match(review.evidence[2].result, /30% lower odds of recidivism/i);
  assert.match(review.evidence[2].transfer, /not Five Keys' effect size/i);
  assert.match(review.decision.costEffectiveness, /\$166,700 per additional credential/i);
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /\$4\.9 million per 10-QALY decision estimate/i);
  assert.match(review.model.qalyBoundary, /not a measured Five Keys health effect/i);
});

test('Five Keys review preserves education, portfolio, and public-funding boundaries', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 121977070);
  assert.equal(review.financialContext.activeSfPrimeContractCount, 15);
  assert.equal(review.financialContext.activeSfPrimeContractAwardAuthorityUsd, 214855512);
  assert.match(review.financialContext.boundary, /None of those fields is a private-donation gap/i);
  assert.match(review.financialContext.boundary, /none should be divided by graduates/i);
  assert.ok(review.nativeScale.every((row) => /not|does not|no cohort/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

test('Five Keys model reconciles audited school cost and keeps causal scenarios explicit', () => {
  const inputs = Object.fromEntries(model.inputs.map((input) => [input.key, input]));
  assert.equal(model.bottomLine.historicalGrossCostPerAdaYearUsd, inputs.fy2024_fkih_total_expense_usd.best / inputs.fy2024_fkih_annual_ada.best);
  assert.equal(model.bottomLine.costPerAdditionalCredentialUsd, model.bottomLine.historicalGrossCostPerAdaYearUsd / inputs.mfi_modeled_additional_credential_probability_per_ada_year.best);
  assert.equal(model.sensitivity.length, 3);
  assert.match(inputs.mfi_modeled_additional_credential_probability_per_ada_year.basis, /decision range, not a Five Keys estimate/i);
  assert.match(model.nullEffectBoundary, /zero and harm/i);
  assert.match(model.externalContext.boundary, /not entered into the Five Keys credential model/i);
  assert.match(model.formula.denominatorBoundary, /not a unique life substantially bettered/i);
});

test('Five Keys applies the universal 10-QALY denominator with an explicit discounted transfer model', () => {
  const b = bridge.modeledBridge;
  assert.equal(bridge.sharedDenominator.qalyThreshold, 10);
  assert.equal(bridge.sharedDenominator.publishedPriceUsd, b.bestCostPerTenQalysUsd);
  assert.equal(bridge.sourceEvidence.publishedDiscountedLifetimeQalyPerAdditionalGraduate, 1.7);
  assert.equal(b.qalyPerAdditionalCredential.best, 0.34);
  assert.equal(b.bestCostPerTenQalysUsd, b.historicalGrossCostPerAdaYearUsd / (b.additionalCredentialProbabilityPerAdaYear.best * b.qalyPerAdditionalCredential.best) * 10);
  assert.equal(b.positiveEffectRangeUsd.low, b.historicalGrossCostPerAdaYearUsd / (b.additionalCredentialProbabilityPerAdaYear.high * b.qalyPerAdditionalCredential.high) * 10);
  assert.equal(b.positiveEffectRangeUsd.high, b.historicalGrossCostPerAdaYearUsd / (b.additionalCredentialProbabilityPerAdaYear.low * b.qalyPerAdditionalCredential.low) * 10);
  assert.match(b.nullBoundary, /no finite upper bound/i);
});

test('donor-facing pages publish the explicit Five Keys decision estimate and its uncertainty', () => {
  const report = fs.readFileSync('app/charities/five-keys/page.tsx', 'utf8');
  const sharedReport = fs.readFileSync('components/CharityResearchReport.tsx', 'utf8');
  const sfPage = fs.readFileSync('app/san-francisco/page.tsx', 'utf8');
  assert.match(report, /COST PER BETTER LIFE/);
  assert.match(report, /about \$4\.9 million per better life/);
  assert.match(report, /qalyPerAdditionalCredential\.best/);
  assert.match(sharedReport, /\$ per 10 QALYs — one better life/);
  assert.match(sfPage, /Five Keys Schools and Programs[\s\S]*betterLifePrice: '≈ \$4\.9M'/);
  assert.match(sfPage, /Five Keys Schools and Programs[\s\S]*bridgeState: 'Very-low-confidence education\/QALY model'/);
});

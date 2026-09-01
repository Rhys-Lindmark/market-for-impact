import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/five-keys-review-v1.json', 'utf8'));
const model = JSON.parse(fs.readFileSync('data/san-francisco/five-keys-credential-cea-v1.json', 'utf8'));

test('Five Keys review separates service scale and in-house comparison from causal impact', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].transfer, /not impact/i);
  assert.match(review.evidence[1].transfer, /cannot be interpreted as a Five Keys causal reduction/i);
  assert.match(review.evidence[2].result, /30% lower odds of recidivism/i);
  assert.match(review.evidence[2].transfer, /not Five Keys' effect size/i);
  assert.match(review.decision.costEffectiveness, /\$166,700 per additional credential/i);
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
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

test('donor-facing pages use 10 QALYs as the shared better-life denominator without inventing a bridge', () => {
  const report = fs.readFileSync('app/charities/five-keys/page.tsx', 'utf8');
  const sharedReport = fs.readFileSync('components/CharityResearchReport.tsx', 'utf8');
  const sfPage = fs.readFileSync('app/san-francisco/page.tsx', 'utf8');
  assert.match(report, /\$ PER BETTER LIFE/);
  assert.match(report, /denominator: 10 QALYs/);
  assert.match(sharedReport, /\$ per 10 QALYs — one better life/);
  assert.match(sfPage, /COST PER BETTER LIFE/);
  assert.match(sfPage, /Not yet convertible/);
});

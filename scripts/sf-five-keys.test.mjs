import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/five-keys-review-v1.json', 'utf8'));

test('Five Keys review separates service scale and in-house comparison from causal impact', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].transfer, /not impact/i);
  assert.match(review.evidence[1].transfer, /cannot be interpreted as a Five Keys causal reduction/i);
  assert.match(review.evidence[2].result, /30% lower odds of recidivism/i);
  assert.match(review.evidence[2].transfer, /not Five Keys' effect size/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
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

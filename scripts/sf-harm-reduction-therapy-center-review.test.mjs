import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/harm-reduction-therapy-center-review-v1.json', 'utf8'));

test('HRTC review separates access, engagement, and durable impact', () => {
  assert.equal(review.evidence.length, 5);
  assert.match(review.evidence[0].transfer, /do not publish intervention dose/i);
  assert.match(review.evidence[1].transfer, /not an independent outcome evaluation/i);
  assert.match(review.evidence[2].result, /0\.03 \(95% CI -0\.08 to 0\.14\)/);
  assert.match(review.evidence[3].transfer, /not HRTC's effect size/i);
  assert.match(review.evidence[4].result, /no statistically significant/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('HRTC review preserves financial and model boundaries', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 4618647);
  assert.equal(review.financialContext.totalExpensesUsd, 2726066);
  assert.equal(review.financialContext.activeSfPrimeContractCount, 3);
  assert.equal(review.financialContext.activeSfPrimeContractAwardAuthorityUsd, 9381515);
  assert.equal(review.financialContext.activeSfPrimeContractPaymentsUsd, 3372517.13);
  assert.match(review.financialContext.boundary, /not a private-donation gap/i);
  assert.ok(review.nativeScale.every((row) => /not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

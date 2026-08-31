import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/homeless-youth-alliance-review-v1.json', 'utf8'));

test('HYA review separates service contact, connection, and durable impact', () => {
  assert.equal(review.evidence.length, 5);
  assert.match(review.evidence[0].transfer, /different undated organization pages/i);
  assert.match(review.evidence[1].transfer, /no incremental capital or operating cost/i);
  assert.match(review.evidence[2].transfer, /supports the intervention class, not HYA/i);
  assert.match(review.evidence[3].transfer, /multi-service portfolio/i);
  assert.match(review.evidence[4].transfer, /connection to housing is not equivalent/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('HYA review preserves public-finance and service-overlap boundaries', () => {
  assert.equal(review.financialContext.sourceNativeRevenueUsd, 1888673);
  assert.equal(review.financialContext.sourceNativeAssetAmountUsd, 3623953);
  assert.equal(review.financialContext.activeSfPrimeContractCount, 1);
  assert.equal(review.financialContext.activeSfPrimeContractAwardAuthorityUsd, 1785397);
  assert.equal(review.financialContext.activeSfPrimeContractPaymentsUsd, 1262790.02);
  assert.match(review.financialContext.boundary, /none is a private-donation gap/i);
  assert.ok(review.nativeScale.every((row) => /not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

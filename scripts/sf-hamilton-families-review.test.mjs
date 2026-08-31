import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/hamilton-families-review-v1.json', 'utf8'));

test('Hamilton review separates reported housing outcomes from additional impact', () => {
  assert.equal(review.evidence.length, 5);
  assert.match(review.evidence[0].transfer, /subset of 344, not an additional outcome count/i);
  assert.match(review.evidence[1].transfer, /not an outcome evaluation/i);
  assert.match(review.evidence[2].result, /no outcome results/i);
  assert.match(review.evidence[3].result, /long-term housing subsidies produced the broadest benefits/i);
  assert.match(review.evidence[4].transfer, /without a comparison/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Hamilton review preserves portfolio, public-funding, and overlap boundaries', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 17410740);
  assert.equal(review.financialContext.governmentRevenueUsd, 11730764);
  assert.equal(review.financialContext.totalExpensesUsd, 18799001);
  assert.equal(review.financialContext.activeSfPrimeContractCount, 8);
  assert.equal(review.financialContext.activeSfPrimeContractAwardAuthorityUsd, 60051037);
  assert.match(review.financialContext.boundary, /none is a private-donation gap/i);
  assert.match(review.reservations[3], /included within the 344/i);
  assert.ok(review.nativeScale.every((row) => /not|no published/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/glide-review-v1.json', 'utf8'));

test('GLIDE review separates service outputs and external evidence from organization impact', () => {
  assert.equal(review.evidence.length, 5);
  assert.match(review.evidence[0].transfer, /different service or administrative events/i);
  assert.match(review.evidence[1].transfer, /establish compliance, not reduced food insecurity/i);
  assert.equal(review.evidence[2].result.includes('0.53'), true);
  assert.match(review.evidence[3].transfer, /cannot be transferred without identifying service intensity/i);
  assert.match(review.evidence[4].transfer, /not GLIDE's broader HEAT portfolio/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
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

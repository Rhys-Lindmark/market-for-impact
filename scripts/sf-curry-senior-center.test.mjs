import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/curry-senior-center-review-v1.json', 'utf8'));

test('Curry review separates favorable pre/post change from causal impact', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].result, /d=-0.24/);
  assert.match(review.evidence[0].transfer, /no comparison group/i);
  assert.match(review.evidence[2].result, /not statistically significant/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Curry review keeps periods, outputs, and conditional grants bounded', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 10598408);
  assert.equal(review.financialContext.programServicesExpenseUsd, 7433744);
  assert.match(review.financialContext.boundary, /FY2024 audited finances and FY2025 service scale must not be combined/i);
  assert.match(review.financialContext.boundary, /not cash on hand/i);
  assert.ok(review.nativeScale.every((row) => /not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

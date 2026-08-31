import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/farming-hope-review-v1.json', 'utf8'));

test('Farming Hope review separates reported placement from causal impact', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].transfer, /does not identify the employment-rate numerator/i);
  assert.match(review.evidence[1].result, /did not increase regular unsubsidized employment/i);
  assert.match(review.evidence[2].result, /4.0 percentage-point impact/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Farming Hope review preserves portfolio, cost, and public-funding boundaries', () => {
  assert.equal(review.financialContext.totalRevenueUsd, 4118276);
  assert.equal(review.financialContext.jobTrainingProgramExpenseUsd, 1706032);
  assert.equal(review.financialContext.foodAccessProgramExpenseUsd, 1030888);
  assert.match(review.financialContext.boundary, /not incremental costs or impact prices/i);
  assert.match(review.financialContext.boundary, /none is philanthropic funding room/i);
  assert.ok(review.nativeScale.every((row) => /not|does not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

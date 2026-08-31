import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/huckleberry-youth-programs-review-v1.json', 'utf8'));

test('Huckleberry review separates portfolio signals from marginal impact', () => {
  assert.equal(review.evidence.length, 5);
  assert.match(review.evidence[0].transfer, /different denominators and conditioning rules/i);
  assert.match(review.evidence[1].transfer, /service counts may overlap/i);
  assert.match(review.evidence[2].transfer, /nonexperimental participant-only design/i);
  assert.match(review.evidence[3].transfer, /supports the intervention class/i);
  assert.match(review.evidence[4].transfer, /does not establish Huckleberry House/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Huckleberry review preserves program, period, and public-finance boundaries', () => {
  assert.equal(review.financialContext.sourceNativeRevenueUsd, 11310626);
  assert.equal(review.financialContext.sourceNativeAssetAmountUsd, 9092120);
  assert.equal(review.financialContext.fy2024ReportedGovernmentRevenueShare, 0.73);
  assert.equal(review.financialContext.activeSfPrimeContractCount, 5);
  assert.equal(review.financialContext.activeSfPrimeContractAwardAuthorityUsd, 28428659);
  assert.equal(review.financialContext.activeSfPrimeContractPaymentsUsd, 15955253.23);
  assert.match(review.financialContext.boundary, /different periods and accounting lenses/i);
  assert.ok(review.nativeScale.every((row) => /not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/compass-family-services-review-v1.json', 'utf8'));

test('Compass review separates the C-Rent model from broader portfolio evidence', () => {
  assert.equal(review.evidence.length, 7);
  assert.match(review.evidence[0].transfer, /not 207 additional causal outcomes/i);
  assert.match(review.evidence[1].transfer, /not a causal cost per outcome/i);
  assert.match(review.evidence[2].result, /3.8 percentage points/i);
  assert.match(review.evidence[3].transfer, /not annual flow/i);
  assert.match(review.evidence[4].transfer, /before outcomes are published/i);
  assert.match(review.evidence[5].result, /roughly the same outcomes as usual care/i);
  assert.match(review.evidence[6].transfer, /not randomly assigned/i);
  assert.match(review.decision.costEffectiveness, /approximately \$485,000/i);
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /very-low-confidence.*1\.35 million per 10 QALYs/i);
});

test('Compass review keeps assistance transfers and reported outcomes bounded', () => {
  assert.equal(review.financialContext.housingAssistanceUsd, 17174392);
  assert.equal(review.financialContext.cRentProgramExpenseUsd, 2008658);
  assert.equal(review.financialContext.cRentHousingAssistanceUsd, 1095985);
  assert.equal(review.financialContext.governmentGrantsUsd, 33364151);
  assert.match(review.financialContext.boundary, /subsidy or transfer, not delivery cost/i);
  assert.ok(review.nativeScale.every((row) => /not|does not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

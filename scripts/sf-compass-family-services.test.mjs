import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/compass-family-services-review-v1.json', 'utf8'));

test('Compass review separates mixed intervention evidence from organization impact', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].transfer, /before outcomes are published/i);
  assert.match(review.evidence[1].result, /roughly the same outcomes as usual care/i);
  assert.match(review.evidence[2].transfer, /not randomly assigned/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Compass review keeps assistance transfers and reported outcomes bounded', () => {
  assert.equal(review.financialContext.housingAssistanceUsd, 17174392);
  assert.equal(review.financialContext.governmentGrantsUsd, 33364151);
  assert.match(review.financialContext.boundary, /subsidy or transfer, not delivery cost/i);
  assert.ok(review.nativeScale.every((row) => /not|does not/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

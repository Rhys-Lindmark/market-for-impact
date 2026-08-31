import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/eviction-defense-collaborative-review-v1.json', 'utf8'));

test('EDC review preserves mixed evidence and blocks unsupported cost-effectiveness claims', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].transfer, /not an EDC-specific causal estimate/i);
  assert.match(review.evidence[2].result, /did not improve substantive outcomes/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 8);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('EDC financial and outcome boundaries prevent false per-family calculations', () => {
  assert.equal(review.financialContext.rentalAndClientAssistanceUsd, 8018851);
  assert.match(review.financialContext.boundary, /transfers must remain separate/i);
  assert.ok(review.nativeScale.every((row) => /not|different cost categories/i.test(row.semantics)));
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

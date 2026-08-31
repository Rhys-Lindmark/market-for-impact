import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const review = JSON.parse(fs.readFileSync('data/san-francisco/project-open-hand-review-v1.json', 'utf8'));

test('Project Open Hand review preserves mixed evidence and blocks an unsupported CEA', () => {
  assert.equal(review.evidence.length, 3);
  assert.match(review.evidence[0].result, /primary.*not improved/i);
  assert.equal(review.decision.costEffectiveness, 'Not estimable');
  assert.equal(review.decision.roomForMoreFunding, 'Not published');
  assert.equal(review.model.missingInputs.length, 6);
  assert.match(review.model.qalyBoundary, /No QALY/);
});

test('Project Open Hand scale and finances stay descriptive', () => {
  assert.equal(review.nativeScale.length, 3);
  assert.ok(review.nativeScale.every((row) => /not|service output/i.test(row.semantics)));
  assert.match(review.financialContext.boundary, /not the cost/);
  assert.ok(review.sources.every((source) => source.url && source.published && source.retrieved && source.sourceType));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateEvaluatorComparison } from './lib/evaluator-comparison.mjs';

const snapshot = JSON.parse(await readFile(new URL('../data/comparisons/evaluator-matrix-v1.json', import.meta.url), 'utf8'));
const cell = (cause, evaluator) => snapshot.causes.find((item) => item.key === cause).cells.find((item) => item.evaluatorKey === evaluator);

test('comparison matrix keeps every evaluator explicit for every supported cause', () => {
  assert.equal(validateEvaluatorComparison(snapshot), snapshot);
  assert.equal(snapshot.causes.length, 6);
  assert.equal(snapshot.causes.flatMap((cause) => cause.cells).length, 30);
  assert.ok(snapshot.causes.flatMap((cause) => cause.cells).some((item) => item.coverageStatus === 'not-covered-in-accepted-current-set'));
});

test('comparison keeps recommendations, grant history, and funding room separate', () => {
  assert.equal(cell('global-health', 'givewell').recommendationCount, 4);
  assert.equal(cell('global-health', 'coefficient').recommendationCount, 0);
  assert.equal(cell('global-health', 'coefficient').coverageStatus, 'published-grant-lens');
  assert.equal(cell('animal-welfare', 'ace').numericFundingRoomUsd, 12456000);
  assert.equal(cell('climate', 'giving-green').numericFundingRoomCount, 1);
  assert.match(cell('climate', 'giving-green').fundingStatus, /not treated as current 2026 room/);
  assert.equal(cell('climate', 'founders-pledge').coverageStatus, 'current-pooled-fund');
});

test('multi-lens Coefficient catastrophic-risk totals remain non-additive', () => {
  const coefficient = cell('global-catastrophic-risks', 'coefficient');
  assert.equal(coefficient.fundLenses.length, 2);
  assert.equal(coefficient.publishedGrantCount, null);
  assert.equal(coefficient.publishedAmountUsd, null);
  assert.match(coefficient.note, /never summed/);
});

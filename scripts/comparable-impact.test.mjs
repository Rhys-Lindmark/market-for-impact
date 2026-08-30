import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { coefficientGivingValue, qalyCost, validateComparableImpact } from './lib/comparable-impact.mjs';

const snapshot = JSON.parse(await readFile(new URL('../data/comparisons/impact-conversions-v1.json', import.meta.url), 'utf8'));

test('conversion registry preserves explicit model states and boundaries', () => {
  assert.equal(validateComparableImpact(snapshot), snapshot);
  assert.deepEqual(new Set(snapshot.models.map((model) => model.status)), new Set(['illustrative', 'evaluator-published', 'blocked-missing-input']));
  assert.equal(snapshot.boundaries.length, 3);
  assert.ok(snapshot.boundaries.every((boundary) => boundary.status === 'incomparable'));
});

test('QALY sensitivity divides historical cost per life by user-supplied yield', () => {
  assert.equal(qalyCost(4500, 30), 150);
  assert.equal(qalyCost(4000, 20), 200);
  assert.equal(qalyCost(4000, 50), 80);
});

test('$CG follows the evaluator-published logarithmic income formula', () => {
  const result = coefficientGivingValue({ people: 100, incomeGainPercent: 10, years: 5, costUsd: 100000 });
  assert.ok(Math.abs(result.valueCg - 2382754.50) < 0.01);
  assert.ok(Math.abs(result.sroi - 23.827545) < 0.0001);
});

test('calculators reject missing or non-positive assumptions', () => {
  assert.throws(() => qalyCost(4000, 0));
  assert.throws(() => coefficientGivingValue({ people: 100, incomeGainPercent: 0, years: 5, costUsd: 100000 }));
});

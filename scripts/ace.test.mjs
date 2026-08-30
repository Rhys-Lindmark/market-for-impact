import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { recommendationHash, recommendationSlugs, validateAceSnapshot } from './lib/ace.mjs';

const snapshot = JSON.parse(await readFile(new URL('../data/ace/recommendations-2025.json', import.meta.url), 'utf8'));

test('ACE snapshot preserves cohorts, funding semantics, and native metrics', () => {
  assert.equal(validateAceSnapshot(snapshot), snapshot);
  assert.match(snapshot.comparabilityWarning, /not directly comparable/i);
  assert.ok(snapshot.records.some((record) => record.metrics.some((metric) => metric.unit.includes('SADs'))));
  assert.ok(snapshot.records.some((record) => record.metrics.some((metric) => metric.unit.includes('papers'))));
});

test('ACE recommendation parser deduplicates and hashes review links', () => {
  const html = '<a href="https://animalcharityevaluators.org/charity-review/beta/">B</a><a href="https://animalcharityevaluators.org/charity-review/alpha/">A</a><a href="https://animalcharityevaluators.org/charity-review/beta/">B</a>';
  assert.deepEqual(recommendationSlugs(html), ['alpha', 'beta']);
  assert.equal(recommendationHash(['beta', 'alpha']), recommendationHash(['alpha', 'beta']));
});


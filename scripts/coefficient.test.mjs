import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalizeSnapshot, parseDecisionMonth, parseUsd } from './lib/coefficient.mjs';

const fixture = JSON.parse(await readFile(resolve('data/coefficient/effective-giving-and-careers.json'), 'utf8'));

test('parses published amount and month semantics', () => {
  assert.equal(parseUsd('$6,250,000'), 6250000);
  assert.equal(parseDecisionMonth('July 2026'), '2026-07-01T00:00:00.000Z');
  assert.throws(() => parseUsd('about $1m'));
});

test('normalization is complete and deterministic', () => {
  const first = normalizeSnapshot(fixture);
  const second = normalizeSnapshot(fixture);
  assert.equal(first.summary.grantCount, 79);
  assert.equal(first.summary.uniqueRecipientCount, 51);
  assert.equal(first.source.contentHash, second.source.contentHash);
  assert.deepEqual(first.records, second.records);
  assert.equal(new Set(first.records.map((record) => record.externalId)).size, 79);
});

test('duplicate source rows fail closed', () => {
  const duplicate = structuredClone(fixture);
  duplicate.records.push(duplicate.records[0]);
  duplicate.source.displayedResultCount += 1;
  assert.throws(() => normalizeSnapshot(duplicate), /Duplicate grant identity/);
});

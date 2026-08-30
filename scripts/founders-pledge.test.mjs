import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizePageText, semanticHash, validateFoundersPledgeSnapshot, verifySourceClaims } from './lib/founders-pledge.mjs';

const snapshot = JSON.parse(await readFile(new URL('../data/founders-pledge/research-matrix.json', import.meta.url), 'utf8'));

test('Founders Pledge matrix preserves recommendation and benchmark boundaries', () => {
  assert.equal(validateFoundersPledgeSnapshot(snapshot), snapshot);
  assert.equal(snapshot.records.filter((record) => record.benchmarkMultiple != null).length, 1);
  assert.equal(snapshot.records.filter((record) => record.opportunityType === 'current-pooled-fund').length, 2);
  assert.equal(snapshot.records.filter((record) => record.status === 'partner-derived-summary').length, 1);
});

test('Founders Pledge page normalization and reviewed claims are deterministic', () => {
  const source = { key: 'example', requiredClaims: ['11x as cost effective as GiveDirectly', 'Teaching at the Right Level'] };
  const html = '<main><p>11x as cost effective as GiveDirectly</p><script>ignore()</script><p>Teaching at the Right Level</p></main>';
  assert.equal(normalizePageText(html), '11x as cost effective as GiveDirectly Teaching at the Right Level');
  assert.deepEqual(verifySourceClaims(source, html), { key: 'example', claimCount: 2 });
  assert.throws(() => verifySourceClaims(source, '<p>changed</p>'), /missing reviewed claim/);
});

test('Founders Pledge semantic hash excludes retrieval time but includes claims', () => {
  const copy = structuredClone(snapshot);
  copy.retrievedAt = '2030-01-01T00:00:00.000Z';
  assert.equal(semanticHash(copy), snapshot.contentHash);
  copy.sources[0].requiredClaims[0] = 'changed';
  assert.notEqual(semanticHash(copy), snapshot.contentHash);
});

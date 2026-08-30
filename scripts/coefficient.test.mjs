import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalizeSnapshot, parseDecisionMonth, parseUsd } from './lib/coefficient.mjs';
import { buildSnapshotFromAlgolia, diffSnapshots } from './lib/coefficient-source.mjs';

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

const algoliaHit = {
  objectID: 'grants-123-0', post_id: 123, post_type: 'Grants', title: 'General Support',
  organization_name: ['Example &amp; Partners'], organization_website: 'https://example.org/',
  grant_amount: 125000, award_date: 1784073600, publication_date: 1784073600,
  url: 'https://coefficientgiving.org/grants/example/',
  'focus-area': ['Effective Giving &amp; Careers'],
};

test('Algolia acquisition preserves source provenance and semantics', () => {
  const hits = Array.from({ length: 70 }, (_, index) => ({
    ...algoliaHit,
    objectID: `grants-${index + 1}-0`,
    post_id: index + 1,
    title: `Grant ${index + 1}`,
  }));
  const snapshot = buildSnapshotFromAlgolia({ nbHits: hits.length, hits }, '2026-08-30T00:00:00.000Z');
  assert.equal(snapshot.records.length, 70);
  assert.equal(snapshot.records[0].recipient, 'Example & Partners');
  assert.equal(snapshot.records[0].date, 'July 2026');
  assert.equal(snapshot.records[0].publicationDate, '2026-07-15T00:00:00.000Z');
  assert.equal(snapshot.source.acquisition.type, 'public-algolia-search-index');
});

test('source refresh detects semantic additions and fails closed on truncation', () => {
  const previous = { records: fixture.records.slice(0, 10).map((record, index) => ({ ...record, sourceRecordId: String(index) })) };
  const next = structuredClone(previous);
  next.records.push({ amount: '$1', date: 'August 2026', purpose: 'New', recipient: 'New recipient', sourceRecordId: 'new' });
  assert.equal(diffSnapshots(previous, next).added.length, 1);
  const updated = structuredClone(previous);
  updated.records[0].recipientUrl = 'https://new.example/';
  assert.equal(diffSnapshots(previous, updated).updated.length, 1);
  assert.throws(() => diffSnapshots({ records: fixture.records }, { records: fixture.records.slice(0, 20).map((record, index) => ({ ...record, sourceRecordId: String(index) })) }), /Failing closed/);
});

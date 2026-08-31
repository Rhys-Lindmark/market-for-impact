import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  buildFiscalSponsorSource,
  extractFiscalSponsorAssertions,
  validateFiscalSponsorSource,
} from './lib/sf-sff-fiscal-sponsors.mjs';

const source = validateFiscalSponsorSource(JSON.parse(await readFile(new URL('../data/san-francisco/sff-fiscal-sponsor-source.json', import.meta.url), 'utf8')));

test('SFF fiscal-sponsor parser preserves labeled and heading-derived project names', () => {
  const posts = [{
    id: 1,
    link: 'https://sff.org/example/',
    date: '2026-01-01T00:00:00',
    modified: '2026-01-02T00:00:00',
    title: { rendered: 'Example &amp; guide' },
    content: { rendered: '<h6><strong>Project One</strong></h6><p>Fiscal Sponsor: Sponsor A</p><hr><p><strong>Grantee</strong>: Project Two<br><strong>Fiscal sponsor</strong>: Sponsor B</p>' },
  }];
  assert.deepEqual(extractFiscalSponsorAssertions(posts).map((row) => [row.projectName, row.fiscalSponsorName]), [
    ['Project One', 'Sponsor A'],
    ['Project Two', 'Sponsor B'],
  ]);
});

test('SFF fiscal-sponsor corpus is complete, explicit, and conflict-preserving', () => {
  assert.equal(source.summary.searchedPostCount, 29);
  assert.equal(source.summary.sourcePostCount, 21);
  assert.equal(source.summary.extractedAssertionCount, 44);
  assert.equal(source.summary.uniqueProjectSponsorRelationshipCount, 35);
  assert.equal(source.summary.conflictingProjectCount, 1);
  assert.ok(source.assertions.every((row) => row.assertionSemantics === 'source-reported-at-publication-not-current-verification'));
  assert.match(source.search.coverageBoundary, /not a complete or current registry/i);
});

test('SFF fiscal-sponsor source builder is deterministic apart from retrieval time', () => {
  const minimalPosts = [{
    id: 7,
    link: 'https://sff.org/example/',
    date: '2026-01-01T00:00:00',
    modified: '2026-01-02T00:00:00',
    title: { rendered: 'Example' },
    content: { rendered: '<h6>Project</h6><p>Fiscal sponsor: Sponsor</p>' },
  }];
  const first = buildFiscalSponsorSource(minimalPosts, '2026-01-03T00:00:00Z');
  const second = buildFiscalSponsorSource(minimalPosts, '2026-02-03T00:00:00Z');
  assert.equal(first.semanticHash, second.semanticHash);
  assert.notEqual(first.retrievedAt, second.retrievedAt);
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseProfilePage, parseSearchPage, validateSnapshot } from './lib/charity-navigator.mjs';

const snapshot = validateSnapshot(JSON.parse(await readFile(new URL('../data/charity-navigator/lgbtq-rights-v1.json', import.meta.url), 'utf8')));

test('Charity Navigator discovery keeps ratings separate from impact claims', () => {
  assert.equal(snapshot.candidates.length, snapshot.source.totalItems);
  assert.equal(snapshot.source.pagesRetrieved, Math.ceil(snapshot.source.totalItems / 10));
  assert.equal(snapshot.summary.profileReviewedCount, 10);
  assert.equal(snapshot.summary.fourBeaconCount, 10);
  assert.equal(snapshot.summary.assessedImpactEvidenceCount, 0);
  assert.equal(snapshot.summary.publishedRoomForFundingCount, 0);
  assert.ok(snapshot.candidates.every((row) => row.ratingDate === null));
});

test('crosswalk matches stay conservative and auditable', () => {
  const matches = snapshot.candidates.flatMap((candidate) => [...candidate.evaluatorAssessmentMatches, ...candidate.acceptedGrantLedgerMatches]);
  assert.equal(snapshot.summary.evaluatorOverlapCount, snapshot.candidates.filter((row) => row.evaluatorAssessmentMatches.length).length);
  assert.equal(snapshot.summary.acceptedGrantLedgerOverlapCount, snapshot.candidates.filter((row) => row.acceptedGrantLedgerMatches.length).length);
  assert.ok(matches.every((match) => match.matchMethod === 'exact-name'));
  assert.ok(matches.every((match) => match.publisher && match.sourceRecordId));
});

test('search and profile parsers preserve source fields and missing dates', () => {
  const searchHtml = '<script>self.__next_f.push([1,"x:{\\"results\\":[{\\"name\\":\\"Example\\",\\"url\\":\\"/ein/123456789\\",\\"ein\\":\\"123456789\\",\\"city\\":\\"City\\",\\"state\\":\\"CA\\",\\"rating\\":\\"91\\",\\"highest_level_advisory\\":null,\\"causes\\":[\\"LGBTQ rights\\"],\\"size\\":\\"SMALL\\",\\"star_rating\\":\\"4\\",\\"is_profile_complete\\":true,\\"donation_eligible\\":true}],\\"totalItems\\":1,\\"from\\":0,\\"size\\":10}"])</script>';
  const parsed = parseSearchPage(searchHtml, 0);
  assert.equal(parsed.records.length, 1);
  assert.throws(() => parseSearchPage(searchHtml, 10), /Unexpected Charity Navigator result contract/);
  const profile = parseProfilePage('4 of 4 BEACONS COMPLETED {"datePublished":"2026-08-25T00:00:00Z"}', '123456789');
  assert.equal(profile.completedBeacons.length, 4);
  assert.equal(profile.ratingDate, null);
});

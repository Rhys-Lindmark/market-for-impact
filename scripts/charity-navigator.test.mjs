import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseProfilePage, parseSearchPage, validateSnapshot } from './lib/charity-navigator.mjs';

const snapshot = validateSnapshot(JSON.parse(await readFile(new URL('../data/charity-navigator/lgbtq-rights-v1.json', import.meta.url), 'utf8')));

test('Charity Navigator discovery keeps ratings separate from impact claims', () => {
  assert.equal(snapshot.candidates.length, 10);
  assert.equal(snapshot.summary.fourBeaconCount, 10);
  assert.equal(snapshot.summary.assessedImpactEvidenceCount, 0);
  assert.equal(snapshot.summary.publishedRoomForFundingCount, 0);
  assert.ok(snapshot.candidates.every((row) => row.evaluatorAssessmentMatches.length === 0));
  assert.ok(snapshot.candidates.every((row) => row.acceptedGrantLedgerMatches.length === 0));
});

test('the first LGBTQ discovery page has no exact accepted-ledger identity overlap', async () => {
  const paths = [
    '../data/coefficient/all-grants.json',
    '../data/normalized/givewell-grants.json',
    '../data/givewell/top-charities.json',
    '../data/ace/recommendations-2025.json',
    '../data/giving-green/recommendations-2025-2026.json',
    '../data/founders-pledge/research-matrix.json',
    '../data/renphil/ai-for-math-2025.json'
  ];
  const acceptedSourceText = (await Promise.all(paths.map((path) => readFile(new URL(path, import.meta.url), 'utf8')))).join('\n').toLowerCase();
  for (const candidate of snapshot.candidates) {
    assert.equal(acceptedSourceText.includes(`"${candidate.name.toLowerCase()}"`), false, `${candidate.name} needs explicit identity reconciliation.`);
  }
});

test('search and profile parsers preserve source fields and missing dates', () => {
  const searchHtml = '<script>self.__next_f.push([1,"x:{\\"results\\":[{\\"name\\":\\"Example\\",\\"url\\":\\"/ein/123456789\\",\\"ein\\":\\"123456789\\",\\"city\\":\\"City\\",\\"state\\":\\"CA\\",\\"rating\\":\\"91\\",\\"highest_level_advisory\\":null,\\"causes\\":[\\"LGBTQ rights\\"],\\"size\\":\\"SMALL\\",\\"star_rating\\":\\"4\\",\\"is_profile_complete\\":true,\\"donation_eligible\\":true}],\\"totalItems\\":1,\\"from\\":0,\\"size\\":10}"])</script>';
  assert.throws(() => parseSearchPage(searchHtml), /Unexpected Charity Navigator result contract/);
  const profile = parseProfilePage('4 of 4 BEACONS COMPLETED {"datePublished":"2026-08-25T00:00:00Z"}', '123456789');
  assert.equal(profile.completedBeacons.length, 4);
  assert.equal(profile.ratingDate, null);
});

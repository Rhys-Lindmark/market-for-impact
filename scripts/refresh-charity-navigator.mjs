import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildSnapshot, parseProfilePage, parseSearchPage, searchUrlForPage, SEARCH_URL, validateSnapshot } from './lib/charity-navigator.mjs';

const headers = { 'user-agent': 'MarketForImpact/1.0 source freshness check' };
const fetchText = async (url) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  return response.text();
};

const firstPage = parseSearchPage(await fetchText(SEARCH_URL), 0);
const pageCount = Math.ceil(firstPage.totalItems / firstPage.size);
const pages = [firstPage];
for (let page = 2; page <= pageCount; page += 6) {
  const batch = Array.from({ length: Math.min(6, pageCount - page + 1) }, (_, index) => page + index);
  pages.push(...await Promise.all(batch.map(async (pageNumber) => parseSearchPage(
    await fetchText(searchUrlForPage(pageNumber)),
    (pageNumber - 1) * firstPage.size
  ))));
}
if (pages.some((page) => page.totalItems !== firstPage.totalItems || page.size !== firstPage.size)) {
  throw new Error('Charity Navigator pagination metadata changed during retrieval.');
}
const search = { ...firstPage, records: pages.flatMap((page) => page.records) };
if (search.records.length !== search.totalItems) throw new Error(`Incomplete Charity Navigator pagination: ${search.records.length}/${search.totalItems}.`);

const profiles = new Map(await Promise.all(search.records.slice(0, 10).map(async (record) => [
  record.ein,
  parseProfilePage(await fetchText(`https://www.charitynavigator.org${record.url}`), record.ein)
])));

const normalizeName = (value) => value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
const crosswalks = new Map();
const addMatch = (name, bucket, match) => {
  if (!name) return;
  const key = normalizeName(name);
  const current = crosswalks.get(key) ?? { evaluatorAssessmentMatches: [], acceptedGrantLedgerMatches: [] };
  if (!current[bucket].some((row) => row.publisher === match.publisher && row.sourceRecordId === match.sourceRecordId)) current[bucket].push(match);
  crosswalks.set(key, current);
};
const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const [coefficient, givewellGrants, givewellTop, ace, givingGreen, foundersPledge] = await Promise.all([
  load('../data/coefficient/all-grants.json'), load('../data/normalized/givewell-grants.json'), load('../data/givewell/top-charities.json'),
  load('../data/ace/recommendations-2025.json'), load('../data/giving-green/recommendations-2025-2026.json'), load('../data/founders-pledge/research-matrix.json')
]);
for (const grant of coefficient.records) for (const recipient of grant.recipients) addMatch(recipient, 'acceptedGrantLedgerMatches', { publisher: 'Coefficient Giving', sourceRecordId: grant.sourceRecordId, sourceUrl: grant.grantUrl, matchMethod: 'exact-name' });
for (const grant of givewellGrants.records) addMatch(grant.recipient, 'acceptedGrantLedgerMatches', { publisher: 'GiveWell', sourceRecordId: grant.sourceRecordId, sourceUrl: grant.sourceUrl, matchMethod: 'exact-name' });
for (const opportunity of givewellTop.opportunities) addMatch(opportunity.organization, 'evaluatorAssessmentMatches', { publisher: 'GiveWell', sourceRecordId: opportunity.slug, sourceUrl: opportunity.researchUrl, matchMethod: 'exact-name' });
for (const record of ace.records) addMatch(record.organization, 'evaluatorAssessmentMatches', { publisher: 'Animal Charity Evaluators', sourceRecordId: record.slug, sourceUrl: record.reviewUrl, matchMethod: 'exact-name' });
for (const record of givingGreen.topRecommendations) addMatch(record.name, 'evaluatorAssessmentMatches', { publisher: 'Giving Green', sourceRecordId: record.slug, sourceUrl: record.reviewUrl, matchMethod: 'exact-name' });
for (const record of givingGreen.grants) addMatch(record.name, 'acceptedGrantLedgerMatches', { publisher: 'Giving Green', sourceRecordId: record.sourceRecordId, sourceUrl: record.reviewUrl, matchMethod: 'exact-name' });
for (const record of foundersPledge.records) addMatch(record.organization, 'evaluatorAssessmentMatches', { publisher: 'Founders Pledge', sourceRecordId: record.slug, sourceUrl: foundersPledge.sources.find((source) => source.key === record.sourceKey)?.url ?? null, matchMethod: 'exact-name' });

const snapshot = validateSnapshot(buildSnapshot({ search, profiles, crosswalks, retrievedAt: new Date().toISOString() }));
const path = new URL('../data/charity-navigator/lgbtq-rights-v1.json', import.meta.url);

if (process.argv.includes('--write')) {
  await mkdir(new URL('../data/charity-navigator/', import.meta.url), { recursive: true });
  await writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`);
} else {
  const committed = validateSnapshot(JSON.parse(await readFile(path, 'utf8')));
  if (committed.source.contentHash !== snapshot.source.contentHash) {
    throw new Error('Charity Navigator LGBTQ rights discovery changed; run npm run data:charity-navigator:refresh and review the diff.');
  }
}

console.log(`Charity Navigator discovery current: ${snapshot.candidates.length} tagged organizations across ${snapshot.source.pagesRetrieved} pages; ${snapshot.summary.profileReviewedCount} profiles reviewed; ${snapshot.summary.evaluatorOverlapCount} evaluator and ${snapshot.summary.acceptedGrantLedgerOverlapCount} grant-ledger overlaps.`);

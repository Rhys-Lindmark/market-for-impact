import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { buildSnapshot, parseProfilePage, parseSearchPage, SEARCH_URL, validateSnapshot } from './lib/charity-navigator.mjs';

const headers = { 'user-agent': 'MarketForImpact/1.0 source freshness check' };
const fetchText = async (url) => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  return response.text();
};

const search = parseSearchPage(await fetchText(SEARCH_URL));
const profiles = new Map(await Promise.all(search.records.map(async (record) => [
  record.ein,
  parseProfilePage(await fetchText(`https://www.charitynavigator.org${record.url}`), record.ein)
])));
const snapshot = validateSnapshot(buildSnapshot({ search, profiles, retrievedAt: new Date().toISOString() }));
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

console.log(`Charity Navigator discovery current: ${snapshot.source.totalItems} tagged organizations; reviewed first ${snapshot.candidates.length}.`);

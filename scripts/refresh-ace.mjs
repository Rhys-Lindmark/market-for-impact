import { readFile, writeFile } from 'node:fs/promises';
import { ACE_RECOMMENDATIONS_URL, recommendationHash, recommendationSlugs, validateAceSnapshot } from './lib/ace.mjs';

const path = new URL('../data/ace/recommendations-2025.json', import.meta.url);
const snapshot = JSON.parse(await readFile(path, 'utf8'));
const response = await fetch(ACE_RECOMMENDATIONS_URL, { headers: { 'user-agent': 'MarketForImpact/1.0 source freshness check' } });
if (!response.ok) throw new Error(`ACE returned HTTP ${response.status}.`);
const expectedSlugs = snapshot.records.map((record) => new URL(record.reviewUrl).pathname.split('/').filter(Boolean).at(-1));
const slugs = recommendationSlugs(await response.text()).filter((slug) => expectedSlugs.includes(slug));
if (slugs.length !== 10) throw new Error(`ACE page exposes ${slugs.length} of the 10 committed recommendation review links.`);
const currentHash = recommendationHash(slugs);
if (process.argv.includes('--write')) {
  snapshot.source.contentHash = currentHash;
  snapshot.source.retrievedAt = new Date().toISOString();
  await writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`);
}
validateAceSnapshot({ ...snapshot, source: { ...snapshot.source, contentHash: currentHash } });
if (snapshot.source.contentHash !== currentHash && !process.argv.includes('--write')) {
  throw new Error('ACE current recommendation set changed; run npm run data:ace:refresh and review the new set.');
}
console.log(`ACE current recommendation set verified: ${slugs.length} charities (${currentHash.slice(0, 12)}).`);

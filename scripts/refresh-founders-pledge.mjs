import { readFile, writeFile } from 'node:fs/promises';
import { semanticHash, validateFoundersPledgeSnapshot, verifySourceClaims } from './lib/founders-pledge.mjs';

const path = new URL('../data/founders-pledge/research-matrix.json', import.meta.url);
const snapshot = JSON.parse(await readFile(path, 'utf8'));
const results = [];
for (const source of snapshot.sources) {
  const response = await fetch(source.url, { headers: { 'user-agent': 'MarketForImpact/1.0 source freshness check' } });
  if (!response.ok) throw new Error(`${source.key} returned ${response.status}.`);
  results.push(verifySourceClaims(source, await response.text()));
}
snapshot.contentHash = semanticHash(snapshot);
if (process.argv.includes('--write')) {
  snapshot.retrievedAt = new Date().toISOString();
  await writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`);
}
validateFoundersPledgeSnapshot(snapshot);
console.log(`Founders Pledge verified: ${results.length} sources, ${snapshot.records.length} opportunities, ${snapshot.summary.causeAreaCount} cause areas.`);

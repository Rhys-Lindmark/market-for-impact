import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildRenPhilSnapshot, parseWinnerIndex, RENPHIL_WINNERS_URL } from './lib/renphil.mjs';

const outputPath = new URL('../data/renphil/ai-for-math-2025.json', import.meta.url);
const write = process.argv.includes('--write');

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'MarketForImpact/0.1 source-review' } });
  if (!response.ok) throw new Error(`RenPhil request failed (${response.status}): ${url}`);
  return response.text();
}

const indexHtml = await fetchText(RENPHIL_WINNERS_URL);
const winners = parseWinnerIndex(indexHtml);
const details = new Map(await Promise.all(winners.map(async (winner) => [winner.sourceUrl, await fetchText(winner.sourceUrl)])));
const snapshot = buildRenPhilSnapshot(indexHtml, details, new Date().toISOString());
let existing = null;
try { existing = JSON.parse(await readFile(outputPath, 'utf8')); } catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

if (!write) {
  if (!existing) throw new Error('No committed RenPhil snapshot. Run with --write after reviewing the source.');
  if (existing.source.contentHash !== snapshot.source.contentHash) {
    throw new Error(`RenPhil source changed (${existing.source.contentHash.slice(0, 12)} → ${snapshot.source.contentHash.slice(0, 12)}). Review before writing.`);
  }
  console.log(`RenPhil snapshot current: ${snapshot.summary.awardCount} awards (${snapshot.source.contentHash.slice(0, 12)}).`);
} else {
  await mkdir(new URL('../data/renphil/', import.meta.url), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote ${snapshot.summary.awardCount} RenPhil awards (${snapshot.source.contentHash.slice(0, 12)}).`);
}

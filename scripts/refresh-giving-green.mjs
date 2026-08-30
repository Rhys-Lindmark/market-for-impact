import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildGivingGreenSnapshot, GIVING_GREEN_ANNOUNCEMENT_URL, validateGivingGreenSnapshot } from './lib/giving-green.mjs';

const outputPath = new URL('../data/giving-green/recommendations-2025-2026.json', import.meta.url);
const response = await fetch(GIVING_GREEN_ANNOUNCEMENT_URL, { headers: { 'user-agent': 'MarketForImpact/1.0 source freshness check' } });
if (!response.ok) throw new Error(`Giving Green returned HTTP ${response.status}.`);
const next = validateGivingGreenSnapshot(buildGivingGreenSnapshot(await response.text(), new Date().toISOString()));
let previous = null;
try { previous = validateGivingGreenSnapshot(JSON.parse(await readFile(outputPath, 'utf8'))); } catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
if (process.argv.includes('--write')) {
  await mkdir(new URL('../data/giving-green/', import.meta.url), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`);
} else if (!previous || previous.source.contentHash !== next.source.contentHash) {
  throw new Error('Giving Green recommendation or grant tables changed; run npm run data:giving-green:refresh and review the diff.');
}
console.log(`Giving Green verified: ${next.topRecommendations.length} top recommendations, ${next.grants.length} grant rows, $${next.summary.totalAnnouncedGrantUsd.toLocaleString('en-US')} announced.`);


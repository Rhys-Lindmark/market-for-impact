import { readFile, writeFile } from 'node:fs/promises';
import { buildFundingTranches, validateFundingTranches } from './lib/funding-tranches.mjs';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const snapshot = validateFundingTranches(buildFundingTranches({
  ace: await readJson('../data/ace/recommendations-2025.json'),
  givewell: await readJson('../data/givewell/top-charities.json'),
  givingGreen: await readJson('../data/giving-green/recommendations-2025-2026.json'),
  foundersPledge: await readJson('../data/founders-pledge/research-matrix.json'),
}));

const output = new URL('../data/comparisons/funding-tranches-v1.json', import.meta.url);
if (process.argv.includes('--write')) {
  await writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote ${snapshot.tranches.length} funding tranches.`);
} else {
  const current = JSON.parse(await readFile(output, 'utf8'));
  if (JSON.stringify(current) !== JSON.stringify(snapshot)) throw new Error('Funding-tranche snapshot is stale. Run with --write and review the diff.');
  console.log(`Funding-tranche snapshot current: ${snapshot.tranches.length} tranches.`);
}

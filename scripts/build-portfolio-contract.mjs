import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPortfolioContract, validatePortfolioContract } from './lib/portfolio-builder.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async (relative) => JSON.parse(await fs.readFile(path.join(root, relative), 'utf8'));
const fundingTranches = await read('data/comparisons/funding-tranches-v1.json');
const contract = validatePortfolioContract(buildPortfolioContract({
  fundingTranches,
  ace: await read('data/ace/recommendations-2025.json'),
  givewell: await read('data/givewell/top-charities.json'),
  givingGreen: await read('data/giving-green/recommendations-2025-2026.json'),
  foundersPledge: await read('data/founders-pledge/research-matrix.json'),
}), fundingTranches);
const target = path.join(root, 'data/comparisons/portfolio-contract-v1.json');
const output = `${JSON.stringify(contract, null, 2)}\n`;
if (process.argv.includes('--write')) {
  await fs.writeFile(target, output);
  console.log(`Wrote ${contract.candidates.length} portfolio candidate classifications.`);
} else {
  const current = await fs.readFile(target, 'utf8').catch(() => '');
  if (current !== output) throw new Error('Portfolio contract is stale. Run npm run data:portfolio:build.');
  console.log(`Portfolio contract current: ${contract.candidates.length} candidates.`);
}

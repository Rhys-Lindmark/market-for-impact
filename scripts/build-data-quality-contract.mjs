import { readFile, writeFile } from 'node:fs/promises';
import { buildDataQualityContract, validateDataQualityContract } from './lib/data-quality-contract.mjs';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const contract = validateDataQualityContract(buildDataQualityContract({
  coefficient: await readJson('../data/normalized/coefficient-market-summary.json'),
  givewell: await readJson('../data/normalized/givewell-grants.json'),
  givingGreen: await readJson('../data/giving-green/recommendations-2025-2026.json'),
  renphil: await readJson('../data/renphil/ai-for-math-2025.json'),
  grantFlows: await readJson('../data/comparisons/grant-flow-contract-v1.json'),
  fundingTranches: await readJson('../data/comparisons/funding-tranches-v1.json'),
}));
const output = new URL('../data/comparisons/data-quality-contract-v1.json', import.meta.url);
if (process.argv.includes('--write')) {
  await writeFile(output, `${JSON.stringify(contract, null, 2)}\n`);
  console.log(`Wrote ${contract.ledgers.length} ledger quality contracts and ${contract.knownIssues.length} issue definitions.`);
} else {
  const current = JSON.parse(await readFile(output, 'utf8'));
  if (JSON.stringify(current) !== JSON.stringify(contract)) throw new Error('Data-quality contract is stale. Run with --write and review the diff.');
  console.log(`Data-quality contract current: ${contract.knownIssues.length} known issues.`);
}

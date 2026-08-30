import { readFile, writeFile } from 'node:fs/promises';
import { buildGrantFlowContract, validateGrantFlowContract } from './lib/grant-flow-contract.mjs';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const contract = validateGrantFlowContract(buildGrantFlowContract({
  coefficient: await readJson('../data/coefficient/all-grants.json'),
  coefficientEgc: await readJson('../data/normalized/coefficient-effective-giving-and-careers.json'),
  givewell: await readJson('../data/normalized/givewell-grants.json'),
  givingGreen: await readJson('../data/giving-green/recommendations-2025-2026.json'),
  renphil: await readJson('../data/renphil/ai-for-math-2025.json'),
}));
const output = new URL('../data/comparisons/grant-flow-contract-v1.json', import.meta.url);
if (process.argv.includes('--write')) {
  await writeFile(output, `${JSON.stringify(contract, null, 2)}\n`);
  console.log(`Wrote ${contract.acceptedSourceRowCount} accepted source-row contracts.`);
} else {
  const current = JSON.parse(await readFile(output, 'utf8'));
  if (JSON.stringify(current) !== JSON.stringify(contract)) throw new Error('Grant-flow contract is stale. Run with --write and review the diff.');
  console.log(`Grant-flow contract current: ${contract.acceptedSourceRowCount} source rows.`);
}

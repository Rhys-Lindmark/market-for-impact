import fs from 'node:fs/promises';
import { buildIndiaGeography, validateIndiaGeography } from './lib/india-geography.mjs';

const read = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));
const snapshot = validateIndiaGeography(buildIndiaGeography({
  givewell: await read('data/normalized/givewell-grants.json'),
  topCharities: await read('data/givewell/top-charities.json'),
  ace: await read('data/ace/recommendations-2025.json'),
  grantFlow: await read('data/comparisons/grant-flow-contract-v1.json'),
}));
const output = `${JSON.stringify(snapshot, null, 2)}\n`;
const path = 'data/geographies/india-v1.json';

if (process.argv.includes('--write')) {
  await fs.mkdir('data/geographies', { recursive: true });
  await fs.writeFile(path, output);
} else if (await fs.readFile(path, 'utf8') !== output) {
  throw new Error(`${path} is stale. Run npm run data:india:build.`);
}

console.log(`India geography current: ${snapshot.summary.givewellGrantCount} GiveWell grants, ${snapshot.summary.currentEvaluatorOpportunityCount} current evaluator opportunity, ${snapshot.summary.currentIndiaSpecificFundingRoomCount} India-specific funding-room figures.`);

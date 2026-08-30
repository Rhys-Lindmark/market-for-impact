import fs from 'node:fs/promises';
import { buildSfNonprofitDiligence, validateSfNonprofitDiligence } from './lib/sf-nonprofit-diligence.mjs';

const read = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));
const [config, publicFunding, coefficient, givewell, givingGreen, renphil] = await Promise.all([
  read('data/san-francisco/nonprofit-diligence-config-v1.json'),
  read('data/san-francisco/public-funding-v1.json'),
  read('data/coefficient/all-grants.json'),
  read('data/normalized/givewell-grants.json'),
  read('data/giving-green/recommendations-2025-2026.json'),
  read('data/renphil/ai-for-math-2025.json')
]);
const snapshot = validateSfNonprofitDiligence(buildSfNonprofitDiligence({
  config, publicFunding, ledgers: { coefficient, givewell, givingGreen, renphil }
}));
const output = `${JSON.stringify(snapshot, null, 2)}\n`;
const path = 'data/san-francisco/nonprofit-diligence-v1.json';
if (process.argv.includes('--write')) await fs.writeFile(path, output);
else if (await fs.readFile(path, 'utf8') !== output) throw new Error('SF nonprofit diligence snapshot drifted; run npm run data:sf:diligence:build.');
console.log(`SF diligence current: ${snapshot.summary.candidateCount} candidates, ${snapshot.summary.publicContractMatchCount} matched active contracts, ${snapshot.summary.qalyBlockedCount} blocked QALY estimates.`);

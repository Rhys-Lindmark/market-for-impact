import fs from 'node:fs/promises';
import { buildSfDonorComparison, validateSfDonorComparison } from './lib/sf-donor-comparison.mjs';

const read = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));
const snapshot = validateSfDonorComparison(buildSfDonorComparison({
  diligence: await read('data/san-francisco/nonprofit-diligence-v1.json'),
  outcomes: await read('data/san-francisco/outcome-ontology-v1.json'),
}));
const output = `${JSON.stringify(snapshot, null, 2)}\n`;
const path = 'data/san-francisco/donor-comparison-v1.json';

if (process.argv.includes('--write')) await fs.writeFile(path, output);
else if (await fs.readFile(path, 'utf8') !== output) throw new Error('SF donor comparison snapshot drifted; run npm run data:sf:comparison:build.');

console.log(`SF donor comparison current: ${snapshot.summary.candidateCount} candidates, ${snapshot.summary.recommendationReadyCount} recommendation-ready, ${snapshot.summary.costEffectivenessNotEstimableCount} cost-effectiveness estimates blocked.`);

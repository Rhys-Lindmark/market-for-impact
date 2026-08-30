import fs from 'node:fs/promises';
import { buildSfMarginalPlanRequests, validateSfMarginalPlanRequests } from './lib/sf-marginal-plan-requests.mjs';

const read = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));
const snapshot = validateSfMarginalPlanRequests(buildSfMarginalPlanRequests({
  grantEvaluation: await read('data/san-francisco/grant-evaluation-v1.json'),
  diligence: await read('data/san-francisco/nonprofit-diligence-v1.json'),
  publicFunding: await read('data/san-francisco/public-funding-v1.json'),
}));
const outputPath = 'data/san-francisco/marginal-plan-requests-v1.json';
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;

if (process.argv.includes('--write')) await fs.writeFile(outputPath, serialized);
else if (await fs.readFile(outputPath, 'utf8') !== serialized) throw new Error(`${outputPath} is stale. Run npm run data:sf:requests:build.`);

console.log(`SF marginal-plan requests current: ${snapshot.summary.packetCount} packets, ${snapshot.summary.scenarioCount} scenarios, ${snapshot.summary.submittedScenarioCount} submitted.`);

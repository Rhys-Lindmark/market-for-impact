import fs from 'node:fs';
import { buildSfGrantEvaluation, validateSfGrantEvaluation } from './lib/sf-grant-evaluation.mjs';

const outputPath = 'data/san-francisco/grant-evaluation-v1.json';
const comparison = JSON.parse(fs.readFileSync('data/san-francisco/donor-comparison-v1.json', 'utf8'));
const diligence = JSON.parse(fs.readFileSync('data/san-francisco/nonprofit-diligence-v1.json', 'utf8'));
const snapshot = validateSfGrantEvaluation(buildSfGrantEvaluation({ comparison, diligence }));
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;

if (process.argv.includes('--write')) {
  fs.writeFileSync(outputPath, serialized);
  console.log(`Wrote ${outputPath}`);
} else {
  const current = fs.readFileSync(outputPath, 'utf8');
  if (current !== serialized) throw new Error(`${outputPath} is stale. Run npm run data:sf:lookbacks:build.`);
}

console.log(`SF grant-evaluation contract current: ${snapshot.summary.scenarioCount} scenarios, ${snapshot.summary.submittedScenarioCount} submitted, ${snapshot.summary.forecastLockedCount} forecasts locked, ${snapshot.summary.historicalGrantCount} historical grant seed.`);

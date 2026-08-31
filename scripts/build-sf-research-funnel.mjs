import fs from 'node:fs';
import { buildSfResearchFunnel, validateSfResearchFunnel } from './lib/sf-research-funnel.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const output = validateSfResearchFunnel(buildSfResearchFunnel({
  irsUniverse: read('data/san-francisco/irs-exempt-universe-v1.json'),
  config: read('data/san-francisco/research-funnel-config-v1.json')
}));
fs.writeFileSync('data/san-francisco/research-funnel-v1.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(`Built ${output.version}: ${output.summary.universeCount} → ${output.summary.shallowScreenCount} → ${output.summary.priorityReviewCount} → ${output.summary.deepDiveQueueCount}.`);

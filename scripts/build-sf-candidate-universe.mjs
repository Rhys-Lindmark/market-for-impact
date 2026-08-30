import fs from 'node:fs/promises';
import { buildSfCandidateUniverse, validateSfCandidateUniverse } from './lib/sf-candidate-universe.mjs';

const read = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));
const [publicFunding, diligenceConfig, diligence, ontology] = await Promise.all([
  read('data/san-francisco/public-funding-v1.json'),
  read('data/san-francisco/nonprofit-diligence-config-v1.json'),
  read('data/san-francisco/nonprofit-diligence-v1.json'),
  read('data/san-francisco/outcome-ontology-v1.json')
]);
const snapshot = validateSfCandidateUniverse(buildSfCandidateUniverse({ publicFunding, diligenceConfig, diligence, ontology }));
const output = `${JSON.stringify(snapshot, null, 2)}\n`;
const path = 'data/san-francisco/candidate-universe-v1.json';
if (process.argv.includes('--write')) await fs.writeFile(path, output);
else if (await fs.readFile(path, 'utf8') !== output) throw new Error('SF candidate universe drifted; run npm run data:sf:universe:build.');
console.log(`SF candidate universe current: ${snapshot.summary.sourceOrganizationNameCount} source names, ${snapshot.summary.activeContractCount} contracts, ${snapshot.summary.outcomeMappedOrganizationNameCount} outcome-mapped names.`);

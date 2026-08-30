import fs from 'node:fs/promises';
import { buildSfIrsUniverse, validateSfIrsUniverse } from './lib/sf-irs-universe.mjs';

const read = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));
const sourceUrl = 'https://www.irs.gov/pub/irs-soi/eo_ca.csv';
const [response, diligence, candidateUniverse] = await Promise.all([
  fetch(sourceUrl),
  read('data/san-francisco/nonprofit-diligence-v1.json'),
  read('data/san-francisco/candidate-universe-v1.json')
]);
if (!response.ok) throw new Error(`IRS EO BMF fetch failed: ${response.status}`);
const retrievedAt = new Date().toISOString();
const snapshot = validateSfIrsUniverse(buildSfIrsUniverse({ csvText: await response.text(), retrievedAt, lastModified: response.headers.get('last-modified'), diligence, candidateUniverse }));
const path = 'data/san-francisco/irs-exempt-universe-v1.json';
if (process.argv.includes('--write')) await fs.writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`);
else {
  const current = validateSfIrsUniverse(await read(path));
  if (current.source.contentHash !== snapshot.source.contentHash) throw new Error(`IRS EO BMF semantic drift: ${current.source.contentHash} -> ${snapshot.source.contentHash}`);
}
console.log(`SF IRS universe current: ${snapshot.summary.organizationCount} EINs, ${snapshot.summary.subsection501c3Count} subsection 501(c)(3), ${snapshot.summary.exactContractNameMatchCount} exact city-contract names, ${snapshot.summary.scorecardEinMatchCount} scorecards.`);

import fs from 'node:fs/promises';
import {
  SFF_FISCAL_SPONSOR_API_URL,
  buildFiscalSponsorSource,
  validateFiscalSponsorSource,
} from './lib/sf-sff-fiscal-sponsors.mjs';

const path = 'data/san-francisco/sff-fiscal-sponsor-source.json';
const response = await fetch(SFF_FISCAL_SPONSOR_API_URL, { headers: { 'user-agent': 'Market-for-Impact source monitor' } });
if (!response.ok) throw new Error(`SFF fiscal-sponsor API returned HTTP ${response.status}.`);
const source = validateFiscalSponsorSource(buildFiscalSponsorSource(await response.json(), new Date().toISOString()));
if (process.argv.includes('--write')) {
  await fs.writeFile(path, `${JSON.stringify(source, null, 2)}\n`);
  console.log(`Wrote ${path}.`);
} else {
  const accepted = validateFiscalSponsorSource(JSON.parse(await fs.readFile(path, 'utf8')));
  if (source.semanticHash !== accepted.semanticHash) throw new Error('Official SFF fiscal-sponsor corpus changed; review and run npm run data:sf:sff:sponsors:refresh.');
}
console.log(`SFF fiscal-sponsor source current: ${source.summary.extractedAssertionCount} dated assertions, ${source.summary.uniqueProjectSponsorRelationshipCount} unique relationships, ${source.summary.conflictingProjectCount} project conflict.`);

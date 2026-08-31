import fs from 'node:fs/promises';
import { buildSfSffGrants, validateSfSffGrants } from './lib/sf-sff-grants.mjs';

const read = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));
const [source, fiscalSponsorSource, currentReceivingEntityReviews, serviceGeographyReviews, irsUniverse, candidateUniverse, diligence] = await Promise.all([
  read('data/san-francisco/sff-fy25-grantee-totals-source.json'),
  read('data/san-francisco/sff-fiscal-sponsor-source.json'),
  read('data/san-francisco/sff-current-receiving-entity-reviews.json'),
  read('data/san-francisco/sff-service-geography-reviews.json'),
  read('data/san-francisco/irs-exempt-universe-v1.json'),
  read('data/san-francisco/candidate-universe-v1.json'),
  read('data/san-francisco/nonprofit-diligence-v1.json'),
]);
const snapshot = validateSfSffGrants(buildSfSffGrants({ source, fiscalSponsorSource, currentReceivingEntityReviews, serviceGeographyReviews, irsUniverse, candidateUniverse, diligence }));
const output = `${JSON.stringify(snapshot, null, 2)}\n`;
const path = 'data/san-francisco/sff-community-grants-v1.json';
if (process.argv.includes('--write')) await fs.writeFile(path, output);
else if (await fs.readFile(path, 'utf8') !== output) throw new Error('SFF community grants drifted; run npm run data:sf:sff:build.');
console.log(`SFF community grants current: ${snapshot.summary.publishedPartnerRowCount} partner rows, $${snapshot.summary.publishedPartnerTotalFundingUsd.toLocaleString('en-US')}, ${snapshot.summary.sourceReportedFiscalSponsorRowCount} historical sponsor matches, ${snapshot.summary.currentSponsorConfirmedRowCount} currently confirmed sponsors.`);

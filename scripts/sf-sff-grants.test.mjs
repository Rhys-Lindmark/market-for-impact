import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateSfSffGrants } from './lib/sf-sff-grants.mjs';

const snapshot = validateSfSffGrants(JSON.parse(await readFile(new URL('../data/san-francisco/sff-community-grants-v1.json', import.meta.url), 'utf8')));

test('SFF FY2025 partner totals reconcile to the complete published PDF table', () => {
  assert.equal(snapshot.partners.length, 424);
  assert.equal(snapshot.summary.publishedPartnerTotalFundingUsd, 49_516_694);
  assert.equal(snapshot.summary.reportedGrantCount, 585);
  assert.equal(snapshot.partners.reduce((sum, row) => sum + row.totalFundingUsd, 0), 49_516_694);
});

test('SFF rows preserve aggregate amount semantics rather than inventing grants', () => {
  assert.ok(snapshot.partners.every((row) => row.amountSemantics === 'aggregated-fy2025-programmatic-funding'));
  assert.match(snapshot.interpretation.amount, /aggregate total/i);
  assert.match(snapshot.interpretation.denominator, /does not classify each row/i);
});

test('SFF discovery crosswalks are exact and do not become impact or funding room', () => {
  const hamilton = snapshot.partners.find((row) => row.granteeName === 'Hamilton Families');
  assert.equal(hamilton?.totalFundingUsd, 15_000);
  assert.equal(hamilton?.diligenceKey, 'hamilton-families');
  assert.ok(snapshot.summary.exactIrsMatchRowCount > 0);
  assert.ok(snapshot.summary.exactContractMatchRowCount > 0);
  assert.equal(snapshot.summary.sourceReportedFiscalSponsorRowCount, 11);
  assert.equal(snapshot.summary.distinctSourceReportedFiscalSponsorCount, 8);
  assert.equal(snapshot.summary.fiscalSponsorConflictRowCount, 0);
  assert.equal(snapshot.summary.publishableRoomForFundingCount, 0);
  assert.equal(snapshot.summary.rowLevelServiceGeographyCount, 0);
  assert.ok(snapshot.partners.every((row) => row.impactEvidenceStatus === 'not-yet-assessed' || row.impactEvidenceStatus === 'deep-evidence-dossier'));
});

test('SFF fiscal-sponsor records remain dated source assertions rather than current legal verification', () => {
  const eltimpano = snapshot.partners.find((row) => row.granteeName === 'El Tímpano');
  assert.deepEqual(eltimpano?.sourceReportedFiscalSponsors.map((row) => row.sponsorName), ['Independent Arts & Media']);
  assert.equal(eltimpano?.sourceReportedFiscalSponsors[0]?.assertionSemantics, 'source-reported-at-publication-not-current-verification');
  assert.equal(eltimpano?.sourceReportedFiscalSponsors[0]?.latestSourcePublishedAt, '2024-11-12T10:58:08');
  assert.match(snapshot.interpretation.identity, /not verification of a current legal or donation relationship/i);
  assert.equal(snapshot.summary.rowLevelServiceGeographyCount, 0);
});

test('current receiving reviews never carry historical sponsors forward automatically', () => {
  assert.equal(snapshot.summary.currentReceivingEntityReviewRowCount, 11);
  assert.equal(snapshot.summary.currentSponsorConfirmedRowCount, 5);
  assert.equal(snapshot.summary.historicalSponsorChangedRowCount, 1);
  assert.equal(snapshot.summary.currentReceivingEntityUnresolvedRowCount, 6);
  assert.equal(snapshot.summary.currentDonationRouteRowCount, 9);
  const eltimpano = snapshot.partners.find((row) => row.granteeName === 'El Tímpano');
  assert.equal(eltimpano?.sourceReportedFiscalSponsors[0]?.sponsorName, 'Independent Arts & Media');
  assert.equal(eltimpano?.currentReceivingEntityReview?.relationshipStatus, 'historical-sponsor-changed');
  assert.equal(eltimpano?.currentReceivingEntityReview?.currentFiscalSponsorName, 'Mission Edge');
  assert.match(eltimpano?.currentReceivingEntityReview?.donationPayeeInstructions ?? '', /Mission Edge/);
  const pym = snapshot.partners.find((row) => row.granteeName === 'Palestinian Youth Movement');
  assert.equal(pym?.sourceReportedFiscalSponsors[0]?.sponsorName, 'WESPAC Foundation, Inc.');
  assert.equal(pym?.currentReceivingEntityReview?.currentFiscalSponsorName, null);
  assert.equal(pym?.currentReceivingEntityReview?.relationshipStatus, 'current-receiving-entity-unresolved');
});

test('SFF source provenance remains pinned to the reviewed official PDF', () => {
  assert.equal(snapshot.source.pdfSha256, '2ecda948949b04fa7a1d29cba39bf12b6901098182d32388fbb775744ebb8e12');
  assert.equal(snapshot.source.pdfPageCount, 11);
  assert.match(snapshot.interpretation.geography, /does not publish a county/i);
  assert.match(snapshot.interpretation.impact, /not evidence of effectiveness/i);
});

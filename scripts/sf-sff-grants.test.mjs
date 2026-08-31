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
  assert.equal(snapshot.summary.publishableRoomForFundingCount, 0);
  assert.equal(snapshot.summary.rowLevelServiceGeographyCount, 0);
  assert.ok(snapshot.partners.every((row) => row.impactEvidenceStatus === 'not-yet-assessed' || row.impactEvidenceStatus === 'deep-evidence-dossier'));
});

test('SFF source provenance remains pinned to the reviewed official PDF', () => {
  assert.equal(snapshot.source.pdfSha256, '2ecda948949b04fa7a1d29cba39bf12b6901098182d32388fbb775744ebb8e12');
  assert.equal(snapshot.source.pdfPageCount, 11);
  assert.match(snapshot.interpretation.geography, /does not publish a county/i);
  assert.match(snapshot.interpretation.impact, /not evidence of effectiveness/i);
});

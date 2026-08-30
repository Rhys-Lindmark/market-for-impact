import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeGiveWellGrants, parseCsv, validateGiveWellOpportunities } from './lib/givewell.mjs';

const manifest = JSON.parse(await readFile('data/givewell/grants-source.json', 'utf8'));
const csv = await readFile('data/givewell/grants.csv', 'utf8');
const opportunities = JSON.parse(await readFile('data/givewell/top-charities.json', 'utf8'));

test('GiveWell CSV parser preserves quoted multi-select and comma fields', () => {
  const rows = parseCsv('\uFEFFGrant,Recipient,Amount,Date,Link to grant description,Topics,Funders,Countries\n"A, B","Recipient, Inc.",$10,2026-01-02,,"Water,Malaria",Fund,"Chad,Togo"\n');
  assert.equal(rows[0].Grant, 'A, B');
  assert.equal(rows[0].Recipient, 'Recipient, Inc.');
  assert.equal(rows[0].Topics, 'Water,Malaria');
});

test('GiveWell grants normalize completely and deterministically', () => {
  const first = normalizeGiveWellGrants(csv, manifest);
  const second = normalizeGiveWellGrants(csv, manifest);
  assert.equal(first.summary.grantCount, 541);
  assert.equal(first.summary.totalPublishedAmountUsd, 2625949864);
  assert.equal(first.summary.airtableDisplayedTotalAmountUsd, 2625949861);
  assert.equal(first.summary.displayedVsExportedDifferenceUsd, 3);
  assert.equal(first.source.contentHash, second.source.contentHash);
  assert.equal(new Set(first.records.map((record) => record.sourceRecordId)).size, 541);
});

test('GiveWell normalization fails closed on truncation and duplicate identities', () => {
  const rows = csv.trimEnd().split('\n');
  assert.throws(() => normalizeGiveWellGrants(rows.slice(0, -1).join('\n'), manifest), /Expected 541/);
  const duplicated = `${csv.trimEnd()}\n${rows[1]}\n`;
  const expandedManifest = structuredClone(manifest);
  expandedManifest.source.displayedRecordCount += 1;
  assert.throws(() => normalizeGiveWellGrants(duplicated, expandedManifest), /Duplicate GiveWell grant identity/);
});

test('GiveWell Top Charity snapshot is complete', () => {
  assert.equal(validateGiveWellOpportunities(opportunities).opportunities.length, 4);
});

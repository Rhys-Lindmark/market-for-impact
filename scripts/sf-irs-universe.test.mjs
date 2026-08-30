import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseCsv, validateSfIrsUniverse } from './lib/sf-irs-universe.mjs';

const snapshot = validateSfIrsUniverse(JSON.parse(await readFile(new URL('../data/san-francisco/irs-exempt-universe-v1.json', import.meta.url), 'utf8')));

test('CSV parser retains quoted commas and escaped quotes', () => {
  assert.deepEqual(parseCsv('A,B\n"one, two","said ""yes"""\n'), [['A', 'B'], ['one, two', 'said "yes"']]);
});

test('SF IRS universe is a unique EIN-address denominator', () => {
  assert.equal(snapshot.summary.organizationCount, 6688);
  assert.equal(snapshot.summary.uniqueEinCount, snapshot.summary.organizationCount);
  assert.ok(snapshot.summary.subsection501c3Count > 5000);
  assert.ok(snapshot.summary.nteeMissingCount > 0);
});

test('SF IRS reconciliation is conservative and non-evaluative', () => {
  assert.equal(snapshot.summary.scorecardEinMatchCount, 4);
  assert.ok(snapshot.summary.exactContractNameMatchCount > 0);
  assert.equal(snapshot.summary.publishableRoomForFundingCount, 0);
  assert.ok(snapshot.organizations.every((row) => row.roomForMoreFundingStatus === 'not-yet-assessed'));
  assert.match(snapshot.interpretation.denominator, /filing address/i);
  assert.match(snapshot.interpretation.recommendation, /no row is ranked/i);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildSfNonprofitDiligence, validateSfNonprofitDiligence } from './lib/sf-nonprofit-diligence.mjs';

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const config = load('data/san-francisco/nonprofit-diligence-config-v1.json');
const publicFunding = load('data/san-francisco/public-funding-v1.json');
const ledgers = { coefficient: load('data/coefficient/all-grants.json'), givewell: load('data/normalized/givewell-grants.json'), givingGreen: load('data/giving-green/recommendations-2025-2026.json'), renphil: load('data/renphil/ai-for-math-2025.json') };
const snapshot = buildSfNonprofitDiligence({ config, publicFunding, ledgers });

test('SF diligence cohort is reproducible and keeps conversions blocked', () => {
  validateSfNonprofitDiligence(snapshot);
  assert.equal(snapshot.candidates.length, 6);
  assert.equal(snapshot.summary.qalyBlockedCount, 6);
  assert.equal(snapshot.summary.candidatesWithPublishedMarginalGap, 0);
});

test('public-contract aliases reconcile exact accounting totals', () => {
  const hamilton = snapshot.candidates.find((row) => row.key === 'hamilton-families');
  const foodBank = snapshot.candidates.find((row) => row.key === 'sf-marin-food-bank');
  const center = snapshot.candidates.find((row) => row.key === 'sf-lgbt-center');
  const glide = snapshot.candidates.find((row) => row.key === 'glide');
  assert.deepEqual([hamilton.publicFunding.contractCount, foodBank.publicFunding.contractCount, center.publicFunding.contractCount, glide.publicFunding.contractCount], [8, 8, 5, 14]);
  assert.equal(hamilton.publicFunding.awardUsd, 60051037);
  assert.equal(foodBank.publicFunding.awardUsd, 23938671);
  assert.equal(center.publicFunding.awardUsd, 14528741);
  assert.equal(glide.publicFunding.awardUsd, 50205192);
});

test('ratings never masquerade as impact evidence', () => {
  const hamilton = snapshot.candidates.find((row) => row.key === 'hamilton-families');
  const glide = snapshot.candidates.find((row) => row.key === 'glide');
  assert.equal(hamilton.charityNavigator.completedBeaconCount, 1);
  assert.match(hamilton.charityNavigator.note, /not an impact estimate/i);
  assert.equal(glide.charityNavigator.rating, null);
  assert.match(glide.charityNavigator.note, /not a negative impact finding/i);
});

test('accepted grant ledgers are cross-checked without fuzzy identity merging', () => {
  assert.equal(snapshot.summary.acceptedGrantLedgerMatchCount, 1);
  const hac = snapshot.candidates.find((row) => row.key === 'housing-action-coalition');
  assert.deepEqual(hac.acceptedGrantLedgerMatches, [{ publisher: 'Coefficient Giving', recordId: 'grants-36116-0', name: 'Housing Action Coalition' }]);
});

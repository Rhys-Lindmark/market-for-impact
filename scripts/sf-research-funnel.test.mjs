import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { buildSfResearchFunnel, validateSfResearchFunnel } from './lib/sf-research-funnel.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const snapshot = buildSfResearchFunnel({ irsUniverse: read('data/san-francisco/irs-exempt-universe-v1.json'), config: read('data/san-francisco/research-funnel-config-v1.json') });

test('builds a nested research funnel without implying impact', () => {
  validateSfResearchFunnel(snapshot);
  assert.deepEqual(snapshot.summary, { universeCount: 6688, machineEligibleCount: 1103, shallowScreenCount: 1000, priorityReviewCount: 100, deepDiveQueueCount: 25, completedInitialReviewCount: 3, completedCostEffectivenessCount: 0 });
  assert.equal(new Set(snapshot.priority1000).size, 1000);
  assert.equal(new Set(snapshot.priority100).size, 100);
  assert.equal(snapshot.interpretation.ranking.includes('not top-charity lists'), true);
});

test('keeps advocacy in a separate unranked evidence track', () => {
  assert.equal(snapshot.advocacyEvidenceTrack.length, 2);
  assert.equal(snapshot.deepDiveRows.some((row) => row.displayName === 'GrowSF'), false);
});

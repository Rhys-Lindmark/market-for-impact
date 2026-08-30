import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseGrantAmount, parseGivingGreenAnnouncement, validateGivingGreenSnapshot } from './lib/giving-green.mjs';

const snapshot = JSON.parse(await readFile(new URL('../data/giving-green/recommendations-2025-2026.json', import.meta.url), 'utf8'));

test('Giving Green snapshot reconciles recommendations, grants, and funding semantics', () => {
  assert.equal(validateGivingGreenSnapshot(snapshot), snapshot);
  assert.equal(snapshot.summary.topRecommendationCount, 5);
  assert.equal(snapshot.summary.grantRecordCount, 29);
  assert.match(snapshot.source.statusSemantics, /not proof of disbursement/i);
  assert.equal(snapshot.topRecommendations.filter((record) => record.fundingRoomUsd != null).length, 1);
});

test('Giving Green amount parser preserves multi-year semantics', () => {
  assert.deepEqual(parseGrantAmount('$1,600,000 over two years'), { amountUsd: 1600000, period: 'two years' });
  assert.deepEqual(parseGrantAmount('$300,000'), { amountUsd: 300000, period: 'one-time period not specified' });
});

test('Giving Green table parser fails closed on incomplete input', () => {
  assert.throws(() => parseGivingGreenAnnouncement('<html></html>'), /tables were not found/);
});


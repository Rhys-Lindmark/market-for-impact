import test from 'node:test';
import assert from 'node:assert/strict';
import { researchCostRanking as rows } from '../lib/research-cost-ranking.mjs';

test('all 40 reviews have unique, ascending central 10-QALY estimates', () => {
  assert.equal(rows.length, 40);
  assert.equal(new Set(rows.map(r => r.slug)).size, 40);
  rows.forEach((r, i) => {
    assert.ok(Number.isFinite(r.centralUsdPerTenQalys) && r.centralUsdPerTenQalys > 0);
    if (i) assert.ok(rows[i - 1].centralUsdPerTenQalys <= r.centralUsdPerTenQalys);
  });
  assert.deepEqual(rows.slice(0, 4).map(r => r.slug), ['san-francisco-aids-foundation', 'project-homeless-connect', 'glide', 'breathe-california']);
  assert.ok(Math.abs(rows[0].centralUsdPerTenQalys - 56328) < 1);
  assert.ok(Math.abs(rows[1].centralUsdPerTenQalys - 71111.111111) < .001);
});

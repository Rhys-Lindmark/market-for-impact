import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { medicationAccessModel } from '../lib/medication-access-model.mjs';
const m = JSON.parse(readFileSync(new URL('../data/san-francisco/hya-medication-access-cea-v1.json', import.meta.url)));
test('HYA models additional medication time rather than referral counts', () => {
  const r = medicationAccessModel(m.scenarios[1]);
  assert.ok(Math.abs(r.costPerTenQalys - 4687026.91166) < 0.01);
  assert.ok(Math.abs(r.additionalQalys - 0.21335486628) < 1e-9);
  assert.equal(m.scenarios[1].costPerSupportedInitiation, 10 * m.anchors.publishedSharedHourlyUsd);
  assert.equal(m.fundingRoom.verifiedUsd, null);
  assert.match(m.overlapBoundary, /Prime-only ledgers miss subcontract exposure/);
});
test('HYA handles nulls and rejects invalid positive-model inputs', () => {
  for (const change of [{ additionality: 0 }, { coveredYears: 0 }, { mortalityHazardRatio: 1 }]) assert.equal(medicationAccessModel({ ...m.scenarios[1], ...change }).costPerTenQalys, null);
  assert.throws(() => medicationAccessModel({ ...m.scenarios[1], coveredYears: 2 }));
  assert.throws(() => medicationAccessModel({ ...m.scenarios[1], costPerSupportedInitiation: 0 }));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { therapyDecisionModel } from '../lib/therapy-model.mjs';
const m = JSON.parse(readFileSync(new URL('../data/san-francisco/hrtc-therapy-cea-v1.json', import.meta.url)));
test('HRTC converts an explicit score scenario and integrates incremental duration', () => {
  const r = therapyDecisionModel(m.scenarios[1]);
  assert.ok(Math.abs(r.costPerTenQalys - 5548442.1608) < 0.1);
  assert.ok(Math.abs(r.qalysPerOfferedCourse - 0.002703461538) < 1e-10);
  assert.equal(m.scenarios[1].effectiveWeeks, 12 / 2 + 24 / 2);
  assert.equal(m.fundingRoom.verifiedUsd, null);
});
test('HRTC null benefit and invalid mapping cannot produce misleading finite prices', () => {
  assert.equal(therapyDecisionModel({ ...m.scenarios[1], additionality: 0 }).costPerTenQalys, null);
  assert.throws(() => therapyDecisionModel({ ...m.scenarios[1], effectiveWeeks: 53 }));
  assert.throws(() => therapyDecisionModel({ ...m.scenarios[1], physicalScoreGain: 1000 }));
  assert.throws(() => therapyDecisionModel({ ...m.scenarios[1], costPerOfferedCourse: -1 }));
});

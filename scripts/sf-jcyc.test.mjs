import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { youthJobsDecisionModel } from '../lib/youth-jobs-model.mjs';
const model = JSON.parse(readFileSync(new URL('../data/san-francisco/jcyc-myeep-cea-v1.json', import.meta.url)));
test('MYEEP mortality is cumulative participation-scaled probability, not percentage or annual effect', () => {
  assert.equal(model.anchors.mortalityReduction, 0.00073);
  const r = youthJobsDecisionModel(model.scenarios[1]);
  assert.ok(Math.abs(r.costPerTenQalys - 24840182.6484) < 0.01);
  assert.ok(Math.abs(r.additionalQalys - 0.04025735294) < 1e-9);
  assert.equal(model.fundingRoom.verifiedUsd, null);
});
test('MYEEP null and invalid scenarios are handled explicitly', () => {
  assert.equal(youthJobsDecisionModel({ ...model.scenarios[1], additionality: 0 }).costPerTenQalys, null);
  assert.throws(() => youthJobsDecisionModel({ ...model.scenarios[1], mortalityReduction: 2 }));
  assert.throws(() => youthJobsDecisionModel({ ...model.scenarios[1], costPerSlot: 0 }));
});
test('MYEEP bottom-up cost anchor is rounded without mixing annual budgets', () => {
  const a = model.anchors;
  assert.ok(Math.abs((a.designEmploymentHours + a.designTrainingHours) * a.currentPostedHourlyWage * 1.12 + 1800 - 5094.48) < 1e-8);
  assert.equal(model.scenarios[1].costPerSlot, 5100);
  for (const source of model.sources) assert.ok(source.url && source.published && source.retrieved);
});

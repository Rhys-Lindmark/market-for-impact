import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/san-francisco/healthright-moud-cea-v1.json' with { type: 'json' };
import { moudAccessModel as f } from '../lib/moud-access-model.mjs';
const s = data.scenarios.find(s => /central/i.test(s.name));
test('two-year access and clinical cost denominators remain distinct', () => {
  const r = f(s);
  assert.ok(Math.abs(r.trialMedicationYears - 23.4418866667) < 1e-8);
  assert.ok(Math.abs(r.additionalBuprenorphineYears - 5.2744245) < 1e-8);
  assert.equal(r.donorCost, 585705);
  assert.ok(Math.abs(r.costPerTenQalys - 26353957.02408218) < .01);
  assert.ok(Math.abs(r.costPerTenQalys - 10 * r.costPerQaly) < 1e-7);
  assert.ok(r.resourceCostPerTenQalys > r.costPerTenQalys);
  assert.ok(r.maximumDonorCostFor100k < 2300);
});
test('nulls and harm are not finite positive benefit prices', () => {
  for (const key of ['accessTransfer', 'fundingAdditionality', 'buprenorphineShare']) assert.equal(f({ ...s, [key]: 0 }).costPerTenQalys, null);
  assert.equal(f({ ...s, causalRetention: 0, nonfatalUtilityGain: 0 }).costPerTenQalys, null);
  assert.equal(f({ ...s, extraDeaths: .05 }).costPerTenQalys, null);
  assert.ok(f({ ...s, nonfatalUtilityGain: 0 }).costPerTenQalys > f(s).costPerTenQalys);
});
test('invalid inputs fail and pharmacy payer changes cost not health', () => {
  for (const override of [{ accessTransfer: 1.1 }, { mortalityIn: NaN }, { costMultiplier: 0 }, { nonfatalUtilityGain: 2 }]) assert.throws(() => f({ ...s, ...override }), RangeError);
  const allDonor = f({ ...s, donorDrugShare: 1 });
  assert.equal(allDonor.netQalys, f(s).netQalys);
  assert.equal(allDonor.donorCost, allDonor.resourceCost);
  for (const scenario of data.scenarios) assert.ok(f(scenario).costPerTenQalys > 100000);
});

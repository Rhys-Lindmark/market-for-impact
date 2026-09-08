import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { hbvRetentionModel } from '../lib/hbv-retention-model.mjs';
const model = JSON.parse(fs.readFileSync(new URL('../data/san-francisco/nems-hbv-cea-v1.json', import.meta.url)));
const central = model.scenarios[1];
test('HBV finite-support calibration retains source denominator and annual costs', () => {
  const r = hbvRetentionModel(central);
  assert.equal(r.referenceQalys, 0.17394);
  assert(Math.abs(r.timingFraction - 0.43847115) < 1e-8);
  assert(Math.abs(r.netQalys - 0.00672554) < 1e-8);
  assert(r.donorCost > 800 && r.donorCost < 810);
  assert.equal(r.years.filter(y => y.discountedDonorCostPerPerson > 0).length, 20);
  assert.equal(r.years[20].creditedWeight, 0);
});
test('HBV null, harm and zero-support cases never produce a positive price', () => {
  for (const key of ['localMonitoringIncrement', 'causalTransfer', 'fundingAdditionality', 'fundedYears']) assert.equal(hbvRetentionModel({ ...central, [key]: 0 }).costPerTenQalys, null);
  assert(hbvRetentionModel({ ...central, harmQalysPerPerson: 0.1 }).netQalys < 0);
  assert.equal(hbvRetentionModel({ ...central, harmQalysPerPerson: 0.1 }).costPerTenQalys, null);
});
test('HBV health scaling does not erase incurred costs or double discount the anchor', () => {
  const r = hbvRetentionModel(central);
  assert.equal(hbvRetentionModel({ ...central, fundingAdditionality: 0 }).donorCost, r.donorCost);
  const full = hbvRetentionModel({ ...central, fundedYears: 35, localMonitoringIncrement: 0.2835, causalTransfer: 1, fundingAdditionality: 1 });
  assert(Math.abs(full.netQalys - 0.17394) < 1e-12);
  assert.equal(full.timingFraction, 1);
});
test('HBV scenario order, dimensional threshold and invalid inputs', () => {
  const [a,b,c] = model.scenarios.map(hbvRetentionModel);
  assert(a.costPerTenQalys < b.costPerTenQalys && b.costPerTenQalys < c.costPerTenQalys);
  assert.equal(b.maximumDonorCostFor100k, 10000*b.netQalys);
  for (const change of [{panelSize:0}, {fundedYears:36}, {fundedYears:1.5}, {causalTransfer:2}, {referenceYears:101}, {costMultiplier:NaN}]) assert.throws(()=>hbvRetentionModel({...central,...change}),RangeError);
});

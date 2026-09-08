import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { vaccineAccessModel } from '../lib/vaccine-access-model.mjs';
const data = JSON.parse(fs.readFileSync(new URL('../data/san-francisco/sffc-vaccine-cea-v1.json', import.meta.url)));
const central = data.scenarios[1];
test('Vaccine model charges seed purchases without converting stock into a cash refund', () => {
  const r = vaccineAccessModel(central);
  assert.equal(r.doses, 36); assert.equal(r.replenished, 30); assert.equal(r.terminalDoses, 14);
  assert(Math.abs(r.donorCash - 5933.8) < 1e-9);
  assert(Math.abs(r.netQalys - .030352) < 1e-12);
  assert(Math.abs(r.costPerTenQalys - 1954994.728518714) < .01);
});
test('Favorable threshold is fragile to two additional buffer doses', () => {
  const a = data.scenarios[0];
  assert(vaccineAccessModel(a).costPerTenQalys < 100000);
  assert(vaccineAccessModel({...a,purchasedSeedDoses:a.purchasedSeedDoses+2}).costPerTenQalys > 100000);
});
test('Vaccine null and signed harm do not become negative-price bargains', () => {
  assert.equal(vaccineAccessModel({...central,counterfactualShare:0}).costPerTenQalys,null);
  const h = vaccineAccessModel({...central,extraHarm:1});
  assert(h.netQalys < 0); assert.equal(h.costPerTenQalys,null);
  assert.equal(h.donorCash,vaccineAccessModel(central).donorCash);
});
test('Vaccine integer batches, shared cap and impossible inventory are validated', () => {
  const u = vaccineAccessModel(data.scenarios[2]); assert.equal(u.replenished,0);
  for(const change of [{completedSeries:21},{initiators:2.5},{counterfactualShare:2},{otherSitePapDoses:200},{purchasedSeedDoses:0},{benchmarkAge:65},{dosePrice:NaN}]) assert.throws(()=>vaccineAccessModel({...central,...change}),RangeError);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import model from '../data/san-francisco/dope-site-cea-v1.json' with { type: 'json' };
import { dopeSiteModel } from '../lib/dope-site-model.mjs';

const central = model.scenarios.find(s => /central/i.test(s.name));
test('DOPE central site-year uses person-time and deaths, not reversal counts', () => {
  const r = dopeSiteModel(central);
  assert.equal(r.baselineResponsiveDeaths, .24);
  assert.equal(r.additionalDeathsPrevented, .024);
  assert.ok(Math.abs(r.costPerTenQalys - 2425273) < 1);
  const c = model.costConstruction;
  assert.equal(c.specialists * c.weeklyPayment * c.weeks + c.coordinatorHoursPerWeek * c.coordinatorLoadedHourlyCost * c.weeks + c.otherAnnualCosts, central.annualCost);
  assert.ok(r.requiredDeathsFor100k > central.residentYears * central.annualOverdoseRisk);
});
test('DOPE null, displacement and responder harm remain explicit', () => {
  assert.equal(dopeSiteModel({ ...central, fundingAdditionality: 0 }).costPerTenQalys, null);
  assert.equal(dopeSiteModel({ ...central, relativeRiskReduction: 0 }).costPerTenQalys, null);
  assert.ok(dopeSiteModel({ ...central, relativeRiskReduction: -.2 }).netQalys < 0);
  assert.equal(dopeSiteModel({ ...central, responderHarmQalys: .15 }).costPerTenQalys, null);
  assert.ok(dopeSiteModel({ ...central, responderHarmQalys: .05 }).costPerTenQalys > dopeSiteModel(central).costPerTenQalys);
});
test('DOPE invalid values fail; threshold and marginal cost scale correctly', () => {
  for (const bad of [{ residentYears: -1 }, { annualCost: 0 }, { annualOverdoseRisk: 2 }, { opioidResponsiveShare: 2 }, { relativeRiskReduction: 2 }, { fundingAdditionality: NaN }]) assert.throws(() => dopeSiteModel({ ...central, ...bad }), RangeError);
  const r = dopeSiteModel(central);
  assert.equal(dopeSiteModel({ ...central, annualCost: 60000 }).costPerTenQalys, 2 * r.costPerTenQalys);
  assert.ok(Math.abs(dopeSiteModel({ ...central, annualCost: r.netQalys * 10000 }).costPerTenQalys - 100000) < 1e-6);
});

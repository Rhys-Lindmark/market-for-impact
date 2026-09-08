import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/san-francisco/sfchc-hcv-cea-v1.json' with { type: 'json' };
import { hcvAccessModel as f } from '../lib/hcv-access-model.mjs';
const s = data.scenarios.find(s => /central/i.test(s.name));
test('HCV effect is an incremental cure difference, with matched cost denominator', () => {
  const r = f(s);
  assert.equal(r.trialCureDifference, 55/82-19/83);
  assert.ok(Math.abs(r.clinicalCost-10504.23706097561)<1e-8);
  assert.ok(Math.abs(r.costPerTenQalys-1997838.2309494312)<.01);
  assert.ok(Math.abs(r.costPerTenQalys-10*r.costPerQaly)<1e-8);
  assert.ok(r.resourceCostPerTenQalys > r.costPerTenQalys);
});
test('QALY anchor is not discounted twice and catch-up can remove all benefit', () => {
  const full = f({...s, reinfectionHazard:0, excessMortalityHazard:0, laterCureProbability:0});
  assert.equal(full.healthRetention,1);
  assert.equal(full.netQalysPerCure,s.referenceQalysPerCure);
  assert.equal(f({...s,laterCureProbability:1,laterCureYears:0}).costPerTenQalys,null);
  for(const k of ['accessTransfer','fundingAdditionality']) assert.equal(f({...s,[k]:0}).costPerTenQalys,null);
  assert.equal(f({...s,harmQalysPerEnrollee:.1}).costPerTenQalys,null);
});
test('durability, later cure and drug payment change the intended quantities', () => {
  assert.ok(f({...s,reinfectionHazard:0}).netQalys>f(s).netQalys);
  assert.ok(f({...s,laterCureYears:10}).netQalys>f(s).netQalys);
  assert.ok(f({...s,benefitShape:2}).netQalys<f(s).netQalys);
  const paid=f({...s,donorDrugShare:1});
  assert.equal(paid.netQalys,f(s).netQalys);
  assert.equal(paid.donorCost,paid.resourceCost);
  assert.ok(f(data.scenarios[0]).costPerTenQalys<100000);
  assert.ok(f(s).costPerTenQalys>100000);
});
test('invalid model inputs fail instead of creating plausible prices', () => {
  for(const override of [{accessTransfer:1.1},{plannedEnrollees:0},{horizonYears:2.5},{reinfectionHazard:NaN},{benefitShape:-1},{donorDrugShare:Infinity}]) assert.throws(()=>f({...s,...override}),RangeError);
});

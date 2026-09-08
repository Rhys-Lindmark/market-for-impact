import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate, INPUT_BOUNDS} from '../lib/end-overdose-model.mjs';

const model = JSON.parse(readFileSync(new URL('../data/us/end-overdose-model-v1.json', import.meta.url)));
const central = model.scenarios.find(s => s.id === 'central').inputs;
const near = (a, b) => assert.ok(Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(a), Math.abs(b)));
const finiteTree = value => {
  if (typeof value === 'number') assert.ok(Number.isFinite(value));
  else if (value && typeof value === 'object') Object.values(value).forEach(finiteTree);
};

for (const s of model.scenarios) {
  test(`exact accepted full ledger: ${s.id}`, () => {
    assert.deepEqual(calculate(s.inputs), s.outputs);
  });
}

test('all required inputs reject missing, nonfinite, coerced and out-of-bound numbers', () => {
  for (const [key, [min, max]] of Object.entries(INPUT_BOUNDS)) {
    const missing = {...central};
    delete missing[key];
    assert.throws(() => calculate(missing), {name: 'TypeError'});
    for (const invalid of [NaN, Infinity, -Infinity, '1', null, undefined, true]) {
      assert.throws(() => calculate({...central, [key]: invalid}), {name: 'TypeError'});
    }
    assert.throws(() => calculate({...central, [key]: min - 1}), {name: 'RangeError'});
    assert.throws(() => calculate({...central, [key]: max + 1}), {name: 'RangeError'});
  }
});

test('container, integer horizon, combined price and combined shares are guarded', () => {
  for (const p of [null, undefined, [], 5, 'inputs']) assert.throws(() => calculate(p));
  assert.throws(() => calculate({...central, health_years: 2.5}));
  assert.throws(() => calculate({...central, kit_cash_usd: 0, operations_cash_usd: 0}));
  assert.throws(() => calculate({...central, kit_cash_usd: 0.001, operations_cash_usd: 0.001}));
  assert.throws(() => calculate({...central, sf_health_share: 0.6, rest_bay_health_share: 0.5}));
});

test('zero activity and clinical gain retain costs and appropriately scaled harm', () => {
  const zero = calculate({...central, funding_additionality: 0, shared_harm_qaly: 5});
  assert.equal(zero.global.qaly, 0);
  assert.equal(zero.gross_resource_usd, 115000);
  const independent = calculate({...central, funding_additionality: 0, shared_harm_qaly: 5, donor_specific_harm_qaly: 0.1});
  assert.equal(independent.global.qaly, -0.1);
  for (const region of ['global', 'bay', 'sf']) {
    assert.equal(independent[region].donor_usd_per_10_qaly, null);
  }
  const noRescue = calculate({...central, incremental_timely_rescue_probability: 0, shared_harm_qaly: 0.2});
  assert.equal(noRescue.global.qaly, -0.1);
});

test('finite survival handles zero duration, full mortality and no discount', () => {
  for (const change of [{health_years: 0}, {annual_competing_mortality: 1}, {survival_utility: 0}]) {
    const r = calculate({...central, ...change, donor_specific_harm_qaly: 0.1});
    assert.equal(r.finite_qaly_per_death_at_rescue, 0);
    assert.equal(r.global.qaly, -0.1);
  }
  const r = calculate({...central, discount_rate: 0, annual_competing_mortality: 0});
  assert.equal(r.finite_qaly_per_death_at_rescue, 22.5);
  const delayed = calculate({...central, event_delay_years: 2});
  near(delayed.global.qaly, calculate(central).global.qaly / 1.03);
});

test('shares partition one signed total and do not alter the gift denominator', () => {
  const r = calculate({...central, sf_health_share: 0.2, rest_bay_health_share: 0.3});
  near(r.bay.qaly, r.global.qaly * 0.5);
  near(r.sf.qaly, r.global.qaly * 0.2);
  near(r.sf.qaly * r.sf.donor_usd_per_10_qaly, 10 * central.gift_usd);
  const zero = calculate({...central, sf_health_share: 0});
  assert.equal(zero.sf.qaly, 0);
  assert.equal(zero.sf.donor_usd_per_10_qaly, null);
});

test('stock sensitivity transfers medication into resources exactly once', () => {
  const r = calculate({...central, kit_cash_usd: 0, donated_stock_resource_per_offer_usd: 19});
  assert.equal(r.gross_resource_usd, central.gift_usd + r.offers * (10 + 19));
  assert.ok(r.gross_resource_usd > calculate(central).gross_resource_usd);
});

test('bounded extremes and zero gifts remain finite, immutable and JSON-safe', () => {
  const max = Object.fromEntries(Object.entries(INPUT_BOUNDS).map(([key, bounds]) => [key, bounds[1]]));
  max.sf_health_share = 0.5;
  max.rest_bay_health_share = 0.5;
  max.kit_cash_usd = 0;
  max.operations_cash_usd = 0.01;
  for (const p of [max, {...max, annual_competing_mortality: 0, discount_rate: 0}, {...central, gift_usd: 0}]) {
    const snapshot = {...p};
    const r = calculate(Object.freeze(p));
    assert.deepEqual(p, snapshot);
    finiteTree(r);
    assert.deepEqual(JSON.parse(JSON.stringify(r)), r);
  }
});

test('underflow or overflowing positive ratios return null, never NaN or Infinity', () => {
  const r = calculate({...central, sf_health_share: Number.MIN_VALUE});
  assert.equal(r.sf.donor_usd_per_10_qaly, null);
  finiteTree(r);
});

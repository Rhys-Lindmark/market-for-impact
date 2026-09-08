import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate, INPUT_BOUNDS} from '../lib/roots-model.mjs';

const model = JSON.parse(readFileSync(new URL('../data/bay/roots-model-v1.json', import.meta.url)));
const original = JSON.parse(readFileSync(new URL('../data/bay/roots-regression-v1.json', import.meta.url)));
const central = model.scenarios.find(s => s.id === 'central').inputs;
const near = (a, b) => assert.ok(Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(a), Math.abs(b)));

for (const s of model.scenarios) {
  test(`unchanged full ledger: ${s.id}`, () => {
    const expected = original.results.find(r => r.id === s.id);
    const ledger = {...expected};
    delete ledger.id;
    assert.deepEqual(calculate(s.inputs), ledger);
  });
}

test('each required number rejects missing, nonfinite and coerced values', () => {
  for (const key of Object.keys(INPUT_BOUNDS)) {
    const missing = {...central};
    delete missing[key];
    assert.throws(() => calculate(missing), {name: 'TypeError'});
    for (const invalid of [NaN, Infinity, -Infinity, '1', null, undefined, true]) {
      assert.throws(() => calculate({...central, [key]: invalid}), {name: 'TypeError'});
    }
    const [min, max] = INPUT_BOUNDS[key];
    assert.throws(() => calculate({...central, [key]: min - 1}), {name: 'RangeError'});
    assert.throws(() => calculate({...central, [key]: max + 1}), {name: 'RangeError'});
  }
});

test('container, clipping boolean, geography and integer horizons are guarded', () => {
  for (const p of [null, undefined, [], 5, 'inputs']) assert.throws(() => calculate(p));
  for (const value of [undefined, null, 0, 1, 'false']) {
    assert.throws(() => calculate({...central, clip_at_course_end: value}));
  }
  const missing = {...central};
  delete missing.clip_at_course_end;
  assert.throws(() => calculate(missing));
  assert.throws(() => calculate({...central, sf_share: 1}));
  for (const key of ['fatal_years', 'nonfatal_years']) {
    assert.throws(() => calculate({...central, [key]: 2.5}));
  }
});

test('zero gain, funding and independent harms preserve signed health', () => {
  assert.equal(calculate({...central, funding_additionality: 0}).all_us_q, 0);
  assert.equal(calculate({...central, funding_additionality: 0, independent_harm_q: 0.1}).all_us_q, -0.1);
  const nullGain = calculate({...central, sbp_difference: 0});
  assert.ok(nullGain.all_us_q < 0);
  assert.equal(nullGain.donor_us_per_10q, null);
  assert.equal(calculate({...central, sbp_difference: 0, shared_harm_q_per_course: 0}).all_us_q, 0);
});

test('first-event differences reconcile risk, including negative late differences', () => {
  const p = {...central, usual_care_risk: 1};
  const r = calculate(p);
  near(r.schedule.reduce((s, y) => s + y.first_event_difference, 0), 0.2);
  assert.ok(r.schedule.slice(1).every(y => y.first_event_difference < 0));
});

test('clipping cutoff shifts with delay and preserves all gift and resource costs', () => {
  const clipped = calculate({...central, clip_at_course_end: true});
  const delayed = calculate({...central, clip_at_course_end: true, start_delay_years: 1.25});
  for (let i = 0; i < 5; i++) {
    near(delayed.schedule[i].discounted_q_per_event,
      clipped.schedule[i].discounted_q_per_event / 1.03);
  }
  assert.equal(clipped.gross_resource_usd, calculate(central).gross_resource_usd);
  assert.equal(clipped.gift_usd, central.gift_usd);
  assert.ok(clipped.all_us_q < calculate(central).all_us_q);
});

test('resident ledgers are nested and nonzero SF shares work', () => {
  const r = calculate({...central, sf_share: 0.2});
  near(r.sf_q, r.all_us_q * 0.2);
  near(r.bay_q, r.all_us_q * 0.95);
  near(r.donor_sf_per_10q * r.sf_q, central.gift_usd * 10);
});

test('zero duration and total competing mortality leave only explicit harm', () => {
  const harm = -12.5 * 0.5 * central.shared_harm_q_per_course;
  near(calculate({...central, fatal_years: 0, nonfatal_years: 0}).all_us_q, harm);
  near(calculate({...central, annual_competing_mortality: 1}).all_us_q, harm);
});

test('bounded extreme inputs produce finite JSON-safe outputs without mutation', () => {
  const p = Object.fromEntries(Object.entries(INPUT_BOUNDS).map(([key, bounds]) => [key, bounds[1]]));
  p.course_cash_usd = INPUT_BOUNDS.course_cash_usd[0];
  p.clip_at_course_end = false;
  const snapshot = {...p};
  const r = calculate(Object.freeze(p));
  assert.deepEqual(p, snapshot);
  function finiteTree(v) {
    if (typeof v === 'number') assert.ok(Number.isFinite(v));
    else if (v && typeof v === 'object') Object.values(v).forEach(finiteTree);
  }
  finiteTree(r);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), r);
});

test('unrepresentable ratios return null rather than Infinity', () => {
  const r = calculate({...central, bay_share: Number.MIN_VALUE});
  assert.equal(r.donor_bay_per_10q, null);
});

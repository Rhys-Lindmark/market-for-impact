import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const frozen = JSON.parse(fs.readFileSync(new URL('../data/new-york-city/parker-nyc-pre-recalibration-model.json', import.meta.url), 'utf8'));
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) <= 1e-10 * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);
function reconstruct(p) {
  const cost = p.C0 + p.I + p.M * p.w + p.H * p.s * p.k + p.Cd;
  const people = p.D / p.share * p.f;
  const rate = p.rho + Math.log1p(p.d);
  const years = rate === 0 ? p.T : -Math.expm1(-rate * p.T) / rate;
  const medical = people * p.a * p.b * (p.p * p.u * years - p.h);
  const dental = p.Nd * p.rd * p.ad * p.b * (p.pd * p.ud * p.Td - p.hd) * p.od;
  const all = medical + dental;
  const local = p.g * all;
  return { cost, people, medical, dental, all, local, price: local > 0 ? 10 * cost / local : null };
}

test('Parker frozen beta retains full identity and thirteen original cases', () => {
  assert.equal(frozen.organizationId, 'ein:22-3619518');
  assert.equal(frozen.frozenFromCommit, '89446bdb4559dde39c1b02b32bc23aaea2225b74');
  assert.equal(frozen.model.scenarios.length, 13);
  assert.equal(new Set(frozen.model.scenarios.map(s => s.id)).size, 13);
  for (const s of frozen.model.scenarios) {
    const p = { ...frozen.model.centralParameters, ...s.parameterOverrides };
    assert.deepEqual(JSON.parse(s.assumptions), p);
    const r = reconstruct(p);
    close(r.cost, s.costUSD);
    close(r.all, s.allPopulationQalys);
    close(r.local, s.editionQalys);
    if (r.price === null) assert.equal(s.pricePer10Qalys, null);
    else close(r.price, s.pricePer10Qalys);
  }
});

test('Parker medical and prospective dental scopes remain distinct', () => {
  const p = frozen.model.centralParameters;
  const r = reconstruct(p);
  close(r.people, 1368);
  close(r.people * p.a * p.b, 171);
  assert.equal(r.dental, 0);
  close(r.cost, 2427658);
  close(r.price, 7711757.941826708);
  const dental = frozen.model.scenarios.find(s => s.id === 'dental-prospective');
  assert.ok(reconstruct({ ...p, ...dental.parameterOverrides }).dental > 0);
});

test('Parker accounting boundary alone does not change physical outcomes or establish cash productivity', () => {
  const p = frozen.model.centralParameters;
  const gross = reconstruct(p);
  const recognized = reconstruct({ ...p, w: 0, s: 0 });
  close(recognized.all, gross.all);
  close(recognized.price / gross.price, recognized.cost / gross.cost);
  assert.equal(reconstruct({ ...p, b: 0 }).price, null);
  assert.ok(reconstruct({ ...p, p: 0, h: .005 }).local < 0);
});

#!/usr/bin/env node
// Reference evaluator for open-botec recipes. No dependencies beyond the repo's existing ajv.
// Usage: node docs/open-botec/tools/evaluate.mjs <recipe.json> [--out <record.json>] [--samples N] [--seed S]
// A recipe names a template, parameter files, org inputs and provenance. The evaluator resolves
// every template parameter, refuses missing local/org values, propagates p10/p50/p90 by Monte Carlo
// (independent draws) and writes a botec.schema.json record.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const FUNCS = { exp: Math.exp, log: Math.log, min: Math.min, max: Math.max };

function compile(expr, names) {
  if (!/^[A-Za-z0-9_ .+\-*/()^,]+$/.test(expr)) throw new Error(`Illegal character in expression: ${expr}`);
  for (const id of expr.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []) {
    if (!names.includes(id) && !(id in FUNCS)) throw new Error(`Unknown identifier "${id}" in: ${expr}`);
  }
  const args = [...Object.keys(FUNCS), ...names];
  const fn = new Function(...args, `return (${expr.replaceAll('^', '**')});`);
  return (env) => fn(...Object.values(FUNCS), ...names.map((n) => env[n]));
}

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Z90 = 1.2815515655446004;
const clampP = (p) => Math.min(Math.max(p, 0.005), 0.995);
const logit = (p) => Math.log(clampP(p) / (1 - clampP(p)));
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

function sampler(dist, name) {
  const { p10, p50, p90 } = dist;
  const shape = dist.shape ?? 'two-piece-lognormal';
  if (shape === 'fixed' || (p10 === p50 && p50 === p90)) return () => p50;
  if (shape === 'two-piece-logit') {
    const [a, b, c] = [logit(p10), logit(p50), logit(p90)];
    return (z) => sigmoid(b + z * (z < 0 ? (b - a) : (c - b)) / Z90);
  }
  if (shape === 'two-piece-lognormal') {
    if (!(p10 > 0 && p50 > 0 && p90 > 0)) throw new Error(`${name}: lognormal needs positive quantiles`);
    const [lo, hi] = [Math.log(p50 / p10) / Z90, Math.log(p90 / p50) / Z90];
    return (z) => p50 * Math.exp(z * (z < 0 ? lo : hi));
  }
  throw new Error(`${name}: unsupported shape ${shape}`);
}

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
const sig = (x) => (x == null || !Number.isFinite(x) ? null : Number(x.toPrecision(4)));
const dist = (arr, unit) => {
  const s = [...arr].sort((a, b) => a - b);
  return { p10: sig(quantile(s, 0.1)), p50: sig(quantile(s, 0.5)), p90: sig(quantile(s, 0.9)), unit, shape: 'empirical', basis: 'simulated' };
};

export function evaluate(recipePath, { samples = 20000, seed = 20261018 } = {}) {
  const recipe = readJson(recipePath);
  const template = readJson(join(ROOT, recipe.template));
  const inputs = {};
  // Precedence: template defaults < parameter files in order < recipe inputs.
  for (const [name, p] of Object.entries(template.parameters)) {
    if (p.default) inputs[name] = { label: p.label, ...p.default, from: recipe.template };
  }
  const paramFiles = recipe.parameterSets ?? [];
  for (const file of paramFiles) {
    const pf = readJson(join(ROOT, file));
    if (pf.archetypeId !== template.archetypeId) throw new Error(`${file} is for ${pf.archetypeId}, not ${template.archetypeId}`);
    for (const [name, v] of Object.entries(pf.values)) inputs[name] = { label: template.parameters[name]?.label, ...v, from: file };
  }
  for (const [name, v] of Object.entries(recipe.inputs ?? {})) inputs[name] = { label: template.parameters[name]?.label, ...v, from: relative(ROOT, recipePath) };

  const unknown = Object.keys(inputs).filter((n) => !template.parameters[n]);
  if (unknown.length) throw new Error(`Inputs not in template: ${unknown.join(', ')}`);
  const missing = Object.keys(template.parameters).filter((n) => !inputs[n]);
  if (missing.length) throw new Error(`Missing local/org lookups: ${missing.join(', ')}`);
  const overrides = Object.entries(inputs)
    .filter(([n, v]) => template.parameters[n].default && v.from !== recipe.template)
    .map(([parameter, v]) => ({ parameter, reason: v.overrideReason ?? 'not stated' }));
  for (const v of Object.values(inputs)) delete v.overrideReason;

  const derivedNames = Object.keys(template.derived ?? {});
  const names = [...Object.keys(template.parameters), ...derivedNames];
  const derived = derivedNames.map((n) => [n, compile(template.derived[n], names)]);
  const fNative = compile(template.formulas.nativeOutcomesPerUnit, names);
  const bridge = template.formulas.qalyBridge;
  const fQaly = bridge ? compile(bridge.qalysPerNativeOutcome, names) : null;
  const costName = template.costDenominator.costParameter;

  const run = (env) => {
    for (const [n, f] of derived) env[n] = f(env);
    const native = fNative(env);
    const cost = env[costName];
    const qpn = fQaly ? fQaly(env) : null;
    const qalys = qpn == null ? null : native * qpn;
    return { cost, native, costPerOutcome: native > 0 ? cost / native : Infinity, per10k: (10000 / cost) * native, qpn, price10: qalys > 0 ? (10 * cost) / qalys : Infinity };
  };

  const central = run(Object.fromEntries(Object.entries(inputs).map(([n, v]) => [n, v.value.p50])));
  const rand = mulberry32(seed);
  const samplers = Object.entries(inputs).map(([n, v]) => [n, sampler(v.value, n)]);
  const out = { costPerOutcome: [], per10k: [], qpn: [], price10: [] };
  let nonPositive = 0;
  for (let i = 0; i < samples; i++) {
    const env = {};
    for (const [n, s] of samplers) {
      const z = Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
      env[n] = s(z);
    }
    const r = run(env);
    if (!(r.native > 0)) nonPositive++;
    for (const k of Object.keys(out)) out[k].push(r[k]);
  }

  const k = recipe.key;
  const id = `${k.org.orgId.toLowerCase().replace(/[^a-z0-9:-]/g, '-')}/${k.program.slug}/${template.archetypeId}/${k.geography.geoId}/${k.year}/${k.modelVersion}`;
  const record = {
    schemaVersion: 'open-botec/0.1',
    id,
    key: { ...k, archetypeId: template.archetypeId },
    status: recipe.status,
    template: { archetypeId: template.archetypeId, templateVersion: template.version, parameterSets: paramFiles, overrides },
    scope: recipe.scope,
    inputs,
    nativeOutcome: {
      unit: template.nativeOutcome.unit,
      perUnitCost: template.costDenominator.unit,
      outcomesPer10kUsd: dist(out.per10k, `${template.nativeOutcome.unit} per $10,000`),
      costPerOutcome: dist(out.costPerOutcome, `USD per ${template.nativeOutcome.unit}`),
      centralPoint: sig(central.costPerOutcome),
      formula: template.formulas.nativeOutcomesPerUnit,
    },
    cost: recipe.cost,
    qalyLayer: bridge
      ? {
          bridgeId: bridge.bridgeId,
          bridgeVersion: bridge.version,
          qalysPerNativeOutcome: dist(out.qpn, `QALYs per ${template.nativeOutcome.unit}`),
          pricePer10Qalys: dist(out.price10, 'USD per 10 QALYs'),
          centralPointPricePer10Qalys: sig(central.price10),
          probabilityNonPositive: nonPositive / samples,
          auditStatus: 'unaudited',
          notes: 'probabilityNonPositive is 0 by construction: v1 input distributions are strictly positive, so the null case lives only in nullBoundary.',
        }
      : null,
    simulation: { method: 'monte-carlo-independent', samples, seed, tool: 'docs/open-botec/tools/evaluate.mjs', notes: 'Inputs drawn independently. Legacy SF scenarios were joint corners; independent draws give a narrower price spread than those corners.' },
    margin: recipe.margin,
    fundingRoom: recipe.fundingRoom,
    nullBoundary: template.nullBoundary,
    provenance: recipe.provenance,
    conflictOfInterest: recipe.conflictOfInterest,
    ...(recipe.links ? { links: recipe.links } : {}),
  };
  return record;
}

export function validator() {
  const require = createRequire(join(ROOT, '../../package.json'));
  // The repo ships ajv 6 (draft-07); schemas declare draft-07 and keep $defs as plain JSON-pointer targets.
  const Ajv = require('ajv');
  const ajv = new Ajv({ allErrors: true });
  ajv.addSchema(readJson(join(ROOT, 'botec.schema.json')));
  ajv.addSchema(readJson(join(ROOT, 'template.schema.json')));
  ajv.addSchema(readJson(join(ROOT, 'parameters.schema.json')));
  return ajv;
}

const listJson = (dir, keep = () => true) => readdirSync(join(ROOT, dir), { recursive: true })
  .filter((f) => f.endsWith('.json') && keep(f)).sort().map((f) => join(dir, f));

// The site imports registry.json, so a contribution only needs files under docs/open-botec plus `--all`.
export function buildRegistry() {
  const estimates = listJson('estimates', (f) => !f.endsWith('.recipe.json')).map((f) => ({ path: `docs/open-botec/${f}`, ...readJson(join(ROOT, f)) }));
  const templates = listJson('templates').map((f) => ({ path: `docs/open-botec/${f}`, ...readJson(join(ROOT, f)) }));
  const parameters = listJson('parameters').map((f) => ({ path: `docs/open-botec/${f}`, ...readJson(join(ROOT, f)) }));
  const schemas = Object.fromEntries(['botec', 'template', 'parameters'].map((n) => [n, readJson(join(ROOT, `${n}.schema.json`))]));
  return { registryVersion: 'open-botec-registry/0.1', source: 'https://github.com/Rhys-Lindmark/market-for-impact/tree/main/docs/open-botec', schemas, templates, parameters, estimates };
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === '--all') {
  const ajv = validator();
  for (const recipe of listJson('estimates', (f) => f.endsWith('.recipe.json'))) {
    const record = evaluate(join(ROOT, recipe));
    if (!ajv.validate('https://ai.rhyslindmark.com/givebetter/open-botec/botec.schema.json', record)) { console.error(recipe, ajv.errorsText()); process.exit(1); }
    writeFileSync(join(ROOT, recipe.replace('.recipe.json', '.json')), JSON.stringify(record, null, 2) + '\n');
  }
  writeFileSync(join(ROOT, 'registry.json'), JSON.stringify(buildRegistry()) + '\n');
  console.log('Regenerated estimates and registry.json');
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d);
  const record = evaluate(resolve(args[0]), { samples: Number(opt('--samples', 20000)), seed: Number(opt('--seed', 20261018)) });
  const ajv = validator();
  const ok = ajv.validate('https://ai.rhyslindmark.com/givebetter/open-botec/botec.schema.json', record);
  if (!ok) { console.error(JSON.stringify(ajv.errors, null, 2)); process.exit(1); }
  const outPath = opt('--out');
  if (outPath) writeFileSync(outPath, JSON.stringify(record, null, 2) + '\n');
  const q = record.qalyLayer;
  console.log(`${record.id}\n  cost per ${record.nativeOutcome.unit}: central ${record.nativeOutcome.centralPoint} | sim p10/p50/p90 ${record.nativeOutcome.costPerOutcome.p10} / ${record.nativeOutcome.costPerOutcome.p50} / ${record.nativeOutcome.costPerOutcome.p90}`);
  if (q) console.log(`  USD per 10 QALYs: central ${q.centralPointPricePer10Qalys} | sim p10/p50/p90 ${q.pricePer10Qalys.p10} / ${q.pricePer10Qalys.p50} / ${q.pricePer10Qalys.p90}`);
}

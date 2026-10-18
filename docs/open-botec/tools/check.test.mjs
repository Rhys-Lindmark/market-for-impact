// CI gate for open-botec contributions: node --test docs/open-botec/tools/check.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate, validator, buildRegistry } from './evaluate.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://ai.rhyslindmark.com/givebetter/open-botec/';
const ajv = validator();
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const files = (dir, suffix) => (existsSync(join(ROOT, dir)) ? readdirSync(join(ROOT, dir), { recursive: true }).filter((f) => f.endsWith(suffix)).map((f) => join(ROOT, dir, f)) : []);
const valid = (schema, path) => {
  const ok = ajv.validate(BASE + schema, readJson(path));
  assert.ok(ok, `${path}: ${ajv.errorsText()}`);
};

test('templates validate', () => { for (const f of files('templates', '.json')) valid('template.schema.json', f); });
test('parameter files validate', () => { for (const f of files('parameters', '.json')) valid('parameters.schema.json', f); });

const recipes = files('estimates', '.recipe.json');
test('every recipe evaluates to its committed, schema-valid record', () => {
  for (const r of recipes) {
    const committed = r.replace('.recipe.json', '.json');
    assert.ok(existsSync(committed), `missing generated record for ${r}`);
    valid('botec.schema.json', committed);
    assert.deepEqual(evaluate(r), readJson(committed), `${committed} is stale; rerun evaluate.mjs --out`);
  }
});

test('self-submitted and conflicted records stay draft', () => {
  for (const r of recipes) {
    const rec = readJson(r.replace('.recipe.json', '.json'));
    if (rec.conflictOfInterest.selfSubmitted || rec.conflictOfInterest.declared) assert.equal(rec.status.tier, 'draft', rec.id);
    if (rec.status.tier !== 'draft') assert.ok(rec.provenance.audits?.some((a) => a.independent && a.verdict.startsWith('pass')), `${rec.id} needs an independent passing audit`);
  }
});

test('templates reproduce the legacy SF central prices', () => {
  const expect = { 'sfaf-naloxone': 56330, 'ymca-sf-dpp': 2095000, 'selfhelp-tai-chi': 2336000 };
  for (const [slug, price] of Object.entries(expect)) {
    const rec = evaluate(join(ROOT, 'estimates/us-ca-san-francisco', `${slug}.recipe.json`));
    assert.equal(rec.qalyLayer.centralPointPricePer10Qalys, price, slug);
  }
});

test('registry.json is current', () => {
  assert.deepEqual(readJson(join(ROOT, 'registry.json')), buildRegistry(), 'run: node docs/open-botec/tools/evaluate.mjs --all');
});

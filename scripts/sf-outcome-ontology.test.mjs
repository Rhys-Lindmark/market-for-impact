import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkSfOntologySource, sha256, validateSfOutcomeOntology } from './lib/sf-outcome-ontology.mjs';

const snapshot = JSON.parse(fs.readFileSync(new URL('../data/san-francisco/outcome-ontology-v1.json', import.meta.url)));

test('San Francisco ontology defines all eight required outcome families', () => {
  validateSfOutcomeOntology(snapshot);
  assert.deepEqual(snapshot.outcomes.map((item) => item.key), [
    'housing-stability', 'unsheltered-days-avoided', 'overdose-deaths-averted', 'mental-health-stabilization',
    'food-security', 'educational-attainment', 'violence-reduction', 'economic-mobility',
  ]);
});

test('every local outcome blocks unsupported QALY, WELLBY, and causal claims', () => {
  for (const outcome of snapshot.outcomes) {
    assert.equal(outcome.qalyState, 'blocked-no-local-conversion-model');
    assert.equal(outcome.wellbyState, 'blocked-no-local-conversion-model');
    assert.equal(outcome.attributionState, 'counterfactual-required');
    assert.ok(outcome.blockedClaims.length >= 3);
  }
});

test('service outputs and administrative outcomes remain distinct', () => {
  const overdose = snapshot.outcomes.find((item) => item.key === 'overdose-deaths-averted');
  assert.ok(overdose.serviceOutputs.includes('naloxone kits distributed'));
  assert.ok(overdose.blockedClaims.includes('each naloxone reversal equals one death averted'));
  const unsheltered = snapshot.outcomes.find((item) => item.key === 'unsheltered-days-avoided');
  assert.equal(unsheltered.measurementState, 'model-required');
  assert.ok(unsheltered.blockedClaims.some((item) => item.includes('PIT')));
});

test('double-count rules cover the major linked outcome paths', () => {
  assert.equal(snapshot.overlaps.length, 6);
  assert.ok(snapshot.overlaps.some((item) => item.left === 'housing-stability' && item.right === 'unsheltered-days-avoided'));
  assert.ok(snapshot.overlaps.some((item) => item.left === 'educational-attainment' && item.right === 'economic-mobility'));
});

test('source monitor validates binary hashes and semantic signals', async () => {
  const bytes = Buffer.from('stable source');
  const binary = { key: 'binary', url: 'https://example.test/a.pdf', monitor: { mode: 'binary-sha256', sha256: sha256(bytes) } };
  const semantic = { key: 'semantic', url: 'https://example.test/a', monitor: { mode: 'semantic-signals', signals: ['stable source', 'definition'] } };
  const response = (body) => async () => new Response(body, { status: 200 });
  assert.equal((await checkSfOntologySource(binary, response(bytes))).state, 'current-binary');
  assert.equal((await checkSfOntologySource(semantic, response('Stable source definition'))).state, 'current-semantic');
  await assert.rejects(checkSfOntologySource({ ...binary, monitor: { ...binary.monitor, sha256: '0'.repeat(64) } }, response(bytes)), /changed/);
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateSfCandidateUniverse } from './lib/sf-candidate-universe.mjs';

const snapshot = validateSfCandidateUniverse(JSON.parse(await readFile(new URL('../data/san-francisco/candidate-universe-v1.json', import.meta.url), 'utf8')));

test('SF universe reconciles every active nonprofit prime contract without inventing organizations', () => {
  assert.equal(snapshot.summary.activeContractCount, snapshot.organizations.reduce((total, row) => total + row.contractCount, 0));
  assert.equal(snapshot.summary.sourceOrganizationNameCount, snapshot.organizations.length);
  assert.ok(snapshot.summary.sourceOrganizationNameCount > 500);
  assert.ok(snapshot.summary.outcomeMappedOrganizationNameCount > 100);
});

test('SF discovery keeps public accounting separate from effectiveness and funding room', () => {
  assert.equal(snapshot.summary.publishableRoomForFundingCount, 0);
  assert.ok(snapshot.organizations.every((row) => row.roomForMoreFundingUsd === null));
  assert.match(snapshot.interpretation.scale, /do not measure/i);
  assert.match(snapshot.interpretation.recommendation, /no recommendation/i);
});

test('SF identity and outcome boundaries remain explicit', () => {
  assert.ok(snapshot.organizations.every((row) => row.identityStatus === 'source-name-only'));
  assert.equal(snapshot.outcomes.length, 8);
  assert.equal(snapshot.summary.deepDiligenceCount, 6);
  assert.equal(snapshot.summary.deepDiligenceInUniverseCount, 4);
  assert.equal(snapshot.summary.deepDiligenceOutsideUniverseCount, 2);
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildSfMarginalPlanRequests, validateSfMarginalPlanRequests } from './lib/sf-marginal-plan-requests.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const snapshot = buildSfMarginalPlanRequests({
  grantEvaluation: read('data/san-francisco/grant-evaluation-v1.json'),
  diligence: read('data/san-francisco/nonprofit-diligence-v1.json'),
  publicFunding: read('data/san-francisco/public-funding-v1.json'),
});

test('Hamilton request covers every required field and gift size', () => {
  validateSfMarginalPlanRequests(snapshot);
  const packet = snapshot.packets[0];
  assert.deepEqual(packet.scenarios.map((scenario) => scenario.amountUsd), [100000, 1000000, 10000000]);
  assert.equal(packet.questions.length, 8);
  assert.equal(snapshot.summary.publicFactCount, 5);
});

test('public facts never become organization answers or MFI estimates', () => {
  const packet = snapshot.packets[0];
  assert.equal(packet.statusLabel, 'Draft · not sent');
  assert.equal(packet.responseReceivedAt, null);
  assert.equal(packet.forecastLockedAt, null);
  assert.ok(packet.scenarios.every((scenario) => scenario.organizationResponse === null && scenario.mfiModel === null));
  assert.ok(packet.questions.every((question) => question.organizationResponse === null && question.mfiModel === null));
  assert.match(packet.decisionBoundary, /not a funding recommendation/i);
});

test('accepted public prefill exposes the funding and outcome boundaries that matter', () => {
  const packet = snapshot.packets[0];
  assert.match(packet.publicFacts.find((fact) => fact.key === 'latest-signals').display, /34 program exits to stable housing/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'organization-finances').display, /\$17\.41M revenue/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'public-funding').display, /8 exact prime-contractor matches/);
  assert.match(packet.questions.find((question) => question.key === 'fundingDisplacement').publicContext, /eight matched city contracts/i);
  assert.ok(packet.sources.every((source) => source.retrievedAt));
});

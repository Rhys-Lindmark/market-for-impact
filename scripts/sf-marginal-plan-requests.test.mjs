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

test('all organization requests cover every required field and gift size', () => {
  validateSfMarginalPlanRequests(snapshot);
  assert.equal(snapshot.summary.packetCount, 4);
  assert.equal(snapshot.summary.scenarioCount, 12);
  assert.equal(snapshot.summary.questionCount, 32);
  assert.equal(snapshot.summary.publicFactCount, 20);
  for (const packet of snapshot.packets) {
    assert.deepEqual(packet.scenarios.map((scenario) => scenario.amountUsd), [100000, 1000000, 10000000]);
    assert.equal(packet.questions.length, 8);
  }
});

test('public facts never become organization answers or MFI estimates', () => {
  for (const packet of snapshot.packets) {
    assert.equal(packet.statusLabel, 'Draft · not sent');
    assert.equal(packet.responseReceivedAt, null);
    assert.equal(packet.forecastLockedAt, null);
    assert.ok(packet.scenarios.every((scenario) => scenario.organizationResponse === null && scenario.mfiModel === null));
    assert.ok(packet.questions.every((question) => question.organizationResponse === null && question.mfiModel === null));
    assert.match(packet.decisionBoundary, /not a funding recommendation/i);
  }
});

test('Hamilton public prefill exposes the funding and outcome boundaries that matter', () => {
  const packet = snapshot.packets.find((item) => item.candidateKey === 'hamilton-families');
  assert.match(packet.publicFacts.find((fact) => fact.key === 'latest-signals').display, /34 program exits to stable housing/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'organization-finances').display, /\$17\.41M revenue/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'public-funding').display, /8 exact prime-contractor matches/);
  assert.match(packet.questions.find((question) => question.key === 'fundingDisplacement').publicContext, /eight matched city contracts/i);
});

test('Food Bank public prefill keeps cash, in-kind, capacity, and outcomes separate', () => {
  const packet = snapshot.packets.find((item) => item.candidateKey === 'sf-marin-food-bank');
  assert.match(packet.publicFacts.find((fact) => fact.key === 'latest-signals').display, /44,000 households served weekly/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'organization-finances').display, /\$83\.89M donated food\/in-kind/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'public-funding').display, /8 exact prime-contractor matches/);
  assert.match(packet.questions.find((question) => question.key === 'capacityConstraints').publicContext, /at capacity and uses a waitlist/i);
  assert.match(packet.questions.find((question) => question.key === 'outcomeForecast').publicContext, /USDA food-security denominator/i);
  assert.match(packet.decisionBoundary, /not.*cost per food-secure household/i);
  assert.ok(packet.sources.every((source) => source.retrievedAt));
});

test('SF LGBT Center public prefill keeps reach, finances, paused enrollment, and durable outcomes separate', () => {
  const packet = snapshot.packets.find((item) => item.candidateKey === 'sf-lgbt-center');
  assert.match(packet.publicFacts.find((fact) => fact.key === 'latest-signals').display, /30\+ people secured living-wage employment/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'organization-finances').display, /\$3\.62M government grants \(55% of revenue\)/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'public-funding').display, /5 exact prime-contractor matches/);
  assert.match(packet.questions.find((question) => question.key === 'capacityConstraints').publicContext, /enrollment is currently paused/i);
  assert.match(packet.questions.find((question) => question.key === 'outcomeForecast').publicContext, /248-participant formative evaluation/i);
  assert.match(packet.questions.find((question) => question.key === 'costAndAttribution').publicContext, /cost per retained living-wage job/i);
  assert.match(packet.decisionBoundary, /not.*cost per retained job/i);
  assert.ok(packet.sources.every((source) => source.retrievedAt));
});

test('GLIDE public prefill keeps gateway services, consolidated finances, capacity, and outcomes separate', () => {
  const packet = snapshot.packets.find((item) => item.candidateKey === 'glide');
  assert.match(packet.publicFacts.find((fact) => fact.key === 'latest-signals').display, /620,513 meals served/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'organization-finances').display, /\$10\.83M contract revenue/);
  assert.match(packet.publicFacts.find((fact) => fact.key === 'public-funding').display, /14 exact prime-contractor matches/);
  assert.match(packet.questions.find((question) => question.key === 'capacityConstraints').publicContext, /limited space and high demand/i);
  assert.match(packet.questions.find((question) => question.key === 'fundingDisplacement').publicContext, /\$14\.12M future meal agreement/i);
  assert.match(packet.questions.find((question) => question.key === 'outcomeForecast').publicContext, /treatment-retention/i);
  assert.match(packet.decisionBoundary, /not.*cost per food-secure participant/i);
  assert.ok(packet.sources.every((source) => source.retrievedAt));
});

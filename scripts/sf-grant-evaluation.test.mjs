import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildSfGrantEvaluation, validateSfGrantEvaluation } from './lib/sf-grant-evaluation.mjs';

const comparison = JSON.parse(fs.readFileSync('data/san-francisco/donor-comparison-v1.json', 'utf8'));
const diligence = JSON.parse(fs.readFileSync('data/san-francisco/nonprofit-diligence-v1.json', 'utf8'));
const snapshot = buildSfGrantEvaluation({ comparison, diligence });

test('SF grant-evaluation contract covers every candidate and gift size', () => {
  validateSfGrantEvaluation(snapshot);
  assert.equal(snapshot.summary.candidateCount, 6);
  assert.equal(snapshot.summary.scenarioCount, 18);
  for (const candidate of snapshot.candidates) assert.deepEqual(candidate.scenarios.map((scenario) => scenario.amountUsd), [100000, 1000000, 10000000]);
});

test('empty research records fail visibly open rather than implying readiness', () => {
  assert.equal(snapshot.summary.submittedScenarioCount, 0);
  assert.equal(snapshot.summary.forecastLockedCount, 0);
  assert.equal(snapshot.summary.lookbackEligibleCount, 0);
  for (const candidate of snapshot.candidates) {
    assert.equal(candidate.marginalPlanLabel, 'Not submitted');
    assert.ok(candidate.scenarios.every((scenario) => scenario.display === 'Awaiting program-specific plan'));
    assert.ok(candidate.scenarios.every((scenario) => Object.values(scenario.requiredFieldStates).every((state) => state === 'missing')));
  }
});

test('forecast and lookback requirements preserve precommitment and counterfactuals', () => {
  assert.equal(snapshot.marginalPlan.requiredFields.length, 8);
  assert.equal(snapshot.lookback.requiredFields.length, 8);
  assert.match(snapshot.promotionRule, /specific program and entity.*counterfactual.*uncertainty.*independent review/i);
  assert.match(snapshot.lookback.forecastRule, /original forecast remains immutable/i);
  assert.deepEqual(snapshot.lookback.systematicReviewTargetMonths, [24, 36]);
  assert.ok(snapshot.sources.every((source) => source.publisher === 'GiveWell'));
});

test('the first historical grant seed preserves published amount and missing lookback evidence', () => {
  const grant = snapshot.historicalGrants[0];
  assert.equal(snapshot.summary.historicalGrantCount, 1);
  assert.equal(grant.candidateName, 'Housing Action Coalition');
  assert.equal(grant.amountUsd, 120000);
  assert.equal(grant.amountSemantics, 'funder-published grant amount');
  assert.equal(grant.originalForecastState, 'not-published');
  assert.equal(grant.milestonesState, 'not-published');
  assert.equal(grant.realizedOutcomesState, 'not-published');
  assert.equal(grant.lookbackState, 'not-yet-assessable');
  assert.match(grant.publisherRole, /originating funder not assumed/i);
  assert.match(grant.scheduleSemantics, /not a funder commitment/i);
});

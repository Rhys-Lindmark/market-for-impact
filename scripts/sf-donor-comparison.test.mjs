import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildSfDonorComparison, validateSfDonorComparison } from './lib/sf-donor-comparison.mjs';

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const snapshot = buildSfDonorComparison({
  diligence: load('data/san-francisco/nonprofit-diligence-v1.json'),
  outcomes: load('data/san-francisco/outcome-ontology-v1.json'),
});

test('SF donor comparison standardizes six candidates without ranking them', () => {
  validateSfDonorComparison(snapshot);
  assert.equal(snapshot.summary.candidateCount, 6);
  assert.equal(snapshot.summary.recommendationReadyCount, 0);
  assert.equal(snapshot.summary.insufficientEvidenceCount, 6);
  assert.equal(snapshot.summary.deepDossierCount, 5);
  assert.match(snapshot.interpretation.ordering, /alphabetical, not ranked/i);
});

test('every unsupported impact price and gift-size plan fails visibly open', () => {
  assert.equal(snapshot.summary.costEffectivenessNotEstimableCount, 6);
  assert.equal(snapshot.summary.publishedFundingRoomCount, 0);
  for (const candidate of snapshot.candidates) {
    assert.equal(candidate.costEffectiveness.display, 'Not yet estimable');
    assert.equal(candidate.livesSubstantiallyBettered.display, 'Definition not approved');
    assert.deepEqual(candidate.fundingRoom.giftScenarios.map((scenario) => scenario.amountUsd), [100000, 1000000, 10000000]);
    assert.ok(candidate.fundingRoom.giftScenarios.every((scenario) => scenario.display === 'No reviewed plan'));
  }
});

test('research depth and donation vehicles remain descriptive rather than scored', () => {
  const growsf = snapshot.candidates.find((candidate) => candidate.key === 'growsf');
  const hac = snapshot.candidates.find((candidate) => candidate.key === 'housing-action-coalition');
  assert.equal(growsf.researchState, 'initial-scorecard-only');
  assert.match(growsf.donationVehicle.deductibility, /not deductible/i);
  assert.equal(hac.researchState, 'deep-evidence-dossier');
  assert.match(hac.donationVehicle.taxStatus, /501\(c\)\(3\).*501\(c\)\(4\)/i);
  assert.match(snapshot.interpretation.recommendation, /does not convert research depth.*into an impact score/i);
});

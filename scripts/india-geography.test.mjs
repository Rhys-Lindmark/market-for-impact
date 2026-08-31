import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildIndiaGeography, validateIndiaGeography } from './lib/india-geography.mjs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const snapshot = buildIndiaGeography({
  givewell: read('data/normalized/givewell-grants.json'),
  topCharities: read('data/givewell/top-charities.json'),
  ace: read('data/ace/recommendations-2025.json'),
  grantFlow: read('data/comparisons/grant-flow-contract-v1.json'),
});

test('India geography contract reconciles explicit country-tagged GiveWell rows', () => {
  validateIndiaGeography(snapshot);
  assert.equal(snapshot.summary.givewellGrantCount, 50);
  assert.equal(snapshot.summary.givewellPublishedAmountUsd, 170373207);
  assert.equal(snapshot.summary.indiaOnlyGrantCount, 36);
  assert.equal(snapshot.summary.indiaOnlyPublishedAmountUsd, 124386229);
  assert.equal(snapshot.summary.multiCountryGrantCount, 14);
  assert.equal(snapshot.summary.multiCountryPublishedAmountUsd, 45986978);
  assert.equal(snapshot.summary.recentGrantCount, 26);
  assert.equal(snapshot.summary.recentPublishedAmountUsd, 61826023);
});

test('current India opportunity preserves native ACE metrics and blocks geographic overreach', () => {
  const opportunity = snapshot.currentOpportunities[0];
  assert.equal(snapshot.summary.currentEvaluatorOpportunityCount, 1);
  assert.equal(opportunity.organization, 'Shrimp Welfare Project');
  assert.equal(opportunity.indiaMetrics.length, 2);
  assert.deepEqual(opportunity.indiaMetrics.map((metric) => metric.unit), ['shrimps helped per USD', 'SADs averted per USD']);
  assert.equal(opportunity.organizationFundingRoomUsd, 750000);
  assert.equal(opportunity.indiaSpecificFundingRoomUsd, null);
  assert.equal(opportunity.headquarters, null);
  assert.equal(opportunity.indiaDonationVehicle, null);
  assert.match(snapshot.interpretation.fundingRoom, /organization-wide.*India-specific room remains unknown/i);
});

test('multi-country rows retain full source amount without inventing an India allocation', () => {
  const multiCountry = snapshot.givewellFlow.recentGrants.filter((row) => row.countries.length > 1);
  assert.equal(multiCountry.length, 5);
  assert.ok(multiCountry.every((row) => row.indiaAmountUsd === null));
  assert.ok(multiCountry.every((row) => row.amountSemantics === 'published grant amount; payment timing not inferred'));
  assert.match(snapshot.interpretation.amount, /full source amount.*does not allocate dollars by country/i);
});

test('evaluator coverage exposes missing country fields instead of keyword inference', () => {
  assert.equal(snapshot.evaluatorCoverage.length, 6);
  assert.equal(snapshot.evaluatorCoverage.find((row) => row.evaluator === 'Coefficient Giving').state, 'structured-country-field-unavailable');
  assert.match(snapshot.evaluatorCoverage.find((row) => row.evaluator === 'Giving Green').boundary, /not used to infer India/i);
  assert.equal(snapshot.summary.currentGiveWellTopCharityCount, 0);
  assert.equal(snapshot.summary.assessedIndiaDonationVehicleCount, 0);
});

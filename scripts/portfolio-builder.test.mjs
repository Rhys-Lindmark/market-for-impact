import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildDonorPortfolio, validatePortfolioContract } from './lib/portfolio-builder.mjs';

const contract = JSON.parse(fs.readFileSync(new URL('../data/comparisons/portfolio-contract-v1.json', import.meta.url)));
const funding = JSON.parse(fs.readFileSync(new URL('../data/comparisons/funding-tranches-v1.json', import.meta.url)));
const base = { budgetUsd: 10000, causeWeights: Object.fromEntries(contract.causes.map((cause) => [cause, 1])),
  riskTolerance: 'exploratory', minimumEvidence: 'reviewed', geography: 'any', liquidity: 'pooled-ok', timeHorizon: 'flexible' };

test('portfolio contract classifies every funding tranche without inventing geography', () => {
  validatePortfolioContract(contract, funding);
  assert.equal(contract.candidates.length, 31);
  assert.equal(contract.candidates.filter((item) => item.geography === 'Not published in accepted opportunity record').length, 12);
});

test('cause weights remain exact and filtered causes stay unallocated', () => {
  const result = buildDonorPortfolio(contract, funding.tranches, { ...base, causeWeights: { 'Global health': 3, Climate: 1 } });
  assert.equal(result.buckets.find((item) => item.cause === 'Global health').requestedUsd, 7500);
  assert.equal(result.buckets.find((item) => item.cause === 'Climate').requestedUsd, 2500);
  const filtered = buildDonorPortfolio(contract, funding.tranches, { ...base, causeWeights: { Climate: 1 }, geography: 'africa' });
  assert.equal(filtered.summary.allocatedUsd, 0);
  assert.equal(filtered.summary.unallocatedUsd, 10000);
  const odd = buildDonorPortfolio(contract, funding.tranches, { ...base, budgetUsd: 10001 });
  assert.equal(odd.buckets.reduce((sum, item) => sum + item.requestedUsd, 0), 10001);
});

test('risk, evidence, liquidity, geography, and horizon controls materially change eligibility', () => {
  const open = buildDonorPortfolio(contract, funding.tranches, base);
  const established = buildDonorPortfolio(contract, funding.tranches, { ...base, riskTolerance: 'established' });
  const quantified = buildDonorPortfolio(contract, funding.tranches, { ...base, minimumEvidence: 'quantified' });
  const direct = buildDonorPortfolio(contract, funding.tranches, { ...base, liquidity: 'direct-only' });
  const africa = buildDonorPortfolio(contract, funding.tranches, { ...base, geography: 'africa' });
  const fast = buildDonorPortfolio(contract, funding.tranches, { ...base, timeHorizon: 'within-year' });
  assert.ok(open.allocations.length > established.allocations.length);
  assert.ok(open.allocations.length > quantified.allocations.length);
  assert.ok(open.exclusions.filter((item) => item.reasons.some((reason) => reason.includes('pooled'))).length < direct.exclusions.filter((item) => item.reasons.some((reason) => reason.includes('pooled'))).length);
  assert.ok(africa.allocations.every((item) => item.geographyTags.includes('africa')));
  assert.ok(fast.allocations.every((item) => item.deploymentMode === 'within-year'));
});

test('numeric room caps allocations and unknown room is flagged for verification', () => {
  const animal = buildDonorPortfolio(contract, funding.tranches, { ...base, budgetUsd: 100000000, causeWeights: { 'Animal welfare': 1 } });
  assert.ok(animal.allocations.every((item) => item.amountUsd == null || item.allocationUsd <= item.amountUsd));
  const health = buildDonorPortfolio(contract, funding.tranches, { ...base, causeWeights: { 'Global health': 1 } });
  assert.ok(health.allocations.every((item) => item.roomVerification === 'verify-current-room-before-giving'));
});

test('invalid inputs fail closed', () => {
  assert.throws(() => buildDonorPortfolio(contract, funding.tranches, { ...base, budgetUsd: 0 }), /Budget/);
  assert.throws(() => buildDonorPortfolio(contract, funding.tranches, { ...base, causeWeights: {} }), /weight/);
  assert.throws(() => buildDonorPortfolio(contract, funding.tranches, { ...base, riskTolerance: 'magic' }), /riskTolerance/);
});

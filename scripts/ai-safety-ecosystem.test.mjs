import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAiSafetyEcosystem, classifyGrant, validateAiSafetyEcosystem } from './lib/ai-safety-ecosystem.mjs';

const snapshot = JSON.parse(await readFile(new URL('../data/ai-safety/ecosystem-v1.json', import.meta.url), 'utf8'));

test('AI safety ecosystem reconciles the complete accepted fund lens', () => {
  assert.equal(validateAiSafetyEcosystem(snapshot), snapshot);
  assert.equal(snapshot.summary.grantCount, 630);
  assert.equal(snapshot.summary.publishedAmountUsd, 972185421);
  assert.equal(snapshot.summary.foundersPledgeOverlapCount, 5);
  assert.equal(snapshot.summary.foundersPledgeOnlyCount, 1);
});

test('AI safety classification is multi-label and fails open into unclassified', () => {
  const classified = classifyGrant({ purpose: 'Biosecurity model evaluation benchmark', recipients: [] });
  assert.deepEqual(classified.roles, ['biosecurity-overlap', 'evaluations-auditing']);
  assert.deepEqual(classifyGrant({ purpose: 'General support', recipients: ['Unknown Group'] }).roles, ['unclassified']);
});

test('AI safety category amounts are explicitly non-additive', () => {
  const categoryTotal = snapshot.categories.reduce((sum, category) => sum + category.publishedAmountUsd, 0);
  assert.ok(categoryTotal > snapshot.summary.publishedAmountUsd);
  assert.equal(snapshot.organizations.filter((organization) => organization.roles.length > 1).length > 0, true);
});

test('AI safety identities decode source HTML entities before reconciliation', () => {
  const coefficient = {
    source: { publisher: 'Coefficient Giving' },
    records: [{
      sourceRecordId: 'escaped-recipient', listedFunds: ['Navigating Transformative AI'],
      purpose: 'Technical AI safety research', recipients: ['California State University&#044; San José'],
      amountUsd: 39_000, awardDate: '2023-03-03T00:00:00.000Z',
    }],
  };
  const built = buildAiSafetyEcosystem(coefficient, { contentHash: 'fixture', records: [] }, '2026-08-30T00:00:00.000Z');
  assert.equal(built.organizations[0].organization, 'California State University, San José');
  assert.equal(built.organizations[0].slug, 'california-state-university-san-jose');
  assert.equal(built.grantClassifications[0].recipient, 'California State University, San José');
});

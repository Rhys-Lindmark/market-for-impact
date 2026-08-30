import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateFundingTranches } from './lib/funding-tranches.mjs';

const snapshot = validateFundingTranches(JSON.parse(await readFile(new URL('../data/comparisons/funding-tranches-v1.json', import.meta.url), 'utf8')));

test('funding tranches keep period-specific numeric room separate', () => {
  const numeric = snapshot.tranches.filter((item) => item.status === 'published-numeric-current-period');
  assert.equal(numeric.length, 10);
  assert.equal(numeric.filter((item) => item.timeWindow === 'annual, 2025–2026').reduce((sum, item) => sum + item.amountUsd, 0), 3300000);
  assert.equal(numeric.filter((item) => item.timeWindow === 'annual, 2026–2027').reduce((sum, item) => sum + item.amountUsd, 0), 9156000);
});

test('unknown, stale, and closed states never become current numeric room', () => {
  assert.equal(snapshot.tranches.filter((item) => item.status === 'stale-published-gap').length, 1);
  assert.equal(snapshot.tranches.filter((item) => item.amountUsd == null).length, 20);
  assert.ok(snapshot.tranches.filter((item) => item.status === 'closed-or-contact-required').every((item) => item.amountUsd == null));
});

test('counterfactual funders remain unknown when sources do not identify one', () => {
  assert.ok(snapshot.tranches.every((item) => item.likelyCounterfactualFunder === null));
  assert.ok(snapshot.tranches.every((item) => /not publish|No likely|no organization-wide/i.test(item.counterfactualBasis)));
});

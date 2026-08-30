import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDataQualityContract } from './lib/data-quality-contract.mjs';

const contract = validateDataQualityContract(JSON.parse(await readFile(new URL('../data/comparisons/data-quality-contract-v1.json', import.meta.url), 'utf8')));

test('data-quality contract preserves source conflicts separately from documented boundaries', () => {
  assert.equal(contract.knownIssues.filter((item) => item.state === 'conflict').length, 2);
  assert.equal(contract.knownIssues.find((item) => item.key === 'givewell-displayed-exported-total').count, 3);
  assert.equal(contract.knownIssues.find((item) => item.key === 'renphil-declared-linked-gap').count, 1);
  assert.ok(contract.knownIssues.filter((item) => item.state === 'documented-boundary').length >= 4);
});

test('quality rules prohibit cross-source totals and unsupported retraction claims', () => {
  assert.match(contract.rowRules.amounts, /Cross-publisher totals are prohibited/i);
  assert.match(contract.rowRules.disappeared, /not called a retraction/i);
  assert.equal(contract.knownIssues.find((item) => item.key === 'coefficient-egc-overlap').count, 79);
});

test('freshness and state rules are explicit rather than scored', () => {
  assert.deepEqual(contract.freshnessRules.map((item) => item.maximumAgeDays), [14, 45, null]);
  assert.deepEqual(contract.stateRules.map((item) => item.state), ['conflict', 'incomplete', 'documented-boundary']);
  assert.ok(contract.stateRules.every((item) => item.rule.length > 30));
});

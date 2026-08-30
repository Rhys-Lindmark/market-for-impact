import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateGrantFlowContract } from './lib/grant-flow-contract.mjs';

const contract = validateGrantFlowContract(JSON.parse(await readFile(new URL('../data/comparisons/grant-flow-contract-v1.json', import.meta.url), 'utf8')));

test('flow contract accepts four complete publisher ledgers without the overlapping EGC subset', () => {
  assert.equal(contract.acceptedSourceRowCount, 3491);
  assert.deepEqual(Object.fromEntries(contract.ledgers.map((ledger) => [ledger.key, ledger.rowCount])), {
    coefficient: 2893, givewell: 541, 'giving-green': 29, renphil: 28,
  });
  assert.equal(contract.excludedLedgers[0].rowCount, 79);
  assert.equal(contract.excludedLedgers[0].allRowsInAcceptedLedger, true);
});

test('amounts are aggregatable only inside one selected publisher ledger', () => {
  assert.match(contract.aggregationRules.amount, /only inside one selected publisher ledger/i);
  assert.match(contract.aggregationRules.amount, /prohibited/i);
  assert.ok(contract.ledgers.every((ledger) => Number.isFinite(ledger.publishedAmountUsd)));
});

test('role and missingness boundaries remain explicit', () => {
  assert.equal(contract.ledgers.find((ledger) => ledger.key === 'coefficient').roleCoverage.originatingFunder, 'not-normalized');
  assert.equal(contract.ledgers.find((ledger) => ledger.key === 'givewell').roleCoverage.originatingFunder, 'source-list-only');
  assert.equal(contract.ledgers.find((ledger) => ledger.key === 'renphil').roleCoverage.recipients, 'source-list-only');
  assert.ok(contract.ledgers.every((ledger) => ledger.fieldCoverage.stage === 'not-published'));
  assert.match(contract.aggregationRules.missingness, /never inferred/i);
});

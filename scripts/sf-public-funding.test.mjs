import assert from 'node:assert/strict';
import test from 'node:test';
import config from '../data/san-francisco/public-funding-config-v1.json' with { type: 'json' };
import snapshot from '../data/san-francisco/public-funding-v1.json' with { type: 'json' };
import { buildSfPublicFundingSnapshot, classifyContract, sourceQueries, validateSfPublicFundingSnapshot } from './lib/sf-public-funding.mjs';

test('public-funding queries pin fiscal year, nonprofit prime status, and snapshot date', () => {
  const queries = sourceQueries(config);
  const budgetWhere = new URL(queries.budget).searchParams.get('$where');
  const contractWhere = new URL(queries.contracts).searchParams.get('$where');
  assert.equal(budgetWhere, 'fiscal_year="2027" AND revenue_or_spending="Spending"');
  assert.match(contractWhere, /non_profit="X"/);
  assert.match(contractWhere, /project_team_constituent="Prime Contractor"/);
  assert.match(contractWhere, /term_start_date <= "2026-08-30T23:59:59"/);
  assert.match(contractWhere, /term_end_date >= "2026-08-30T00:00:00"/);
});

test('contract classification is multi-label but conservative', () => {
  const shelter = classifyContract({ departmentCode: 'HOM', contractTitle: 'Family emergency shelter', scopeOfWork: '' }, config);
  assert.deepEqual(shelter.map((row) => row.outcomeKey), ['housing-stability', 'unsheltered-days-avoided']);
  const clinic = classifyContract({ departmentCode: 'DPH', contractTitle: 'Mental health care for homeless children', scopeOfWork: '' }, config);
  assert.deepEqual(clinic.map((row) => row.outcomeKey), ['mental-health-stabilization']);
  const bhs = classifyContract({ departmentCode: 'DPH', contractTitle: 'BHS residential treatment', scopeOfWork: '' }, config);
  assert.deepEqual(bhs.map((row) => row.outcomeKey), ['mental-health-stabilization']);
  const policeTraining = classifyContract({ departmentCode: 'POL', contractTitle: 'Academy training services', scopeOfWork: '' }, config);
  assert.deepEqual(policeTraining, []);
});

test('snapshot preserves separate accounting lenses and negative source values', () => {
  validateSfPublicFundingSnapshot(snapshot, config);
  assert.equal(snapshot.summary.departmentCount, 54);
  assert.equal(snapshot.summary.cityBudgetUsd, 16851826113);
  assert.equal(snapshot.summary.activeNonprofitContractCount, 1784);
  assert.equal(snapshot.summary.classifiedContractCount, 388);
  assert.equal(snapshot.summary.contractAwardUsd, 10920905877.17);
  assert.equal(snapshot.summary.paymentsMadeUsd, 5130310587.44);
  assert.equal(snapshot.summary.negativeRemainingCount, 144);
  assert.ok(snapshot.contracts.some((row) => row.remainingAuthorityUsd < 0));
  assert.match(snapshot.rules.amounts, /kept separate/);
  assert.match(snapshot.rules.impact, /not evidence of effectiveness/);
});

test('outcome aggregates are explicitly non-additive and cover all ontology keys', () => {
  assert.equal(snapshot.outcomes.length, 8);
  assert.equal(new Set(snapshot.outcomes.map((row) => row.outcomeKey)).size, 8);
  assert.ok(snapshot.summary.multiOutcomeContractCount > 0);
  const summedOutcomeAwards = snapshot.outcomes.reduce((sum, row) => sum + row.contractAwardUsd, 0);
  assert.ok(summedOutcomeAwards > snapshot.summary.classifiedContractAwardUsd);
  assert.match(snapshot.rules.contracts, /non-additive/);
});

test('snapshot builder is deterministic apart from retrieval time', () => {
  const budgetRows = [{ department_code: 'HOM', department: 'Homelessness Services', budget: '10', data_as_of: '2026-08-01', data_loaded_at: '2026-08-02' }];
  const contractRows = [{ contract_no: 'C1', contract_title: 'Emergency shelter', term_start_date: '2026-01-01', term_end_date: '2027-01-01',
    contract_type: 'Grant', purchasing_authority: 'Test', department_code: 'HOM', department: 'Homelessness Services', prime_contractor: 'Example',
    scope_of_work: 'Shelter', agreed_amt: '8', consumed_amt: '2', pmt_amt: '3', remaining_amt: '3', data_as_of: '2026-08-01', data_loaded_at: '2026-08-02' }];
  const metadata = { rowsUpdatedAt: 1780000000 };
  const first = buildSfPublicFundingSnapshot({ config, budgetMetadata: metadata, contractMetadata: metadata, budgetRows, contractRows, generatedAt: '2026-08-30T00:00:00.000Z' });
  const second = buildSfPublicFundingSnapshot({ config, budgetMetadata: metadata, contractMetadata: metadata, budgetRows, contractRows, generatedAt: '2026-08-30T00:00:00.000Z' });
  assert.deepEqual(first, second);
  assert.deepEqual(first.contracts[0].outcomeKeys, ['housing-stability', 'unsheltered-days-avoided']);
  assert.equal(first.summary.contractAwardUsd, 8);
  assert.equal(first.summary.paymentsMadeUsd, 3);
});

import { env } from 'cloudflare:workers';
import snapshot from '@/data/san-francisco/public-funding-v1.json';
import { ensureSfOutcomeOntology } from '@/db/sf-outcomes';

function epoch(value: string) {
  const result = Math.floor(new Date(value).valueOf() / 1000);
  if (!result) throw new Error(`Invalid public-funding timestamp: ${value}`);
  return result;
}

function number(value: unknown) {
  return value == null ? null : Number(value);
}

function parseArray(value: unknown) {
  if (typeof value !== 'string') return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

function sum(rows: Record<string, unknown>[], key: string) {
  return Math.round(rows.reduce((total, row) => total + Number(row[key] ?? 0), 0) * 100) / 100;
}

let materializationPromise: Promise<{ updatedAt: number }> | null = null;

async function materializeSfPublicFunding() {
  await ensureSfOutcomeOntology();
  const updatedAt = epoch(snapshot.generatedAt);
  const expectedLinks = snapshot.contracts.reduce((total, row) => total + row.matchReasons.length, 0);
  const current = await env.DB.batch([
    env.DB.prepare('SELECT COUNT(*) AS count FROM sf_public_funding_sources WHERE snapshot_version = ?').bind(snapshot.version),
    env.DB.prepare('SELECT COUNT(*) AS count FROM sf_department_budgets WHERE snapshot_version = ? AND updated_at = ?').bind(snapshot.version, updatedAt),
    env.DB.prepare('SELECT COUNT(*) AS count FROM sf_public_contracts WHERE snapshot_version = ? AND updated_at = ?').bind(snapshot.version, updatedAt),
    env.DB.prepare('SELECT COUNT(*) AS count FROM sf_public_contract_outcomes WHERE snapshot_version = ?').bind(snapshot.version),
  ]);
  const counts = current.map((result) => Number((result.results[0] as { count?: number } | undefined)?.count ?? 0));
  if (counts[0] === snapshot.sources.length && counts[1] === snapshot.departmentBudgets.length &&
      counts[2] === snapshot.contracts.length && counts[3] === expectedLinks) return { updatedAt };
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sf_public_contract_outcomes WHERE snapshot_version = ?').bind(snapshot.version),
    env.DB.prepare('DELETE FROM sf_public_contracts WHERE snapshot_version = ?').bind(snapshot.version),
    env.DB.prepare('DELETE FROM sf_department_budgets WHERE snapshot_version = ?').bind(snapshot.version),
    env.DB.prepare('DELETE FROM sf_public_funding_sources WHERE snapshot_version = ?').bind(snapshot.version),
  ]);
  await env.DB.batch(snapshot.sources.map((source) => env.DB.prepare(`INSERT INTO sf_public_funding_sources
    (source_key, dataset_id, publisher, title, public_url, query_url, amount_semantics, data_as_of, source_updated_at,
     retrieved_at, source_row_count, semantic_hash, snapshot_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(source.key, source.datasetId, source.publisher, source.title, source.publicUrl, source.queryUrl,
      source.amountSemantics, source.dataAsOf, epoch(source.sourceUpdatedAt), epoch(source.retrievedAt),
      source.sourceRowCount, source.semanticHash, snapshot.version)));
  await env.DB.batch(snapshot.departmentBudgets.map((row) => env.DB.prepare(`INSERT INTO sf_department_budgets
    (department_code, department, fiscal_year, budget_usd, outcome_keys_json, data_as_of, data_loaded_at, snapshot_version, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(row.departmentCode, row.department, snapshot.fiscalYear.sourceValue, row.budgetUsd, JSON.stringify(row.outcomeKeys),
      row.dataAsOf, row.dataLoadedAt, snapshot.version, updatedAt)));
  const contractStatements = snapshot.contracts.map((row) => env.DB.prepare(`INSERT INTO sf_public_contracts
    (contract_number, contract_title, term_start_date, term_end_date, contract_type, purchasing_authority,
     department_code, department, prime_contractor, scope_of_work, award_usd, outstanding_purchase_orders_usd,
     payments_made_usd, remaining_authority_usd, data_as_of, data_loaded_at, snapshot_version, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(row.contractNumber, row.contractTitle, row.termStartDate, row.termEndDate, row.contractType,
      row.purchasingAuthority, row.departmentCode, row.department, row.primeContractor, row.scopeOfWork,
      row.awardUsd, row.outstandingPurchaseOrdersUsd, row.paymentsMadeUsd, row.remainingAuthorityUsd,
      row.dataAsOf, row.dataLoadedAt, snapshot.version, updatedAt));
  for (let index = 0; index < contractStatements.length; index += 50) await env.DB.batch(contractStatements.slice(index, index + 50));
  const [contractIds, outcomeIds] = await Promise.all([
    env.DB.prepare('SELECT id, contract_number FROM sf_public_contracts WHERE snapshot_version = ?').bind(snapshot.version).all<{ id: number; contract_number: string }>(),
    env.DB.prepare('SELECT id, slug FROM local_outcomes WHERE ontology_version = ?').bind('sf-outcome-ontology-v0.1').all<{ id: number; slug: string }>(),
  ]);
  const contracts = new Map(contractIds.results.map((row) => [row.contract_number, row.id]));
  const outcomes = new Map(outcomeIds.results.map((row) => [row.slug, row.id]));
  const linkStatements = snapshot.contracts.flatMap((row) => row.matchReasons.map((match) => {
    const contractId = contracts.get(row.contractNumber); const outcomeId = outcomes.get(match.outcomeKey);
    if (!contractId || !outcomeId) throw new Error(`Missing SF public-funding link ${row.contractNumber}:${match.outcomeKey}.`);
    return env.DB.prepare(`INSERT INTO sf_public_contract_outcomes
      (contract_id, outcome_id, match_reason, snapshot_version) VALUES (?, ?, ?, ?)`)
      .bind(contractId, outcomeId, match.reason, snapshot.version);
  }));
  for (let index = 0; index < linkStatements.length; index += 50) await env.DB.batch(linkStatements.slice(index, index + 50));
  await env.DB.prepare('PRAGMA optimize').run();
  return { updatedAt };
}

export async function ensureSfPublicFunding() {
  if (materializationPromise) return materializationPromise;
  const current = materializeSfPublicFunding();
  materializationPromise = current;
  try {
    return await current;
  } finally {
    if (materializationPromise === current) materializationPromise = null;
  }
}

export async function getSfPublicFunding() {
  const { updatedAt } = await ensureSfPublicFunding();
  const [sourceRows, departmentRows, contractRows, linkRows, outcomeRows] = await Promise.all([
    env.DB.prepare('SELECT * FROM sf_public_funding_sources WHERE snapshot_version = ? ORDER BY source_key').bind(snapshot.version).all<Record<string, unknown>>(),
    env.DB.prepare('SELECT * FROM sf_department_budgets WHERE snapshot_version = ? AND updated_at = ? ORDER BY department_code').bind(snapshot.version, updatedAt).all<Record<string, unknown>>(),
    env.DB.prepare('SELECT * FROM sf_public_contracts WHERE snapshot_version = ? AND updated_at = ? ORDER BY award_usd DESC, contract_number').bind(snapshot.version, updatedAt).all<Record<string, unknown>>(),
    env.DB.prepare(`SELECT x.contract_id, x.outcome_id, x.match_reason, o.slug AS outcome_key FROM sf_public_contract_outcomes x
      JOIN local_outcomes o ON o.id = x.outcome_id WHERE x.snapshot_version = ? ORDER BY x.contract_id, o.display_order`)
      .bind(snapshot.version).all<Record<string, unknown>>(),
    env.DB.prepare('SELECT id, slug, label, canonical_unit FROM local_outcomes WHERE ontology_version = ? ORDER BY display_order')
      .bind('sf-outcome-ontology-v0.1').all<Record<string, unknown>>(),
  ]);
  const linksByContract = new Map<number, Array<{ outcomeKey: string; reason: string }>>();
  for (const row of linkRows.results) {
    const id = Number(row.contract_id); const current = linksByContract.get(id) ?? [];
    current.push({ outcomeKey: String(row.outcome_key), reason: String(row.match_reason) }); linksByContract.set(id, current);
  }
  const contracts = contractRows.results.map((row) => ({ id: Number(row.id), contractNumber: row.contract_number,
    contractTitle: row.contract_title, termStartDate: row.term_start_date, termEndDate: row.term_end_date,
    contractType: row.contract_type, departmentCode: row.department_code, department: row.department,
    primeContractor: row.prime_contractor, scopeOfWork: row.scope_of_work, awardUsd: number(row.award_usd),
    outstandingPurchaseOrdersUsd: number(row.outstanding_purchase_orders_usd), paymentsMadeUsd: number(row.payments_made_usd),
    remainingAuthorityUsd: number(row.remaining_authority_usd), links: linksByContract.get(Number(row.id)) ?? [] }));
  const classified = contracts.filter((row) => row.links.length);
  const departments = departmentRows.results.map((row) => ({ departmentCode: row.department_code, department: row.department,
    budgetUsd: Number(row.budget_usd), outcomeKeys: parseArray(row.outcome_keys_json) }));
  const mappedDepartments = departments.filter((row) => row.outcomeKeys.length);
  const outcomes = outcomeRows.results.map((outcome) => {
    const key = String(outcome.slug); const budgetDepartments = departments.filter((row) => row.outcomeKeys.includes(key));
    const linkedContracts = contracts.filter((row) => row.links.some((link) => link.outcomeKey === key));
    return { key, label: outcome.label, canonicalUnit: outcome.canonical_unit,
      budgetDepartmentCount: budgetDepartments.length, budgetEnvelopeUsd: sum(budgetDepartments as unknown as Record<string, unknown>[], 'budgetUsd'),
      budgetDepartments, contractCount: linkedContracts.length,
      contractAwardUsd: sum(linkedContracts as unknown as Record<string, unknown>[], 'awardUsd'),
      paymentsMadeUsd: sum(linkedContracts as unknown as Record<string, unknown>[], 'paymentsMadeUsd'),
      remainingAuthorityUsd: sum(linkedContracts as unknown as Record<string, unknown>[], 'remainingAuthorityUsd'),
      topContracts: linkedContracts.slice(0, 12).map((contract) => ({ contractNumber: contract.contractNumber,
        contractTitle: contract.contractTitle, termStartDate: contract.termStartDate, termEndDate: contract.termEndDate,
        contractType: contract.contractType, departmentCode: contract.departmentCode, department: contract.department,
        primeContractor: contract.primeContractor, scopeOfWork: contract.scopeOfWork, awardUsd: contract.awardUsd,
        outstandingPurchaseOrdersUsd: contract.outstandingPurchaseOrdersUsd, paymentsMadeUsd: contract.paymentsMadeUsd,
        remainingAuthorityUsd: contract.remainingAuthorityUsd,
        matchReason: contract.links.find((link) => link.outcomeKey === key)?.reason })) };
  });
  return { version: snapshot.version, generatedAt: snapshot.generatedAt, snapshotDate: snapshot.snapshotDate,
    fiscalYear: snapshot.fiscalYear, rules: snapshot.rules,
    summary: { departmentCount: departments.length, cityBudgetUsd: sum(departments as unknown as Record<string, unknown>[], 'budgetUsd'),
      mappedDepartmentCount: mappedDepartments.length, mappedDepartmentBudgetUsd: sum(mappedDepartments as unknown as Record<string, unknown>[], 'budgetUsd'),
      activeNonprofitContractCount: contracts.length, classifiedContractCount: classified.length,
      unclassifiedContractCount: contracts.length - classified.length,
      multiOutcomeContractCount: contracts.filter((row) => row.links.length > 1).length,
      contractAwardUsd: sum(contracts as unknown as Record<string, unknown>[], 'awardUsd'),
      paymentsMadeUsd: sum(contracts as unknown as Record<string, unknown>[], 'paymentsMadeUsd'),
      remainingAuthorityUsd: sum(contracts as unknown as Record<string, unknown>[], 'remainingAuthorityUsd'),
      classifiedContractAwardUsd: sum(classified as unknown as Record<string, unknown>[], 'awardUsd'),
      classifiedPaymentsMadeUsd: sum(classified as unknown as Record<string, unknown>[], 'paymentsMadeUsd'),
      classifiedRemainingAuthorityUsd: sum(classified as unknown as Record<string, unknown>[], 'remainingAuthorityUsd'),
      negativeRemainingCount: contracts.filter((row) => (row.remainingAuthorityUsd ?? 0) < 0).length },
    sources: sourceRows.results.map((row) => ({ key: row.source_key, datasetId: row.dataset_id, publisher: row.publisher,
      title: row.title, publicUrl: row.public_url, queryUrl: row.query_url, amountSemantics: row.amount_semantics,
      dataAsOf: row.data_as_of, sourceUpdatedAt: new Date(Number(row.source_updated_at) * 1000).toISOString(),
      retrievedAt: new Date(Number(row.retrieved_at) * 1000).toISOString(), sourceRowCount: Number(row.source_row_count),
      semanticHash: row.semantic_hash })), outcomes };
}

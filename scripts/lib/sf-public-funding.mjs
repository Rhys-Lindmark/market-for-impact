import crypto from 'node:crypto';

export function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

function queryUrl(resourceUrl, params) {
  const url = new URL(resourceUrl);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

export function sourceQueries(config) {
  return {
    budget: queryUrl(config.sources.budget.resourceUrl, {
      '$select': 'department_code,department,sum(budget) as budget,max(data_as_of) as data_as_of,max(data_loaded_at) as data_loaded_at',
      '$where': `fiscal_year="${config.fiscalYear.sourceValue}" AND revenue_or_spending="Spending"`,
      '$group': 'department_code,department', '$order': 'department_code', '$limit': '50000',
    }),
    contracts: queryUrl(config.sources.contracts.resourceUrl, {
      '$select': 'contract_no,contract_title,term_start_date,term_end_date,contract_type,purchasing_authority,department_code,department,prime_contractor,scope_of_work,agreed_amt,consumed_amt,pmt_amt,remaining_amt,data_as_of,data_loaded_at',
      '$where': `non_profit="X" AND project_team_constituent="Prime Contractor" AND term_start_date <= "${config.snapshotDate}T23:59:59" AND term_end_date >= "${config.snapshotDate}T00:00:00"`,
      '$order': 'contract_no', '$limit': '50000',
    }),
  };
}

function amount(value) {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid public-funding amount: ${value}`);
  return Math.round(parsed * 100) / 100;
}

function total(rows, key) {
  return Math.round(rows.reduce((sum, row) => sum + (row[key] ?? 0), 0) * 100) / 100;
}

function isoFromEpoch(epoch) {
  return new Date(Number(epoch) * 1000).toISOString();
}

export function classifyContract(row, config) {
  const haystack = `${row.contractTitle ?? ''} ${row.scopeOfWork ?? ''}`.toLowerCase();
  const matches = [];
  for (const [outcomeKey, rules] of Object.entries(config.contractClassificationRules)) {
    for (const rule of rules) {
      if (!rule.departments.includes(row.departmentCode)) continue;
      if (!new RegExp(rule.pattern, 'i').test(haystack)) continue;
      matches.push({ outcomeKey, reason: rule.reason });
      break;
    }
  }
  return matches;
}

export function normalizeBudgetRows(rows, config) {
  const reverseMappings = new Map();
  for (const [outcomeKey, departments] of Object.entries(config.budgetDepartmentMappings)) {
    for (const code of departments) reverseMappings.set(code, [...(reverseMappings.get(code) ?? []), outcomeKey]);
  }
  const normalized = rows.map((row) => ({ departmentCode: row.department_code, department: row.department,
    budgetUsd: amount(row.budget), dataAsOf: row.data_as_of, dataLoadedAt: row.data_loaded_at,
    outcomeKeys: reverseMappings.get(row.department_code) ?? [] }));
  normalized.sort((a, b) => a.departmentCode.localeCompare(b.departmentCode));
  if (new Set(normalized.map((row) => row.departmentCode)).size !== normalized.length) throw new Error('Budget query returned duplicate department codes.');
  return normalized;
}

export function normalizeContractRows(rows, config) {
  const normalized = rows.map((row) => {
    const item = { contractNumber: row.contract_no, contractTitle: row.contract_title ?? null,
      termStartDate: row.term_start_date, termEndDate: row.term_end_date, contractType: row.contract_type ?? null,
      purchasingAuthority: row.purchasing_authority ?? null, departmentCode: row.department_code,
      department: row.department, primeContractor: row.prime_contractor, scopeOfWork: row.scope_of_work ?? null,
      awardUsd: amount(row.agreed_amt), outstandingPurchaseOrdersUsd: amount(row.consumed_amt),
      paymentsMadeUsd: amount(row.pmt_amt), remainingAuthorityUsd: amount(row.remaining_amt),
      dataAsOf: row.data_as_of, dataLoadedAt: row.data_loaded_at };
    const matches = classifyContract(item, config);
    return { ...item, outcomeKeys: matches.map((match) => match.outcomeKey), matchReasons: matches };
  });
  normalized.sort((a, b) => a.contractNumber.localeCompare(b.contractNumber));
  if (new Set(normalized.map((row) => row.contractNumber)).size !== normalized.length) throw new Error('Contract query returned duplicate contract numbers.');
  return normalized;
}

export function buildSfPublicFundingSnapshot({ config, budgetMetadata, contractMetadata, budgetRows, contractRows, generatedAt = new Date().toISOString() }) {
  const queries = sourceQueries(config);
  const departmentBudgets = normalizeBudgetRows(budgetRows, config);
  const contracts = normalizeContractRows(contractRows, config);
  const classifiedContracts = contracts.filter((row) => row.outcomeKeys.length);
  const mappedDepartments = departmentBudgets.filter((row) => row.outcomeKeys.length);
  const outcomeOrder = Object.keys(config.budgetDepartmentMappings);
  const outcomes = outcomeOrder.map((outcomeKey) => {
    const budgetDepartments = departmentBudgets.filter((row) => row.outcomeKeys.includes(outcomeKey));
    const linkedContracts = contracts.filter((row) => row.outcomeKeys.includes(outcomeKey));
    return { outcomeKey, budgetDepartmentCount: budgetDepartments.length, budgetEnvelopeUsd: total(budgetDepartments, 'budgetUsd'),
      contractCount: linkedContracts.length, contractAwardUsd: total(linkedContracts, 'awardUsd'),
      paymentsMadeUsd: total(linkedContracts, 'paymentsMadeUsd'), remainingAuthorityUsd: total(linkedContracts, 'remainingAuthorityUsd') };
  });
  const sourceRows = {
    budget: departmentBudgets.map((row) => { const sourceRow = { ...row }; delete sourceRow.outcomeKeys; return sourceRow; }),
    contracts: contracts.map((row) => { const sourceRow = { ...row }; delete sourceRow.outcomeKeys; delete sourceRow.matchReasons; return sourceRow; }),
  };
  return {
    version: 'sf-public-funding-v0.1', configVersion: config.version, generatedAt, snapshotDate: config.snapshotDate,
    fiscalYear: config.fiscalYear, rules: config.rules,
    sources: [
      { ...config.sources.budget, queryUrl: queries.budget, retrievedAt: generatedAt,
        sourceUpdatedAt: isoFromEpoch(budgetMetadata.rowsUpdatedAt), dataAsOf: departmentBudgets[0]?.dataAsOf ?? null,
        sourceRowCount: departmentBudgets.length, semanticHash: sha256(sourceRows.budget) },
      { ...config.sources.contracts, queryUrl: queries.contracts, retrievedAt: generatedAt,
        sourceUpdatedAt: isoFromEpoch(contractMetadata.rowsUpdatedAt), dataAsOf: contracts[0]?.dataAsOf ?? null,
        sourceRowCount: contracts.length, semanticHash: sha256(sourceRows.contracts) },
    ],
    summary: { departmentCount: departmentBudgets.length, cityBudgetUsd: total(departmentBudgets, 'budgetUsd'),
      mappedDepartmentCount: mappedDepartments.length, mappedDepartmentBudgetUsd: total(mappedDepartments, 'budgetUsd'),
      activeNonprofitContractCount: contracts.length, classifiedContractCount: classifiedContracts.length,
      unclassifiedContractCount: contracts.length - classifiedContracts.length,
      multiOutcomeContractCount: contracts.filter((row) => row.outcomeKeys.length > 1).length,
      contractAwardUsd: total(contracts, 'awardUsd'), paymentsMadeUsd: total(contracts, 'paymentsMadeUsd'),
      remainingAuthorityUsd: total(contracts, 'remainingAuthorityUsd'),
      classifiedContractAwardUsd: total(classifiedContracts, 'awardUsd'),
      classifiedPaymentsMadeUsd: total(classifiedContracts, 'paymentsMadeUsd'),
      classifiedRemainingAuthorityUsd: total(classifiedContracts, 'remainingAuthorityUsd'),
      negativeRemainingCount: contracts.filter((row) => (row.remainingAuthorityUsd ?? 0) < 0).length },
    outcomes, departmentBudgets, contracts,
  };
}

export function validateSfPublicFundingSnapshot(snapshot, config) {
  if (snapshot.version !== 'sf-public-funding-v0.1' || snapshot.configVersion !== config.version) throw new Error('Unexpected SF public-funding version.');
  if (snapshot.fiscalYear.sourceValue !== config.fiscalYear.sourceValue) throw new Error('Unexpected fiscal year.');
  if (snapshot.sources.length !== 2) throw new Error('Expected two authoritative funding sources.');
  if (!snapshot.departmentBudgets.length || !snapshot.contracts.length) throw new Error('Public-funding snapshot is empty.');
  if (snapshot.summary.departmentCount !== snapshot.departmentBudgets.length || snapshot.summary.activeNonprofitContractCount !== snapshot.contracts.length) throw new Error('Public-funding summary row counts drifted.');
  if (new Set(snapshot.departmentBudgets.map((row) => row.departmentCode)).size !== snapshot.departmentBudgets.length) throw new Error('Duplicate department budget row.');
  if (new Set(snapshot.contracts.map((row) => row.contractNumber)).size !== snapshot.contracts.length) throw new Error('Duplicate contract row.');
  const outcomeKeys = new Set(Object.keys(config.budgetDepartmentMappings));
  if (snapshot.outcomes.length !== outcomeKeys.size || snapshot.outcomes.some((row) => !outcomeKeys.has(row.outcomeKey))) throw new Error('Outcome coverage drifted.');
  for (const row of [...snapshot.departmentBudgets, ...snapshot.contracts]) for (const key of row.outcomeKeys) if (!outcomeKeys.has(key)) throw new Error(`Unknown outcome mapping ${key}.`);
  for (const source of snapshot.sources) if (!/^[a-f0-9]{64}$/.test(source.semanticHash) || !source.queryUrl.startsWith('https://data.sfgov.org/')) throw new Error(`Invalid source contract for ${source.key}.`);
  if (!snapshot.rules.impact.includes('not evidence of effectiveness')) throw new Error('Impact boundary is missing.');
  return snapshot;
}

export async function fetchSfPublicFundingSources(config, fetcher = fetch) {
  const queries = sourceQueries(config);
  const headers = { 'User-Agent': 'Market-for-Impact source monitor' };
  const [budgetMetadataResponse, contractMetadataResponse, budgetRowsResponse, contractRowsResponse] = await Promise.all([
    fetcher(config.sources.budget.metadataUrl, { headers }), fetcher(config.sources.contracts.metadataUrl, { headers }),
    fetcher(queries.budget, { headers }), fetcher(queries.contracts, { headers }),
  ]);
  for (const [label, response] of [['budget metadata', budgetMetadataResponse], ['contract metadata', contractMetadataResponse], ['budget query', budgetRowsResponse], ['contract query', contractRowsResponse]]) if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}.`);
  return { budgetMetadata: await budgetMetadataResponse.json(), contractMetadata: await contractMetadataResponse.json(),
    budgetRows: await budgetRowsResponse.json(), contractRows: await contractRowsResponse.json() };
}

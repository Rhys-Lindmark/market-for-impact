function moneyTotal(rows, key) {
  return Math.round(rows.reduce((sum, row) => sum + Number(row[key] ?? 0), 0) * 100) / 100;
}

function identity(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
}

export function acceptedGrantNames(ledgers) {
  const names = [];
  for (const row of ledgers.coefficient.records) for (const name of row.recipients ?? []) names.push({ publisher: 'Coefficient Giving', recordId: row.sourceRecordId, name });
  for (const row of ledgers.givewell.records) names.push({ publisher: 'GiveWell', recordId: row.sourceRecordId, name: row.recipient });
  for (const row of ledgers.givingGreen.grants) names.push({ publisher: 'Giving Green', recordId: row.sourceRecordId, name: row.name });
  for (const row of ledgers.renphil.records) for (const name of row.recipientNames ?? []) names.push({ publisher: 'Renaissance Philanthropy', recordId: row.sourceRecordId, name });
  return names;
}

export function buildSfNonprofitDiligence({ config, publicFunding, ledgers }) {
  const grantNames = acceptedGrantNames(ledgers);
  const candidates = config.candidates.map((candidate) => {
    const contractAliases = new Set(candidate.contractAliases.map(identity));
    const contracts = publicFunding.contracts.filter((row) => contractAliases.has(identity(row.primeContractor)));
    const grantAliases = new Set(candidate.grantLedgerAliases.map(identity));
    const grantLedgerMatches = grantNames.filter((row) => grantAliases.has(identity(row.name)));
    const publicOutcomeKeys = [...new Set(contracts.flatMap((row) => row.outcomeKeys))].sort();
    return {
      ...candidate,
      publicFunding: {
        snapshotVersion: publicFunding.version,
        snapshotDate: publicFunding.snapshotDate,
        contractCount: contracts.length,
        awardUsd: moneyTotal(contracts, 'awardUsd'),
        paymentsMadeUsd: moneyTotal(contracts, 'paymentsMadeUsd'),
        remainingAuthorityUsd: moneyTotal(contracts, 'remainingAuthorityUsd'),
        outcomeKeys: publicOutcomeKeys,
        contractNumbers: contracts.map((row) => row.contractNumber),
        note: contracts.length
          ? 'Exact prime-contractor alias matches in the active-contract snapshot; figures are accounting context, not philanthropic room.'
          : 'No exact prime-contractor alias match in the active-contract snapshot; absence is not evidence of no public funding.'
      },
      acceptedGrantLedgerMatches: grantLedgerMatches,
      conversionState: { qaly: 'blocked', wellby: 'blocked', reason: config.rules.conversion }
    };
  });
  return {
    version: 'sf-nonprofit-diligence-v0.1',
    configVersion: config.version,
    generatedAt: config.generatedAt,
    geography: config.geography,
    coverageNote: config.coverageNote,
    rules: config.rules,
    summary: {
      candidateCount: candidates.length,
      publicContractMatchCount: candidates.reduce((sum, row) => sum + row.publicFunding.contractCount, 0),
      candidatesWithPublicContracts: candidates.filter((row) => row.publicFunding.contractCount).length,
      candidatesWithPublishedMarginalGap: candidates.filter((row) => /\$[\d,.]+/.test(row.marginalFunding)).length,
      qalyBlockedCount: candidates.filter((row) => row.conversionState.qaly === 'blocked').length,
      acceptedGrantLedgerMatchCount: candidates.reduce((sum, row) => sum + row.acceptedGrantLedgerMatches.length, 0)
    },
    candidates
  };
}

export function validateSfNonprofitDiligence(snapshot) {
  if (snapshot.version !== 'sf-nonprofit-diligence-v0.1') throw new Error('Unexpected SF nonprofit diligence version.');
  if (snapshot.candidates.length < 6 || snapshot.summary.candidateCount !== snapshot.candidates.length) throw new Error('Initial SF candidate cohort is incomplete.');
  if (new Set(snapshot.candidates.map((row) => row.key)).size !== snapshot.candidates.length) throw new Error('Duplicate SF candidate key.');
  if (snapshot.summary.qalyBlockedCount !== snapshot.candidates.length) throw new Error('Every initial SF QALY estimate must remain blocked.');
  if (snapshot.summary.candidatesWithPublishedMarginalGap !== 0) throw new Error('A marginal gap was inferred without an accepted source.');
  for (const row of snapshot.candidates) {
    if (!row.name || !row.entityType || !row.taxStatus || !row.theoryOfChange || !row.causalBoundary || !row.marginalFunding || !row.downsideCase) throw new Error(`Incomplete diligence contract for ${row.key}.`);
    if (!row.sources.length || row.sources.some((source) => !source.url.startsWith('https://') || !source.retrievedAt)) throw new Error(`Invalid source trail for ${row.key}.`);
    if (row.charityNavigator && !row.charityNavigator.note.toLowerCase().includes('not')) throw new Error(`Charity Navigator boundary missing for ${row.key}.`);
    if (row.publicFunding.contractCount !== row.publicFunding.contractNumbers.length) throw new Error(`Public-contract reconciliation failed for ${row.key}.`);
    if (row.conversionState.qaly !== 'blocked' || row.conversionState.wellby !== 'blocked') throw new Error(`Unsupported conversion for ${row.key}.`);
  }
  return snapshot;
}

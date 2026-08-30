const sumAmounts = (records) => records.reduce((sum, record) => sum + (record.amountUsd ?? 0), 0);

export function buildGrantFlowContract({ coefficient, coefficientEgc, givewell, givingGreen, renphil }) {
  const coefficientIds = new Set(coefficient.records.map((record) => record.sourceRecordId));
  const excludedSubsetIds = coefficientEgc.records.map((record) => record.sourceRecordId);
  const ledgers = [
    {
      key: 'coefficient', label: 'Coefficient public index', publisher: 'Coefficient Giving',
      detailSource: 'coefficient', sourceUrl: coefficient.source.url, retrievedAt: coefficient.source.retrievedAt,
      rowCount: coefficient.records.length, publishedAmountUsd: sumAmounts(coefficient.records),
      statusSemantics: coefficient.source.statusSemantics,
      roleCoverage: { originatingFunder: 'not-normalized', advisingFunder: 'normalized', recipients: 'normalized' },
      fieldCoverage: { year: 'award-date', geography: 'not-published', stage: 'not-published', restriction: 'not-published' },
    },
    {
      key: 'givewell', label: 'GiveWell grant export', publisher: 'GiveWell', detailSource: 'givewell',
      sourceUrl: givewell.source.url, retrievedAt: givewell.source.retrievedAt,
      rowCount: givewell.records.length, publishedAmountUsd: sumAmounts(givewell.records),
      statusSemantics: givewell.source.statusSemantics,
      roleCoverage: { originatingFunder: 'source-list-only', advisingFunder: 'not-normalized', recipients: 'normalized' },
      fieldCoverage: { year: 'decision-date', geography: 'country-list', stage: 'not-published', restriction: 'not-published' },
    },
    {
      key: 'giving-green', label: 'Giving Green 2025 cycle', publisher: 'Giving Green', detailSource: 'giving-green',
      sourceUrl: givingGreen.source.url, retrievedAt: givingGreen.source.retrievedAt,
      rowCount: givingGreen.grants.length, publishedAmountUsd: sumAmounts(givingGreen.grants),
      statusSemantics: givingGreen.source.statusSemantics,
      roleCoverage: { originatingFunder: 'normalized', advisingFunder: 'normalized', recipients: 'normalized' },
      fieldCoverage: { year: 'announcement-date', geography: 'not-published', stage: 'not-published', restriction: 'not-published' },
    },
    {
      key: 'renphil', label: 'RenPhil AI for Math', publisher: 'Renaissance Philanthropy', detailSource: 'renphil',
      sourceUrl: renphil.source.url, retrievedAt: renphil.source.retrievedAt,
      rowCount: renphil.records.length, publishedAmountUsd: sumAmounts(renphil.records),
      statusSemantics: renphil.source.statusSemantics,
      roleCoverage: { originatingFunder: 'normalized', advisingFunder: 'normalized', recipients: 'source-list-only' },
      fieldCoverage: { year: 'announcement-date', geography: 'not-published', stage: 'not-published', restriction: 'not-published' },
    },
  ];
  return {
    version: 'grant-flow-contract-v0.1', generatedAt: ledgers.map((ledger) => ledger.retrievedAt).sort().at(-1),
    defaultLedger: 'coefficient', acceptedSourceRowCount: ledgers.reduce((sum, ledger) => sum + ledger.rowCount, 0),
    ledgers,
    excludedLedgers: [{
      key: 'coefficient-egc', label: 'Coefficient Effective Giving & Careers subset',
      reason: 'All 79 rows already occur in the complete Coefficient public index. Including this ledger would duplicate source records and amounts.',
      rowCount: coefficientEgc.records.length,
      allRowsInAcceptedLedger: excludedSubsetIds.every((id) => coefficientIds.has(id)),
    }],
    aggregationRules: {
      row: 'One displayed flow equals one accepted publisher source row, regardless of recipient count or number of organization roles.',
      amount: 'Dollar totals are computed only inside one selected publisher ledger. Cross-publisher totals are prohibited because the same underlying funding may appear in more than one publication.',
      roles: 'Originating and advising funders are separate roles. A publisher or evaluator is not treated as the originating funder unless the accepted source says so.',
      missingness: 'Unknown geography, stage, restriction, amount, or role remains unknown and is never inferred from a recipient, purpose, or evaluator.',
      date: 'Year filters use each ledger’s declared date basis: award, decision, or announcement. The basis is shown on every row.',
    },
  };
}

export function validateGrantFlowContract(contract) {
  if (contract.version !== 'grant-flow-contract-v0.1') throw new Error('Unexpected grant-flow contract version.');
  if (contract.ledgers.length !== 4) throw new Error('Expected four accepted publisher ledgers.');
  if (new Set(contract.ledgers.map((ledger) => ledger.key)).size !== 4) throw new Error('Ledger keys must be unique.');
  const expectedCounts = { coefficient: 2893, givewell: 541, 'giving-green': 29, renphil: 28 };
  for (const ledger of contract.ledgers) {
    if (ledger.rowCount !== expectedCounts[ledger.key]) throw new Error(`${ledger.key} row count drifted.`);
    if (!(ledger.publishedAmountUsd >= 0) || !Number.isFinite(ledger.publishedAmountUsd)) throw new Error(`${ledger.key} has an invalid amount.`);
    if (!ledger.sourceUrl || !ledger.retrievedAt || !ledger.statusSemantics) throw new Error(`${ledger.key} is missing provenance.`);
  }
  if (contract.acceptedSourceRowCount !== 3491) throw new Error('Accepted source-row total drifted.');
  const excluded = contract.excludedLedgers[0];
  if (excluded.key !== 'coefficient-egc' || excluded.rowCount !== 79 || !excluded.allRowsInAcceptedLedger) {
    throw new Error('Coefficient EGC overlap boundary failed.');
  }
  if (!/prohibited/.test(contract.aggregationRules.amount)) throw new Error('Cross-publisher amount boundary must remain explicit.');
  return contract;
}

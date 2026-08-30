const latestIso = (...values) => values.filter(Boolean).sort().at(-1);

export function buildDataQualityContract({ coefficient, givewell, givingGreen, renphil, grantFlows, fundingTranches }) {
  const ledgerByKey = new Map(grantFlows.ledgers.map((ledger) => [ledger.key, ledger]));
  const ledgers = [
    {
      ...ledgerByKey.get('coefficient'), canonicalDateField: 'award_date', canonicalDateLabel: 'award date',
      expected: coefficient.summary,
      caveats: [
        'Public entries can lag grantmaking by months and omit sensitive grants.',
        'The public database omits most funding advised for donors other than Good Ventures.',
        'Some source entries group similar grants, but grouping is not exposed consistently enough to infer row-level grouped status.',
      ],
    },
    {
      ...ledgerByKey.get('givewell'), canonicalDateField: 'decision_date', canonicalDateLabel: 'decision date',
      expected: givewell.summary,
      caveats: [
        'Publication does not establish payment timing.',
        'The public export names funding pools, but those labels are not normalized as originating-funder organizations.',
        'A row-level source URL is not published for every grant.',
      ],
    },
    {
      ...ledgerByKey.get('giving-green'), canonicalDateField: 'award_date', canonicalDateLabel: 'disbursement date',
      expected: givingGreen.summary,
      caveats: [
        'The accepted table announces planned grants; it is not proof of payment or a disbursement date.',
        'Grant size is not an effectiveness ranking or an organization funding gap.',
      ],
    },
    {
      ...ledgerByKey.get('renphil'), canonicalDateField: 'decision_date', canonicalDateLabel: 'award decision date',
      expected: renphil.summary,
      caveats: [
        'Row-level award amounts and decision or payment dates are not published.',
        'Two current award pages do not expose structured team names; source-listed project records remain accepted.',
      ],
    },
  ];
  const knownIssues = [
    {
      key: 'givewell-displayed-exported-total', sourceKey: 'givewell', state: 'conflict', category: 'source-conflict',
      count: Math.abs(givewell.summary.displayedVsExportedDifferenceUsd), unit: 'USD',
      title: 'GiveWell displayed and exported totals differ',
      description: `The Airtable display is $${givewell.summary.airtableDisplayedTotalAmountUsd.toLocaleString('en-US')}; exported rows sum to $${givewell.summary.totalPublishedAmountUsd.toLocaleString('en-US')}. Both remain visible.`,
    },
    {
      key: 'renphil-declared-linked-gap', sourceKey: 'renphil', state: 'conflict', category: 'coverage-conflict',
      count: renphil.summary.unlistedAwardCount, unit: 'award', title: 'RenPhil declared and linked portfolios do not reconcile',
      description: `RenPhil states ${renphil.summary.declaredAwardCount} first-round awards while the current winners page exposes ${renphil.summary.awardCount} linked records.`,
    },
    {
      key: 'coefficient-future-dated', sourceKey: 'coefficient', state: 'monitor', category: 'date-anomaly',
      count: coefficient.summary.futureDatedGrants, unit: 'row', title: 'Coefficient includes a future-dated award row',
      description: 'The date is retained as published rather than rewritten; users can inspect the source record.',
    },
    {
      key: 'coefficient-private-coverage', sourceKey: 'coefficient', state: 'documented-boundary', category: 'private-grant-caveat',
      count: null, unit: null, title: 'Coefficient public coverage is intentionally partial',
      description: 'Sensitive grants may be withheld, publication can lag, and most non–Good Ventures advised funding is outside the public database.',
    },
    {
      key: 'coefficient-grouping-unobservable', sourceKey: 'coefficient', state: 'documented-boundary', category: 'granularity-caveat',
      count: null, unit: null, title: 'Grouped-grant status is not reliably machine-observable',
      description: 'Coefficient says some entries group similar grants. Zero observed grouped flags must not be interpreted as zero grouped grants.',
    },
    {
      key: 'coefficient-egc-overlap', sourceKey: 'coefficient', state: 'documented-boundary', category: 'deduplication-boundary',
      count: grantFlows.excludedLedgers[0].rowCount, unit: 'rows', title: 'The EGC subset is excluded from portfolio totals',
      description: grantFlows.excludedLedgers[0].reason,
    },
    {
      key: 'giving-green-announcement-status', sourceKey: 'giving-green', state: 'documented-boundary', category: 'payment-caveat',
      count: givingGreen.summary.grantRecordCount, unit: 'rows', title: 'Giving Green rows are announced plans, not verified payments',
      description: 'All 29 accepted rows preserve the announcement semantics and leave disbursement dates unpublished.',
    },
    {
      key: 'funding-tranche-stale-gap', sourceKey: 'funding-room', state: 'monitor', category: 'stale-evidence',
      count: fundingTranches.tranches.filter((item) => item.status === 'stale-published-gap').length, unit: 'tranche',
      title: 'A period-specific funding gap is stale', description: 'Giving Green’s Project InnerSpace figure is retained with its 2025 period and excluded from current numeric room.',
    },
    {
      key: 'funding-tranche-closed', sourceKey: 'funding-room', state: 'documented-boundary', category: 'closed-opportunity',
      count: fundingTranches.tranches.filter((item) => item.status === 'closed-or-contact-required').length, unit: 'tranche',
      title: 'A published funding route is closed or contact-required', description: 'The Founders Pledge opportunity remains visible but is excluded from open funding room.',
    },
  ];
  return {
    version: 'data-quality-contract-v0.1',
    generatedAt: latestIso(grantFlows.generatedAt, fundingTranches.generatedAt),
    freshnessRules: [
      { state: 'current', maximumAgeDays: 14, label: 'Retrieved within 14 days' },
      { state: 'monitor', maximumAgeDays: 45, label: 'Retrieved 15–45 days ago' },
      { state: 'stale', maximumAgeDays: null, label: 'Retrieved more than 45 days ago' },
    ],
    stateRules: [
      { state: 'conflict', rule: 'A source’s own published totals or declared coverage disagree.' },
      { state: 'incomplete', rule: 'At least one accepted row lacks an amount, canonical date, recipient name, purpose, or direct source URL.' },
      { state: 'documented-boundary', rule: 'No row-level contradiction is open, but material publication or interpretation limits apply.' },
    ],
    rowRules: {
      current: 'A current row has last_seen_at equal to its source retrieval timestamp.',
      disappeared: 'A disappeared row was present in an earlier accepted snapshot but is absent from the current one; this is not called a retraction without publisher evidence.',
      grouped: 'Grouped status is counted only when a row explicitly carries it. Publisher-wide grouping caveats remain separate.',
      amounts: grantFlows.aggregationRules.amount,
    },
    ledgers,
    knownIssues,
  };
}

export function validateDataQualityContract(contract) {
  if (contract.version !== 'data-quality-contract-v0.1') throw new Error('Unexpected data-quality contract version.');
  if (contract.ledgers.length !== 4) throw new Error('Expected four accepted grant ledgers.');
  if (contract.ledgers.reduce((sum, ledger) => sum + ledger.rowCount, 0) !== 3491) throw new Error('Accepted ledger row total drifted.');
  const conflicts = contract.knownIssues.filter((item) => item.state === 'conflict');
  if (conflicts.length !== 2) throw new Error('Expected two accepted source conflicts.');
  if (contract.knownIssues.find((item) => item.key === 'givewell-displayed-exported-total')?.count !== 3) throw new Error('GiveWell total conflict drifted.');
  if (contract.knownIssues.find((item) => item.key === 'renphil-declared-linked-gap')?.count !== 1) throw new Error('RenPhil coverage conflict drifted.');
  if (contract.knownIssues.find((item) => item.key === 'coefficient-egc-overlap')?.count !== 79) throw new Error('Coefficient overlap boundary drifted.');
  if (!/not called a retraction/i.test(contract.rowRules.disappeared)) throw new Error('Retraction terminology boundary is missing.');
  return contract;
}

const REQUEST_STATUS = 'draft-not-sent';

const formatMoney = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
}).format(amount);

export function buildSfMarginalPlanRequests({ grantEvaluation, diligence, publicFunding }) {
  const hamilton = diligence.candidates.find((candidate) => candidate.key === 'hamilton-families');
  if (!hamilton?.evidenceDossier) throw new Error('Accepted Hamilton Families evidence dossier is missing.');
  const protocolCandidate = grantEvaluation.candidates.find((candidate) => candidate.candidateKey === hamilton.key);
  if (!protocolCandidate) throw new Error('Hamilton Families is missing from the grant-evaluation protocol.');
  const annual = hamilton.evidenceDossier.organizationReported;
  const cityContracts = publicFunding.sources.find((source) => source.key === 'datasf-supplier-contracts');
  if (!cityContracts) throw new Error('Accepted DataSF supplier-contract source is missing.');

  const sources = [
    {
      key: 'hamilton-annual-report-2025',
      publisher: annual.source.publisher,
      title: annual.source.title,
      url: annual.source.url,
      publishedAt: annual.source.publishedAt,
      retrievedAt: annual.source.retrievedAt,
    },
    {
      key: 'hamilton-quarterly-2026-q4',
      ...hamilton.sources.find((source) => source.title === 'Quarterly Report (April–June 2026)'),
    },
    {
      key: 'hamilton-financials',
      ...hamilton.sources.find((source) => source.title === 'Financials'),
    },
    {
      key: 'hamilton-housing-services',
      publisher: 'Hamilton Families',
      title: 'Housing Services',
      url: 'https://hamiltonfamilies.org/housing-services',
      publishedAt: null,
      retrievedAt: '2026-08-30',
    },
    {
      key: 'datasf-supplier-contracts',
      publisher: cityContracts.publisher,
      title: cityContracts.title,
      url: cityContracts.publicUrl,
      publishedAt: cityContracts.sourceUpdatedAt,
      retrievedAt: cityContracts.retrievedAt,
    },
  ];

  const publicFacts = [
    {
      key: 'entity',
      label: 'Entity and donation vehicle',
      display: `${hamilton.name} · ${hamilton.taxStatus} · EIN ${hamilton.ein}`,
      boundary: 'This identifies the organization, not the program, restricted fund, or geography that would receive a proposed gift.',
      sourceKeys: ['hamilton-financials'],
    },
    {
      key: 'program-scope',
      label: 'Published program scope',
      display: 'Homelessness prevention, family shelter, transitional housing, rapid rehousing, housing subsidies, and case management',
      boundary: 'Hamilton must identify one named program, target population, and geography for each gift scenario; this public list is not a marginal plan.',
      sourceKeys: ['hamilton-annual-report-2025', 'hamilton-housing-services'],
    },
    {
      key: 'latest-signals',
      label: 'Latest accepted reporting window',
      display: '338 families served · 34 program exits to stable housing · 19 families received eviction-prevention assistance · $660,709 in housing subsidies',
      boundary: 'April–June 2026 organization-reported outputs and outcomes; no common follow-up window, counterfactual, or donor attribution is published.',
      sourceKeys: ['hamilton-quarterly-2026-q4'],
    },
    {
      key: 'organization-finances',
      label: 'Organization-wide FY2025 context',
      display: `${formatMoney(annual.financials.revenueUsd)} revenue · ${formatMoney(annual.financials.expensesUsd)} expenses · ${formatMoney(annual.financials.governmentRevenueUsd)} government revenue`,
      boundary: 'Audited organization-wide totals do not reveal a program budget, unrestricted cash, reserves, expected revenue, or a time-bounded funding gap.',
      sourceKeys: ['hamilton-annual-report-2025', 'hamilton-financials'],
    },
    {
      key: 'public-funding',
      label: 'San Francisco contract context',
      display: `${hamilton.publicFunding.contractCount} exact prime-contractor matches · ${formatMoney(hamilton.publicFunding.awardUsd)} contract authority · ${formatMoney(hamilton.publicFunding.paymentsMadeUsd)} paid`,
      boundary: 'Life-to-date city contract accounting is not annual revenue, philanthropic funding room, program cost, or evidence that a private gift is additional.',
      sourceKeys: ['datasf-supplier-contracts'],
    },
  ];

  const publicContextByField = {
    programIdentity: 'Hamilton Families and its EIN are verified; the receiving program, restricted fund, population, and San Francisco geography are not selected.',
    timeBoundedBudget: 'Organization-wide FY2025 revenue, expenses, and government funding are public. A program-period budget and unfunded amount are not.',
    incrementalActivities: 'Published services describe current work, but no source says what an incremental gift at any requested size would add.',
    capacityConstraints: 'The quarterly report describes 46 new landlord partnerships. Available units, staffing, referral flow, caseload, and other binding constraints are not published.',
    fundingDisplacement: 'Government revenue and eight matched city contracts make displacement material, but no scenario-specific reconciliation is public.',
    outcomeForecast: 'Hamilton reports stable-housing exits and eviction-prevention assistance without a common durability window, comparison rate, expected incremental outcome, or uncertainty range.',
    costAndAttribution: 'Housing subsidies are reported, but program cash cost, cost per sustained outcome, contribution share, and donor attribution are not.',
    milestones: 'No accepted source pre-registers 6-, 12-, 24-, or 36-month milestones or continuation, revision, and exit rules for a new gift.',
  };

  const questions = grantEvaluation.marginalPlan.requiredFields.map((field) => ({
    key: field.key,
    label: field.label,
    question: field.question,
    publicContext: publicContextByField[field.key],
    publicContextState: 'accepted-public-context',
    organizationResponseState: 'not-submitted',
    organizationResponse: null,
    mfiModelState: 'not-started',
    mfiModel: null,
  }));

  const scenarios = protocolCandidate.scenarios.map((scenario) => ({
    amountUsd: scenario.amountUsd,
    state: 'not-submitted',
    organizationResponse: null,
    mfiModel: null,
    requestedDecision: `Identify the strongest specific use of an incremental ${formatMoney(scenario.amountUsd)} gift over a dated period, or state that Hamilton cannot productively absorb it.`,
    requiredQuestionKeys: questions.map((question) => question.key),
  }));

  const packet = {
    packetKey: 'hamilton-families-marginal-plan-v0.1',
    candidateKey: hamilton.key,
    candidateName: hamilton.name,
    status: REQUEST_STATUS,
    statusLabel: 'Draft · not sent',
    responseReceivedAt: null,
    forecastLockedAt: null,
    recommendationState: 'insufficient-evidence',
    purpose: 'Turn organization-level public reporting into three program-specific, time-bounded funding cases without treating public context as an organization response or an MFI impact estimate.',
    decisionBoundary: 'This packet is a research request, not a funding recommendation, commitment, organization endorsement, submitted response, or estimate of room for more funding.',
    provenanceLegend: [
      { key: 'public-context', label: 'Accepted public context', meaning: 'A cited fact that frames the question but does not answer the marginal case.' },
      { key: 'organization-response', label: 'Organization response', meaning: 'A dated answer and supporting materials supplied or confirmed by Hamilton Families. None has been received.' },
      { key: 'mfi-model', label: 'MFI model', meaning: 'An independently reviewed forecast or translation built only after the response. None has been started.' },
    ],
    publicFacts,
    scenarios,
    questions,
    sources,
  };

  return {
    version: 'sf-marginal-plan-requests-v0.1',
    generatedAt: grantEvaluation.generatedAt,
    geography: grantEvaluation.geography,
    summary: {
      packetCount: 1,
      draftPacketCount: 1,
      scenarioCount: scenarios.length,
      submittedScenarioCount: 0,
      organizationResponseCount: 0,
      mfiModelCount: 0,
      publicFactCount: publicFacts.length,
      questionCount: questions.length,
    },
    packets: [packet],
  };
}

export function validateSfMarginalPlanRequests(snapshot) {
  if (snapshot.version !== 'sf-marginal-plan-requests-v0.1') throw new Error('Unexpected SF marginal-plan request version.');
  if (snapshot.packets.length !== 1 || snapshot.summary.packetCount !== 1) throw new Error('Expected one Hamilton request packet.');
  const packet = snapshot.packets[0];
  if (packet.candidateKey !== 'hamilton-families' || packet.status !== REQUEST_STATUS) throw new Error('Hamilton request must remain a draft that was not sent.');
  if (packet.responseReceivedAt !== null || packet.forecastLockedAt !== null) throw new Error('Hamilton request overstates response or forecast readiness.');
  if (packet.scenarios.length !== 3 || JSON.stringify(packet.scenarios.map((scenario) => scenario.amountUsd)) !== JSON.stringify([100000, 1000000, 10000000])) throw new Error('Hamilton request must cover all three gift sizes.');
  if (packet.questions.length !== 8 || new Set(packet.questions.map((question) => question.key)).size !== 8) throw new Error('Hamilton request must cover all eight marginal-plan fields.');
  if (packet.scenarios.some((scenario) => scenario.state !== 'not-submitted' || scenario.organizationResponse !== null || scenario.mfiModel !== null)) throw new Error('Hamilton scenarios overstate submitted or modeled evidence.');
  if (packet.questions.some((question) => question.publicContextState !== 'accepted-public-context' || question.organizationResponseState !== 'not-submitted' || question.organizationResponse !== null || question.mfiModelState !== 'not-started' || question.mfiModel !== null)) throw new Error('Hamilton question provenance is not fail-closed.');
  if (packet.publicFacts.some((fact) => !fact.boundary || fact.sourceKeys.length === 0)) throw new Error('Every Hamilton public prefill needs a source and transfer boundary.');
  const sourceKeys = new Set(packet.sources.map((source) => source.key));
  if (packet.publicFacts.some((fact) => fact.sourceKeys.some((key) => !sourceKeys.has(key)))) throw new Error('Hamilton public prefill references an unknown source.');
  if (snapshot.summary.submittedScenarioCount !== 0 || snapshot.summary.organizationResponseCount !== 0 || snapshot.summary.mfiModelCount !== 0) throw new Error('Hamilton request summary overstates readiness.');
  if (packet.sources.some((source) => !source.url.startsWith('https://hamiltonfamilies.org/') && !source.url.startsWith('https://data.sfgov.org/'))) throw new Error('Hamilton request includes an unsupported source domain.');
  return snapshot;
}

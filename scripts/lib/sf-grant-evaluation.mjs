const GIFT_SCENARIOS = [100000, 1000000, 10000000];

const REQUIRED_MARGINAL_PLAN_FIELDS = [
  { key: 'programIdentity', label: 'Program and legal entity', question: 'Which legal entity, named program, population, and San Francisco geography would receive the gift?' },
  { key: 'timeBoundedBudget', label: 'Time-bounded budget', question: 'What is the program budget, cash on hand, restricted funding, reserves, expected revenue, and unfunded amount over the same period?' },
  { key: 'incrementalActivities', label: 'Incremental activities', question: 'What would happen with this gift that would not happen otherwise, and on what spending schedule?' },
  { key: 'capacityConstraints', label: 'Capacity constraints', question: 'Which staffing, referral, facility, regulatory, partner, or target-population constraints limit expansion?' },
  { key: 'fundingDisplacement', label: 'Other-funder displacement', question: 'Would public, restricted, board-designated, or other philanthropic funding change if this gift arrived?' },
  { key: 'outcomeForecast', label: 'Outcome forecast', question: 'What durable outcome, baseline, counterfactual, follow-up window, expected value, and uncertainty range are forecast?' },
  { key: 'costAndAttribution', label: 'Cost and attribution', question: 'What program-level cash cost and contribution or attribution share connect the gift to the outcome?' },
  { key: 'milestones', label: 'Milestones and stop rules', question: 'What will be reported at 6, 12, 24, and 36 months, and what result would cause continuation, revision, or exit?' },
];

const LOOKBACK_FIELDS = [
  { key: 'forecastLock', label: 'Original forecast', copy: 'Preserve the dated decision memo, model version, assumptions, uncertainty, and forecast hash. Never overwrite the original case.' },
  { key: 'financialDelivery', label: 'Financial delivery', copy: 'Record amount committed, paid, spent, remaining, and reallocated with dates and amount semantics.' },
  { key: 'implementation', label: 'Implementation', copy: 'Compare forecast activities, capacity, milestones, and timing with what was actually delivered.' },
  { key: 'observedOutcomes', label: 'Observed outcomes', copy: 'Report the pre-specified durable outcome, denominator, follow-up, missingness, comparator, and uncertainty.' },
  { key: 'counterfactualUpdate', label: 'Counterfactual update', copy: 'Reassess what likely happened without the grant, including other funders, public funding, and displacement.' },
  { key: 'forecastVariance', label: 'Forecast variance', copy: 'Show forecast versus observed value, absolute and percentage variance where valid, and why they differ.' },
  { key: 'modelUpdate', label: 'Model update', copy: 'Publish the revised impact and cost-effectiveness model separately from the frozen original model.' },
  { key: 'decisionLearning', label: 'Decision and learning', copy: 'State what changes in the recommendation, future grant design, monitoring, or research priority.' },
];

export function buildSfGrantEvaluation({ comparison, diligence }) {
  const candidatePlans = comparison.candidates.map((candidate) => ({
    candidateKey: candidate.key,
    candidateName: candidate.name,
    researchHref: candidate.researchHref,
    decisionState: candidate.decisionCategory,
    marginalPlanState: 'not-submitted',
    marginalPlanLabel: 'Not submitted',
    forecastLockState: 'not-eligible',
    lookbackState: 'not-eligible',
    scenarios: GIFT_SCENARIOS.map((amountUsd) => ({
      amountUsd,
      state: 'not-submitted',
      display: 'Awaiting program-specific plan',
      program: null,
      periodStart: null,
      periodEnd: null,
      reviewedAt: null,
      reviewedBy: [],
      sourceUrls: [],
      requiredFieldStates: Object.fromEntries(REQUIRED_MARGINAL_PLAN_FIELDS.map((field) => [field.key, 'missing'])),
    })),
  }));

  const housingActionCoalition = diligence.candidates.find((candidate) => candidate.key === 'housing-action-coalition');
  const coefficientGrantLayer = housingActionCoalition?.evidenceDossier?.evidenceLayers.find((layer) => layer.scope === 'independent grant record' && layer.publisher === 'Coefficient Giving');
  if (!coefficientGrantLayer) throw new Error('Accepted Housing Action Coalition grant record is missing.');

  const historicalGrants = [{
    grantKey: 'coefficient-housing-action-coalition-housing-policy-advocacy-2025',
    candidateKey: 'housing-action-coalition',
    candidateName: housingActionCoalition.name,
    publisher: coefficientGrantLayer.publisher,
    publisherRole: 'grant publisher and advisor; originating funder not assumed',
    title: coefficientGrantLayer.title,
    amountUsd: 120000,
    amountSemantics: 'funder-published grant amount',
    awardPeriod: 'September 2025',
    purpose: 'Housing Policy Advocacy',
    fund: 'Abundance & Growth',
    sourceUrl: coefficientGrantLayer.url,
    sourcePublishedAt: coefficientGrantLayer.publishedAt,
    sourceRetrievedAt: coefficientGrantLayer.retrievedAt,
    originalForecastState: 'not-published',
    milestonesState: 'not-published',
    realizedOutcomesState: 'not-published',
    lookbackState: 'not-yet-assessable',
    systematicLookbackWindow: 'September 2027–September 2028',
    scheduleSemantics: 'MFI protocol target of 24–36 months after the published award period; not a funder commitment or source-published deadline.',
    currentAssessment: coefficientGrantLayer.transferLimit,
  }];

  return {
    version: 'sf-grant-evaluation-v0.1',
    generatedAt: comparison.generatedAt,
    geography: comparison.geography,
    purpose: 'Define the minimum evidence required to turn an organization-level research lead into a program-specific marginal funding opportunity, then compare the frozen forecast with realized delivery and outcomes.',
    methodBoundary: 'This contract is a research protocol, not evidence that any organization supplied a plan, that any grant occurred, or that any candidate is recommendation-ready.',
    promotionRule: 'No candidate can receive a modeled marginal impact price until one scenario identifies a specific program and entity, reconciles available and expected funding, specifies incremental activities and constraints, pre-registers a durable outcome and counterfactual, publishes uncertainty, and passes independent review.',
    marginalPlan: {
      giftScenariosUsd: GIFT_SCENARIOS,
      requiredFields: REQUIRED_MARGINAL_PLAN_FIELDS,
      statusOrder: ['not-submitted', 'submitted-unreviewed', 'revision-requested', 'reviewed-not-approved', 'forecast-locked'],
    },
    lookback: {
      defaultCheckpointsMonths: [6, 12, 24, 36],
      systematicReviewTargetMonths: [24, 36],
      requiredFields: LOOKBACK_FIELDS,
      statusOrder: ['not-eligible', 'monitoring', 'lookback-due', 'lookback-published'],
      forecastRule: 'The original forecast remains immutable. Updated estimates are versioned beside it so forecast accuracy is measurable.',
    },
    sources: [
      {
        publisher: 'GiveWell',
        title: 'Research Overview',
        url: 'https://www.givewell.org/research',
        retrievedAt: '2026-08-30',
        use: 'Grant monitoring and systematic look-backs compare original cost-effectiveness estimates and forecasts with program data and stakeholder feedback.',
      },
      {
        publisher: 'GiveWell',
        title: 'Room for More Funding',
        url: 'https://www.givewell.org/how-we-work/criteria/room-for-more-funding',
        retrievedAt: '2026-08-30',
        use: 'Scenario analysis asks how activities change at different unrestricted-funding levels and checks actual activities against actual funding later.',
      },
      {
        publisher: 'GiveWell',
        title: 'Process for Identifying Top Charities',
        url: 'https://www.givewell.org/how-we-work/process',
        retrievedAt: '2026-08-30',
        use: 'Recommendation research examines evidence, cost-effectiveness, room for more funding, organizational execution, and transparency.',
      },
      {
        publisher: 'GiveWell',
        title: 'Top Charities',
        url: 'https://www.givewell.org/charities/top-charities',
        retrievedAt: '2026-08-30',
        use: 'Front-of-house reference for presenting concise donor decisions with research behind them.',
      },
    ],
    summary: {
      candidateCount: candidatePlans.length,
      scenarioCount: candidatePlans.reduce((sum, candidate) => sum + candidate.scenarios.length, 0),
      submittedScenarioCount: 0,
      forecastLockedCount: 0,
      lookbackEligibleCount: 0,
      requiredMarginalFieldCount: REQUIRED_MARGINAL_PLAN_FIELDS.length,
      requiredLookbackFieldCount: LOOKBACK_FIELDS.length,
      historicalGrantCount: historicalGrants.length,
      historicalGrantsWithPublishedForecastCount: 0,
      historicalGrantsWithPublishedOutcomesCount: 0,
    },
    candidates: candidatePlans,
    historicalGrants,
  };
}

export function validateSfGrantEvaluation(snapshot) {
  if (snapshot.version !== 'sf-grant-evaluation-v0.1') throw new Error('Unexpected SF grant-evaluation version.');
  if (snapshot.candidates.length !== 6 || snapshot.summary.candidateCount !== 6) throw new Error('Grant-evaluation contract must cover all six candidates.');
  if (snapshot.summary.scenarioCount !== 18) throw new Error('Grant-evaluation contract must cover three gift sizes for each candidate.');
  if (new Set(snapshot.candidates.map((candidate) => candidate.candidateKey)).size !== 6) throw new Error('Duplicate grant-evaluation candidate.');
  if (snapshot.candidates.some((candidate) => candidate.scenarios.length !== 3)) throw new Error('Incomplete marginal-plan scenario set.');
  if (snapshot.candidates.some((candidate) => candidate.marginalPlanState !== 'not-submitted' || candidate.forecastLockState !== 'not-eligible' || candidate.lookbackState !== 'not-eligible')) throw new Error('Unsupported grant-evaluation readiness claim.');
  if (snapshot.candidates.some((candidate) => candidate.scenarios.some((scenario) => scenario.state !== 'not-submitted' || scenario.program !== null || scenario.sourceUrls.length !== 0))) throw new Error('Unsupported marginal-plan submission claim.');
  const requiredKeys = snapshot.marginalPlan.requiredFields.map((field) => field.key).sort();
  if (snapshot.candidates.some((candidate) => candidate.scenarios.some((scenario) => JSON.stringify(Object.keys(scenario.requiredFieldStates).sort()) !== JSON.stringify(requiredKeys) || Object.values(scenario.requiredFieldStates).some((state) => state !== 'missing')))) throw new Error('Marginal-plan missingness is incomplete.');
  if (snapshot.summary.submittedScenarioCount !== 0 || snapshot.summary.forecastLockedCount !== 0 || snapshot.summary.lookbackEligibleCount !== 0) throw new Error('Grant-evaluation summary overstates readiness.');
  if (snapshot.historicalGrants.length !== 1 || snapshot.summary.historicalGrantCount !== 1) throw new Error('Historical grant seed is incomplete.');
  if (snapshot.historicalGrants.some((grant) => grant.amountUsd !== 120000 || grant.amountSemantics !== 'funder-published grant amount' || grant.originalForecastState !== 'not-published' || grant.realizedOutcomesState !== 'not-published' || grant.lookbackState !== 'not-yet-assessable')) throw new Error('Historical grant seed overstates evidence or changes amount semantics.');
  if (snapshot.summary.historicalGrantsWithPublishedForecastCount !== 0 || snapshot.summary.historicalGrantsWithPublishedOutcomesCount !== 0) throw new Error('Historical grant summary overstates source coverage.');
  if (snapshot.sources.some((source) => !source.url.startsWith('https://www.givewell.org/'))) throw new Error('Grant-evaluation method must retain official primary sources.');
  return snapshot;
}

const GIFT_SCENARIOS = [100000, 1000000, 10000000];

export function buildSfDonorComparison({ diligence, outcomes }) {
  const outcomeLabels = new Map(outcomes.outcomes.map((outcome) => [outcome.key, outcome.label]));
  const candidates = [...diligence.candidates]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((candidate) => {
      const dossier = candidate.evidenceDossier ?? null;
      return {
        key: candidate.key,
        name: candidate.name,
        organizationType: candidate.entityType,
        interventionType: candidate.interventionType,
        serviceGeography: candidate.serviceGeography,
        outcomeKeys: candidate.outcomeKeys,
        outcomeLabels: candidate.outcomeKeys.map((key) => outcomeLabels.get(key) ?? key),
        decisionCategory: 'insufficient-evidence',
        decisionLabel: 'Insufficient evidence for recommendation',
        recommendationReady: false,
        researchState: dossier ? 'deep-evidence-dossier' : 'initial-scorecard-only',
        researchStateLabel: dossier ? 'Deep evidence dossier' : 'Initial scorecard only',
        reviewedAt: dossier?.reviewedAt ?? diligence.generatedAt.slice(0, 10),
        decisionSummary: dossier?.decisionSummary ?? candidate.evidenceSummary,
        strongestNativeSignal: candidate.nativeSignals[0] ?? null,
        costEffectiveness: {
          status: 'not-yet-estimable',
          display: 'Not yet estimable',
          requestedUnit: 'USD per life substantially bettered',
          reason: diligence.rules.conversion,
        },
        livesSubstantiallyBettered: {
          status: 'definition-not-approved',
          display: 'Definition not approved',
          reason: 'No San Francisco threshold, duration, moral weights, counterfactual, or uncertainty model currently defines a “life substantially bettered.” No fixed QALY or WELLBY conversion is assumed.',
        },
        fundingRoom: {
          status: 'not-published',
          display: 'Not published',
          sourceStatement: candidate.marginalFunding,
          giftScenarios: GIFT_SCENARIOS.map((amountUsd) => ({ amountUsd, status: 'no-reviewed-plan', display: 'No reviewed plan' })),
        },
        donationVehicle: {
          taxStatus: candidate.taxStatus,
          deductibility: candidate.donationDeductibility,
          url: candidate.donationUrl,
        },
        publicFunding: candidate.publicFunding,
        researchHref: dossier ? `#${candidate.key}-dossier-title` : `#${candidate.key}-scorecard`,
        primarySource: dossier?.organizationReported.source ?? candidate.sources[0],
      };
    });

  return {
    version: 'sf-donor-comparison-v0.1',
    generatedAt: diligence.generatedAt,
    geography: diligence.geography,
    interpretation: {
      ordering: 'Alphabetical, not ranked.',
      recommendation: 'Every candidate remains insufficient-evidence for recommendation. The comparison standardizes missingness; it does not convert research depth, organizational scale, ratings, contracts, or service outputs into an impact score.',
      translationBoundary: '“Life substantially bettered” remains undefined for San Francisco until a versioned model publishes the threshold, duration, moral weights, counterfactual, uncertainty range, model date, and sensitivity analysis.',
      fundingBoundary: 'A donation page or organization-wide budget is not room for more funding. Each gift-size scenario remains unavailable until a reviewed, time-bounded marginal plan identifies what additional funding would buy and what other funding it may displace.',
    },
    summary: {
      candidateCount: candidates.length,
      recommendationReadyCount: candidates.filter((candidate) => candidate.recommendationReady).length,
      insufficientEvidenceCount: candidates.filter((candidate) => candidate.decisionCategory === 'insufficient-evidence').length,
      deepDossierCount: candidates.filter((candidate) => candidate.researchState === 'deep-evidence-dossier').length,
      costEffectivenessNotEstimableCount: candidates.filter((candidate) => candidate.costEffectiveness.status === 'not-yet-estimable').length,
      publishedFundingRoomCount: candidates.filter((candidate) => candidate.fundingRoom.status !== 'not-published').length,
    },
    candidates,
  };
}

export function validateSfDonorComparison(snapshot) {
  if (snapshot.version !== 'sf-donor-comparison-v0.1') throw new Error('Unexpected SF donor comparison version.');
  if (snapshot.candidates.length !== 6 || snapshot.summary.candidateCount !== 6) throw new Error('SF donor comparison must contain the six-candidate research cohort.');
  if (new Set(snapshot.candidates.map((candidate) => candidate.key)).size !== snapshot.candidates.length) throw new Error('Duplicate SF donor comparison candidate.');
  if (snapshot.candidates.some((candidate) => candidate.recommendationReady || candidate.decisionCategory !== 'insufficient-evidence')) throw new Error('An unsupported SF recommendation escaped the evidence gate.');
  if (snapshot.candidates.some((candidate) => candidate.costEffectiveness.status !== 'not-yet-estimable')) throw new Error('Unsupported SF cost-effectiveness estimate.');
  if (snapshot.candidates.some((candidate) => candidate.livesSubstantiallyBettered.status !== 'definition-not-approved')) throw new Error('Unsupported lives-substantially-bettered definition.');
  if (snapshot.candidates.some((candidate) => candidate.fundingRoom.status !== 'not-published' || candidate.fundingRoom.giftScenarios.length !== 3)) throw new Error('Unsupported SF funding-room claim.');
  if (snapshot.candidates.some((candidate) => candidate.fundingRoom.giftScenarios.some((scenario) => scenario.status !== 'no-reviewed-plan'))) throw new Error('Unsupported gift-size plan.');
  if (snapshot.candidates.some((candidate) => !candidate.researchHref.startsWith('#') || !candidate.primarySource?.url?.startsWith('https://'))) throw new Error('Incomplete SF comparison research trail.');
  if (snapshot.summary.recommendationReadyCount !== 0 || snapshot.summary.insufficientEvidenceCount !== 6 || snapshot.summary.costEffectivenessNotEstimableCount !== 6 || snapshot.summary.publishedFundingRoomCount !== 0) throw new Error('SF donor comparison summary misstates the evidence boundary.');
  return snapshot;
}

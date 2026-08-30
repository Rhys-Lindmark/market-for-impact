const liveFoundersPledgeStatuses = new Set(['current-fund', 'published-recommendation-live', 'partner-derived-summary']);

const isoMax = (...values) => values.filter(Boolean).sort().at(-1);

export function buildFundingTranches({ ace, givewell, givingGreen, foundersPledge }) {
  const fpSources = new Map(foundersPledge.sources.map((source) => [source.key, source]));
  const tranches = [];

  for (const record of ace.records) {
    tranches.push({
      trancheKey: `ace:${record.slug}:${record.fundingPeriod.replaceAll(/[^0-9]+/g, '-')}`,
      evaluator: 'Animal Charity Evaluators', evaluatorSlug: 'animal-charity-evaluators',
      organization: record.organization, organizationSlug: record.slug, cause: 'Animal welfare',
      sourceUrl: record.reviewUrl, sourceTitle: `${record.organization} charity review`,
      status: 'published-numeric-current-period', amountUsd: record.fundingRoomUsd,
      capacityUsd: record.fundingCapacityUsd, timeWindow: record.fundingPeriod,
      use: record.fundingUse, confidenceLabel: record.evidenceLevel,
      confidenceBasis: `ACE ${record.evaluationYear} review; recommendation cohort ${record.recommendationCohort}.`,
      marginalMetricName: record.headlineMetric.program, marginalMetricValue: record.headlineMetric.value,
      marginalMetricUnit: record.headlineMetric.unit, modelVersion: `ACE ${record.evaluationYear}`,
      likelyCounterfactualFunder: null,
      counterfactualBasis: 'ACE does not publish the donor who would otherwise fill this organization-level annual room.',
      limitations: record.limitations,
    });
  }

  for (const record of givewell.opportunities) {
    tranches.push({
      trancheKey: `givewell:${record.slug}:rolling-current`, evaluator: 'GiveWell', evaluatorSlug: 'givewell',
      organization: record.organization, organizationSlug: record.slug, cause: 'Global health',
      sourceUrl: record.researchUrl, sourceTitle: `${record.organization} GiveWell review`,
      status: 'rolling-allocation-amount-unpublished', amountUsd: null, capacityUsd: null,
      timeWindow: 'Rolling; Top Charities Fund commits donations within six months',
      use: record.program, confidenceLabel: record.evidenceLevel,
      confidenceBasis: record.fundingRoomNote,
      marginalMetricName: 'Historical reported cost per life saved', marginalMetricValue: record.costPerLifeSavedUsd,
      marginalMetricUnit: 'USD per life saved', modelVersion: record.modelVersion,
      likelyCounterfactualFunder: null,
      counterfactualBasis: 'GiveWell considers expected funding from other donors at the grant-opportunity level; no organization-wide counterfactual funder is published.',
      limitations: record.limitations,
    });
  }

  for (const record of givingGreen.topRecommendations) {
    const stale = record.fundingRoomUsd != null;
    tranches.push({
      trancheKey: `giving-green:${record.slug}:${stale ? 'stale-2025-gap' : 'qualitative-current'}`,
      evaluator: 'Giving Green', evaluatorSlug: 'giving-green', organization: record.name,
      organizationSlug: record.slug, cause: 'Climate', sourceUrl: record.reviewUrl,
      sourceTitle: `${record.name} nonprofit spotlight`, status: stale ? 'stale-published-gap' : 'qualitative-need-amount-unpublished',
      amountUsd: record.fundingRoomUsd, capacityUsd: null, timeWindow: record.fundingRoomPeriod,
      use: record.fundingNeed, confidenceLabel: 'qualitative best-bet assessment',
      confidenceBasis: record.evaluationSummary, marginalMetricName: null, marginalMetricValue: null,
      marginalMetricUnit: null, modelVersion: 'Giving Green 2025–2026', likelyCounterfactualFunder: null,
      counterfactualBasis: 'No likely counterfactual funder is published in the accepted spotlight.', limitations: record.limitations,
    });
  }

  for (const record of foundersPledge.records) {
    const source = fpSources.get(record.sourceKey);
    if (!source) throw new Error(`Missing Founders Pledge source ${record.sourceKey}.`);
    const status = record.status === 'current-fund' ? 'accepting-amount-unpublished'
      : record.status === 'contact-program' ? 'closed-or-contact-required'
      : liveFoundersPledgeStatuses.has(record.status) ? 'published-recommendation-gap-unpublished'
      : 'not-current';
    tranches.push({
      trancheKey: `founders-pledge:${record.slug}:${record.status}`, evaluator: 'Founders Pledge',
      evaluatorSlug: 'founders-pledge', organization: record.organization, organizationSlug: record.slug,
      cause: record.cause, sourceUrl: source.url, sourceTitle: source.title, status,
      amountUsd: null, capacityUsd: null, timeWindow: record.fundingStatus,
      use: record.summary, confidenceLabel: record.evidenceModel, confidenceBasis: record.fundingStatus,
      marginalMetricName: record.nativeMetric, marginalMetricValue: null, marginalMetricUnit: null,
      modelVersion: record.assessmentDate?.slice(0, 10) ?? 'Current page; no decision date published',
      likelyCounterfactualFunder: null,
      counterfactualBasis: 'No likely counterfactual funder is published for this accepted opportunity.', limitations: record.limitations,
    });
  }

  return {
    version: 'funding-tranches-v0.1',
    generatedAt: isoMax(ace.source.retrievedAt, givewell.source.retrievedAt, givingGreen.source.retrievedAt, foundersPledge.retrievedAt),
    methodologySources: [
      { publisher: 'Animal Charity Evaluators', title: 'Evaluation Criteria 2025', url: 'https://animalcharityevaluators.org/charity-reviews/evaluating-charities/evaluation-criteria/' },
      { publisher: 'GiveWell', title: 'Room for More Funding', url: 'https://www.givewell.org/how-we-work/criteria/room-for-more-funding' },
      { publisher: 'GiveWell', title: 'Top Charities Fund', url: 'https://www.givewell.org/top-charities-fund' }
    ],
    interpretation: {
      tranche: 'One source-supported marginal funding opportunity at one evaluator-defined amount and time window; an unknown amount remains one tranche, not zero dollars.',
      amount: 'Funding room is not annual capacity, grant size, or historical funding. Only evaluator-published room is numeric.',
      curve: 'Numeric curves may be summed only within the same evaluator period. Cross-period and cross-evaluator totals are prohibited.',
      counterfactual: 'A likely counterfactual funder is stored only when the source identifies one; otherwise it remains unknown.'
    },
    tranches,
  };
}

export function validateFundingTranches(snapshot) {
  if (snapshot.version !== 'funding-tranches-v0.1') throw new Error('Unexpected funding-tranche version.');
  if (snapshot.tranches.length !== 31) throw new Error(`Expected 31 tranches, received ${snapshot.tranches.length}.`);
  if (new Set(snapshot.tranches.map((item) => item.trancheKey)).size !== snapshot.tranches.length) throw new Error('Tranche keys must be unique.');
  for (const item of snapshot.tranches) {
    for (const key of ['trancheKey', 'evaluator', 'organization', 'cause', 'sourceUrl', 'status', 'timeWindow', 'use', 'confidenceLabel', 'confidenceBasis', 'modelVersion', 'counterfactualBasis', 'limitations']) {
      if (!item[key]) throw new Error(`${item.trancheKey ?? 'tranche'} is missing ${key}.`);
    }
    if (item.amountUsd != null && (!(item.amountUsd > 0) || !Number.isFinite(item.amountUsd))) throw new Error(`${item.trancheKey} has an invalid amount.`);
    if (item.status === 'published-numeric-current-period' && item.amountUsd == null) throw new Error(`${item.trancheKey} must have an amount.`);
    if (item.likelyCounterfactualFunder !== null) throw new Error(`${item.trancheKey} invents a counterfactual funder.`);
  }
  const numeric = snapshot.tranches.filter((item) => item.status === 'published-numeric-current-period');
  const byPeriod = Object.fromEntries([...new Set(numeric.map((item) => item.timeWindow))].map((period) => [period, numeric.filter((item) => item.timeWindow === period).reduce((sum, item) => sum + item.amountUsd, 0)]));
  if (byPeriod['annual, 2025–2026'] !== 3300000 || byPeriod['annual, 2026–2027'] !== 9156000) throw new Error('ACE period totals drifted.');
  const stale = snapshot.tranches.filter((item) => item.status === 'stale-published-gap');
  if (stale.length !== 1 || stale[0].amountUsd !== 4000000) throw new Error('Expected one stale $4M Giving Green gap.');
  return snapshot;
}

import { createHash } from 'node:crypto';

export const comparisonVersion = 'evaluator-comparison-v1-2026-08-30';

const evaluatorProfiles = [
  {
    key: 'givewell', name: 'GiveWell', methodologyUrl: 'https://www.givewell.org/how-we-work/process',
    criteria: ['Strength of evidence', 'Cost-effectiveness', 'Room for more funding'],
    evidenceRegime: 'Intervention and location models with empirical evidence, moral weights, cost-effectiveness estimates, and marginal funding opportunities.',
  },
  {
    key: 'coefficient', name: 'Coefficient Giving', methodologyUrl: 'https://coefficientgiving.org/our-approach/',
    criteria: ['Worldview diversification', 'Hits-based expected impact', 'Cause-appropriate cost-effectiveness'],
    evidenceRegime: 'Fund-specific grantmaking that mixes quantitative models with qualitative judgment, expert input, and high-risk/high-upside portfolio reasoning.',
  },
  {
    key: 'ace', name: 'Animal Charity Evaluators', methodologyUrl: 'https://animalcharityevaluators.org/charity-reviews/evaluating-charities/evaluation-criteria/',
    criteria: ['Impact', 'Room for more funding', 'Organizational health'],
    evidenceRegime: 'Theory-of-change review, selected-program cost-effectiveness models, funding scenarios, and organizational-health assessment.',
  },
  {
    key: 'giving-green', name: 'Giving Green', methodologyUrl: 'https://www.givinggreen.earth/faq',
    criteria: ['Scale', 'Feasibility', 'Funding need', 'Organization-specific due diligence'],
    evidenceRegime: 'Strategy-first climate research followed by organization diligence and qualitative or organization-specific cost-effectiveness analysis.',
  },
  {
    key: 'founders-pledge', name: 'Founders Pledge', methodologyUrl: 'https://www.founderspledge.com/research/our-approach-to-charity',
    criteria: ['Track record and team', 'Room for more funding', 'Future projects', 'Evidence of cost-effectiveness', 'Due diligence and transparency'],
    evidenceRegime: 'Modeled direct interventions where possible and qualitative, hits-based portfolio judgment where outcomes resist common-unit modeling.',
  },
];

const causeDefinitions = [
  { key: 'global-health', label: 'Global health', coefficientFunds: ['Global Health & Wellbeing Opportunities'], fpFilter: (record) => record.cause === 'Global health' },
  { key: 'animal-welfare', label: 'Animal welfare', coefficientFunds: ['Farm Animal Welfare'], fpFilter: () => false },
  { key: 'climate', label: 'Climate', coefficientFunds: [], fpFilter: (record) => record.cause === 'Climate' },
  { key: 'education', label: 'Education', coefficientFunds: [], fpFilter: (record) => record.cause === 'Education' },
  { key: 'ai-safety', label: 'AI safety', coefficientFunds: ['Navigating Transformative AI'], fpFilter: (record) => record.cause === 'Global catastrophic risks' && (record.opportunityType === 'current-pooled-fund' || record.statusLabel.includes('AI')) },
  { key: 'global-catastrophic-risks', label: 'Biosecurity & catastrophic risks', coefficientFunds: ['Global Catastrophic Risks Opportunities', 'Biosecurity & Pandemic Preparedness'], fpFilter: (record) => record.cause === 'Global catastrophic risks' && (record.opportunityType === 'current-pooled-fund' || record.statusLabel.includes('biosecurity')) },
];

const foundersPledgeAliases = new Map([
  ['centre-for-long-term-resilience', 'the-centre-for-long-term-resilience'],
  ['institute-for-law-and-ai', 'institute-for-law-and-ai'],
]);

function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function slug(value) {
  return value.normalize('NFKC').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function latest(values) {
  return values.filter(Boolean).sort().at(-1) ?? null;
}

function notCovered(profile, note) {
  return {
    evaluatorKey: profile.key, evaluator: profile.name, coverageStatus: 'not-covered-in-accepted-current-set',
    mode: 'No accepted current comparison row', decisionDate: null, retrievedAt: null,
    recommendationCount: 0, numericFundingRoomCount: 0, numericFundingRoomUsd: null,
    publishedGrantCount: null, publishedAmountUsd: null, fundLenses: [], organizations: [],
    criteria: profile.criteria, evidenceRegime: profile.evidenceRegime, fundingStatus: 'Not represented in the accepted current source set for this cause.',
    sourceUrl: profile.methodologyUrl, note,
  };
}

function coefficientCell(profile, cause, coefficient) {
  if (!cause.coefficientFunds.length) return notCovered(profile, 'Coefficient may have relevant grants elsewhere, but its current funds page has no dedicated lens for this cause; no proxy total is inferred.');
  const lenses = cause.coefficientFunds.map((fund) => {
    const grants = coefficient.records.filter((record) => record.listedFunds.includes(fund));
    return {
      fund, grantCount: grants.length, publishedAmountUsd: grants.reduce((sum, record) => sum + (record.amountUsd ?? 0), 0),
      latestAwardDate: latest(grants.map((record) => record.awardDate)),
      organizations: [...new Set(grants.flatMap((record) => record.recipients).map(slug))].sort(),
    };
  });
  const additive = lenses.length === 1;
  return {
    evaluatorKey: profile.key, evaluator: profile.name, coverageStatus: 'published-grant-lens', mode: 'Historical published grant flow',
    decisionDate: latest(lenses.map((lens) => lens.latestAwardDate)), retrievedAt: coefficient.source.retrievedAt,
    recommendationCount: 0, numericFundingRoomCount: 0, numericFundingRoomUsd: null,
    publishedGrantCount: additive ? lenses[0].grantCount : null,
    publishedAmountUsd: additive ? lenses[0].publishedAmountUsd : null,
    fundLenses: lenses.map((lens) => ({ fund: lens.fund, grantCount: lens.grantCount, publishedAmountUsd: lens.publishedAmountUsd, latestAwardDate: lens.latestAwardDate })),
    organizations: [...new Set(lenses.flatMap((lens) => lens.organizations))].sort(),
    criteria: profile.criteria, evidenceRegime: profile.evidenceRegime,
    fundingStatus: 'Published historical grants; not a current recommendation set, disbursement confirmation, or room-for-more-funding estimate.',
    sourceUrl: coefficient.source.url,
    note: additive ? 'The dedicated fund lens is many-to-many at the portfolio level but this row reports one lens.' : 'The two fund lenses overlap; counts and amounts remain separate and are never summed.',
  };
}

function giveWellCell(profile, cause, givewell) {
  if (cause.key !== 'global-health') return notCovered(profile, 'GiveWell’s accepted current Top Charities set in this project covers global health and development only.');
  return {
    evaluatorKey: profile.key, evaluator: profile.name, coverageStatus: 'current-direct-recommendations', mode: 'Current Top Charities',
    decisionDate: givewell.source.publishedAt, retrievedAt: givewell.source.retrievedAt,
    recommendationCount: givewell.opportunities.length, numericFundingRoomCount: givewell.opportunities.filter((record) => record.fundingRoomUsd != null).length,
    numericFundingRoomUsd: null, publishedGrantCount: null, publishedAmountUsd: null, fundLenses: [],
    organizations: givewell.opportunities.map((record) => record.slug).sort(), criteria: profile.criteria, evidenceRegime: profile.evidenceRegime,
    fundingStatus: 'Top Charities Fund allocates to current high-impact opportunities; no current organization-wide numeric gaps are published on the accepted Top Charities pages.',
    sourceUrl: givewell.source.url,
    note: 'Published cost-per-life figures are historical 2022–2024 averages, not current location-specific tranche estimates.',
  };
}

function aceCell(profile, cause, ace) {
  if (cause.key !== 'animal-welfare') return notCovered(profile, 'ACE’s accepted current recommendation set covers animal welfare only.');
  return {
    evaluatorKey: profile.key, evaluator: profile.name, coverageStatus: 'current-direct-recommendations', mode: 'Current Recommended Charities',
    decisionDate: ace.source.recommendationDate, retrievedAt: ace.source.retrievedAt,
    recommendationCount: ace.records.length, numericFundingRoomCount: ace.records.filter((record) => record.fundingRoomUsd != null).length,
    numericFundingRoomUsd: ace.records.reduce((sum, record) => sum + (record.fundingRoomUsd ?? 0), 0),
    publishedGrantCount: null, publishedAmountUsd: null, fundLenses: [], organizations: ace.records.map((record) => record.slug).sort(),
    criteria: profile.criteria, evidenceRegime: profile.evidenceRegime,
    fundingStatus: ace.summary.fundingRoomPeriodNote, sourceUrl: ace.source.url,
    note: 'Native outcome metrics and recommendation vintages remain incomparable across species, programs, and model years.',
  };
}

function givingGreenCell(profile, cause, givingGreen) {
  if (cause.key !== 'climate') return notCovered(profile, 'Giving Green’s accepted current recommendation set covers climate only.');
  const numeric = givingGreen.topRecommendations.filter((record) => record.fundingRoomUsd != null);
  return {
    evaluatorKey: profile.key, evaluator: profile.name, coverageStatus: 'current-direct-recommendations', mode: 'Current Top Climate Nonprofits',
    decisionDate: givingGreen.source.publishedAt, retrievedAt: givingGreen.source.retrievedAt,
    recommendationCount: givingGreen.topRecommendations.length, numericFundingRoomCount: numeric.length,
    numericFundingRoomUsd: numeric.reduce((sum, record) => sum + record.fundingRoomUsd, 0),
    publishedGrantCount: givingGreen.grants.length, publishedAmountUsd: givingGreen.grants.reduce((sum, record) => sum + record.amountUsd, 0),
    fundLenses: [], organizations: givingGreen.topRecommendations.map((record) => record.slug).sort(),
    criteria: profile.criteria, evidenceRegime: profile.evidenceRegime,
    fundingStatus: 'Four recommendations publish qualitative funding need only. Project InnerSpace’s $4M figure applies to the remainder of 2025 and is not treated as current 2026 room.',
    sourceUrl: givingGreen.source.url,
    note: 'The 29-row $26.063M announcement is planned grantmaking, not proof of disbursement or an effectiveness ranking.',
  };
}

function foundersPledgeCell(profile, cause, foundersPledge) {
  const rows = foundersPledge.records.filter(cause.fpFilter);
  if (!rows.length) return notCovered(profile, 'Founders Pledge has no accepted current matrix row for this cause in the project snapshot.');
  const sources = new Map(foundersPledge.sources.map((source) => [source.key, source]));
  const hasCurrentFund = rows.some((record) => record.opportunityType === 'current-pooled-fund');
  const hasPublishedRecommendation = rows.some((record) => record.opportunityType === 'published-organization-recommendation');
  return {
    evaluatorKey: profile.key, evaluator: profile.name,
    coverageStatus: hasCurrentFund && hasPublishedRecommendation ? 'current-fund-and-published-recommendations' : hasCurrentFund ? 'current-pooled-fund' : 'published-direct-recommendations',
    mode: hasCurrentFund && hasPublishedRecommendation ? 'Current pooled fund plus published recommendations' : hasCurrentFund ? 'Current pooled fund' : 'Published organization recommendations',
    decisionDate: latest(rows.map((record) => record.assessmentDate)), retrievedAt: foundersPledge.retrievedAt,
    recommendationCount: rows.length, numericFundingRoomCount: rows.filter((record) => record.fundingRoomUsd != null).length,
    numericFundingRoomUsd: null, publishedGrantCount: null, publishedAmountUsd: null, fundLenses: [],
    organizations: rows.filter((record) => record.opportunityType === 'published-organization-recommendation')
      .map((record) => foundersPledgeAliases.get(record.slug) ?? record.slug).sort(),
    criteria: profile.criteria, evidenceRegime: profile.evidenceRegime,
    fundingStatus: rows.map((record) => record.fundingStatus).join(' · '),
    sourceUrl: sources.get(rows[0].sourceKey)?.url ?? profile.methodologyUrl,
    note: 'Current pooled funds, historical models, partner-derived summaries, and organization recommendations remain distinct evidence regimes.',
  };
}

function synthesisFor(cause, cells) {
  const recommendationCells = cells.filter((cell) => cell.coverageStatus.includes('recommendation') || cell.coverageStatus.includes('fund'));
  const directSets = recommendationCells.filter((cell) => cell.organizations.length).map((cell) => ({ evaluator: cell.evaluator, values: new Set(cell.organizations) }));
  const sharedRecommendations = [];
  for (let left = 0; left < directSets.length; left += 1) {
    for (let right = left + 1; right < directSets.length; right += 1) {
      const organizations = [...directSets[left].values].filter((value) => directSets[right].values.has(value)).sort();
      if (organizations.length) sharedRecommendations.push({ evaluators: [directSets[left].evaluator, directSets[right].evaluator], organizations });
    }
  }
  const coefficient = cells.find((cell) => cell.evaluatorKey === 'coefficient');
  const recommendationGrantOverlaps = coefficient?.organizations.length ? directSets.map((set) => ({
    evaluator: set.evaluator,
    organizations: [...set.values].filter((value) => coefficient.organizations.includes(value)).sort(),
  })).filter((item) => item.organizations.length) : [];
  const statements = {
    'global-health': {
      agreement: 'GiveWell and Founders Pledge both make marginal funding use explicit; the accepted named recommendation sets do not currently overlap.',
      disagreement: 'GiveWell’s accepted set emphasizes modeled intervention-level cost-effectiveness, while Founders Pledge also represents catalytic program and partner-derived evidence.',
      decisionBoundary: 'Coefficient is evidence of historical grant flow, not a recommendation. GiveWell direct picks and Founders Pledge program or recommendation rows are different donation products.',
    },
    'animal-welfare': {
      agreement: 'ACE recommendations and Coefficient’s farm-animal-welfare grant lens both identify an active funding ecosystem; any organization overlap is recommendation–grant history, not evaluator consensus.',
      disagreement: 'ACE publishes organization assessments and incremental funding capacity; Coefficient publishes a broader historical grant portfolio without a current recipient ranking.',
      decisionBoundary: 'ACE funding-room figures cover mixed annual periods. Coefficient grant amounts cannot substitute for marginal funding room.',
    },
    climate: {
      agreement: 'Giving Green and Founders Pledge both prioritize systems-level climate work and neglected bottlenecks.',
      disagreement: 'Giving Green names five current organizations; Founders Pledge’s accepted current climate vehicle is a pooled, actively managed fund.',
      decisionBoundary: 'The direct-organization and pooled-fund products are not interchangeable, and the one stale numeric 2025 gap is not a current portfolio target.',
    },
    education: {
      agreement: 'Only Founders Pledge has accepted education recommendations in the current comparison set, so cross-evaluator agreement is not measurable.',
      disagreement: 'The two education models use different native outputs: learning gains and modeled wellbeing relative to GiveDirectly.',
      decisionBoundary: 'A missing row means no accepted current coverage, not a negative judgment by another evaluator.',
    },
    'ai-safety': {
      agreement: 'Founders Pledge’s published AI recommendations substantially overlap organizations appearing in Coefficient’s AI grant history.',
      disagreement: 'Founders Pledge exposes a small recommendation slate and pooled fund; Coefficient’s lens is a much broader historical portfolio with no current recipient rank.',
      decisionBoundary: 'Grant overlap shows prior funding alignment, not independent agreement on current marginal impact or room for funding.',
    },
    'global-catastrophic-risks': {
      agreement: 'Both represented evaluators use hits-based reasoning for low-probability, high-consequence risks.',
      disagreement: 'Founders Pledge exposes a pooled fund and two published biosecurity recommendations; Coefficient exposes overlapping GCR and biosecurity grant lenses.',
      decisionBoundary: 'Neither source publishes a common risk-reduction-per-dollar unit, and overlapping Coefficient lenses must remain non-additive.',
    },
  }[cause.key];
  return { ...statements, sharedRecommendations, recommendationGrantOverlaps };
}

export function buildEvaluatorComparison({ coefficient, givewell, ace, givingGreen, foundersPledge }, generatedAt) {
  const profiles = new Map(evaluatorProfiles.map((profile) => [profile.key, profile]));
  const causes = causeDefinitions.map((cause) => {
    const cells = [
      giveWellCell(profiles.get('givewell'), cause, givewell),
      coefficientCell(profiles.get('coefficient'), cause, coefficient),
      aceCell(profiles.get('ace'), cause, ace),
      givingGreenCell(profiles.get('giving-green'), cause, givingGreen),
      foundersPledgeCell(profiles.get('founders-pledge'), cause, foundersPledge),
    ];
    return {
      key: cause.key, label: cause.label, cells, synthesis: synthesisFor(cause, cells),
      summary: {
        representedEvaluatorCount: cells.filter((cell) => cell.coverageStatus !== 'not-covered-in-accepted-current-set').length,
        currentRecommendationEvaluatorCount: cells.filter((cell) => cell.coverageStatus.includes('recommendation') || cell.coverageStatus.includes('fund')).length,
        numericFundingRoomEvaluatorCount: cells.filter((cell) => cell.numericFundingRoomCount > 0).length,
      },
    };
  });
  const semantic = { comparisonVersion, evaluatorProfiles, causes };
  return {
    ...semantic, generatedAt, contentHash: hash(semantic),
    comparisonBoundary: 'Rows compare what each accepted source publishes for a cause. Absence is not a negative evaluation; grant history is not a recommendation; pooled funds are not direct organization picks; and native impact units remain incomparable.',
  };
}

export function validateEvaluatorComparison(snapshot) {
  if (snapshot.evaluatorProfiles.length !== 5 || snapshot.causes.length !== 6) throw new Error('Evaluator/cause coverage changed.');
  if (snapshot.causes.some((cause) => cause.cells.length !== 5)) throw new Error('Every cause must retain one explicit cell per evaluator.');
  if (snapshot.causes.flatMap((cause) => cause.cells).some((cell) => !cell.criteria.length || !cell.sourceUrl || !cell.fundingStatus)) {
    throw new Error('Comparison cells must preserve criteria, source, and funding status.');
  }
  const cell = (cause, evaluator) => snapshot.causes.find((item) => item.key === cause)?.cells.find((item) => item.evaluatorKey === evaluator);
  if (cell('global-health', 'givewell')?.recommendationCount !== 4) throw new Error('GiveWell comparison count changed.');
  if (cell('animal-welfare', 'ace')?.recommendationCount !== 10 || cell('animal-welfare', 'ace')?.numericFundingRoomUsd !== 12456000) throw new Error('ACE comparison changed.');
  if (cell('climate', 'giving-green')?.recommendationCount !== 5 || cell('climate', 'giving-green')?.publishedGrantCount !== 29) throw new Error('Giving Green comparison changed.');
  if (cell('education', 'founders-pledge')?.recommendationCount !== 2) throw new Error('Founders Pledge education comparison changed.');
  if (cell('ai-safety', 'coefficient')?.publishedGrantCount !== 630 || cell('ai-safety', 'coefficient')?.publishedAmountUsd !== 972185421) throw new Error('Coefficient AI comparison changed.');
  if (cell('ai-safety', 'founders-pledge')?.recommendationCount !== 5 || cell('global-catastrophic-risks', 'founders-pledge')?.recommendationCount !== 3) throw new Error('Founders Pledge GCR split changed.');
  const semantic = { comparisonVersion: snapshot.comparisonVersion, evaluatorProfiles: snapshot.evaluatorProfiles, causes: snapshot.causes };
  if (hash(semantic) !== snapshot.contentHash) throw new Error('Evaluator comparison content hash does not reconcile.');
  return snapshot;
}

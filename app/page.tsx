'use client';

import { useEffect, useMemo, useState } from 'react';
import giveWellSnapshot from '@/data/givewell/top-charities.json';
import renPhilSnapshot from '@/data/renphil/ai-for-math-2025.json';

type CoefficientMarket = {
  source: { retrievedAt: string; coverageNote: string; url: string };
  summary: { grant_count: number; total_amount_usd: number; latest_decision_date: number; recipient_count: number };
  recent: Array<{ external_id: string; source_url: string | null; recipient: string; recipient_slug: string; recipient_url: string | null; purpose: string; amount_usd: number; decision_date: number; status: string }>;
};

type CoefficientExplorer = {
  source: { retrievedAt: string; coverageNote: string | null; url: string; contentHash: string | null };
  summary: {
    grantCount: number; totalPublishedAmountUsd: number; uniqueRecipientCount: number; listedFundCount: number;
    grantsWithMultipleListedFunds: number; grantsWithoutListedFund: number; grantsWithoutFocusArea: number;
    grantsWithoutPublishedAmount: number; grantsWithoutRecipient: number; grantsWithoutAwardDate: number;
    futureDatedGrants: number; earliestAwardDate: string | null; latestAwardDate: string | null;
  };
  funds: Array<{ fund: string; url: string; status: string; grantCount: number; publishedAmountUsd: number; latestAwardDate: string | null }>;
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
  grants: Array<{
    sourceRecordId: string;
    sourceUrl: string | null;
    purpose: string | null;
    amountUsd: number | null;
    awardDate: string | null;
    sourcePublishedAt: string | null;
    recipients: string[];
    focusAreas: string[];
    listedFunds: string[];
  }>;
};

type GiveWellMarket = {
  source: { retrievedAt: string; url: string; coverageNote: string };
  summary: { grant_count: number; total_amount_usd: number; recipient_count: number; latest_decision_date: number; missing_amount_count: number };
  opportunities: Array<{
    organization: string; slug: string; program: string; geographies: string[]; evidenceLevel: string;
    costPerDeliveryUsd: number; deliveryUnit: string; costPerLifeSavedUsd: number | null;
    modelVersion: string; modelUrl: string; researchUrl: string; fundingRoomStatus: string;
    fundingRoomUsd: number | null; fundingRoomNote: string; limitations: string;
  }>;
};

type GiveDirectlyBenchmark = {
  retrievedAt: string;
  benchmarks: Array<{
    benchmarkKey: string; name: string; benchmarkType: 'welfare-anchor' | 'program-estimate' | 'funding-bar';
    effectiveAt: string; modelVersion: string; referenceBenchmarkKey: string | null;
    estimateLow: number; estimateHigh: number; unitName: string; unitsPerUsd: number | null;
    currencyBasis: string; populationBasis: string; assumptions: string[]; limitations: string[];
    modelUrl: string; sourceUrl: string; sourceTitle: string;
  }>;
};

type RenPhilMarket = {
  source: { retrievedAt: string; url: string; coverageNote: string };
  summary: { award_count: number; declared_award_count: number; unlisted_award_count: number; missing_amount_count: number; missing_description_count: number };
};

type AceMarket = {
  source: { retrievedAt: string; url: string; coverageNote: string };
  summary: { recommendedCharityCount: number; awardedOrRenewedIn2025: number; retainedFrom2024: number; annualFundingRoomUsd: number; fundingRoomPeriodNote: string };
  comparabilityWarning: string;
  recommendations: Array<{
    id: number; canonical_name: string; slug: string; website_url: string; evidence_level: string;
    native_metric_name: string; native_metric_value: number; native_metric_unit: string;
    funding_room_usd: number; funding_room_period: string; funding_capacity_usd: number;
    summary: string; limitations: string; model_version: string; recommendationCohort: number;
    geography: string; animalGroups: string[]; interventions: string[];
    metrics: Array<{ metric_key: string; program: string; value: number; confidence_low: number | null; confidence_high: number | null; unit: string; model_version: string; limitations: string }>;
  }>;
};

type GivingGreenMarket = {
  source: { retrievedAt: string; url: string; topListUrl: string; coverageNote: string };
  summary: { grant_count: number; announced_amount_usd: number; missing_disbursement_date_count: number; topRecommendationCount: number; otherGranteeCount: number; grantRecordCount: number; totalAnnouncedGrantUsd: number; topAnnouncedGrantUsd: number };
  comparabilityWarning: string;
  recommendations: Array<{
    canonical_name: string; slug: string; website_url: string; evidence_level: string;
    native_metric_name: string; funding_room_usd: number | null; funding_room_period: string;
    summary: string; limitations: string; model_version: string; sourceRecordId: string;
    amountUsd: number; amountLabel: string; period: string; strategies: string[]; geography: string;
    evaluationSummary: string; fundingNeed: string;
  }>;
  grants: Array<{ source_record_id: string; source_url: string; amount_usd: number; canonical_name: string; slug: string; strategies: string[] }>;
};

type FoundersPledgeMarket = {
  retrievedAt: string;
  coverageNote: string;
  comparabilityWarning: string;
  summary: { opportunityCount: number; causeAreaCount: number; currentPooledFundCount: number; publishedOrganizationRecommendationCount: number; partnerDerivedCount: number; giveDirectlyRelativeCount: number };
  opportunities: Array<{
    canonical_name: string; slug: string; source_url: string; source_title: string;
    cause: 'Education' | 'Climate' | 'Global health' | 'Global catastrophic risks';
    opportunityType: string; status: string; statusLabel: string; assessmentDate: string | null;
    evidenceModel: string; nativeMetric: string; benchmarkName: string | null; benchmarkMultiple: number | null;
    funding_room_usd: null; fundingStatus: string; summary: string; limitations: string;
  }>;
};

type AiSafetyMarket = {
  taxonomyVersion: string;
  generatedAt: string;
  source: { url: string; retrievedAt: string };
  summary: { grantCount: number; publishedAmountUsd: number; organizationCount: number; foundersPledgeOverlapCount: number; foundersPledgeOnlyCount: number };
  categories: Array<{ key: string; label: string; description: string; grantCount: number; publishedAmountUsd: number; organizationCount: number }>;
  organizations: Array<{ organization: string; slug: string; roles: string[]; primaryRole: string; grantCount: number; publishedAmountUsd: number; foundersPledgeStatus: string | null }>;
  externalOnlyRecommendations: Array<{ organization: string; slug: string; status: string }>;
  coverageNote: string;
  classificationNote: string;
};

type EvaluatorComparison = {
  comparisonVersion: string;
  generatedAt: string;
  comparisonBoundary: string;
  database: { status: string; checkedEvaluatorCount: number; sourceFreshness: Record<string, string> };
  evaluatorProfiles: Array<{ key: string; name: string; methodologyUrl: string; criteria: string[]; evidenceRegime: string }>;
  causes: Array<{
    key: string; label: string;
    summary: { representedEvaluatorCount: number; currentRecommendationEvaluatorCount: number; numericFundingRoomEvaluatorCount: number };
    synthesis: {
      agreement: string; disagreement: string; decisionBoundary: string;
      sharedRecommendations: Array<{ evaluators: string[]; organizations: string[] }>;
      recommendationGrantOverlaps: Array<{ evaluator: string; organizations: string[] }>;
    };
    cells: Array<{
      evaluatorKey: string; evaluator: string; coverageStatus: string; mode: string; decisionDate: string | null; retrievedAt: string | null;
      recommendationCount: number; numericFundingRoomCount: number; numericFundingRoomUsd: number | null;
      publishedGrantCount: number | null; publishedAmountUsd: number | null;
      fundLenses: Array<{ fund: string; grantCount: number; publishedAmountUsd: number; latestAwardDate: string | null }>;
      organizations: string[]; criteria: string[]; evidenceRegime: string; fundingStatus: string; sourceUrl: string; note: string;
    }>;
  }>;
};

type ComparableImpact = {
  version: string; updatedAt: string; nativeUnitRule: string;
  models: Array<{
    modelKey: string; name: string; status: string; sourceUnit: string; targetUnit: string;
    formula: string; modelVersion: string; effectiveAt: string | null; evaluator: string | null;
    parameters: Array<{ key: string; label: string; low: number; default: number; high: number; unit: string }>;
    assumptions: string[]; limitations: string[]; sourceUrl: string; sourceTitle: string;
  }>;
  qalyOpportunities: Array<{
    organization: string; slug: string; nativeMetricName: string; costPerLifeSavedUsd: number;
    nativeMetricUnit: string; modelVersion: string; limitations: string;
  }>;
  benchmarkTranslations: Array<{
    benchmarkKey: string; name: string; benchmarkType: string; multipleLow: number; multipleHigh: number;
    unitsPerUsdAtLow: number; unitsPerUsdAtHigh: number; modelVersion: string;
  }>;
  boundaries: Array<{ label: string; nativeUnit: string; status: string; reason: string }>;
};

type FundingTrancheMarket = {
  version: string; updatedAt: string;
  interpretation: { tranche: string; amount: string; curve: string; counterfactual: string };
  methodologySources: Array<{ publisher: string; title: string; url: string }>;
  summary: { trancheCount: number; currentNumericCount: number; amountUnpublishedCount: number; staleCount: number; closedCount: number };
  periods: Array<{ timeWindow: string; trancheCount: number; amountUsd: number }>;
  statuses: Array<{ status: string; trancheCount: number }>;
  tranches: Array<{
    trancheKey: string; evaluatorSlug: string; evaluator: string; organization: string; organizationSlug: string;
    cause: string; status: string; amountUsd: number | null; capacityUsd: number | null; timeWindow: string;
    use: string; confidenceLabel: string; confidenceBasis: string; marginalMetricName: string | null;
    marginalMetricValue: number | null; marginalMetricUnit: string | null; likelyCounterfactualFunder: string | null;
    counterfactualBasis: string; modelVersion: string; sourceUrl: string; limitations: string;
  }>;
};

type DonorPortfolio = {
  version: string; generatedAt: string;
  input: { budgetUsd: number; causeWeights: Record<string, number>; riskTolerance: string; minimumEvidence: string; geography: string; liquidity: string; timeHorizon: string };
  summary: { budgetUsd: number; allocatedUsd: number; unallocatedUsd: number; allocationCount: number; causeCount: number; verifyRoomCount: number };
  buckets: Array<{ cause: string; weight: number; requestedUsd: number; eligibleCount: number; selectedCount: number; allocatedUsd: number; unallocatedUsd: number }>;
  allocations: Array<{
    trancheKey: string; evaluatorSlug: string; evaluator: string; organization: string; organizationSlug: string; cause: string;
    status: string; amountUsd: number | null; timeWindow: string; use: string; confidenceLabel: string; confidenceBasis: string;
    marginalMetricName: string | null; marginalMetricValue: number | null; marginalMetricUnit: string | null; modelVersion: string;
    sourceUrl: string; limitations: string; evidenceLabel: string; uncertaintyProfile: string; liquidityMode: string;
    deploymentMode: string; geography: string; geographyTags: string[]; allocationUsd: number; roomVerification: string;
  }>;
  exclusions: Array<{ trancheKey: string; organization: string; cause: string; reasons: string[] }>;
  rules: { weights: string; selection: string; allocation: string; comparability: string; geography: string };
};

type SfOutcomeOntology = {
  version: string; generatedAt: string; geography: string; scopeNote: string;
  classificationRules: { outcome: string; proxy: string; output: string; counterfactual: string; equity: string; conversion: string };
  summary: { outcomeCount: number; sourceCount: number; modelRequiredCount: number; conversionBlockedCount: number; overlapCount: number };
  outcomes: Array<{
    key: string; label: string; question: string; canonicalUnit: string; observableMeasure: string; unitSemantics: string;
    population: string; timeWindow: string; direction: string; measurementState: string; attributionState: string;
    serviceOutputs: string[]; administrativeProxies: string[]; requiredInputs: string[]; allowedClaims: string[];
    blockedClaims: string[]; equityCuts: string[]; qalyState: string; wellbyState: string;
    sources: Array<{ key: string; publisher: string; title: string; url: string; publishedAt: string | null; datePrecision: string; retrievedAt: string; monitorMode: string; coverageNote: string }>;
  }>;
  overlaps: Array<{ leftKey: string; leftLabel: string; rightKey: string; rightLabel: string; risk: string; rule: string }>;
};

type GrantFlowMarket = {
  version: string; generatedAt: string; acceptedSourceRowCount: number;
  aggregationRules: { row: string; amount: string; roles: string; missingness: string; date: string };
  excludedLedgers: Array<{ key: string; label: string; reason: string; rowCount: number; allRowsInAcceptedLedger: boolean }>;
  sourceSummaries: Array<{
    key: string; label: string; publisher: string; detailSource: string; sourceUrl: string; retrievedAt: string;
    rowCount: number; publishedAmountUsd: number; statusSemantics: string;
    missingAmountCount: number; missingDateCount: number; normalizedOriginatorCount: number;
    normalizedAdvisorCount: number; namedRecipientCount: number; missingRestrictionCount: number; missingStageCount: number;
  }>;
  selectedSource: { key: string; label: string; publisher: string; sourceUrl: string; retrievedAt: string; rowCount: number; dateBasis: string };
  facets: {
    years: Array<{ value: number; count: number }>; causes: Array<{ value: string; count: number }>;
    geographies: Array<{ value: string; count: number }>; statuses: Array<{ value: string; count: number }>;
    restrictions: Array<{ value: string; count: number }>; stages: Array<{ value: string; count: number }>;
    causeCountsAreNonAdditive: boolean;
  };
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
  flows: Array<{
    sourceRecordId: string; sourceUrl: string | null; detailSource: string; amountUsd: number | null;
    status: string; eventDate: string | null; dateBasis: string; purpose: string | null; intervention: string | null;
    causeTags: string[]; geographies: string[]; stage: null; restriction: string | null;
    originatingFunder: { name: string; slug: string } | null; advisingFunder: { name: string; slug: string } | null;
    sourceListedFunders: string[]; recipients: Array<{ name: string; slug: string | null; normalized: boolean }>;
  }>;
};

type DataQuality = {
  version: string; asOfDate: string; generatedAt: string;
  freshnessRules: Array<{ state: string; maximumAgeDays: number | null; label: string }>;
  stateRules: Array<{ state: string; rule: string }>;
  rowRules: { current: string; disappeared: string; grouped: string; amounts: string };
  summary: {
    trackedSourceCount: number; currentSourceCount: number; monitorSourceCount: number; staleSourceCount: number;
    contentAddressedSourceCount: number; reviewedReferenceSourceCount: number; acceptedGrantRowCount: number;
    missingAmountCount: number; missingDateCount: number; missingRecipientCount: number; missingPurposeCount: number;
    missingSourceUrlCount: number; futureDatedCount: number; groupedObservedCount: number;
    disappearedRowCount: number; conflictCount: number; issueCount: number;
    qualityStateCounts: Record<string, number>;
  };
  fundingQuality: { trancheCount: number; amountUnpublishedCount: number; staleCount: number; closedCount: number };
  ledgers: Array<{
    key: string; label: string; publisher: string; title: string; sourceUrl: string; retrievedAt: string;
    ageDays: number; freshnessState: string; qualityState: string; statusSemantics: string; canonicalDateLabel: string;
    rowCount: number; publishedAmountUsd: number; missingAmountCount: number; missingDateCount: number;
    missingRecipientCount: number; missingPurposeCount: number; missingSourceUrlCount: number;
    groupedObservedCount: number; futureDatedCount: number; multipleRecipientCount: number;
    missingRestrictionCount: number; missingNormalizedOriginatorCount: number; missingNormalizedAdvisorCount: number;
    disappearedRowCount: number; contentState: string; coverageNote: string | null; caveats: string[];
  }>;
  issues: Array<{
    key: string; sourceKey: string; state: string; category: string; count: number | null; unit: string | null;
    title: string; description: string; sourceUrl?: string | null;
  }>;
  sources: Array<{
    publisher: string; title: string; url: string; publishedAt: string | null; retrievedAt: string;
    ageDays: number; freshnessState: string; contentState: string; coverageNote: string | null;
    objectCounts: { grants: number; assessments: number; benchmarks: number; conversionModels: number };
  }>;
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('en-US');
const month = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const day = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const awardYears = Array.from({ length: 15 }, (_, index) => 2026 - index);
const grantPath = (source: string, sourceRecordId: string) => `/grants/${source}/${encodeURIComponent(sourceRecordId)}`;
const organizationPath = (slug: string) => `/organizations/${encodeURIComponent(slug)}`;

export default function Home() {
  const [cause, setCause] = useState('All causes');
  const [query, setQuery] = useState('');
  const [coefficientMarket, setCoefficientMarket] = useState<CoefficientMarket | null>(null);
  const [coefficientError, setCoefficientError] = useState(false);
  const [giveWellMarket, setGiveWellMarket] = useState<GiveWellMarket | null>(null);
  const [giveWellError, setGiveWellError] = useState(false);
  const [giveDirectlyBenchmark, setGiveDirectlyBenchmark] = useState<GiveDirectlyBenchmark | null>(null);
  const [giveDirectlyError, setGiveDirectlyError] = useState(false);
  const [renPhilMarket, setRenPhilMarket] = useState<RenPhilMarket | null>(null);
  const [renPhilError, setRenPhilError] = useState(false);
  const [aceMarket, setAceMarket] = useState<AceMarket | null>(null);
  const [aceError, setAceError] = useState(false);
  const [givingGreenMarket, setGivingGreenMarket] = useState<GivingGreenMarket | null>(null);
  const [givingGreenError, setGivingGreenError] = useState(false);
  const [foundersPledgeMarket, setFoundersPledgeMarket] = useState<FoundersPledgeMarket | null>(null);
  const [foundersPledgeError, setFoundersPledgeError] = useState(false);
  const [aiSafetyMarket, setAiSafetyMarket] = useState<AiSafetyMarket | null>(null);
  const [aiSafetyError, setAiSafetyError] = useState(false);
  const [aiRole, setAiRole] = useState('all');
  const [aiQuery, setAiQuery] = useState('');
  const [evaluatorComparison, setEvaluatorComparison] = useState<EvaluatorComparison | null>(null);
  const [evaluatorComparisonError, setEvaluatorComparisonError] = useState(false);
  const [comparisonCause, setComparisonCause] = useState('global-health');
  const [comparableImpact, setComparableImpact] = useState<ComparableImpact | null>(null);
  const [comparableImpactError, setComparableImpactError] = useState(false);
  const [qalySlug, setQalySlug] = useState('');
  const [qalyYield, setQalyYield] = useState(30);
  const [cgPeople, setCgPeople] = useState(100);
  const [cgIncomeGain, setCgIncomeGain] = useState(10);
  const [cgYears, setCgYears] = useState(5);
  const [cgCost, setCgCost] = useState(100000);
  const [fundingTranches, setFundingTranches] = useState<FundingTrancheMarket | null>(null);
  const [fundingTranchesError, setFundingTranchesError] = useState(false);
  const [fundingView, setFundingView] = useState<'numeric' | 'unpriced' | 'boundary'>('numeric');
  const [fundingPeriod, setFundingPeriod] = useState('annual, 2026–2027');
  const [fundingEvaluator, setFundingEvaluator] = useState('all');
  const [portfolio, setPortfolio] = useState<DonorPortfolio | null>(null);
  const [portfolioError, setPortfolioError] = useState('');
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioBudget, setPortfolioBudget] = useState(10000);
  const [portfolioWeights, setPortfolioWeights] = useState<Record<string, number>>({ 'Animal welfare': 20, Climate: 20, Education: 20, 'Global catastrophic risks': 20, 'Global health': 20 });
  const [portfolioRisk, setPortfolioRisk] = useState('balanced');
  const [portfolioEvidence, setPortfolioEvidence] = useState('structured');
  const [portfolioGeography, setPortfolioGeography] = useState('any');
  const [portfolioLiquidity, setPortfolioLiquidity] = useState('pooled-ok');
  const [portfolioHorizon, setPortfolioHorizon] = useState('flexible');
  const [sfOntology, setSfOntology] = useState<SfOutcomeOntology | null>(null);
  const [sfOntologyError, setSfOntologyError] = useState(false);
  const [sfOutcomeKey, setSfOutcomeKey] = useState('housing-stability');
  const [showAllRenPhil, setShowAllRenPhil] = useState(false);
  const [explorer, setExplorer] = useState<CoefficientExplorer | null>(null);
  const [explorerError, setExplorerError] = useState(false);
  const [explorerLoading, setExplorerLoading] = useState(true);
  const [explorerFund, setExplorerFund] = useState('');
  const [explorerYear, setExplorerYear] = useState('');
  const [explorerSort, setExplorerSort] = useState<'recent' | 'largest'>('recent');
  const [explorerDraft, setExplorerDraft] = useState('');
  const [explorerQuery, setExplorerQuery] = useState('');
  const [explorerPage, setExplorerPage] = useState(1);
  const [explorerRefresh, setExplorerRefresh] = useState(0);
  const [grantFlows, setGrantFlows] = useState<GrantFlowMarket | null>(null);
  const [grantFlowsError, setGrantFlowsError] = useState(false);
  const [grantFlowsLoading, setGrantFlowsLoading] = useState(true);
  const [flowSource, setFlowSource] = useState('coefficient');
  const [flowYear, setFlowYear] = useState('');
  const [flowCause, setFlowCause] = useState('');
  const [flowGeography, setFlowGeography] = useState('');
  const [flowStatus, setFlowStatus] = useState('');
  const [flowRestriction, setFlowRestriction] = useState('');
  const [flowSort, setFlowSort] = useState<'recent' | 'largest'>('recent');
  const [flowDraft, setFlowDraft] = useState('');
  const [flowQuery, setFlowQuery] = useState('');
  const [flowPage, setFlowPage] = useState(1);
  const [flowRefresh, setFlowRefresh] = useState(0);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [dataQualityError, setDataQualityError] = useState(false);
  const [qualitySource, setQualitySource] = useState('all');
  const [qualityState, setQualityState] = useState('all');
  const [showAllQualitySources, setShowAllQualitySources] = useState(false);
  useEffect(() => {
    fetch('/api/data-quality').then((response) => {
      if (!response.ok) throw new Error('Data-quality dashboard unavailable');
      return response.json() as Promise<DataQuality>;
    }).then(setDataQuality).catch(() => setDataQualityError(true));
  }, []);
  useEffect(() => {
    const params = new URLSearchParams({ source: flowSource, page: String(flowPage), pageSize: '10', sort: flowSort });
    if (flowYear) params.set('year', flowYear);
    if (flowCause) params.set('cause', flowCause);
    if (flowGeography) params.set('geography', flowGeography);
    if (flowStatus) params.set('status', flowStatus);
    if (flowRestriction) params.set('restriction', flowRestriction);
    if (flowQuery) params.set('q', flowQuery);
    const controller = new AbortController();
    fetch(`/api/grant-flows?${params}`, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error('Grant-flow explorer unavailable');
      return response.json() as Promise<GrantFlowMarket>;
    }).then((result) => {
      setGrantFlows(result); setGrantFlowsLoading(false);
    }).catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setGrantFlowsError(true); setGrantFlowsLoading(false);
    });
    return () => controller.abort();
  }, [flowCause, flowGeography, flowPage, flowQuery, flowRefresh, flowRestriction, flowSort, flowSource, flowStatus, flowYear]);
  useEffect(() => {
    fetch('/api/funding-tranches').then((response) => {
      if (!response.ok) throw new Error('Funding tranches unavailable');
      return response.json() as Promise<FundingTrancheMarket>;
    }).then(setFundingTranches).catch(() => setFundingTranchesError(true));
  }, []);
  useEffect(() => {
    fetch('/api/sf-outcomes').then((response) => {
      if (!response.ok) throw new Error('San Francisco outcome ontology unavailable');
      return response.json() as Promise<SfOutcomeOntology>;
    }).then(setSfOntology).catch(() => setSfOntologyError(true));
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/donor-portfolio', { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budgetUsd: portfolioBudget, causeWeights: portfolioWeights, riskTolerance: portfolioRisk,
        minimumEvidence: portfolioEvidence, geography: portfolioGeography, liquidity: portfolioLiquidity, timeHorizon: portfolioHorizon }) })
      .then(async (response) => {
        const result = await response.json() as DonorPortfolio & { error?: string };
        if (!response.ok) throw new Error(result.error ?? 'Portfolio builder unavailable');
        return result;
      }).then((result) => { setPortfolio(result); setPortfolioError(''); setPortfolioLoading(false); }).catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setPortfolio(null); setPortfolioError(error instanceof Error ? error.message : 'Portfolio builder unavailable'); setPortfolioLoading(false);
      });
    return () => controller.abort();
  }, [portfolioBudget, portfolioEvidence, portfolioGeography, portfolioHorizon, portfolioLiquidity, portfolioRisk, portfolioWeights]);
  useEffect(() => {
    fetch('/api/comparable-impact').then((response) => {
      if (!response.ok) throw new Error('Comparable-impact model unavailable');
      return response.json() as Promise<ComparableImpact>;
    }).then((result) => {
      setComparableImpact(result);
      setQalySlug((current) => current || result.qalyOpportunities[0]?.slug || '');
    }).catch(() => setComparableImpactError(true));
  }, []);
  useEffect(() => {
    fetch('/api/evaluator-comparison').then((response) => {
      if (!response.ok) throw new Error('Evaluator comparison unavailable');
      return response.json() as Promise<EvaluatorComparison>;
    }).then(setEvaluatorComparison).catch(() => setEvaluatorComparisonError(true));
  }, []);
  useEffect(() => {
    fetch('/api/ai-safety').then((response) => {
      if (!response.ok) throw new Error('AI safety ecosystem unavailable');
      return response.json() as Promise<AiSafetyMarket>;
    }).then(setAiSafetyMarket).catch(() => setAiSafetyError(true));
  }, []);
  useEffect(() => {
    fetch('/api/founders-pledge').then((response) => {
      if (!response.ok) throw new Error('Founders Pledge matrix unavailable');
      return response.json() as Promise<FoundersPledgeMarket>;
    }).then(setFoundersPledgeMarket).catch(() => setFoundersPledgeError(true));
  }, []);
  useEffect(() => {
    fetch('/api/giving-green').then((response) => {
      if (!response.ok) throw new Error('Giving Green market unavailable');
      return response.json() as Promise<GivingGreenMarket>;
    }).then(setGivingGreenMarket).catch(() => setGivingGreenError(true));
  }, []);
  useEffect(() => {
    fetch('/api/ace').then((response) => {
      if (!response.ok) throw new Error('ACE market unavailable');
      return response.json() as Promise<AceMarket>;
    }).then(setAceMarket).catch(() => setAceError(true));
  }, []);
  useEffect(() => {
    fetch('/api/coefficient-grants').then((response) => {
      if (!response.ok) throw new Error('Grant market unavailable');
      return response.json() as Promise<CoefficientMarket>;
    }).then(setCoefficientMarket).catch(() => setCoefficientError(true));
  }, []);
  useEffect(() => {
    fetch('/api/renphil').then((response) => {
      if (!response.ok) throw new Error('RenPhil market unavailable');
      return response.json() as Promise<RenPhilMarket>;
    }).then(setRenPhilMarket).catch(() => setRenPhilError(true));
  }, []);
  useEffect(() => {
    fetch('/api/givewell').then((response) => {
      if (!response.ok) throw new Error('GiveWell market unavailable');
      return response.json() as Promise<GiveWellMarket>;
    }).then(setGiveWellMarket).catch(() => setGiveWellError(true));
  }, []);
  useEffect(() => {
    fetch('/api/givedirectly').then((response) => {
      if (!response.ok) throw new Error('GiveDirectly benchmark unavailable');
      return response.json() as Promise<GiveDirectlyBenchmark>;
    }).then(setGiveDirectlyBenchmark).catch(() => setGiveDirectlyError(true));
  }, []);
  useEffect(() => {
    const params = new URLSearchParams({ page: String(explorerPage), pageSize: '12', sort: explorerSort });
    if (explorerFund) params.set('fund', explorerFund);
    if (explorerYear) params.set('year', explorerYear);
    if (explorerQuery) params.set('q', explorerQuery);
    const controller = new AbortController();
    fetch(`/api/coefficient-grants/all?${params}`, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error('Complete grant ledger unavailable');
      return response.json() as Promise<CoefficientExplorer>;
    }).then((result) => {
      setExplorer(result);
      setExplorerLoading(false);
    }).catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setExplorerError(true);
      setExplorerLoading(false);
    });
    return () => controller.abort();
  }, [explorerFund, explorerPage, explorerQuery, explorerRefresh, explorerSort, explorerYear]);
  const beginExplorerUpdate = () => {
    setExplorerLoading(true);
    setExplorerError(false);
    setExplorerRefresh((value) => value + 1);
  };
  const beginFlowUpdate = () => {
    setGrantFlowsLoading(true); setGrantFlowsError(false); setFlowRefresh((value) => value + 1);
  };
  const resetFlowFilters = (source = flowSource) => {
    setGrantFlowsLoading(true); setGrantFlowsError(false); setFlowSource(source); setFlowYear(''); setFlowCause('');
    setFlowGeography(''); setFlowStatus(''); setFlowRestriction(''); setFlowDraft(''); setFlowQuery(''); setFlowPage(1);
  };
  const filteredQualityIssues = useMemo(() => (dataQuality?.issues ?? []).filter((issue) =>
    (qualitySource === 'all' || issue.sourceKey === qualitySource) && (qualityState === 'all' || issue.state === qualityState)),
  [dataQuality, qualitySource, qualityState]);
  const acceptedOpportunities = useMemo(() => [...(giveWellMarket?.opportunities ?? []).map((opportunity) => ({
    name: opportunity.organization,
    slug: opportunity.slug,
    intervention: opportunity.program,
    cause: 'Global health',
    evidence: opportunity.evidenceLevel,
    impact: opportunity.costPerLifeSavedUsd == null ? 'Not published' : `${compactMoney.format(opportunity.costPerLifeSavedUsd)} / life`,
    room: opportunity.fundingRoomUsd == null ? opportunity.fundingRoomStatus.replaceAll('-', ' ') : money.format(opportunity.fundingRoomUsd),
    source: 'GiveWell',
    href: opportunity.researchUrl,
  })), ...(aceMarket?.recommendations ?? []).map((opportunity) => ({
    name: opportunity.canonical_name,
    slug: opportunity.slug,
    intervention: opportunity.native_metric_name,
    cause: 'Animal welfare',
    evidence: opportunity.evidence_level,
    impact: `${integer.format(opportunity.native_metric_value)} ${opportunity.native_metric_unit}`,
    room: money.format(opportunity.funding_room_usd),
    source: 'Animal Charity Evaluators',
    href: opportunity.website_url,
  })), ...(givingGreenMarket?.recommendations ?? []).map((opportunity) => ({
    name: opportunity.canonical_name,
    slug: opportunity.slug,
    intervention: opportunity.strategies.join(' · '),
    cause: 'Climate',
    evidence: opportunity.evidence_level,
    impact: 'Qualitative systems-change case',
    room: opportunity.funding_room_usd == null ? 'Qualitative need published' : money.format(opportunity.funding_room_usd),
    source: 'Giving Green',
    href: opportunity.website_url,
  })), ...(foundersPledgeMarket?.opportunities ?? []).map((opportunity) => ({
    name: opportunity.canonical_name,
    slug: opportunity.slug,
    intervention: opportunity.evidenceModel,
    cause: opportunity.cause,
    evidence: opportunity.statusLabel,
    impact: opportunity.benchmarkMultiple == null ? opportunity.nativeMetric : `${opportunity.benchmarkMultiple}× GiveDirectly`,
    room: opportunity.fundingStatus,
    source: 'Founders Pledge',
    href: opportunity.source_url,
  }))].map((opportunity, index) => ({ ...opportunity, rank: index + 1 })), [aceMarket, foundersPledgeMarket, giveWellMarket, givingGreenMarket]);
  const filtered = useMemo(() => acceptedOpportunities.filter((item) =>
    (cause === 'All causes' || item.cause === cause) &&
    `${item.name} ${item.intervention} ${item.source}`.toLowerCase().includes(query.toLowerCase())
  ), [acceptedOpportunities, cause, query]);
  const flowMetrics = useMemo(() => {
    const values = [
      { name: 'Coefficient public index', amount: explorer?.summary.totalPublishedAmountUsd ?? null, records: explorer?.summary.grantCount ?? null, note: 'published row amounts; complete public index', color: '#8e6cf0' },
      { name: 'GiveWell grant export', amount: giveWellMarket?.summary.total_amount_usd ?? null, records: giveWellMarket?.summary.grant_count ?? null, note: 'published grant rows; separate publisher export', color: '#38a679' },
      { name: 'Coefficient EGC subset', amount: coefficientMarket?.summary.total_amount_usd ?? null, records: coefficientMarket?.summary.grant_count ?? null, note: 'fully overlaps the public index; never summed', color: '#ff7657' },
      { name: 'Giving Green 2025 cycle', amount: givingGreenMarket?.summary.announced_amount_usd ?? null, records: givingGreenMarket?.summary.grant_count ?? null, note: 'planned grants; announcement is not proof of payment', color: '#8cbf45' },
      { name: 'RenPhil AI for Math', amount: null, records: renPhilMarket?.summary.award_count ?? null, note: 'row-level amounts not published', color: '#e2a72e' },
    ];
    const maximum = Math.max(...values.map((item) => item.amount ?? 0), 1);
    return values.map((item) => ({ ...item, width: item.amount == null ? 0 : Math.max(3, (item.amount / maximum) * 100) }));
  }, [coefficientMarket, explorer, giveWellMarket, givingGreenMarket, renPhilMarket]);
  const reviewedAt = explorer?.source.retrievedAt ? month.format(new Date(explorer.source.retrievedAt)) : null;
  const visibleAiOrganizations = useMemo(() => (aiSafetyMarket?.organizations ?? []).filter((organization) =>
    (aiRole === 'all' || organization.roles.includes(aiRole)) &&
    `${organization.organization} ${organization.roles.join(' ')}`.toLowerCase().includes(aiQuery.toLowerCase())
  ).slice(0, 24), [aiQuery, aiRole, aiSafetyMarket]);
  const selectedComparison = evaluatorComparison?.causes.find((item) => item.key === comparisonCause) ?? evaluatorComparison?.causes[0] ?? null;
  const selectedQalyOpportunity = comparableImpact?.qalyOpportunities.find((item) => item.slug === qalySlug) ?? comparableImpact?.qalyOpportunities[0] ?? null;
  const selectedSfOutcome = sfOntology?.outcomes.find((item) => item.key === sfOutcomeKey) ?? sfOntology?.outcomes[0] ?? null;
  const selectedSfOverlaps = sfOntology?.overlaps.filter((item) => item.leftKey === selectedSfOutcome?.key || item.rightKey === selectedSfOutcome?.key) ?? [];
  const qalyCost = selectedQalyOpportunity ? selectedQalyOpportunity.costPerLifeSavedUsd / qalyYield : null;
  const qalyLowCost = selectedQalyOpportunity ? selectedQalyOpportunity.costPerLifeSavedUsd / 50 : null;
  const qalyHighCost = selectedQalyOpportunity ? selectedQalyOpportunity.costPerLifeSavedUsd / 20 : null;
  const cgValue = 50000 * cgPeople * Math.log1p(cgIncomeGain / 100) * cgYears;
  const cgSroi = cgValue / cgCost;
  const visibleFundingTranches = useMemo(() => (fundingTranches?.tranches ?? []).filter((tranche) => {
    if (fundingEvaluator !== 'all' && tranche.evaluatorSlug !== fundingEvaluator) return false;
    if (fundingView === 'numeric') return tranche.status === 'published-numeric-current-period' && tranche.timeWindow === fundingPeriod;
    if (fundingView === 'unpriced') return ['accepting-amount-unpublished', 'rolling-allocation-amount-unpublished', 'qualitative-need-amount-unpublished', 'published-recommendation-gap-unpublished'].includes(tranche.status);
    return ['stale-published-gap', 'closed-or-contact-required'].includes(tranche.status);
  }), [fundingEvaluator, fundingPeriod, fundingTranches, fundingView]);
  const visibleFundingTotal = visibleFundingTranches.reduce((sum, tranche) => sum + (tranche.amountUsd ?? 0), 0);
  const visibleFundingMax = Math.max(1, ...visibleFundingTranches.map((tranche) => tranche.amountUsd ?? 0));

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Market for Impact home">
          <span className="brand-mark">M</span>
          <span>Market for Impact</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#portfolio">Build a portfolio</a>
          <a href="#san-francisco">San Francisco</a>
          <a href="#opportunities">Opportunities</a>
          <a href="#evaluator-comparison">Compare evaluators</a>
          <a href="#funding-curve">Funding room</a>
          <a href="#flows">Funding flows</a>
          <a href="#data-quality">Data quality</a>
        </nav>
        <button className="outline-button">Explore the market <span>↗</span></button>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span className="live-dot" /> Independent impact intelligence</div>
        <h1>Put every dollar<br />where it matters most.</h1>
        <p className="hero-copy">A living market of the world’s most promising funding opportunities—compared across evidence, expected impact, and room for more funding.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#portfolio">Build a portfolio <span>→</span></a>
          <a className="text-link" href="#methodology">How we compare impact</a>
        </div>
        <div className="hero-stats" aria-label="Dataset summary">
          <div><strong>{explorer ? integer.format(explorer.summary.grantCount) : '—'}</strong><span>accepted Coefficient rows</span></div>
          <div><strong>{explorer ? compactMoney.format(explorer.summary.totalPublishedAmountUsd) : '—'}</strong><span>published row amounts</span></div>
          <div><strong>{explorer ? integer.format(explorer.summary.listedFundCount) : '—'}</strong><span>fund lenses in the ledger</span></div>
          <div><strong>{reviewedAt ?? '—'}</strong><span>database snapshot retrieved</span></div>
        </div>
      </section>

      <section className="portfolio-section" id="portfolio">
        <div className="portfolio-heading">
          <div><p className="kicker">YOUR GIVING, MADE EXPLICIT</p><h2>Build a portfolio.<br />Keep every assumption visible.</h2></div>
          <p>This is an allocation worksheet, not an impact ranking. Your cause weights set the dollars; evidence and practical constraints determine which accepted opportunities can receive them.</p>
        </div>
        <div className="portfolio-shell">
          <aside className="portfolio-controls">
            <div className="portfolio-budget"><label htmlFor="portfolio-budget">Giving budget</label><div><span>$</span><input id="portfolio-budget" type="number" min="100" max="100000000" step="100" value={portfolioBudget} onChange={(event) => setPortfolioBudget(Number(event.target.value))} /></div></div>
            <fieldset className="portfolio-weights"><legend>Cause weights</legend>
              {Object.entries(portfolioWeights).map(([portfolioCause, weight]) => <label key={portfolioCause}><span>{portfolioCause}<b>{weight}</b></span><input type="range" min="0" max="100" step="5" value={weight} aria-label={`${portfolioCause} weight`} onChange={(event) => setPortfolioWeights((current) => ({ ...current, [portfolioCause]: Number(event.target.value) }))} /></label>)}
            </fieldset>
            <div className="portfolio-selects">
              <label>Uncertainty tolerance<select value={portfolioRisk} onChange={(event) => setPortfolioRisk(event.target.value)}><option value="established">Direct models only</option><option value="balanced">Models + systems change</option><option value="exploratory">Include hits-based work</option></select></label>
              <label>Minimum evidence<select value={portfolioEvidence} onChange={(event) => setPortfolioEvidence(event.target.value)}><option value="quantified">Quantified / modeled outcomes</option><option value="structured">Structured evaluator case</option><option value="reviewed">Any accepted review</option></select></label>
              <label>Published geography<select value={portfolioGeography} onChange={(event) => setPortfolioGeography(event.target.value)}><option value="any">Any or unpublished</option><option value="global">Global / multi-region</option><option value="africa">Africa named</option><option value="asia">Asia named</option><option value="latin-america">Latin America named</option><option value="europe">Europe named</option><option value="north-america">North America named</option></select></label>
              <label>Giving vehicle<select value={portfolioLiquidity} onChange={(event) => setPortfolioLiquidity(event.target.value)}><option value="pooled-ok">Direct or pooled</option><option value="direct-only">Direct organizations only</option></select></label>
              <label>Deployment horizon<select value={portfolioHorizon} onChange={(event) => setPortfolioHorizon(event.target.value)}><option value="within-year">Published within one year</option><option value="annual">Within-year or annual</option><option value="flexible">Flexible / unpublished timing</option></select></label>
            </div>
          </aside>
          <div className="portfolio-output" aria-live="polite">
            <div className="portfolio-summary">
              <div><span>PROPOSED</span><strong>{portfolio ? money.format(portfolio.summary.allocatedUsd) : '—'}</strong><small>{portfolio ? `${portfolio.summary.allocationCount} source-backed opportunities` : 'Building from current evidence…'}</small></div>
              <div><span>UNALLOCATED</span><strong>{portfolio ? money.format(portfolio.summary.unallocatedUsd) : '—'}</strong><small>Never redistributed across causes silently</small></div>
              <div><span>VERIFY ROOM</span><strong>{portfolio ? integer.format(portfolio.summary.verifyRoomCount) : '—'}</strong><small>Selections without a published numeric cap</small></div>
            </div>
            {portfolioLoading && <p className="portfolio-loading">Reapplying your explicit constraints…</p>}
            {!portfolioLoading && portfolioError && <p className="portfolio-loading error">{portfolioError}</p>}
            {!portfolioLoading && portfolio && <>
              <div className="portfolio-buckets">
                {portfolio.buckets.filter((bucket) => bucket.weight > 0).map((bucket) => <div key={bucket.cause}><span>{bucket.cause}</span><i><em style={{ width: `${portfolio.summary.budgetUsd ? bucket.allocatedUsd / portfolio.summary.budgetUsd * 100 : 0}%` }} /></i><strong>{money.format(bucket.allocatedUsd)}</strong><small>{bucket.unallocatedUsd ? `${money.format(bucket.unallocatedUsd)} held back · ${bucket.eligibleCount} eligible` : `${bucket.selectedCount} selected · weight ${bucket.weight}`}</small></div>)}
              </div>
              <div className="portfolio-allocations">
                {portfolio.allocations.map((item, index) => <article key={item.trancheKey}>
                  <div className="portfolio-allocation-index"><span>{String(index + 1).padStart(2, '0')}</span><b>{item.cause}</b></div>
                  <div className="portfolio-allocation-main">
                    <header><div><span>{item.evaluator}</span><h3>{item.organization}</h3></div><strong>{money.format(item.allocationUsd)}</strong></header>
                    <div className="portfolio-rationale"><p><b>WHY ELIGIBLE</b>{item.evidenceLabel} · {item.uncertaintyProfile.replaceAll('-', ' ')} · {item.liquidityMode.replaceAll('-', ' ')}</p><p><b>USE</b>{item.use}</p><p><b>GEOGRAPHY</b>{item.geography}</p></div>
                    <div className="portfolio-allocation-footer"><span className={item.roomVerification === 'verify-current-room-before-giving' ? 'verify' : ''}>{item.roomVerification.replaceAll('-', ' ')}</span><span>{item.timeWindow}</span><a href={item.sourceUrl} target="_blank" rel="noreferrer">Evaluator source ↗</a><a href={`/organizations/${item.organizationSlug}`}>Evidence profile →</a></div>
                  </div>
                </article>)}
                {portfolio.allocations.length === 0 && <p className="portfolio-empty">No accepted current opportunity passes every chosen constraint. The requested cause dollars remain unallocated; loosen a constraint or inspect the boundaries below.</p>}
              </div>
              <div className="portfolio-boundaries">
                {portfolio.buckets.filter((bucket) => bucket.weight > 0).map((bucket) => <p key={bucket.cause}><strong>{bucket.cause}.</strong> {bucket.eligibleCount ? `${bucket.eligibleCount} eligible; ${bucket.selectedCount} selected under the three-opportunity diversification cap.` : `No eligible candidate; ${money.format(bucket.unallocatedUsd)} stays unallocated.`}</p>)}
              </div>
              <div className="portfolio-rules"><span>ALLOCATION CONTRACT</span><p><strong>Weights.</strong> {portfolio.rules.weights}</p><p><strong>Selection.</strong> {portfolio.rules.selection}</p><p><strong>Comparability.</strong> {portfolio.rules.comparability}</p></div>
              <p className="data-note">{portfolio.version} · {integer.format(portfolio.exclusions.length)} candidates excluded by current constraints · illustrative allocation only · confirm current room and donation mechanics with the evaluator before giving</p>
            </>}
          </div>
        </div>
      </section>

      <section className="sf-outcomes-section" id="san-francisco">
        <div className="sf-outcomes-heading">
          <div><p className="kicker">SAN FRANCISCO OUTCOME CONTRACT</p><h2>A local dollar needs<br />a local outcome.</h2></div>
          <p>Before ranking organizations, define what success means. This first ontology keeps durable outcomes separate from administrative proxies and delivered services—and blocks donor-attribution and health conversions until the required model exists.</p>
        </div>
        <div className="sf-outcomes-summary" aria-label="San Francisco outcome ontology summary">
          <div><span>OUTCOMES DEFINED</span><strong>{sfOntology ? integer.format(sfOntology.summary.outcomeCount) : '—'}</strong><small>Mutually legible, not necessarily additive</small></div>
          <div><span>OFFICIAL SOURCES</span><strong>{sfOntology ? integer.format(sfOntology.summary.sourceCount) : '—'}</strong><small>City, federal, and school-system definitions</small></div>
          <div><span>MODEL REQUIRED</span><strong>{sfOntology ? integer.format(sfOntology.summary.modelRequiredCount) : '—'}</strong><small>Days avoided and deaths averted</small></div>
          <div><span>QALY / WELLBY BLOCKED</span><strong>{sfOntology ? `${integer.format(sfOntology.summary.conversionBlockedCount)} / 8` : '—'}</strong><small>Until a versioned local conversion exists</small></div>
        </div>
        {sfOntologyError && <p className="sf-outcomes-loading error">The San Francisco measurement contract is temporarily unavailable.</p>}
        {!sfOntology && !sfOntologyError && <p className="sf-outcomes-loading">Loading the versioned local measurement contract…</p>}
        {sfOntology && selectedSfOutcome && <>
          <div className="sf-outcome-tabs" role="tablist" aria-label="Choose a San Francisco outcome">
            {sfOntology.outcomes.map((item, index) => <button type="button" role="tab" aria-selected={item.key === selectedSfOutcome.key} className={item.key === selectedSfOutcome.key ? 'active' : ''} key={item.key} onClick={() => setSfOutcomeKey(item.key)}><b>{String(index + 1).padStart(2, '0')}</b><span>{item.label}</span><small>{item.measurementState.replaceAll('-', ' ')}</small></button>)}
          </div>
          <article className="sf-outcome-card">
            <header>
              <div><span>SELECTED OUTCOME</span><h3>{selectedSfOutcome.label}</h3><p>{selectedSfOutcome.question}</p></div>
              <div className="sf-outcome-status"><span>{selectedSfOutcome.measurementState.replaceAll('-', ' ')}</span><span>{selectedSfOutcome.attributionState.replaceAll('-', ' ')}</span><span className="blocked">QALY blocked</span><span className="blocked">WELLBY blocked</span></div>
            </header>
            <div className="sf-outcome-definition">
              <div><span>CANONICAL UNIT</span><strong>{selectedSfOutcome.canonicalUnit}</strong><p>{selectedSfOutcome.unitSemantics}</p></div>
              <div><span>OBSERVABLE MEASURE</span><p>{selectedSfOutcome.observableMeasure}</p></div>
              <div><span>POPULATION</span><p>{selectedSfOutcome.population}</p></div>
              <div><span>FOLLOW-UP WINDOW</span><p>{selectedSfOutcome.timeWindow}</p></div>
            </div>
            <div className="sf-separation-grid">
              <section><span>SERVICE OUTPUTS</span><h4>What was delivered</h4><ul>{selectedSfOutcome.serviceOutputs.map((item) => <li key={item}>{item}</li>)}</ul></section>
              <section><span>ADMINISTRATIVE PROXIES</span><h4>Signals, not proof</h4><ul>{selectedSfOutcome.administrativeProxies.map((item) => <li key={item}>{item}</li>)}</ul></section>
              <section><span>REQUIRED MODEL INPUTS</span><h4>Needed for attribution</h4><ul>{selectedSfOutcome.requiredInputs.map((item) => <li key={item}>{item}</li>)}</ul></section>
            </div>
            <div className="sf-claims-grid">
              <section><span>SAFE TO REPORT</span>{selectedSfOutcome.allowedClaims.map((item) => <p key={item}>✓ {item}</p>)}</section>
              <section><span>CLAIMS BLOCKED</span>{selectedSfOutcome.blockedClaims.map((item) => <p key={item}>× {item}</p>)}</section>
              <section><span>EQUITY CUTS</span><p>{selectedSfOutcome.equityCuts.join(' · ')}</p></section>
            </div>
          </article>
          <div className="sf-evidence-grid">
            <section>
              <div className="sf-subheading"><span>SOURCE TRAIL</span><b>{selectedSfOutcome.sources.length} linked definitions</b></div>
              <div className="sf-source-list">{selectedSfOutcome.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.key}><span>{source.publisher}</span><strong>{source.title}</strong><small>{source.coverageNote}</small><b>↗</b></a>)}</div>
            </section>
            <section>
              <div className="sf-subheading"><span>DOUBLE-COUNT REGISTER</span><b>{selectedSfOverlaps.length} relevant boundaries</b></div>
              <div className="sf-overlap-list">{selectedSfOverlaps.map((item) => { const pairedLabel = item.leftKey === selectedSfOutcome.key ? item.rightLabel : item.leftLabel; return <article key={`${item.leftKey}-${item.rightKey}`}><span>WITH {pairedLabel}</span><p>{item.risk}</p><strong>{item.rule}</strong></article>; })}{selectedSfOverlaps.length === 0 && <p>No registered overlap for this outcome.</p>}</div>
            </section>
          </div>
          <div className="sf-classification-rule">
            <span>CLASSIFICATION RULE</span><p><strong>Outcome.</strong> {sfOntology.classificationRules.outcome}</p><p><strong>Counterfactual.</strong> {sfOntology.classificationRules.counterfactual}</p><p><strong>Conversion.</strong> {sfOntology.classificationRules.conversion}</p>
          </div>
          <p className="data-note">{sfOntology.version} · {sfOntology.geography} · {sfOntology.scopeNote}</p>
        </>}
      </section>

      <section className="market-section" id="opportunities">
        <div className="section-heading">
          <div>
            <p className="kicker">THE OPPORTUNITY MARKET</p>
            <h2>Compare the next dollar.</h2>
          </div>
          <p>These are research leads, not a universal ranking. Unlike outcomes stay visibly unlike until a defensible conversion is available.</p>
        </div>

        <div className="filters">
          <label className="search"><span>⌕</span><input aria-label="Search opportunities" placeholder="Search organizations, interventions, or evaluators" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className="select-wrap">Cause area<select aria-label="Filter by cause" value={cause} onChange={(event) => setCause(event.target.value)}><option>All causes</option><option>Global health</option><option>Climate</option><option>Animal welfare</option><option>Education</option><option>AI safety</option><option>Global catastrophic risks</option></select></label>
          <button className="filter-button">More filters <span>＋</span></button>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Opportunity</th><th>Cause</th><th>Evidence</th><th>Published metric</th><th>Room for funding</th><th>Research source</th><th /></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.name}>
                  <td className="rank">{item.rank}</td>
                  <td><strong>{item.name}</strong><span className="subline">{item.intervention}</span></td>
                  <td><span className={`cause-pill ${item.cause.toLowerCase().replace(' ', '-')}`}>{item.cause}</span></td>
                  <td><span className="evidence-dot" />{item.evidence}</td>
                  <td className="mono">{item.impact}</td>
                  <td className="mono">{item.room}</td>
                  <td>{item.source}</td>
                  <td><a className="row-arrow" aria-label={`View source for ${item.name}`} href={item.href} target="_blank" rel="noreferrer">↗</a></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="empty">{giveWellError ? 'The accepted assessment ledger is temporarily unavailable.' : giveWellMarket ? 'No accepted opportunities match those filters.' : 'Loading accepted opportunity assessments…'}</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="data-note">This table contains accepted assessment rows materialized in the ledger, including current recommendations, pooled funds, and explicitly labeled published research. Metrics preserve each evaluator’s native unit; unlike outcomes are deliberately not collapsed into a universal score.</p>
      </section>

      <section className="evaluator-comparison-section" id="evaluator-comparison">
        <div className="evaluator-comparison-heading">
          <div><p className="kicker">THE EVALUATOR MAP</p><h2>One cause.<br />Five different questions.</h2></div>
          <p>Compare what each evaluator actually publishes: direct recommendations, pooled funds, historical grant lenses, decision criteria, evidence date, and marginal funding status. Empty cells stay explicit.</p>
        </div>
        <div className="comparison-cause-tabs" role="tablist" aria-label="Choose cause for evaluator comparison">
          {(evaluatorComparison?.causes ?? []).map((item) => <button type="button" role="tab" aria-selected={item.key === comparisonCause} className={item.key === comparisonCause ? 'active' : ''} key={item.key} onClick={() => setComparisonCause(item.key)}><span>{item.label}</span><b>{item.summary.representedEvaluatorCount}/5 represented</b></button>)}
        </div>
        {selectedComparison && <>
          <div className="comparison-summary" aria-label={`${selectedComparison.label} evaluator comparison summary`}>
            <div><span>CAUSE</span><strong>{selectedComparison.label}</strong></div>
            <div><span>REPRESENTED</span><strong>{selectedComparison.summary.representedEvaluatorCount} of 5</strong><small>Accepted current source coverage</small></div>
            <div><span>RECOMMENDATION SOURCES</span><strong>{selectedComparison.summary.currentRecommendationEvaluatorCount}</strong><small>Direct picks or active pooled funds</small></div>
            <div><span>NUMERIC FUNDING ROOM</span><strong>{selectedComparison.summary.numericFundingRoomEvaluatorCount}</strong><small>Evaluators publishing at least one figure</small></div>
          </div>
          <div className="comparison-synthesis">
            <article><span>AGREEMENT</span><p>{selectedComparison.synthesis.agreement}</p></article>
            <article><span>DIFFERENCE</span><p>{selectedComparison.synthesis.disagreement}</p></article>
            <article><span>DECISION BOUNDARY</span><p>{selectedComparison.synthesis.decisionBoundary}</p></article>
          </div>
          <div className="comparison-cards">
            {selectedComparison.cells.map((cell) => (
              <article className={cell.coverageStatus === 'not-covered-in-accepted-current-set' ? 'comparison-card empty-cell' : 'comparison-card'} key={cell.evaluatorKey}>
                <div className="comparison-card-status"><span>{cell.coverageStatus.replaceAll('-', ' ')}</span><b>{cell.decisionDate ? shortDay.format(new Date(cell.decisionDate)) : 'No decision date'}</b></div>
                <h3>{cell.evaluator}</h3>
                <p className="comparison-mode">{cell.mode}</p>
                <div className="comparison-signal">
                  {cell.coverageStatus === 'not-covered-in-accepted-current-set' ? <><strong>—</strong><span>No accepted cause row</span></> : cell.recommendationCount > 0 ? <><strong>{integer.format(cell.recommendationCount)}</strong><span>accepted opportunities</span></> : cell.publishedGrantCount != null ? <><strong>{compactMoney.format(cell.publishedAmountUsd ?? 0)}</strong><span>{integer.format(cell.publishedGrantCount)} published grants</span></> : <><strong>{integer.format(cell.fundLenses.length)}</strong><span>overlapping grant lenses</span></>}
                </div>
                {cell.fundLenses.length > 1 && <div className="comparison-lenses">{cell.fundLenses.map((lens) => <span key={lens.fund}>{lens.fund} · {integer.format(lens.grantCount)} · {compactMoney.format(lens.publishedAmountUsd)}</span>)}</div>}
                <div className="comparison-criteria"><span>DECISION CRITERIA</span><p>{cell.criteria.join(' · ')}</p></div>
                <p className="comparison-funding"><strong>Funding status.</strong> {cell.fundingStatus}</p>
                <p className="comparison-note">{cell.note}</p>
                <a href={cell.sourceUrl} target="_blank" rel="noreferrer">Trace the method ↗</a>
              </article>
            ))}
          </div>
          <div className="comparison-overlap">
            <span>RECOMMENDATION ↔ GRANT HISTORY</span>
            {selectedComparison.synthesis.recommendationGrantOverlaps.length ? selectedComparison.synthesis.recommendationGrantOverlaps.map((overlap) => <p key={overlap.evaluator}><strong>{overlap.evaluator}:</strong> {integer.format(overlap.organizations.length)} named recommendation{overlap.organizations.length === 1 ? '' : 's'} also appear in Coefficient’s cause lens. This is prior-funding alignment, not current evaluator agreement.</p>) : <p>No auditable recommendation–grant-history overlap is available for this cause in the accepted comparison set.</p>}
          </div>
        </>}
        {!evaluatorComparison && <p className="market-loading">{evaluatorComparisonError ? 'The evaluator comparison is temporarily unavailable.' : 'Reconciling five evaluator sources against the accepted database…'}</p>}
        <p className="data-note">{evaluatorComparison ? `D1 ${evaluatorComparison.database.status} · matrix generated ${day.format(new Date(evaluatorComparison.generatedAt))}` : 'Loading source reconciliation…'} · Absence is not a negative evaluation · Grant history is not a recommendation · Native outcome units remain incomparable</p>
      </section>

      <section className="impact-lab-section" id="impact-lab">
        <div className="impact-lab-heading">
          <div><p className="kicker">COMPARABLE IMPACT · V0.1</p><h2>Translate with assumptions.<br />Never erase the native unit.</h2></div>
          <p>QALYs, WELLBYs, $CG, and cash-benchmark multiples are different models—not interchangeable labels. This lab exposes the formula and uncertainty, then refuses conversions whose required evidence is absent.</p>
        </div>
        {comparableImpact && <>
          <div className="impact-rule"><span>SOURCE-OF-TRUTH RULE</span><strong>{comparableImpact.nativeUnitRule}</strong><b>{comparableImpact.models.length} versioned models · {comparableImpact.boundaries.length} explicit boundaries</b></div>
          <div className="impact-calculators">
            <article className="impact-calculator qaly-calculator">
              <div className="impact-model-label"><span>ILLUSTRATIVE</span><b>Life saved → QALY</b></div>
              <h3>How much hinges on the life-years assumption?</h3>
              <label>GiveWell opportunity<select aria-label="Choose a GiveWell opportunity for QALY sensitivity" value={qalySlug} onChange={(event) => setQalySlug(event.target.value)}>{comparableImpact.qalyOpportunities.map((item) => <option value={item.slug} key={item.slug}>{item.organization}</option>)}</select></label>
              <label>Assumed QALYs per life saved <output>{qalyYield}</output><select aria-label="Assumed QALYs per life saved" value={qalyYield} onChange={(event) => setQalyYield(Number(event.target.value))}>{[20, 25, 30, 35, 40, 45, 50].map((value) => <option value={value} key={value}>{value} QALYs</option>)}</select></label>
              <div className="impact-result"><span>Illustrative result</span><strong>{qalyCost == null ? '—' : `${money.format(qalyCost)} / QALY`}</strong><small>{selectedQalyOpportunity ? `${money.format(selectedQalyOpportunity.costPerLifeSavedUsd)} per life ÷ ${qalyYield} user-supplied QALYs` : 'Loading accepted native metric…'}</small></div>
              <p className="impact-range">Sensitivity at 20–50 QALYs: <b>{qalyLowCost == null || qalyHighCost == null ? '—' : `${money.format(qalyLowCost)}–${money.format(qalyHighCost)} per QALY`}</b></p>
              <p className="impact-caveat">This is not GiveWell’s published QALY estimate. It is a transparent shortcut over a historical cost-per-life average; morbidity, age, health utilities, and discounting remain unmodeled.</p>
            </article>
            <article className="impact-calculator cg-calculator">
              <div className="impact-model-label"><span>EVALUATOR-PUBLISHED FORMULA</span><b>Economic benefit → $CG</b></div>
              <h3>Make Coefficient’s welfare inputs visible.</h3>
              <div className="cg-inputs">
                <label>People<input aria-label="People affected" type="number" min="1" value={cgPeople} onChange={(event) => setCgPeople(Math.max(1, Number(event.target.value) || 1))} /></label>
                <label>Income gain<input aria-label="Annual income gain percent" type="number" min="1" value={cgIncomeGain} onChange={(event) => setCgIncomeGain(Math.max(1, Number(event.target.value) || 1))} /><span>%</span></label>
                <label>Years<input aria-label="Duration in years" type="number" min="1" value={cgYears} onChange={(event) => setCgYears(Math.max(1, Number(event.target.value) || 1))} /></label>
                <label>Cost<input aria-label="Philanthropic cost in USD" type="number" min="1" value={cgCost} onChange={(event) => setCgCost(Math.max(1, Number(event.target.value) || 1))} /><span>USD</span></label>
              </div>
              <div className="impact-result"><span>Modeled philanthropic value</span><strong>{compactMoney.format(cgValue)} $CG</strong><small>{cgSroi.toLocaleString('en-US', { maximumFractionDigits: 1 })} $CG per $1 of philanthropic cost</small></div>
              <p className="impact-formula">50,000 × people × ln(1 + income gain) × years</p>
              <p className="impact-caveat">Inputs must be causal, marginal estimates. Grant size is not evidence of people reached or income gained, so the ledger never fills these fields automatically.</p>
            </article>
          </div>
          <div className="impact-model-grid">
            {comparableImpact.models.map((model) => <article key={model.modelKey} className={`impact-model-card ${model.status}`}>
              <div><span>{model.status.replaceAll('-', ' ')}</span><b>{model.targetUnit}</b></div>
              <h3>{model.name}</h3>
              <p><strong>Formula.</strong> {model.formula}</p>
              <p><strong>Boundary.</strong> {model.limitations[0]}</p>
              <small>{model.modelVersion}</small>
              <a href={model.sourceUrl} target="_blank" rel="noreferrer">Trace the definition ↗</a>
            </article>)}
          </div>
          <div className="impact-boundaries">
            <span>NO BRIDGE, NO SCORE</span>
            {comparableImpact.boundaries.map((boundary) => <p key={boundary.label}><strong>{boundary.label}.</strong> {boundary.nativeUnit}. {boundary.reason}</p>)}
          </div>
          <p className="data-note">D1 reconciled · model registry {comparableImpact.version} · retrieved {day.format(new Date(comparableImpact.updatedAt))} · formulas, assumptions, and boundaries are versioned independently of native assessment rows</p>
        </>}
        {!comparableImpact && <p className="market-loading">{comparableImpactError ? 'The comparable-impact registry is temporarily unavailable.' : 'Loading versioned formulas and native metrics…'}</p>}
      </section>

      <section className="funding-curve-section" id="funding-curve">
        <div className="funding-curve-heading">
          <div><p className="kicker">MARGINAL FUNDING CURVE · V0.1</p><h2>The next dollar needs<br />a specific job.</h2></div>
          <p>Room for more funding is not one permanent organization score. Each row below is one source-backed amount, period, use, confidence statement, and counterfactual-funder field. Missing evidence stays missing.</p>
        </div>
        {fundingTranches && <>
          <div className="funding-curve-summary" aria-label="Funding tranche coverage summary">
            <div><span>TRANCHES MODELED</span><strong>{fundingTranches.summary.trancheCount}</strong><small>Across four evaluators</small></div>
            <div><span>CURRENT NUMERIC</span><strong>{fundingTranches.summary.currentNumericCount}</strong><small>ACE annual room only</small></div>
            <div><span>AMOUNT UNPUBLISHED</span><strong>{fundingTranches.summary.amountUnpublishedCount}</strong><small>Unknown is not zero</small></div>
            <div><span>STALE / CLOSED</span><strong>{fundingTranches.summary.staleCount + fundingTranches.summary.closedCount}</strong><small>Excluded from live totals</small></div>
          </div>
          <div className="funding-curve-controls">
            <div role="tablist" aria-label="Choose funding evidence state">
              <button type="button" role="tab" aria-selected={fundingView === 'numeric'} className={fundingView === 'numeric' ? 'active' : ''} onClick={() => { setFundingView('numeric'); setFundingEvaluator('all'); }}>Numeric room</button>
              <button type="button" role="tab" aria-selected={fundingView === 'unpriced'} className={fundingView === 'unpriced' ? 'active' : ''} onClick={() => { setFundingView('unpriced'); setFundingEvaluator('all'); }}>Amount unpublished</button>
              <button type="button" role="tab" aria-selected={fundingView === 'boundary'} className={fundingView === 'boundary' ? 'active' : ''} onClick={() => { setFundingView('boundary'); setFundingEvaluator('all'); }}>Stale or closed</button>
            </div>
            <label>Evaluator<select aria-label="Filter funding tranches by evaluator" value={fundingEvaluator} onChange={(event) => setFundingEvaluator(event.target.value)}><option value="all">All represented</option>{[...new Map(fundingTranches.tranches.map((item) => [item.evaluatorSlug, item.evaluator])).entries()].map(([slug, name]) => <option value={slug} key={slug}>{name}</option>)}</select></label>
          </div>
          {fundingView === 'numeric' && <div className="funding-period-tabs" role="tablist" aria-label="Choose funding-room period">{fundingTranches.periods.map((period) => <button type="button" role="tab" aria-selected={fundingPeriod === period.timeWindow} className={fundingPeriod === period.timeWindow ? 'active' : ''} key={period.timeWindow} onClick={() => setFundingPeriod(period.timeWindow)}><span>{period.timeWindow}</span><strong>{compactMoney.format(period.amountUsd)}</strong><small>{period.trancheCount} separate annual tranches</small></button>)}</div>}
          <div className="funding-curve-readout">
            <div><span>{fundingView === 'numeric' ? 'DISCLOSED ROOM IN THIS PERIOD' : fundingView === 'unpriced' ? 'OPEN OR LIVE, AMOUNT NOT PUBLISHED' : 'NOT IN THE LIVE FUNDING TOTAL'}</span><strong>{fundingView === 'numeric' ? compactMoney.format(visibleFundingTotal) : integer.format(visibleFundingTranches.length)}</strong></div>
            <p>{fundingView === 'numeric' ? 'This total stays inside one ACE annual period. It is not combined with the other cohort, stale climate evidence, grants, or annual capacity.' : fundingView === 'unpriced' ? 'These opportunities may be donor-relevant, but the accepted source does not support a numeric marginal tranche.' : 'A stale figure remains visible for auditability; a closed or contact-only vehicle is not shown as accepting donations.'}</p>
          </div>
          <div className="funding-tranche-list">
            {visibleFundingTranches.map((tranche, index) => <article className={`funding-tranche ${tranche.status}`} key={tranche.trancheKey}>
              <div className="tranche-index"><span>{String(index + 1).padStart(2, '0')}</span><b>{tranche.evaluator}</b></div>
              <div className="tranche-main">
                <div className="tranche-title"><div><span>{tranche.cause} · {tranche.status.replaceAll('-', ' ')}</span><h3>{tranche.organization}</h3></div><strong>{tranche.amountUsd == null ? 'Amount not published' : compactMoney.format(tranche.amountUsd)}</strong></div>
                {tranche.amountUsd != null && <div className="tranche-bar" aria-label={`${tranche.organization} amount relative to largest visible tranche`}><i style={{ width: `${Math.max(3, tranche.amountUsd / visibleFundingMax * 100)}%` }} /></div>}
                <dl>
                  <div><dt>Time window</dt><dd>{tranche.timeWindow}</dd></div>
                  <div><dt>Intended use</dt><dd>{tranche.use}</dd></div>
                  <div><dt>Marginal evidence</dt><dd>{tranche.marginalMetricValue == null ? tranche.marginalMetricName ?? 'No numeric marginal metric published' : `${integer.format(tranche.marginalMetricValue)} ${tranche.marginalMetricUnit}`}</dd></div>
                  <div><dt>Confidence</dt><dd>{tranche.confidenceLabel}</dd></div>
                  <div><dt>Likely counterfactual funder</dt><dd>{tranche.likelyCounterfactualFunder ?? 'Not published'}</dd></div>
                </dl>
                <p>{tranche.counterfactualBasis}</p>
                <a href={tranche.sourceUrl} target="_blank" rel="noreferrer">Inspect the source tranche ↗</a>
              </div>
            </article>)}
            {visibleFundingTranches.length === 0 && <p className="funding-empty">No tranches match this evidence state and evaluator.</p>}
          </div>
          <div className="funding-curve-method"><span>CURVE RULES</span><p><strong>Tranche.</strong> {fundingTranches.interpretation.tranche}</p><p><strong>Amount.</strong> {fundingTranches.interpretation.amount}</p><p><strong>Counterfactual.</strong> {fundingTranches.interpretation.counterfactual}</p></div>
          <p className="data-note">D1 reconciled · {fundingTranches.version} · refreshed {day.format(new Date(fundingTranches.updatedAt))} · period totals are deliberately non-additive</p>
        </>}
        {!fundingTranches && <p className="market-loading">{fundingTranchesError ? 'The funding-tranche market is temporarily unavailable.' : 'Reconciling marginal funding evidence…'}</p>}
      </section>

      <section className="givewell-section" id="givewell-market">
        <div className="givewell-heading">
          <div><p className="kicker">THE GIVEWELL MARKET</p><h2>{giveWellMarket ? integer.format(giveWellMarket.opportunities.length) : 'Current'} programs.<br />No fake precision.</h2></div>
          <p>GiveWell’s current Top Charities share a funding bar, but not a single donor-ready rank. We preserve each program’s evidence, native delivery unit, model version, geography, and live funding-room process.</p>
        </div>
        <div className="givewell-benchmark">
          {(giveDirectlyBenchmark?.benchmarks ?? []).map((benchmark) => (
            <div key={benchmark.benchmarkKey}>
              <span>{benchmark.benchmarkType.replace('-', ' ')}</span>
              <strong>{benchmark.estimateLow === benchmark.estimateHigh ? `${benchmark.estimateLow}×` : `${benchmark.estimateLow}–${benchmark.estimateHigh}×`} {benchmark.name}</strong>
              <p>{benchmark.benchmarkType === 'welfare-anchor' ? 'A normalized unit of welfare—not a charity.' : benchmark.benchmarkType === 'program-estimate' ? 'GiveWell’s model of the standard cash program—not all cash transfers.' : 'A changing grantmaking threshold—not a program estimate.'}</p>
            </div>
          ))}
          {!giveDirectlyBenchmark && <div className="benchmark-loading"><span>Cash comparison</span><strong>—</strong><p>{giveDirectlyError ? 'Benchmark ledger temporarily unavailable.' : 'Loading versioned benchmark definitions…'}</p></div>}
        </div>
        {giveDirectlyBenchmark && <div className="cash-benchmark-guide">
          <div className="cash-guide-copy">
            <p className="kicker">READ THE MULTIPLES CORRECTLY</p>
            <h3>GiveDirectly is a comparator.<br />It is not “1× cash.”</h3>
            <p>GiveWell replaced its named cash benchmark in November 2025 with a consumption-based welfare anchor. Its current 3–4× figure is a model of GiveDirectly’s standard Cash for Poverty Relief program; 6× is GiveWell’s current livelihoods funding bar. They answer different questions.</p>
            <a href={giveDirectlyBenchmark.benchmarks[0].sourceUrl} target="_blank" rel="noreferrer">Read GiveWell’s benchmark change ↗</a>
          </div>
          <div className="cash-guide-details">
            <article><span>MODEL POPULATION</span><p>{giveDirectlyBenchmark.benchmarks[1].populationBasis}</p><small>{giveDirectlyBenchmark.benchmarks[1].modelVersion}</small></article>
            <article><span>WELFARE BASIS</span><p>{giveDirectlyBenchmark.benchmarks[0].populationBasis}</p><small>Approximately {giveDirectlyBenchmark.benchmarks[0].unitsPerUsd} units per dollar.</small></article>
            <article className="cash-warning"><span>DO NOT CROSS THE UNITS</span><p>A donation pass-through percentage and GiveDirectly’s claimed $2.50 local-economy multiplier are not cost-effectiveness multiples. Pilot estimates also use different interventions and moral weights.</p><small>Comparing them as if they shared a denominator would be false precision.</small></article>
          </div>
        </div>}
        <div className="givewell-cards">
          {(giveWellMarket?.opportunities ?? []).map((opportunity) => (
            <article className="givewell-card" key={opportunity.slug}>
              <div className="givewell-card-top"><span>{opportunity.evidenceLevel}</span><b>{opportunity.costPerLifeSavedUsd == null ? 'Metric not published' : `${money.format(opportunity.costPerLifeSavedUsd)} / life`}</b></div>
              <h3><a href={organizationPath(opportunity.slug)}>{opportunity.organization}</a></h3>
              <p className="givewell-program">{opportunity.program}</p>
              <dl>
                <div><dt>Delivery unit</dt><dd>{money.format(opportunity.costPerDeliveryUsd)} / {opportunity.deliveryUnit}</dd></div>
                <div><dt>Model</dt><dd><a href={opportunity.modelUrl} target="_blank" rel="noreferrer">{opportunity.modelVersion} ↗</a></dd></div>
                <div><dt>Funding room</dt><dd>{opportunity.fundingRoomStatus.replaceAll('-', ' ')}</dd></div>
              </dl>
              <p className="givewell-room">{opportunity.fundingRoomNote}</p>
              <div className="givewell-card-links"><a href={organizationPath(opportunity.slug)}>Market profile →</a><a href={opportunity.researchUrl} target="_blank" rel="noreferrer">Research ↗</a><span>{opportunity.geographies.join(' · ')}</span></div>
            </article>
          ))}
          {!giveWellMarket && <p className="market-loading">{giveWellError ? 'The accepted GiveWell ledger is temporarily unavailable.' : 'Loading accepted GiveWell assessments…'}</p>}
        </div>
        <div className="givewell-notes">
          <p><strong>Historical metric.</strong> Cost-per-life figures are GiveWell’s reported averages for 2022–2024 directed funding—not literal outputs of the newer location-specific models.</p>
          <p><strong>Source discrepancy.</strong> {giveWellMarket ? `Accepted grant rows sum to ${money.format(giveWellMarket.summary.total_amount_usd)}, exactly $3 above Airtable’s displayed aggregate.` : 'The accepted row sum is exactly $3 above Airtable’s displayed aggregate.'} Both are preserved; neither is silently “fixed.”</p>
        </div>
        <p className="data-note">Top Charities updated September 2025 · Cost-effectiveness framework updated May 2026 · {giveWellMarket ? `Accepted grant rows retrieved ${day.format(new Date(giveWellMarket.source.retrievedAt))}` : giveWellError ? 'Accepted ledger temporarily unavailable' : 'Loading database freshness…'} · <a href={giveWellSnapshot.source.url} target="_blank" rel="noreferrer">Top Charities ↗</a>{giveDirectlyBenchmark && <> · <a href={giveDirectlyBenchmark.benchmarks[1].modelUrl} target="_blank" rel="noreferrer">GiveDirectly model ↗</a></>}</p>
      </section>

      <section className="ace-section" id="ace-market">
        <div className="ace-heading">
          <div><p className="kicker">THE ANIMAL WELFARE MARKET</p><h2>{aceMarket ? integer.format(aceMarket.summary.recommendedCharityCount) : 'Current'} recommendations.<br />Different animals, intact units.</h2></div>
          <p>ACE’s current set spans corporate campaigns, policy, technology, food-system work, and wild-animal research. We preserve each program’s own denominator, evaluation vintage, and uncertainty instead of manufacturing one cross-species league table.</p>
        </div>
        <div className="ace-overview" aria-label="Animal Charity Evaluators recommendation summary">
          <div><span>Current set</span><strong>{aceMarket ? integer.format(aceMarket.summary.recommendedCharityCount) : '—'}</strong><p>Recommended Charities in ACE’s 2025 set.</p></div>
          <div><span>2025 reviews</span><strong>{aceMarket ? integer.format(aceMarket.summary.awardedOrRenewedIn2025) : '—'}</strong><p>Awarded or renewed using the newer model.</p></div>
          <div><span>Retained 2024</span><strong>{aceMarket ? integer.format(aceMarket.summary.retainedFrom2024) : '—'}</strong><p>Still current under two-year status.</p></div>
          <div><span>Published annual room</span><strong>{aceMarket ? compactMoney.format(aceMarket.summary.annualFundingRoomUsd) : '—'}</strong><p>Descriptive sum across two overlapping funding periods.</p></div>
        </div>
        <div className="ace-warning"><strong>Comparability boundary.</strong> {aceMarket?.comparabilityWarning ?? 'ACE metrics retain their original units and vintages; loading accepted assessments…'}</div>
        <div className="ace-cards">
          {(aceMarket?.recommendations ?? []).map((recommendation) => (
            <article className="ace-card" key={recommendation.slug}>
              <div className="ace-card-top"><span>ACE {recommendation.recommendationCohort}</span><b>{recommendation.model_version}</b></div>
              <h3><a href={organizationPath(recommendation.slug)}>{recommendation.canonical_name}</a></h3>
              <p className="ace-geography">{recommendation.geography}</p>
              <div className="ace-headline"><strong>{integer.format(recommendation.native_metric_value)}</strong><span>{recommendation.native_metric_unit}</span><small>{recommendation.native_metric_name}</small></div>
              <dl>
                <div><dt>Incremental room</dt><dd>{compactMoney.format(recommendation.funding_room_usd)} / year</dd></div>
                <div><dt>Funding capacity</dt><dd>{compactMoney.format(recommendation.funding_capacity_usd)} / year</dd></div>
                <div><dt>Period</dt><dd>{recommendation.funding_room_period.replace('annual, ', '')}</dd></div>
              </dl>
              <p className="ace-limit">{recommendation.limitations}</p>
              <div className="ace-card-links"><a href={organizationPath(recommendation.slug)}>Market profile →</a><a href={recommendation.website_url} target="_blank" rel="noreferrer">ACE review ↗</a></div>
            </article>
          ))}
          {!aceMarket && <p className="market-loading">{aceError ? 'The accepted ACE ledger is temporarily unavailable.' : 'Loading accepted ACE assessments…'}</p>}
        </div>
        <p className="data-note">{aceMarket ? `Source retrieved ${day.format(new Date(aceMarket.source.retrievedAt))}` : 'Loading database freshness…'} · <a href="https://animalcharityevaluators.org/blog/announcing-our-2025-charity-recommendations/" target="_blank" rel="noreferrer">2025 recommendation announcement ↗</a></p>
      </section>

      <section className="giving-green-section" id="giving-green-market">
        <div className="giving-green-heading">
          <div><p className="kicker">THE CLIMATE MARKET</p><h2>{givingGreenMarket ? integer.format(givingGreenMarket.summary.topRecommendationCount) : 'Current'} best bets.<br />Systems change, no fake tonnage.</h2></div>
          <p>Giving Green’s current recommendations span firm power, hard-to-abate industry, food systems, aviation, and shipping. Its research is qualitative at the organization level, so we show strategy, funding need, and announced grants without inventing emissions-per-dollar scores.</p>
        </div>
        <div className="giving-green-overview" aria-label="Giving Green 2025–2026 recommendation and grant summary">
          <div><span>Top nonprofits</span><strong>{givingGreenMarket ? integer.format(givingGreenMarket.summary.topRecommendationCount) : '—'}</strong><p>Alphabetical, explicitly not ranked.</p></div>
          <div><span>Announced grant rows</span><strong>{givingGreenMarket ? integer.format(givingGreenMarket.summary.grantRecordCount) : '—'}</strong><p>Five top nonprofits plus 24 strategy grantees.</p></div>
          <div><span>Full cycle announced</span><strong>{givingGreenMarket ? compactMoney.format(givingGreenMarket.summary.totalAnnouncedGrantUsd) : '—'}</strong><p>Planned grants; not proof of disbursement.</p></div>
          <div><span>Top nonprofit share</span><strong>{givingGreenMarket ? compactMoney.format(givingGreenMarket.summary.topAnnouncedGrantUsd) : '—'}</strong><p>Grant size is not an effectiveness rank.</p></div>
        </div>
        <div className="giving-green-warning"><strong>Comparison boundary.</strong> {givingGreenMarket?.comparabilityWarning ?? 'Loading the accepted Giving Green assessment and grant ledger…'}</div>
        <div className="giving-green-cards">
          {(givingGreenMarket?.recommendations ?? []).map((recommendation) => (
            <article className="giving-green-card" key={recommendation.slug}>
              <div className="giving-green-card-top"><span>2025–2026 TOP NONPROFIT</span><b>{recommendation.model_version}</b></div>
              <h3><a href={organizationPath(recommendation.slug)}>{recommendation.canonical_name}</a></h3>
              <p className="giving-green-geography">{recommendation.geography}</p>
              <div className="giving-green-strategies">{recommendation.strategies.map((strategy) => <span key={strategy}>{strategy}</span>)}</div>
              <dl>
                <div><dt>Fund grant</dt><dd>{compactMoney.format(recommendation.amountUsd)} · {recommendation.period}</dd></div>
                <div><dt>Numeric funding gap</dt><dd>{recommendation.funding_room_usd == null ? 'Not published' : `${money.format(recommendation.funding_room_usd)} · ${recommendation.funding_room_period}`}</dd></div>
                <div><dt>Impact metric</dt><dd>Not quantified organization-wide</dd></div>
              </dl>
              <p className="giving-green-need"><strong>Use for more funding.</strong> {recommendation.fundingNeed}</p>
              <p className="giving-green-limit">{recommendation.limitations}</p>
              <div className="giving-green-card-links"><a href={organizationPath(recommendation.slug)}>Market profile →</a><a href={grantPath('giving-green', recommendation.sourceRecordId)}>Grant record →</a><a href={recommendation.website_url} target="_blank" rel="noreferrer">Research ↗</a></div>
            </article>
          ))}
          {!givingGreenMarket && <p className="market-loading">{givingGreenError ? 'The accepted Giving Green ledger is temporarily unavailable.' : 'Loading accepted climate assessments…'}</p>}
        </div>
        <p className="data-note">{givingGreenMarket ? `Source retrieved ${day.format(new Date(givingGreenMarket.source.retrievedAt))}` : 'Loading database freshness…'} · <a href="https://www.givinggreen.earth/top-climate-nonprofits" target="_blank" rel="noreferrer">Current top nonprofits ↗</a> · <a href="https://www.givinggreen.earth/post/2025-2026-top-climate-nonprofits" target="_blank" rel="noreferrer">Grant announcement ↗</a></p>
      </section>

      <section className="founders-pledge-section" id="founders-pledge-market">
        <div className="founders-pledge-heading">
          <div><p className="kicker">THE FOUNDERS PLEDGE MATRIX</p><h2>One evaluator.<br />Four evidence regimes.</h2></div>
          <p>Founders Pledge mixes modeled direct interventions, partner research, active pooled funds, and high-uncertainty bets. This matrix preserves those differences—and shows exactly where a GiveDirectly comparison does and does not exist.</p>
        </div>
        <div className="founders-pledge-overview" aria-label="Founders Pledge research matrix summary">
          <div><span>Funding opportunities</span><strong>{foundersPledgeMarket ? integer.format(foundersPledgeMarket.summary.opportunityCount) : '—'}</strong><p>Funds, programs, and published organization recommendations.</p></div>
          <div><span>Cause areas</span><strong>{foundersPledgeMarket ? integer.format(foundersPledgeMarket.summary.causeAreaCount) : '—'}</strong><p>Education, climate, global health, and catastrophic risks.</p></div>
          <div><span>Current pooled funds</span><strong>{foundersPledgeMarket ? integer.format(foundersPledgeMarket.summary.currentPooledFundCount) : '—'}</strong><p>Climate and Global Catastrophic Risks.</p></div>
          <div><span>Cash-relative estimates</span><strong>{foundersPledgeMarket ? integer.format(foundersPledgeMarket.summary.giveDirectlyRelativeCount) : '—'}</strong><p>Only Imagine Worldwide carries an explicit multiple.</p></div>
        </div>
        <div className="founders-pledge-warning"><strong>Comparison boundary.</strong> {foundersPledgeMarket?.comparabilityWarning ?? 'Loading the accepted Founders Pledge assessment matrix…'}</div>
        <div className="founders-pledge-matrix">
          {(['Education', 'Climate', 'Global health', 'Global catastrophic risks'] as const).map((matrixCause) => (
            <section className="founders-pledge-cause" key={matrixCause}>
              <header><span>{matrixCause}</span><b>{foundersPledgeMarket ? integer.format(foundersPledgeMarket.opportunities.filter((item) => item.cause === matrixCause).length) : '—'}</b></header>
              <div>
                {(foundersPledgeMarket?.opportunities ?? []).filter((item) => item.cause === matrixCause).map((opportunity) => (
                  <article className="founders-pledge-card" key={opportunity.slug}>
                    <div className="founders-pledge-status"><span>{opportunity.statusLabel}</span><b>{opportunity.assessmentDate ? day.format(new Date(opportunity.assessmentDate)) : 'Current page'}</b></div>
                    <h3><a href={organizationPath(opportunity.slug)}>{opportunity.canonical_name}</a></h3>
                    <p className="founders-pledge-model">{opportunity.evidenceModel}</p>
                    <dl>
                      <div><dt>Published metric</dt><dd>{opportunity.nativeMetric}</dd></div>
                      <div><dt>GiveDirectly</dt><dd>{opportunity.benchmarkMultiple == null ? 'No published multiple' : `${opportunity.benchmarkMultiple}× in this model`}</dd></div>
                      <div><dt>Funding status</dt><dd>{opportunity.fundingStatus}</dd></div>
                    </dl>
                    <p className="founders-pledge-summary">{opportunity.summary}</p>
                    <p className="founders-pledge-limit">{opportunity.limitations}</p>
                    <div className="founders-pledge-links"><a href={organizationPath(opportunity.slug)}>Market profile →</a><a href={opportunity.source_url} target="_blank" rel="noreferrer">Founders Pledge source ↗</a></div>
                  </article>
                ))}
              </div>
            </section>
          ))}
          {!foundersPledgeMarket && <p className="market-loading">{foundersPledgeError ? 'The accepted Founders Pledge matrix is temporarily unavailable.' : 'Loading accepted Founders Pledge assessments…'}</p>}
        </div>
        <p className="data-note">{foundersPledgeMarket ? `Sources retrieved ${day.format(new Date(foundersPledgeMarket.retrievedAt))}` : 'Loading source freshness…'} · Current pooled funds are separated from older published recommendations · <a href="https://www.founderspledge.com/programs" target="_blank" rel="noreferrer">Founders Pledge Funds ↗</a></p>
      </section>

      <section className="ai-safety-section" id="ai-safety-market">
        <div className="ai-safety-heading">
          <div><p className="kicker">THE AI SAFETY ECOSYSTEM</p><h2>Follow the field,<br />without forcing a rank.</h2></div>
          <p>Every accepted Coefficient grant in the Navigating Transformative AI fund is mapped into an auditable, multi-label role taxonomy. Founders Pledge recommendations are overlaid as a separate signal.</p>
        </div>
        <div className="ai-safety-overview" aria-label="AI safety ecosystem summary">
          <div><span>Published grants</span><strong>{aiSafetyMarket ? integer.format(aiSafetyMarket.summary.grantCount) : '—'}</strong><p>Complete accepted Coefficient fund lens.</p></div>
          <div><span>Published amount</span><strong>{aiSafetyMarket ? compactMoney.format(aiSafetyMarket.summary.publishedAmountUsd) : '—'}</strong><p>Historical row amounts, not funding room.</p></div>
          <div><span>Named organizations</span><strong>{aiSafetyMarket ? integer.format(aiSafetyMarket.summary.organizationCount) : '—'}</strong><p>Recipient identities in the public index.</p></div>
          <div><span>FP overlap</span><strong>{aiSafetyMarket ? `${aiSafetyMarket.summary.foundersPledgeOverlapCount} + ${aiSafetyMarket.summary.foundersPledgeOnlyCount}` : '—'}</strong><p>Five matched recommendations and one external-only.</p></div>
        </div>
        <div className="ai-safety-warning"><strong>Interpretation boundary.</strong> Published grant flow is neither an effectiveness score nor current room for more funding. Categories overlap, so category totals must not be added.</div>
        <div className="ai-role-grid">
          {(aiSafetyMarket?.categories ?? []).map((category) => (
            <button className={aiRole === category.key ? 'active' : ''} type="button" key={category.key} onClick={() => setAiRole(aiRole === category.key ? 'all' : category.key)}>
              <span>{category.label}</span><strong>{compactMoney.format(category.publishedAmountUsd)}</strong><small>{integer.format(category.organizationCount)} orgs · {integer.format(category.grantCount)} grants</small>
            </button>
          ))}
        </div>
        <div className="ai-directory-controls">
          <label><span>SEARCH ORGANIZATIONS</span><input value={aiQuery} onChange={(event) => setAiQuery(event.target.value)} placeholder="Name or role" /></label>
          <button type="button" onClick={() => { setAiRole('all'); setAiQuery(''); }}>Clear filters</button>
        </div>
        <div className="ai-directory">
          {visibleAiOrganizations.map((organization) => (
            <article key={organization.slug}>
              <div><span>{organization.primaryRole.replaceAll('-', ' ')}</span>{organization.foundersPledgeStatus && <b>FOUNDERS PLEDGE</b>}</div>
              <h3><a href={organizationPath(organization.slug)}>{organization.organization}</a></h3>
              <p>{organization.roles.map((role) => role.replaceAll('-', ' ')).join(' · ')}</p>
              <dl><div><dt>Published flow</dt><dd>{compactMoney.format(organization.publishedAmountUsd)}</dd></div><div><dt>Grant rows</dt><dd>{integer.format(organization.grantCount)}</dd></div></dl>
              <a href={organizationPath(organization.slug)}>Trace organization →</a>
            </article>
          ))}
          {!aiSafetyMarket && <p className="market-loading">{aiSafetyError ? 'The AI safety ecosystem is temporarily unavailable.' : 'Loading the accepted AI safety taxonomy…'}</p>}
          {aiSafetyMarket && visibleAiOrganizations.length === 0 && <p className="market-loading">No organizations match this role and search.</p>}
        </div>
        <p className="data-note">{aiSafetyMarket ? `Taxonomy generated ${day.format(new Date(aiSafetyMarket.generatedAt))} · showing ${integer.format(visibleAiOrganizations.length)} of ${integer.format(aiSafetyMarket.organizations.length)} organizations` : 'Loading taxonomy freshness…'} · <a href="https://coefficientgiving.org/funds/navigating-transformative-ai/" target="_blank" rel="noreferrer">Coefficient fund ↗</a></p>
      </section>

      <section className="renphil-section" id="renphil-market">
        <div className="renphil-heading">
          <div><p className="kicker">THE RENPHIL FRONTIER</p><h2>Funding the tools<br />behind discovery.</h2></div>
          <p>Renaissance Philanthropy’s AI for Math Fund backs open research infrastructure that individual academic and industry labs may lack incentives to build. These are disclosed awards—not a cost-effectiveness ranking.</p>
        </div>
        <div className="renphil-overview" aria-label="Renaissance Philanthropy AI for Math fund summary">
          <div><span>Fund-level commitment</span><strong>Not row-level</strong><p>The announced commitment is excluded from grant totals because RenPhil does not allocate it across awards.</p></div>
          <div><span>Published portfolio</span><strong>{renPhilMarket ? `${integer.format(renPhilMarket.summary.award_count)} linked projects` : '—'}</strong><p>{renPhilMarket ? `RenPhil declares ${integer.format(renPhilMarket.summary.declared_award_count)} awards; ${integer.format(renPhilMarket.summary.unlisted_award_count)} is not named on the current page.` : 'Loading accepted award rows…'}</p></div>
          <div><span>Rows with amounts</span><strong>{renPhilMarket ? integer.format(renPhilMarket.summary.award_count - renPhilMarket.summary.missing_amount_count) : '—'}</strong><p>Application caps and fund totals are never substituted.</p></div>
          <div><span>Named funder</span><strong>XTX Markets</strong><p>RenPhil administers the fund and supports grantees.</p></div>
        </div>
        <div className="renphil-grants">
          {renPhilSnapshot.records.slice(0, showAllRenPhil ? undefined : 8).map((award, index) => (
            <article className="renphil-grant" key={award.sourceRecordId}>
              <div className="renphil-grant-meta"><span>AWARD {String(index + 1).padStart(2, '0')}</span><b>AMOUNT NOT PUBLISHED</b></div>
              <h3>{award.project}</h3>
              <p>{award.purpose ?? 'The current project page does not publish a project description.'}</p>
              <div className="renphil-grant-footer"><span>{award.recipientNames.length ? award.recipientNames.join(' · ') : 'Team biography available at source'}</span><a href={grantPath('renphil', award.sourceRecordId)}>Trace this award →</a><a href={award.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a></div>
            </article>
          ))}
        </div>
        {!showAllRenPhil && <button className="renphil-reveal" type="button" onClick={() => setShowAllRenPhil(true)}>Show all accepted award records <span>↓</span></button>}
        <div className="renphil-caveats">
          <p><strong>Coverage conflict.</strong> {renPhilMarket ? `RenPhil states that the first round funded ${integer.format(renPhilMarket.summary.declared_award_count)} projects, while its current winners page exposes ${integer.format(renPhilMarket.summary.award_count)} accepted records. The ledger records ${integer.format(renPhilMarket.summary.unlisted_award_count)} unresolved gap rather than inventing the missing award.` : 'The publisher’s declared portfolio and linked project records do not reconcile; the accepted ledger preserves that unresolved gap.'}</p>
          <p><strong>Capital signals stay separate.</strong> RenPhil also reports organization-level catalyzed, directly raised, and unlocked capital. None is treated as a grant-ledger total because it cannot be reconciled to the published award rows.</p>
        </div>
        <p className="data-note">{renPhilMarket ? `Accepted award rows retrieved ${day.format(new Date(renPhilMarket.source.retrievedAt))}` : renPhilError ? 'Accepted ledger temporarily unavailable' : 'Loading database freshness…'} · <a href={renPhilSnapshot.source.url} target="_blank" rel="noreferrer">Official winners page ↗</a></p>
      </section>

      <section className="grant-flow-section" id="flows">
        <div className="grant-flow-heading">
          <div><p className="kicker">TRACE THE CAPITAL CHAIN</p><h2>Follow one dollar without counting it twice.</h2></div>
          <p>Choose one publisher ledger, then follow each source row from originating funder through adviser, grant, recipient, intervention, and cause. Unknown links stay unknown.</p>
        </div>
        <div className="grant-flow-stats">
          <div><span>Accepted source rows</span><strong>{grantFlows ? integer.format(grantFlows.acceptedSourceRowCount) : '—'}</strong><p>Counts can be combined because source-row identities are distinct.</p></div>
          <div><span>Publisher ledgers</span><strong>{grantFlows ? integer.format(grantFlows.sourceSummaries.length) : '—'}</strong><p>Dollar totals remain inside one selected ledger.</p></div>
          <div><span>Overlap excluded</span><strong>{grantFlows ? integer.format(grantFlows.excludedLedgers[0]?.rowCount ?? 0) : '—'}</strong><p>Coefficient EGC rows already occur in its complete index.</p></div>
          <div><span>Selected rows</span><strong>{grantFlows ? integer.format(grantFlows.pagination.total) : '—'}</strong><p>One row stays one flow, even with multiple recipients.</p></div>
        </div>
        <div className="flow-ledger-tabs" aria-label="Publisher ledger">
          {(grantFlows?.sourceSummaries ?? []).map((source) => (
            <button type="button" className={flowSource === source.key ? 'active' : ''} key={source.key} onClick={() => resetFlowFilters(source.key)}>
              <span>{source.publisher}</span><strong>{integer.format(source.rowCount)} rows</strong>
              <b>{source.missingAmountCount === source.rowCount ? 'Amounts not published' : compactMoney.format(source.publishedAmountUsd)}</b>
            </button>
          ))}
        </div>
        <div className="flow-boundary"><span>NON-ADDITIVE</span><p>{grantFlows?.aggregationRules.amount ?? 'Cross-publisher dollar totals stay separate because accepted publications may describe the same underlying funding.'}</p></div>
        <form className="flow-filter-panel" onSubmit={(event) => { event.preventDefault(); beginFlowUpdate(); setFlowPage(1); setFlowQuery(flowDraft.trim()); }}>
          <label className="flow-search"><span>Search</span><input value={flowDraft} onChange={(event) => setFlowDraft(event.target.value)} placeholder="Recipient or grant purpose" /></label>
          <label><span>{grantFlows?.selectedSource.dateBasis ?? 'Event'} year</span><select value={flowYear} onChange={(event) => { beginFlowUpdate(); setFlowYear(event.target.value); setFlowPage(1); }}><option value="">All years</option>{(grantFlows?.facets.years ?? []).map((item) => <option value={item.value} key={item.value}>{item.value} · {integer.format(item.count)}</option>)}</select></label>
          <label><span>Cause / source tag</span><select value={flowCause} onChange={(event) => { beginFlowUpdate(); setFlowCause(event.target.value); setFlowPage(1); }}><option value="">All published tags</option>{(grantFlows?.facets.causes ?? []).map((item) => <option value={item.value} key={item.value}>{item.value} · {integer.format(item.count)}</option>)}</select></label>
          <label><span>Geography</span><select value={flowGeography} onChange={(event) => { beginFlowUpdate(); setFlowGeography(event.target.value); setFlowPage(1); }}><option value="">All geographies</option>{(grantFlows?.facets.geographies ?? []).map((item) => <option value={item.value} key={item.value}>{item.value} · {integer.format(item.count)}</option>)}</select></label>
          <label><span>Source status</span><select value={flowStatus} onChange={(event) => { beginFlowUpdate(); setFlowStatus(event.target.value); setFlowPage(1); }}><option value="">All statuses</option>{(grantFlows?.facets.statuses ?? []).map((item) => <option value={item.value} key={item.value}>{item.value}</option>)}</select></label>
          <label><span>Restriction</span><select value={flowRestriction} onChange={(event) => { beginFlowUpdate(); setFlowRestriction(event.target.value); setFlowPage(1); }}><option value="">All published states</option>{(grantFlows?.facets.restrictions ?? []).map((item) => <option value={item.value} key={item.value}>{item.value === 'not-published' ? 'Not published' : item.value[0].toUpperCase() + item.value.slice(1)} · {integer.format(item.count)}</option>)}</select></label>
          <label><span>Stage</span><select value="not-published" disabled><option value="not-published">Not published by accepted sources</option></select></label>
          <label><span>Sort</span><select value={flowSort} onChange={(event) => { beginFlowUpdate(); setFlowSort(event.target.value as 'recent' | 'largest'); setFlowPage(1); }}><option value="recent">Most recent</option><option value="largest">Largest amount</option></select></label>
          <button type="submit">Trace flows →</button>
        </form>
        <div className="flow-query-status" aria-live="polite">
          <span>{grantFlowsLoading ? 'Reconciling source rows…' : grantFlowsError ? 'The flow ledger is temporarily unavailable.' : `${integer.format(grantFlows?.pagination.total ?? 0)} matching ${grantFlows?.selectedSource.label ?? 'source'} rows`}</span>
          {(flowYear || flowCause || flowGeography || flowStatus || flowRestriction || flowQuery) && <button type="button" onClick={() => resetFlowFilters()}>Clear filters</button>}
        </div>
        <div className="capital-flow-list">
          {(grantFlows?.flows ?? []).map((flow) => (
            <article className="capital-flow-card" key={`${flow.detailSource}:${flow.sourceRecordId}`}>
              <div className="capital-flow-meta"><span>{flow.eventDate ? `${shortDay.format(new Date(flow.eventDate))} · ${flow.dateBasis}` : `${flow.dateBasis} not published`}</span><span>{flow.status}</span><strong>{flow.amountUsd == null ? 'Amount not published' : money.format(flow.amountUsd)}</strong></div>
              <div className="capital-flow-chain">
                <div><span>01 · ORIGINATOR</span><strong>{flow.originatingFunder?.name ?? 'Not normalized'}</strong><p>{flow.originatingFunder ? 'Source-backed organization role' : flow.sourceListedFunders.length ? `Source lists: ${flow.sourceListedFunders.join(' · ')}` : 'Source does not identify a normalized originating funder.'}</p></div>
                <i aria-hidden="true">→</i>
                <div><span>02 · ADVISER</span><strong>{flow.advisingFunder?.name ?? 'Not normalized'}</strong><p>{flow.advisingFunder ? 'Source-backed organization role' : 'Publisher is not automatically treated as adviser.'}</p></div>
                <i aria-hidden="true">→</i>
                <div><span>03 · GRANT</span><strong>{flow.purpose ?? 'Purpose not published'}</strong><p>One publisher source row</p></div>
                <i aria-hidden="true">→</i>
                <div><span>04 · RECIPIENT</span><strong>{flow.recipients.map((item) => item.name).join(' + ') || 'Not published'}</strong><p>{flow.recipients.some((item) => !item.normalized) ? 'Source-listed names; identity not normalized' : 'Normalized organization identities'}</p></div>
                <i aria-hidden="true">→</i>
                <div><span>05 · IMPACT PATH</span><strong>{flow.intervention ?? flow.causeTags[0] ?? 'Not published'}</strong><p>{flow.causeTags.length ? flow.causeTags.join(' · ') : 'Cause not published'}</p></div>
              </div>
              <div className="capital-flow-footer"><span>Geography: {flow.geographies.join(' · ') || 'not published'}</span><span>Stage: not published</span><span>Restriction: {flow.restriction ?? 'not published'}</span><a href={grantPath(flow.detailSource, flow.sourceRecordId)}>Open source record →</a></div>
            </article>
          ))}
          {!grantFlowsLoading && !grantFlowsError && grantFlows?.flows.length === 0 && <p className="grant-no-results">No accepted source rows match those filters.</p>}
        </div>
        {grantFlows && grantFlows.pagination.pageCount > 1 && <div className="grant-pagination flow-pagination">
          <button type="button" disabled={flowPage <= 1 || grantFlowsLoading} onClick={() => { beginFlowUpdate(); setFlowPage((page) => Math.max(1, page - 1)); }}>← Previous</button>
          <span>Page {integer.format(grantFlows.pagination.page)} of {integer.format(grantFlows.pagination.pageCount)}</span>
          <button type="button" disabled={flowPage >= grantFlows.pagination.pageCount || grantFlowsLoading} onClick={() => { beginFlowUpdate(); setFlowPage((page) => page + 1); }}>Next →</button>
        </div>}
        <div className="flow-method-notes"><p><strong>One row, one amount.</strong> {grantFlows?.aggregationRules.row ?? 'Recipient roles never duplicate a grant amount.'}</p><p><strong>Role discipline.</strong> {grantFlows?.aggregationRules.roles ?? 'Originating and advising funders remain separate.'}</p><p><strong>Missing stays missing.</strong> {grantFlows?.aggregationRules.missingness ?? 'Unsupported fields are never inferred.'}</p></div>
        <p className="data-note">{grantFlows ? `${grantFlows.version} · selected source retrieved ${day.format(new Date(grantFlows.selectedSource.retrievedAt))}` : 'Loading source reconciliation…'} · cause-tag counts may overlap inside a ledger · <a href={grantFlows?.selectedSource.sourceUrl ?? '#flows'} target="_blank" rel="noreferrer">Publisher source ↗</a></p>
      </section>

      <section className="data-quality-section" id="data-quality">
        <div className="data-quality-heading">
          <div><p className="kicker">QUALITY BEFORE CONFIDENCE</p><h2>See what the data can—and cannot—support.</h2></div>
          <p>A donor should be able to distinguish a real source conflict from a documented publication limit, a missing field, or an old snapshot. This register uses rules, not an opaque quality score.</p>
        </div>
        <div className="quality-summary-grid">
          <div><span>Tracked source pages</span><strong>{dataQuality ? integer.format(dataQuality.summary.trackedSourceCount) : '—'}</strong><p>{dataQuality ? `${integer.format(dataQuality.summary.currentSourceCount)} current · ${integer.format(dataQuality.summary.staleSourceCount)} stale` : 'Reconciling freshness…'}</p></div>
          <div><span>Accepted grant rows</span><strong>{dataQuality ? integer.format(dataQuality.summary.acceptedGrantRowCount) : '—'}</strong><p>Distinct publisher rows; amounts remain non-additive.</p></div>
          <div><span>Amounts unpublished</span><strong>{dataQuality ? integer.format(dataQuality.summary.missingAmountCount) : '—'}</strong><p>Unknown is retained rather than converted to zero.</p></div>
          <div><span>Canonical dates missing</span><strong>{dataQuality ? integer.format(dataQuality.summary.missingDateCount) : '—'}</strong><p>Award, decision, or disbursement date by ledger.</p></div>
          <div><span>Source conflicts</span><strong>{dataQuality ? integer.format(dataQuality.summary.conflictCount) : '—'}</strong><p>Publisher totals or declared coverage disagree.</p></div>
          <div><span>Disappeared rows</span><strong>{dataQuality ? integer.format(dataQuality.summary.disappearedRowCount) : '—'}</strong><p>Not called retracted without publisher evidence.</p></div>
        </div>
        <div className="quality-freshness-strip">
          <div><span>CONTENT-ADDRESSED</span><strong>{dataQuality ? integer.format(dataQuality.summary.contentAddressedSourceCount) : '—'}</strong><p>Snapshot sources with a stored semantic hash.</p></div>
          <div><span>REVIEWED REFERENCE</span><strong>{dataQuality ? integer.format(dataQuality.summary.reviewedReferenceSourceCount) : '—'}</strong><p>Method pages retained without pretending a page hash was captured.</p></div>
          <div><span>FUNDING ROOM</span><strong>{dataQuality ? `${integer.format(dataQuality.fundingQuality.staleCount)} stale · ${integer.format(dataQuality.fundingQuality.closedCount)} closed` : '—'}</strong><p>{dataQuality ? `${integer.format(dataQuality.fundingQuality.amountUnpublishedCount)} of ${integer.format(dataQuality.fundingQuality.trancheCount)} tranches have no published amount.` : 'Reconciling tranche evidence…'}</p></div>
        </div>
        <div className="quality-ledger-grid">
          {(dataQuality?.ledgers ?? []).map((ledger) => (
            <article className={`quality-ledger ${ledger.qualityState}`} key={ledger.key}>
              <header><div><span>{ledger.publisher}</span><h3>{ledger.label}</h3></div><b>{ledger.qualityState.replaceAll('-', ' ')}</b></header>
              <div className="quality-ledger-freshness"><span>{ledger.ageDays === 0 ? 'Retrieved today' : `${integer.format(ledger.ageDays)} days since retrieval`}</span><i><em style={{ width: `${Math.max(4, Math.min(100, 100 - ledger.ageDays * 2))}%` }} /></i><strong>{ledger.freshnessState}</strong></div>
              <dl>
                <div><dt>Rows</dt><dd>{integer.format(ledger.rowCount)}</dd></div>
                <div><dt>Amount missing</dt><dd>{integer.format(ledger.missingAmountCount)}</dd></div>
                <div><dt>{ledger.canonicalDateLabel} missing</dt><dd>{integer.format(ledger.missingDateCount)}</dd></div>
                <div><dt>Recipient missing</dt><dd>{integer.format(ledger.missingRecipientCount)}</dd></div>
                <div><dt>Direct URL missing</dt><dd>{integer.format(ledger.missingSourceUrlCount)}</dd></div>
                <div><dt>Disappeared</dt><dd>{integer.format(ledger.disappearedRowCount)}</dd></div>
              </dl>
              <p>{ledger.coverageNote ?? ledger.caveats[0]}</p>
              <a href={ledger.sourceUrl} target="_blank" rel="noreferrer">Inspect publisher source ↗</a>
            </article>
          ))}
          {!dataQuality && <p className="quality-loading">{dataQualityError ? 'The quality register is temporarily unavailable.' : 'Reconciling accepted sources…'}</p>}
        </div>
        <div className="quality-register">
          <div className="quality-register-heading"><div><span>OPEN EVIDENCE REGISTER</span><h3>Conflicts, gaps, and boundaries.</h3></div><p>Counts describe missing evidence or source behavior. They do not rank evaluator quality.</p></div>
          <div className="quality-filter-controls">
            <label><span>Source</span><select value={qualitySource} onChange={(event) => setQualitySource(event.target.value)}><option value="all">All tracked areas</option>{[...new Set((dataQuality?.issues ?? []).map((issue) => issue.sourceKey))].map((source) => <option value={source} key={source}>{source.replaceAll('-', ' ')}</option>)}</select></label>
            <label><span>Issue state</span><select value={qualityState} onChange={(event) => setQualityState(event.target.value)}><option value="all">All issue states</option><option value="conflict">Source conflict</option><option value="incomplete">Incomplete row evidence</option><option value="monitor">Monitor</option><option value="documented-boundary">Documented boundary</option></select></label>
            <div><span>VISIBLE ISSUES</span><strong>{integer.format(filteredQualityIssues.length)}</strong></div>
          </div>
          <div className="quality-issue-grid">
            {filteredQualityIssues.map((issue) => (
              <article className={`quality-issue ${issue.state}`} key={issue.key}>
                <div><span>{issue.category.replaceAll('-', ' ')}</span><b>{issue.state.replaceAll('-', ' ')}</b></div>
                <h4>{issue.title}</h4>
                <p>{issue.description}</p>
                <div className="quality-issue-footer"><strong>{issue.count == null ? 'QUALITATIVE' : `${integer.format(issue.count)} ${issue.unit ?? ''}`}</strong>{issue.sourceUrl && <a href={issue.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>}</div>
              </article>
            ))}
            {dataQuality && filteredQualityIssues.length === 0 && <p className="quality-empty">No issues match those filters.</p>}
          </div>
        </div>
        <div className="quality-source-inventory">
          <div className="quality-source-heading"><div><span>SOURCE INVENTORY</span><h3>Every tracked page has a freshness state.</h3></div><p>{dataQuality?.freshnessRules.map((rule) => rule.label).join(' · ') ?? 'Loading explicit freshness rules…'}</p></div>
          <div className="quality-source-list">
            {(dataQuality?.sources ?? []).slice(0, showAllQualitySources ? undefined : 8).map((source) => {
              const objectCount = source.objectCounts.grants + source.objectCounts.assessments + source.objectCounts.benchmarks + source.objectCounts.conversionModels;
              return <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.publisher}</span><strong>{source.title}</strong><small>{source.ageDays === 0 ? 'today' : `${integer.format(source.ageDays)}d ago`} · {source.contentState.replaceAll('-', ' ')}</small><b>{integer.format(objectCount)} linked object{objectCount === 1 ? '' : 's'} ↗</b></a>;
            })}
          </div>
          {dataQuality && !showAllQualitySources && dataQuality.sources.length > 8 && <button className="quality-source-reveal" type="button" onClick={() => setShowAllQualitySources(true)}>Show all {integer.format(dataQuality.sources.length)} tracked sources ↓</button>}
        </div>
        <div className="quality-rule-grid">
          {(dataQuality?.stateRules ?? []).map((rule) => <p key={rule.state}><strong>{rule.state.replaceAll('-', ' ')}.</strong> {rule.rule}</p>)}
          <p><strong>Grouped rows.</strong> {dataQuality?.rowRules.grouped ?? 'Grouped status is counted only when published row evidence supports it.'}</p>
        </div>
        <p className="data-note">{dataQuality ? `${dataQuality.version} · quality state as of ${day.format(new Date(`${dataQuality.asOfDate}T00:00:00.000Z`))}` : 'Loading quality state…'} · zero observed grouped flags does not override publisher grouping caveats · missing is not zero</p>
      </section>

      <section className="flows-section" id="published-signals">
        <div className="flow-copy">
          <p className="kicker">THE FLOW OF CAPITAL</p>
          <h2>See where impact funding is actually going.</h2>
          <p>Recommendations reveal what researchers believe. Grants reveal what funders do. Market for Impact connects both.</p>
          <a className="text-link light" href="#methodology">Explore all funding flows <span>→</span></a>
        </div>
        <div className="flow-card">
          <div className="flow-card-head"><div><span>ACCEPTED LEDGER TOTALS</span><strong>A first map of the disclosed ecosystem</strong></div><span className="tag">D1 LIVE</span></div>
          <div className="metric-bars" aria-label="Published funding signals">
            {flowMetrics.map((item) => <div className="metric-row" key={item.name}><div><strong>{item.name}</strong><span>{item.records == null ? 'Loading accepted rows…' : `${integer.format(item.records)} rows · ${item.note}`}</span></div><div className="bar-track"><span style={{ width: `${item.width}%`, background: item.color }} /></div><b>{item.amount == null ? 'Not published' : compactMoney.format(item.amount)}</b></div>)}
          </div>
          <div className="flow-insight"><span>!</span><p><strong>These database totals are intentionally not summed.</strong><br />The Coefficient EGC ledger overlaps its complete index, while cross-publisher exports may describe the same underlying funding. Missing RenPhil amounts remain missing.</p></div>
        </div>
      </section>

      <section className="coefficient-market-section" id="coefficient-market">
        <div className="coefficient-market-heading">
          <div><p className="kicker">THE COEFFICIENT MARKET</p><h2>One index. {explorer ? integer.format(explorer.summary.listedFundCount) : 'Current'} fund lenses.</h2></div>
          <p>{explorer ? integer.format(explorer.summary.grantCount) : '—'} accepted public grant records, classified against every fund on Coefficient’s current funds page. Overall totals count a source record once; fund rows are intentionally non-additive.</p>
        </div>
        <div className="coefficient-overview" aria-label="Coefficient public index summary">
          <div><span>Published records</span><strong>{explorer ? integer.format(explorer.summary.grantCount) : '—'}</strong></div>
          <div><span>Published amounts</span><strong>{explorer ? compactMoney.format(explorer.summary.totalPublishedAmountUsd) : '—'}</strong></div>
          <div><span>Recipient names</span><strong>{explorer ? integer.format(explorer.summary.uniqueRecipientCount) : '—'}</strong></div>
          <div><span>Index coverage</span><strong>{explorer?.summary.earliestAwardDate && explorer.summary.latestAwardDate ? `${new Date(explorer.summary.earliestAwardDate).getUTCFullYear()}–${new Date(explorer.summary.latestAwardDate).getUTCFullYear()}` : '—'}</strong></div>
        </div>
        <div className="fund-market-grid">
          {(explorer?.funds ?? []).map((fund) => (
            <a href={fund.url} target="_blank" rel="noreferrer" className="fund-market-row" key={fund.fund}>
              <span><strong>{fund.fund}</strong>{fund.status === 'closed' && <em>Closed</em>}</span>
              <span>{integer.format(fund.grantCount)} grants</span>
              <b>{compactMoney.format(fund.publishedAmountUsd)}</b>
              <i>↗</i>
            </a>
          ))}
        </div>
        <div className="index-caveats">
          <p><strong>Coverage, not certainty.</strong> {explorer ? `${integer.format(explorer.summary.grantsWithoutListedFund)} records have no currently listed fund tag; ${integer.format(explorer.summary.grantsWithMultipleListedFunds)} have multiple listed fund tags; ${integer.format(explorer.summary.grantsWithoutFocusArea)} have no focus-area tag.` : 'Loading database coverage checks…'}</p>
          <p><strong>Amounts are partial.</strong> {explorer ? `The row total excludes ${integer.format(explorer.summary.grantsWithoutPublishedAmount)} record without a published amount. “Published” does not mean paid; ${integer.format(explorer.summary.futureDatedGrants)} source row is dated after retrieval.` : 'Loading database missingness checks…'}</p>
        </div>
        <div className="grant-explorer">
          <div className="grant-explorer-heading">
            <div><span>QUERY THE LEDGER</span><h3>Trace individual grants.</h3></div>
            <p>Filter the complete D1-backed source ledger without losing Coefficient’s own fund tags or published-record semantics.</p>
          </div>
          <form className="grant-explorer-controls" onSubmit={(event) => { event.preventDefault(); beginExplorerUpdate(); setExplorerPage(1); setExplorerQuery(explorerDraft.trim()); }}>
            <label className="explorer-search"><span>Search</span><input value={explorerDraft} onChange={(event) => setExplorerDraft(event.target.value)} placeholder="Recipient or purpose" /></label>
            <label><span>Fund</span><select value={explorerFund} onChange={(event) => { beginExplorerUpdate(); setExplorerFund(event.target.value); setExplorerPage(1); }}><option value="">All listed funds</option>{(explorer?.funds ?? []).map((fund) => <option value={fund.fund} key={fund.fund}>{fund.fund}</option>)}</select></label>
            <label><span>Award year</span><select value={explorerYear} onChange={(event) => { beginExplorerUpdate(); setExplorerYear(event.target.value); setExplorerPage(1); }}><option value="">All years</option>{awardYears.map((year) => <option value={year} key={year}>{year}</option>)}</select></label>
            <label><span>Sort</span><select value={explorerSort} onChange={(event) => { beginExplorerUpdate(); setExplorerSort(event.target.value as 'recent' | 'largest'); setExplorerPage(1); }}><option value="recent">Most recent</option><option value="largest">Largest amount</option></select></label>
            <button type="submit">Search →</button>
          </form>
          <div className="grant-explorer-status" aria-live="polite">
            <span>{explorerLoading ? 'Querying the ledger…' : explorerError ? 'The complete ledger is temporarily unavailable.' : `${integer.format(explorer?.pagination.total ?? 0)} matching source records`}</span>
            {(explorerFund || explorerYear || explorerQuery) && <button type="button" onClick={() => { beginExplorerUpdate(); setExplorerFund(''); setExplorerYear(''); setExplorerDraft(''); setExplorerQuery(''); setExplorerPage(1); }}>Clear filters</button>}
          </div>
          <div className="grant-results">
            {explorer?.grants.map((grant) => (
              <article className="grant-result" key={grant.sourceRecordId}>
                <div className="grant-result-meta"><span>{grant.awardDate ? `${explorer && new Date(grant.awardDate) > new Date(explorer.source.retrievedAt) ? 'Future-dated · ' : ''}${shortDay.format(new Date(grant.awardDate))}` : 'Award date not published'}</span><span>{grant.listedFunds[0] ?? grant.focusAreas[0] ?? 'No focus-area tag'}</span></div>
                <h4>{grant.recipients.join(' + ') || 'Recipient not published'}</h4>
                <p>{grant.purpose || 'Purpose not published'}</p>
                <div className="grant-result-bottom"><strong>{grant.amountUsd == null ? 'Amount not published' : money.format(grant.amountUsd)}</strong><a href={grantPath('coefficient', grant.sourceRecordId)}>Grant detail →</a></div>
              </article>
            ))}
            {!explorerLoading && !explorerError && explorer?.grants.length === 0 && <p className="grant-no-results">No source records match those filters.</p>}
          </div>
          {explorer && explorer.pagination.pageCount > 1 && <div className="grant-pagination">
            <button type="button" disabled={explorerPage <= 1 || explorerLoading} onClick={() => { beginExplorerUpdate(); setExplorerPage((page) => Math.max(1, page - 1)); }}>← Previous</button>
            <span>Page {integer.format(explorer.pagination.page)} of {integer.format(explorer.pagination.pageCount)}</span>
            <button type="button" disabled={explorerPage >= explorer.pagination.pageCount || explorerLoading} onClick={() => { beginExplorerUpdate(); setExplorerPage((page) => page + 1); }}>Next →</button>
          </div>}
        </div>
        <p className="data-note">{explorer ? `Database source retrieved ${day.format(new Date(explorer.source.retrievedAt))} · ${explorer.source.contentHash?.slice(0, 12) ?? 'no'} content hash` : explorerError ? 'Database source metadata unavailable.' : 'Loading database source metadata…'} · <a href="https://coefficientgiving.org/funds/" target="_blank" rel="noreferrer">Fund taxonomy ↗</a></p>
      </section>

      <section className="ledger-section" id="grant-ledger">
        <div className="ledger-heading">
          <div><p className="kicker">FIRST LIVE GRANT LEDGER</p><h2>Inside one Coefficient fund.</h2></div>
          <p>Every currently accepted record from the Effective Giving & Careers fund page, normalized without claiming that “published” means paid.</p>
        </div>
        <div className="ledger-stats">
          <div><span>Published records</span><strong>{coefficientMarket ? integer.format(coefficientMarket.summary.grant_count) : '—'}</strong></div>
          <div><span>Published amounts</span><strong>{coefficientMarket ? money.format(coefficientMarket.summary.total_amount_usd) : '—'}</strong></div>
          <div><span>Distinct recipients</span><strong>{coefficientMarket ? integer.format(coefficientMarket.summary.recipient_count) : '—'}</strong></div>
          <div><span>Latest decision month</span><strong>{coefficientMarket ? month.format(new Date(coefficientMarket.summary.latest_decision_date * 1000)) : '—'}</strong></div>
        </div>
        <div className="ledger-grid">
          <div className="ledger-table">
            <div className="ledger-row ledger-labels"><span>Recipient</span><span>Purpose</span><span>Amount</span></div>
            {coefficientMarket?.recent.map((grant) => (
              <div className="ledger-row" key={grant.external_id}>
                <span><a href={organizationPath(grant.recipient_slug)}>{grant.recipient} →</a></span>
                <span><a href={grantPath('coefficient-egc', grant.external_id)}>{grant.purpose} →</a></span><strong>{money.format(grant.amount_usd)}</strong>
              </div>
            )) ?? <div className="ledger-loading">{coefficientError ? 'The live ledger is temporarily unavailable; the verified snapshot remains shown above.' : 'Loading the D1-backed ledger…'}</div>}
          </div>
          <aside className="coverage-card">
            <span className="tag">COVERAGE NOTE</span>
            <h3>Published is not complete.</h3>
            <p>Coefficient says entries can lag grantmaking by months, sensitive grants may be withheld, some rows group grants, and its database omits most funding advised for donors other than Good Ventures.</p>
            <p>We therefore store “published” as its own status, leave the originating funder unknown, and never add this overlapping subset to the complete-index total.</p>
            <a className="text-link" href="https://coefficientgiving.org/grant-publishing-process/" target="_blank" rel="noreferrer">Read their publishing process ↗</a>
          </aside>
        </div>
        <p className="data-note">{coefficientMarket ? `Accepted rows retrieved ${day.format(new Date(coefficientMarket.source.retrievedAt))}` : coefficientError ? 'Accepted ledger temporarily unavailable' : 'Loading database freshness…'} · Content-addressed · Removed records remain detectable through last-seen timestamps.</p>
      </section>

      <section className="sources-section">
        <div><p className="kicker">SOURCE LEDGER</p><h2>Every claim should lead back to evidence.</h2></div>
        <div className="source-list">
          <a href="https://coefficientgiving.org/grant-publishing-process/" target="_blank" rel="noreferrer"><span>Coefficient Giving</span><strong>Grant publishing process and coverage</strong><b>↗</b></a>
          <a href="https://www.givewell.org/charities/top-charities" target="_blank" rel="noreferrer"><span>GiveWell</span><strong>Top charities, updated Sep 2025</strong><b>↗</b></a>
          <a href="https://www.givewell.org/how-we-work/our-criteria/cost-effectiveness/cost-effectiveness-models" target="_blank" rel="noreferrer"><span>GiveWell</span><strong>Benchmark semantics, updated May 2026</strong><b>↗</b></a>
          <a href="https://animalcharityevaluators.org/blog/announcing-our-2025-charity-recommendations/" target="_blank" rel="noreferrer"><span>ACE</span><strong>2025 recommended charities</strong><b>↗</b></a>
          <a href="https://www.givinggreen.earth/post/2025-2026-top-climate-nonprofits" target="_blank" rel="noreferrer"><span>Giving Green</span><strong>2025–26 climate recommendations</strong><b>↗</b></a>
          <a href="https://www.founderspledge.com/research/education-evidence-and-recommendations" target="_blank" rel="noreferrer"><span>Founders Pledge</span><strong>Education evidence & recommendations</strong><b>↗</b></a>
          <a href="https://coefficientgiving.org/research/cost-effectiveness/" target="_blank" rel="noreferrer"><span>Coefficient Giving</span><strong>$CG cost-effectiveness methodology</strong><b>↗</b></a>
          <a href="https://www.gov.uk/government/publications/green-book-supplementary-guidance-wellbeing" target="_blank" rel="noreferrer"><span>HM Treasury</span><strong>WELLBY appraisal guidance</strong><b>↗</b></a>
        </div>
      </section>

      <section className="method-section" id="methodology">
        <p className="kicker">A COMMON LANGUAGE FOR IMPACT</p>
        <h2>Comparable where possible.<br />Transparent where it isn’t.</h2>
        <div className="method-grid">
          <article><span>01</span><h3>Evidence</h3><p>How confident should we be that the intervention causes the intended outcome?</p></article>
          <article><span>02</span><h3>Marginal impact</h3><p>What additional good is expected from the next dollar—not the average past dollar?</p></article>
          <article><span>03</span><h3>Funding room</h3><p>How much capital can the organization productively deploy, and on what timeline?</p></article>
          <article><span>04</span><h3>Uncertainty</h3><p>Which estimates are measured, modeled, judgment-based, or fundamentally incomparable?</p></article>
        </div>
      </section>

      <footer><div className="brand"><span className="brand-mark">M</span><span>Market for Impact</span></div><p>Built to make consequential giving legible.</p><span>Research preview · 2026</span></footer>
    </main>
  );
}

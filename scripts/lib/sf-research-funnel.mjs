import crypto from 'node:crypto';

const contentHash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const eligibleNteeGroups = new Set(['B', 'E', 'F', 'I', 'J', 'K', 'L', 'O', 'P', 'R', 'S']);
const recentTaxPeriods = new Set(['202312', '202406', '202409', '202412', '202503', '202506', '202509', '202512']);

function researchPriority(row) {
  const components = {
    exactCityContractLink: row.exactContractSourceName ? 30 : 0,
    existingMfiDossier: row.scorecardKey ? 25 : 0,
    recentTaxPeriod: recentTaxPeriods.has(row.taxPeriod) ? 15 : 0,
    reportedOperatingRevenue: Number(row.revenueAmountUsd ?? 0) > 0 ? Math.min(20, Math.max(1, Math.round(Math.log10(row.revenueAmountUsd) * 2))) : 0,
    interventionTractabilityProxy: ['E', 'F', 'I', 'J', 'K', 'L', 'O', 'P'].includes(row.nteeGroupKey) ? 10 : 4
  };
  return { score: Object.values(components).reduce((sum, value) => sum + value, 0), components };
}

export function buildSfResearchFunnel({ irsUniverse, config }) {
  const queueByEin = new Map(config.deepDiveQueue.map(([ein, displayName, intervention]) => [ein, { displayName, intervention }]));
  const eligible = irsUniverse.organizations.filter((row) => row.subsectionCode === '03' && row.deductibilityCode === '1' && Number(row.revenueAmountUsd ?? 0) > 0 && (eligibleNteeGroups.has(row.nteeGroupKey) || queueByEin.has(row.ein))).map((row) => ({ ...row, researchPriority: researchPriority(row) }));
  const missing = [...queueByEin.keys()].filter((ein) => !eligible.some((row) => row.ein === ein));
  if (missing.length) throw new Error(`Deep-dive EINs missing from eligible universe: ${missing.join(', ')}`);
  const sorted = eligible.sort((a, b) => b.researchPriority.score - a.researchPriority.score || Number(b.revenueAmountUsd) - Number(a.revenueAmountUsd) || a.ein.localeCompare(b.ein));
  const deepDiveRows = config.deepDiveQueue.map(([ein, displayName, intervention], index) => {
    const source = eligible.find((row) => row.ein === ein);
    return {
      queuePosition: index + 1, ein, displayName, legalName: source.name, intervention,
      nteeCode: source.nteeCode, nteeGroup: source.nteeGroup, revenueAmountUsd: source.revenueAmountUsd, taxPeriod: source.taxPeriod,
      exactContractSourceName: source.exactContractSourceName, existingScorecardKey: source.scorecardKey,
      reportStatus: config.completedInitialReviewEins.includes(ein) ? 'initial-review-complete' : 'queued',
      costEffectivenessStatus: config.exploratoryModelEins.includes(ein) ? 'exploratory-model' : 'not-estimable',
      recommendationStatus: 'not-assessed'
    };
  });
  const selected = (limit) => {
    const required = deepDiveRows.map((row) => row.ein);
    const remainder = sorted.map((row) => row.ein).filter((ein) => !queueByEin.has(ein));
    return [...required, ...remainder].slice(0, limit);
  };
  const priority1000 = selected(1000);
  const priority100 = selected(100);
  const semantic = { priority1000, priority100, deepDiveRows, advocacyEvidenceTrack: config.advocacyEvidenceTrack };
  return {
    version: 'sf-research-funnel-v0.1', generatedAt: config.generatedAt, geography: irsUniverse.geography,
    summary: { universeCount: irsUniverse.summary.organizationCount, machineEligibleCount: eligible.length, shallowScreenCount: priority1000.length, priorityReviewCount: priority100.length, deepDiveQueueCount: deepDiveRows.length, completedInitialReviewCount: deepDiveRows.filter((row) => row.reportStatus === 'initial-review-complete').length, exploratoryModelCount: deepDiveRows.filter((row) => row.costEffectivenessStatus === 'exploratory-model').length, completedCostEffectivenessCount: 0 },
    stages: [
      { key: 'universe', count: irsUniverse.summary.organizationCount, label: 'SF filing-address EINs', state: 'discovery universe' },
      { key: 'shallow', count: priority1000.length, label: 'Shallow screens', state: 'research-priority queue' },
      { key: 'priority', count: priority100.length, label: 'Priority reviews', state: 'research-priority queue' },
      { key: 'deep', count: deepDiveRows.length, label: 'Deep-dive reports', state: `${deepDiveRows.filter((row) => row.reportStatus === 'initial-review-complete').length} initial review complete` },
      { key: 'complete', count: deepDiveRows.filter((row) => row.costEffectivenessStatus === 'exploratory-model').length, label: 'Exploratory models', state: '0 recommendation-grade' }
    ],
    eligibilityContract: {
      include: 'IRS filing address in San Francisco; subsection 03; deductibility code 1; reported positive revenue; NTEE group plausibly connected to education, health, safety, employment, food, housing, youth, human services, civil rights, or community improvement. Curated deep-review candidates may enter despite a missing or misleading NTEE code, with the exception visible.',
      prioritySignals: 'Exact city-contract name link, an existing MFI dossier, tax-period recency, reported operating revenue, and a coarse intervention-tractability proxy.',
      boundary: 'This score orders research. It does not estimate effectiveness, cost-effectiveness, organizational quality, local service, room for more funding, or the expected value of a donation.'
    },
    reportContract: ['In a nutshell', 'Program and target population', 'Organization and donation vehicle', 'Evidence for the intervention', 'Organization-specific evidence', 'Reach and full cost', 'Counterfactual impact model', 'Cost-effectiveness and sensitivity', 'Room for more funding', 'Risks, reservations, and how we could be wrong', 'Grant history and look-backs', 'Sources and retrieval dates'],
    priority1000, priority100, deepDiveRows, advocacyEvidenceTrack: config.advocacyEvidenceTrack,
    workbook: config.workbook, sources: config.sources,
    interpretation: {
      ranking: 'The 1,000 and 100 are research-priority queues, not top-charity lists. The 25 are a deliberately varied deep-review queue, displayed alphabetically rather than ranked.',
      costEffectiveness: 'Exploratory models publish a best estimate, sensitivity, and explicit null-effect boundary but are not recommendations. Native outcomes come first; QALY or WELLBY conversion is published only with an inspectable, versioned model and uncertainty.',
      advocacy: 'Election and policy-advocacy organizations are researched in a separate, unranked evidence track. MFI does not endorse candidates or treat an election result as intrinsically beneficial.'
    },
    contentHash: contentHash(semantic)
  };
}

export function validateSfResearchFunnel(snapshot) {
  if (snapshot.version !== 'sf-research-funnel-v0.1') throw new Error('Unexpected SF research-funnel version.');
  if (snapshot.summary.universeCount !== 6688 || snapshot.summary.shallowScreenCount !== 1000 || snapshot.summary.priorityReviewCount !== 100 || snapshot.summary.deepDiveQueueCount !== 25) throw new Error('SF funnel stage counts do not reconcile.');
  if (!snapshot.priority100.slice(0, 25).every((ein) => snapshot.deepDiveRows.some((row) => row.ein === ein))) throw new Error('Deep-dive queue must lead priority review.');
  if (!snapshot.priority100.every((ein) => snapshot.priority1000.includes(ein))) throw new Error('Priority 100 must be a subset of shallow 1,000.');
  if (snapshot.deepDiveRows.some((row) => !['not-estimable', 'exploratory-model'].includes(row.costEffectivenessStatus) || row.recommendationStatus !== 'not-assessed')) throw new Error('Queued deep dives cannot imply recommendations or unsupported model states.');
  if (snapshot.summary.exploratoryModelCount !== snapshot.deepDiveRows.filter((row) => row.costEffectivenessStatus === 'exploratory-model').length) throw new Error('Exploratory-model count does not reconcile.');
  const semantic = { priority1000: snapshot.priority1000, priority100: snapshot.priority100, deepDiveRows: snapshot.deepDiveRows, advocacyEvidenceTrack: snapshot.advocacyEvidenceTrack };
  if (snapshot.contentHash !== contentHash(semantic)) throw new Error('SF research-funnel content hash does not reconcile.');
  return snapshot;
}

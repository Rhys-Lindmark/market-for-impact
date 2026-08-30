const CAUSES = ['Animal welfare', 'Climate', 'Education', 'Global catastrophic risks', 'Global health'];
const CURRENT_STATUSES = new Set([
  'published-numeric-current-period', 'accepting-amount-unpublished', 'rolling-allocation-amount-unpublished',
  'qualitative-need-amount-unpublished', 'published-recommendation-gap-unpublished',
]);

const regionPatterns = {
  global: /global|international|multi-country/i,
  africa: /africa|burkina faso|chad|côte d[’']ivoire|congo|mozambique|nigeria|south sudan|togo|uganda|malawi/i,
  asia: /asia|india|china|türkiye|pakistan/i,
  'latin-america': /latin america|south america|brazil/i,
  europe: /europe|european union|spain|denmark|germany|united kingdom|türkiye/i,
  'north-america': /united states|north america/i,
};

function tagsForGeography(label) {
  return Object.entries(regionPatterns).filter(([, pattern]) => pattern.test(label)).map(([key]) => key);
}

function sourceGeography(tranche, sources) {
  if (tranche.evaluatorSlug === 'animal-charity-evaluators') {
    const record = sources.ace.records.find((item) => item.slug === tranche.organizationSlug);
    return record?.geography ?? 'Not published in accepted opportunity record';
  }
  if (tranche.evaluatorSlug === 'givewell') {
    const record = sources.givewell.opportunities.find((item) => item.slug === tranche.organizationSlug);
    return record?.geographies?.join(', ') || 'Not published in accepted opportunity record';
  }
  if (tranche.evaluatorSlug === 'giving-green') {
    const record = sources.givingGreen.topRecommendations.find((item) => item.slug === tranche.organizationSlug);
    return record?.geography ?? 'Not published in accepted opportunity record';
  }
  return 'Not published in accepted opportunity record';
}

function evidenceTier(tranche) {
  if (tranche.evaluatorSlug === 'givewell') return 3;
  if (tranche.evaluatorSlug === 'animal-charity-evaluators' && tranche.marginalMetricValue != null) return 3;
  if (tranche.evaluatorSlug === 'founders-pledge' && ['teaching-at-the-right-level-africa', 'imagine-worldwide'].includes(tranche.organizationSlug)) return 3;
  if (tranche.evaluatorSlug === 'giving-green' || tranche.organizationSlug === 'givedirectly') return 2;
  return 1;
}

function uncertaintyProfile(tranche) {
  if (['givewell', 'animal-charity-evaluators'].includes(tranche.evaluatorSlug)) return 'direct-model';
  if (tranche.evaluatorSlug === 'giving-green' || ['teaching-at-the-right-level-africa', 'imagine-worldwide', 'givedirectly'].includes(tranche.organizationSlug)) return 'systems-change';
  return 'hits-based';
}

function liquidityMode(tranche) {
  return tranche.organizationSlug.startsWith('founders-pledge-') ? 'pooled-or-managed' : 'direct-organization';
}

function deploymentMode(tranche) {
  if (tranche.evaluatorSlug === 'givewell') return 'within-year';
  if (tranche.evaluatorSlug === 'animal-charity-evaluators') return 'annual';
  return 'not-published';
}

export function buildPortfolioContract({ fundingTranches, ace, givewell, givingGreen, foundersPledge }) {
  const sources = { ace, givewell, givingGreen, foundersPledge };
  const candidates = fundingTranches.tranches.map((tranche) => {
    const geography = sourceGeography(tranche, sources);
    const tier = evidenceTier(tranche);
    return {
      trancheKey: tranche.trancheKey,
      evaluatorSlug: tranche.evaluatorSlug,
      organizationSlug: tranche.organizationSlug,
      cause: tranche.cause,
      availability: CURRENT_STATUSES.has(tranche.status) ? 'current-opportunity' : 'boundary-only',
      evidenceTier: tier,
      evidenceLabel: tier === 3 ? 'quantified or modeled outcome evidence' : tier === 2 ? 'structured evaluator case' : 'qualitative or hits-based case',
      uncertaintyProfile: uncertaintyProfile(tranche),
      liquidityMode: liquidityMode(tranche),
      deploymentMode: deploymentMode(tranche),
      geography,
      geographyTags: tagsForGeography(geography),
    };
  });
  return {
    version: 'donor-portfolio-v0.1',
    generatedAt: fundingTranches.generatedAt,
    causes: CAUSES,
    controls: {
      riskTolerance: ['established', 'balanced', 'exploratory'],
      minimumEvidence: ['quantified', 'structured', 'reviewed'],
      geography: ['any', 'global', 'africa', 'asia', 'latin-america', 'europe', 'north-america'],
      liquidity: ['direct-only', 'pooled-ok'],
      timeHorizon: ['within-year', 'annual', 'flexible'],
    },
    rules: {
      weights: 'Cause weights divide the stated budget exactly. A cause filtered to zero candidates remains unallocated and is never redistributed.',
      selection: 'Within each cause, up to three eligible opportunities are selected by funding-room evidence state, then evaluator and organization name—not by a synthetic impact score.',
      allocation: 'Each cause bucket is split equally. A current numeric funding-room amount caps that candidate; unpublished room is flagged for verification before giving.',
      comparability: 'Native impact units remain unlike. No cross-cause cost-effectiveness ranking or score is produced.',
      geography: 'Geography filters use only location text in the accepted evaluator record. Missing geography never passes a named-region filter.',
    },
    candidates,
  };
}

export function validatePortfolioContract(contract, fundingTranches) {
  if (contract.version !== 'donor-portfolio-v0.1') throw new Error('Unexpected donor-portfolio version.');
  if (contract.candidates.length !== fundingTranches.tranches.length) throw new Error('Every funding tranche must have one portfolio classification.');
  if (new Set(contract.candidates.map((item) => item.trancheKey)).size !== contract.candidates.length) throw new Error('Portfolio tranche keys must be unique.');
  for (const candidate of contract.candidates) {
    if (!CAUSES.includes(candidate.cause)) throw new Error(`${candidate.trancheKey} has an unsupported cause.`);
    if (![1, 2, 3].includes(candidate.evidenceTier)) throw new Error(`${candidate.trancheKey} has an invalid evidence tier.`);
    if (!candidate.geography || !Array.isArray(candidate.geographyTags)) throw new Error(`${candidate.trancheKey} is missing geography evidence.`);
  }
  return contract;
}

const evidenceFloors = { quantified: 3, structured: 2, reviewed: 1 };
const riskProfiles = {
  established: new Set(['direct-model']), balanced: new Set(['direct-model', 'systems-change']),
  exploratory: new Set(['direct-model', 'systems-change', 'hits-based']),
};
const horizonProfiles = {
  'within-year': new Set(['within-year']), annual: new Set(['within-year', 'annual']),
  flexible: new Set(['within-year', 'annual', 'not-published']),
};
const statusOrder = new Map([
  ['published-numeric-current-period', 0], ['rolling-allocation-amount-unpublished', 1],
  ['accepting-amount-unpublished', 2], ['published-recommendation-gap-unpublished', 3],
  ['qualitative-need-amount-unpublished', 4],
]);

export function normalizePortfolioInput(input, contract) {
  const budgetUsd = Math.round(Number(input.budgetUsd));
  if (!Number.isFinite(budgetUsd) || budgetUsd < 100 || budgetUsd > 100000000) throw new Error('Budget must be between $100 and $100,000,000.');
  const weights = Object.fromEntries(contract.causes.map((cause) => [cause, Math.max(0, Math.round(Number(input.causeWeights?.[cause] ?? 0)))]));
  if (Object.values(weights).reduce((sum, value) => sum + value, 0) === 0) throw new Error('At least one cause weight must be positive.');
  for (const [key, options] of Object.entries(contract.controls)) if (!options.includes(input[key])) throw new Error(`Unsupported ${key}.`);
  return { budgetUsd, causeWeights: weights, riskTolerance: input.riskTolerance, minimumEvidence: input.minimumEvidence,
    geography: input.geography, liquidity: input.liquidity, timeHorizon: input.timeHorizon };
}

function exclusionReasons(candidate, tranche, input) {
  const reasons = [];
  if (candidate.availability !== 'current-opportunity') reasons.push('not a current funding opportunity');
  if (candidate.evidenceTier < evidenceFloors[input.minimumEvidence]) reasons.push(`below the ${input.minimumEvidence} evidence floor`);
  if (!riskProfiles[input.riskTolerance].has(candidate.uncertaintyProfile)) reasons.push(`outside the ${input.riskTolerance} uncertainty profile`);
  if (input.geography !== 'any' && !candidate.geographyTags.includes(input.geography)) reasons.push(`accepted geography does not support ${input.geography}`);
  if (input.liquidity === 'direct-only' && candidate.liquidityMode !== 'direct-organization') reasons.push('requires a pooled or managed vehicle');
  if (!horizonProfiles[input.timeHorizon].has(candidate.deploymentMode)) reasons.push(`deployment timing does not meet ${input.timeHorizon}`);
  if (!CURRENT_STATUSES.has(tranche.status)) reasons.push(`funding status is ${tranche.status.replaceAll('-', ' ')}`);
  return [...new Set(reasons)];
}

function allocateBucket(amount, candidates) {
  if (!candidates.length || amount <= 0) return { allocations: [], unallocatedUsd: amount };
  let remaining = amount;
  const allocations = candidates.map((candidate, index) => {
    const slots = candidates.length - index;
    const target = Math.round(remaining / slots);
    const allocationUsd = candidate.amountUsd == null ? target : Math.min(target, candidate.amountUsd);
    remaining -= allocationUsd;
    return { ...candidate, allocationUsd, roomVerification: candidate.amountUsd == null ? 'verify-current-room-before-giving' : 'capped-by-published-current-room' };
  });
  return { allocations, unallocatedUsd: remaining };
}

export function buildDonorPortfolio(contract, tranches, rawInput) {
  const input = normalizePortfolioInput(rawInput, contract);
  const trancheMap = new Map(tranches.map((item) => [item.trancheKey, item]));
  const totalWeight = Object.values(input.causeWeights).reduce((sum, value) => sum + value, 0);
  const weightedBuckets = contract.causes.map((cause, index) => {
    const exact = input.budgetUsd * input.causeWeights[cause] / totalWeight;
    return { cause, index, amount: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let remainderDollars = input.budgetUsd - weightedBuckets.reduce((sum, item) => sum + item.amount, 0);
  for (const bucket of [...weightedBuckets].sort((a, b) => b.remainder - a.remainder || a.index - b.index)) {
    if (remainderDollars === 0) break;
    bucket.amount += 1;
    remainderDollars -= 1;
  }
  const bucketAmounts = new Map(weightedBuckets.map((item) => [item.cause, item.amount]));
  const buckets = [];
  const allocations = [];
  const exclusions = [];
  for (const cause of contract.causes) {
    const weight = input.causeWeights[cause];
    const bucketUsd = bucketAmounts.get(cause) ?? 0;
    const evaluated = contract.candidates.filter((item) => item.cause === cause).map((candidate) => {
      const tranche = trancheMap.get(candidate.trancheKey);
      if (!tranche) throw new Error(`Missing live tranche ${candidate.trancheKey}.`);
      return { candidate, tranche, reasons: exclusionReasons(candidate, tranche, input) };
    });
    const eligible = evaluated.filter((item) => item.reasons.length === 0).sort((a, b) =>
      (statusOrder.get(a.tranche.status) ?? 99) - (statusOrder.get(b.tranche.status) ?? 99)
      || a.tranche.evaluator.localeCompare(b.tranche.evaluator) || a.tranche.organization.localeCompare(b.tranche.organization)).slice(0, 3)
      .map(({ candidate, tranche }) => ({ ...candidate, ...tranche }));
    const result = allocateBucket(bucketUsd, eligible);
    allocations.push(...result.allocations);
    exclusions.push(...evaluated.filter((item) => item.reasons.length).map(({ candidate, tranche, reasons }) => ({
      trancheKey: candidate.trancheKey, organization: tranche.organization, cause, reasons,
    })));
    buckets.push({ cause, weight, requestedUsd: bucketUsd, eligibleCount: eligible.length, selectedCount: result.allocations.length,
      allocatedUsd: bucketUsd - result.unallocatedUsd, unallocatedUsd: result.unallocatedUsd });
  }
  const allocatedUsd = allocations.reduce((sum, item) => sum + item.allocationUsd, 0);
  return {
    version: contract.version, generatedAt: contract.generatedAt, input,
    summary: { budgetUsd: input.budgetUsd, allocatedUsd, unallocatedUsd: input.budgetUsd - allocatedUsd,
      allocationCount: allocations.length, causeCount: buckets.filter((item) => item.weight > 0).length,
      verifyRoomCount: allocations.filter((item) => item.roomVerification === 'verify-current-room-before-giving').length },
    buckets, allocations, exclusions, rules: contract.rules,
  };
}

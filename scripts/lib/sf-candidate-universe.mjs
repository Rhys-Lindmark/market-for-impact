import crypto from 'node:crypto';

const identity = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
const sum = (rows, key) => Math.round(rows.reduce((total, row) => total + Number(row[key] ?? 0), 0) * 100) / 100;
const stableId = (name) => crypto.createHash('sha256').update(identity(name)).digest('hex').slice(0, 16);
const contentHash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function buildSfCandidateUniverse({ publicFunding, diligenceConfig, diligence, ontology }) {
  const contractsByName = new Map();
  for (const contract of publicFunding.contracts) {
    const key = identity(contract.primeContractor);
    if (!contractsByName.has(key)) contractsByName.set(key, []);
    contractsByName.get(key).push(contract);
  }

  const diligenceByAlias = new Map();
  for (const candidate of diligenceConfig.candidates) {
    for (const alias of candidate.contractAliases) diligenceByAlias.set(identity(alias), candidate.key);
  }
  const diligenceByKey = new Map(diligence.candidates.map((candidate) => [candidate.key, candidate]));
  const organizations = [...contractsByName.values()].map((contracts) => {
    const sourceName = contracts[0].primeContractor;
    const outcomeKeys = [...new Set(contracts.flatMap((row) => row.outcomeKeys))].sort();
    const departments = [...new Set(contracts.map((row) => row.department))].sort();
    const diligenceKey = diligenceByAlias.get(identity(sourceName)) ?? null;
    return {
      id: stableId(sourceName), sourceName,
      identityStatus: 'source-name-only',
      contractCount: contracts.length,
      classifiedContractCount: contracts.filter((row) => row.outcomeKeys.length > 0).length,
      unclassifiedContractCount: contracts.filter((row) => row.outcomeKeys.length === 0).length,
      contractAuthorityUsd: sum(contracts, 'awardUsd'),
      paymentsMadeUsd: sum(contracts, 'paymentsMadeUsd'),
      remainingAuthorityUsd: sum(contracts, 'remainingAuthorityUsd'),
      departments, outcomeKeys,
      diligenceKey,
      diligenceName: diligenceKey ? diligenceByKey.get(diligenceKey)?.name ?? null : null,
      impactEvidenceStatus: diligenceKey ? 'initial-scorecard' : 'not-yet-assessed',
      roomForMoreFundingUsd: null,
      roomForMoreFundingStatus: 'not-yet-assessed'
    };
  }).sort((a, b) => a.sourceName.localeCompare(b.sourceName));

  const outcomeLabels = new Map(ontology.outcomes.map((outcome) => [outcome.key, outcome.label]));
  const outcomes = ontology.outcomes.map((outcome) => {
    const rows = organizations.filter((organization) => organization.outcomeKeys.includes(outcome.key));
    const linkedContracts = publicFunding.contracts.filter((contract) => contract.outcomeKeys.includes(outcome.key));
    return {
      key: outcome.key, label: outcome.label,
      sourceOrganizationNameCount: rows.length,
      contractCount: linkedContracts.length,
      contractAuthorityUsd: sum(linkedContracts, 'awardUsd'),
      boundary: 'Text-rule mapping from contract title, scope, and department; this is discovery metadata, not evidence that the organization caused the outcome.'
    };
  });
  const deepKeysInUniverse = new Set(organizations.map((row) => row.diligenceKey).filter(Boolean));
  const semantic = { organizations, outcomes };
  return {
    version: 'sf-candidate-universe-v0.1',
    generatedAt: publicFunding.generatedAt,
    geography: 'San Francisco, California',
    source: {
      publisher: 'DataSF',
      title: 'Citywide nonprofit prime contracts active on the snapshot date',
      snapshotVersion: publicFunding.version,
      snapshotDate: publicFunding.snapshotDate,
      queryUrl: publicFunding.sources.find((source) => source.key === 'contracts')?.queryUrl ?? null,
      retrievedAt: publicFunding.sources.find((source) => source.key === 'contracts')?.retrievedAt ?? null,
      contentHash: contentHash(semantic)
    },
    summary: {
      activeContractCount: publicFunding.contracts.length,
      sourceOrganizationNameCount: organizations.length,
      outcomeMappedOrganizationNameCount: organizations.filter((row) => row.outcomeKeys.length > 0).length,
      unclassifiedOnlyOrganizationNameCount: organizations.filter((row) => row.outcomeKeys.length === 0).length,
      deepDiligenceCount: diligence.candidates.length,
      deepDiligenceInUniverseCount: deepKeysInUniverse.size,
      deepDiligenceOutsideUniverseCount: diligence.candidates.length - deepKeysInUniverse.size,
      publishableRoomForFundingCount: 0
    },
    outcomes,
    organizations,
    interpretation: {
      denominator: 'This is a complete grouping of the active DataSF nonprofit-prime-contract snapshot by Unicode-, whitespace-, and case-normalized published contractor name. It is not a census of Bay Area nonprofits, and one legal entity may appear under more than one source name.',
      identity: 'Rows are source-name identities, not EIN-verified organizations. Exact aliases connect four rows to an existing MFI scorecard; fuzzy merges are prohibited.',
      scale: 'Contract authority, payments, and remaining authority are public-accounting context. They do not measure nonprofit revenue, capacity, philanthropic need, effectiveness, or room for more funding.',
      cause: `Outcome labels (${[...outcomeLabels.values()].join(', ')}) come from MFI's contract-text rules. Unclassified means the accepted rules found no match, not that the work lacks impact.`,
      recommendation: 'Every row is a discovery lead. Only six organizations have initial scorecards, none has a published, independently reviewed marginal funding gap, and this universe makes no recommendation.'
    }
  };
}

export function validateSfCandidateUniverse(snapshot) {
  if (snapshot.version !== 'sf-candidate-universe-v0.1') throw new Error('Unexpected SF candidate-universe version.');
  if (snapshot.summary.sourceOrganizationNameCount !== snapshot.organizations.length) throw new Error('SF organization count does not reconcile.');
  if (snapshot.summary.activeContractCount !== snapshot.organizations.reduce((total, row) => total + row.contractCount, 0)) throw new Error('SF active-contract count does not reconcile.');
  if (new Set(snapshot.organizations.map((row) => row.id)).size !== snapshot.organizations.length) throw new Error('Duplicate SF organization ID.');
  if (snapshot.organizations.some((row) => !row.sourceName || row.identityStatus !== 'source-name-only')) throw new Error('Every SF universe row must retain its source-name identity boundary.');
  if (snapshot.organizations.some((row) => row.roomForMoreFundingUsd !== null || row.roomForMoreFundingStatus !== 'not-yet-assessed')) throw new Error('SF candidate universe inferred room for more funding.');
  if (snapshot.summary.publishableRoomForFundingCount !== 0) throw new Error('SF candidate universe cannot publish a funding gap before diligence.');
  if (snapshot.outcomes.length !== 8 || snapshot.organizations.some((row) => row.outcomeKeys.some((key) => !snapshot.outcomes.some((outcome) => outcome.key === key)))) throw new Error('SF outcome mapping does not reconcile.');
  const expectedHash = contentHash({ organizations: snapshot.organizations, outcomes: snapshot.outcomes });
  if (snapshot.source.contentHash !== expectedHash) throw new Error('SF candidate-universe hash does not reconcile.');
  return snapshot;
}

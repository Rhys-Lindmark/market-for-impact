import { createHash } from 'node:crypto';
import { decodeHtmlEntities } from './html-entities.mjs';

export const AI_FUND = 'Navigating Transformative AI';
export const taxonomyVersion = 'ai-safety-ecosystem-v1-2026-08-30';

export const categories = [
  { key: 'technical-safety', label: 'Technical safety', description: 'Alignment, interpretability, robustness, control, and other technical work intended to reduce loss-of-control risk.' },
  { key: 'governance-policy', label: 'Governance & policy', description: 'Law, regulation, standards, state capacity, international coordination, and policy research.' },
  { key: 'evaluations-auditing', label: 'Evaluations & auditing', description: 'Benchmarks, red-teaming, model evaluations, verification, safety cases, and independent testing.' },
  { key: 'biosecurity-overlap', label: 'Biosecurity overlap', description: 'Work at the AI–biology boundary, including biological-capability evaluation and catastrophic-biorisk mitigation.' },
  { key: 'field-building', label: 'Field-building', description: 'Research communities, convenings, regranting, communications, and shared infrastructure for the field.' },
  { key: 'effective-careers', label: 'Effective careers', description: 'Career transitions, recruiting, training, fellowships, and talent pipelines into high-impact AI work.' },
  { key: 'unclassified', label: 'Unclassified', description: 'Published grants whose purpose and recipient do not support a responsible role assignment under v1 rules.' },
];

export const keywordRules = {
  'technical-safety': ['alignment', 'interpretability', 'mechanistic', 'robustness', 'scalable oversight', 'adversarial training', 'corrigibility', 'agent foundations', 'control agenda', 'model organisms', 'loss of control', 'technical ai safety', 'misalignment'],
  'governance-policy': ['governance', 'policy', 'regulation', 'regulatory', 'law ', 'legal', 'legislation', 'standards', 'government', 'public sector', 'national security', 'diplomacy', 'treaty', 'multilateral', 'advocacy'],
  'evaluations-auditing': ['evaluation', 'evals', 'benchmark', 'auditing', 'audit ', 'red team', 'red-team', 'safety testing', 'model testing', 'verification', 'safety case'],
  'biosecurity-overlap': ['biosecurity', 'biological', 'biorisk', 'bio risk', 'pandemic', 'pathogen', 'bioweapon', 'biosafety', 'synthetic biology', 'biotech', 'nucleic acid'],
  'field-building': ['field-building', 'field building', 'ecosystem', 'conference', 'workshop', 'community building', 'communications', 'journalism', 'media', 'outreach', 'convening', 'regranting', 'research agenda'],
  'effective-careers': ['career', 'recruiting', 'recruitment', 'placement', 'talent pipeline', 'professional development', 'job board'],
};

export const reviewedOrganizationRoles = {
  'Center for Security and Emerging Technology': { roles: ['governance-policy'], primary: 'governance-policy' },
  'Redwood Research': { roles: ['technical-safety'], primary: 'technical-safety' },
  'FAR AI': { roles: ['technical-safety', 'evaluations-auditing', 'field-building'], primary: 'evaluations-auditing' },
  'RAND Corporation': { roles: ['governance-policy', 'evaluations-auditing'], primary: 'governance-policy' },
  'Centre for the Governance of AI': { roles: ['governance-policy', 'field-building'], primary: 'governance-policy' },
  'Institute for AI Policy and Strategy': { roles: ['governance-policy'], primary: 'governance-policy' },
  'BlueDot Impact': { roles: ['effective-careers', 'field-building'], primary: 'effective-careers' },
  'Constellation': { roles: ['field-building'], primary: 'field-building' },
  'Machine Intelligence Research Institute': { roles: ['technical-safety'], primary: 'technical-safety' },
  'Timaeus Research': { roles: ['technical-safety'], primary: 'technical-safety' },
  'Center for a New American Security': { roles: ['governance-policy'], primary: 'governance-policy' },
  'Berkeley Existential Risk Initiative': { roles: ['field-building', 'effective-careers'], primary: 'field-building' },
  'AI Village': { roles: ['field-building'], primary: 'field-building' },
  'Center for AI Safety': { roles: ['technical-safety', 'field-building'], primary: 'technical-safety' },
  'Institute for Law & AI': { roles: ['governance-policy', 'field-building'], primary: 'governance-policy' },
  'MATS Research': { roles: ['effective-careers', 'technical-safety'], primary: 'effective-careers' },
  'AI Safety Support': { roles: ['effective-careers', 'field-building'], primary: 'effective-careers' },
  'AI Alignment Foundation': { roles: ['technical-safety'], primary: 'technical-safety' },
  'AI Verification and Evaluation Research Institute (AVERI)': { roles: ['evaluations-auditing'], primary: 'evaluations-auditing' },
  'Apollo Research': { roles: ['evaluations-auditing', 'technical-safety'], primary: 'evaluations-auditing' },
  'Palisade Research': { roles: ['evaluations-auditing'], primary: 'evaluations-auditing' },
  'The Centre for Long-Term Resilience': { roles: ['governance-policy'], primary: 'governance-policy' },
  'Effective Institutions Project': { roles: ['governance-policy'], primary: 'governance-policy' },
  'SecureBio': { roles: ['biosecurity-overlap', 'evaluations-auditing'], primary: 'biosecurity-overlap' },
  'London Initiative for Safe AI': { roles: ['field-building'], primary: 'field-building' },
  'Cambridge Boston Alignment Initiative': { roles: ['field-building', 'effective-careers'], primary: 'field-building' },
  'Talos Network': { roles: ['governance-policy', 'field-building'], primary: 'governance-policy' },
};

export const foundersPledgeAliases = {
  'Centre for Long-Term Resilience': 'The Centre for Long-Term Resilience',
  'Institute for Law and AI': 'Institute for Law & AI',
};

function normalize(value) {
  return decodeHtmlEntities(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function organizationSlug(value) {
  return normalize(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function classifyGrant(record) {
  const text = `${record.purpose ?? ''} ${(record.recipients ?? []).join(' ')}`.toLowerCase();
  const roles = new Set();
  const basis = [];
  for (const [role, terms] of Object.entries(keywordRules)) {
    const matched = terms.filter((term) => text.includes(term));
    if (matched.length) {
      roles.add(role);
      basis.push(`keyword:${role}:${matched.join('|')}`);
    }
  }
  for (const recipient of record.recipients ?? []) {
    const reviewed = reviewedOrganizationRoles[recipient];
    if (!reviewed) continue;
    for (const role of reviewed.roles) roles.add(role);
    basis.push(`reviewed-organization:${recipient}`);
  }
  if (!roles.size) {
    roles.add('unclassified');
    basis.push('no-reviewed-role-or-keyword-match');
  }
  return { roles: [...roles].sort(), basis: [...new Set(basis)].sort() };
}

export function semanticHash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function buildAiSafetyEcosystem(coefficient, foundersPledge, generatedAt) {
  const grants = coefficient.records.filter((record) => record.listedFunds.includes(AI_FUND));
  const organizations = new Map();
  const grantClassifications = grants.map((grant) => {
    const recipients = grant.recipients.map(normalize);
    const classification = classifyGrant({ ...grant, recipients });
    for (const recipient of recipients) {
      const current = organizations.get(recipient) ?? {
        organization: recipient, slug: organizationSlug(recipient), grantCount: 0, publishedAmountUsd: 0,
        latestAwardDate: null, roles: new Set(), basis: new Set(), roleAmounts: new Map(), sourceRecordIds: [],
      };
      current.grantCount += 1;
      current.publishedAmountUsd += grant.amountUsd ?? 0;
      current.latestAwardDate = !current.latestAwardDate || grant.awardDate > current.latestAwardDate ? grant.awardDate : current.latestAwardDate;
      current.sourceRecordIds.push(grant.sourceRecordId);
      for (const role of classification.roles) {
        current.roles.add(role);
        current.roleAmounts.set(role, (current.roleAmounts.get(role) ?? 0) + (grant.amountUsd ?? 0));
      }
      for (const item of classification.basis) current.basis.add(item);
      organizations.set(recipient, current);
    }
    return {
      sourceRecordId: grant.sourceRecordId, roles: classification.roles, basis: classification.basis,
      amountUsd: grant.amountUsd, awardDate: grant.awardDate, recipient: recipients[0] ?? null,
    };
  });

  const fpRecords = foundersPledge.records.filter((record) => record.cause === 'Global catastrophic risks'
    && record.opportunityType === 'published-organization-recommendation');
  const fpByCanonical = new Map(fpRecords.map((record) => [foundersPledgeAliases[record.organization] ?? record.organization, record]));
  const categoryOrder = categories.map((category) => category.key);
  const organizationRows = [...organizations.values()].map((record) => {
    const reviewed = reviewedOrganizationRoles[record.organization];
    const roles = [...record.roles].sort();
    const primaryRole = reviewed?.primary ?? roles.slice().sort((a, b) =>
      (record.roleAmounts.get(b) ?? 0) - (record.roleAmounts.get(a) ?? 0) || categoryOrder.indexOf(a) - categoryOrder.indexOf(b))[0];
    const fp = fpByCanonical.get(record.organization);
    return {
      organization: record.organization, slug: record.slug, grantCount: record.grantCount,
      publishedAmountUsd: record.publishedAmountUsd, latestAwardDate: record.latestAwardDate,
      roles, primaryRole, classificationBasis: [...record.basis].sort(), sourceRecordIds: record.sourceRecordIds.sort(),
      foundersPledge: fp ? { status: fp.status, sourceName: fp.organization, sourceKey: fp.sourceKey } : null,
    };
  }).sort((a, b) => b.publishedAmountUsd - a.publishedAmountUsd || a.organization.localeCompare(b.organization));

  const categorySummary = categories.map((category) => {
    const classifiedGrants = grantClassifications.filter((grant) => grant.roles.includes(category.key));
    const classifiedOrganizations = organizationRows.filter((organization) => organization.roles.includes(category.key));
    return {
      ...category, grantCount: classifiedGrants.length,
      publishedAmountUsd: classifiedGrants.reduce((sum, grant) => sum + (grant.amountUsd ?? 0), 0),
      organizationCount: classifiedOrganizations.length,
    };
  });
  const externalOnlyRecommendations = fpRecords.filter((record) => !organizations.has(foundersPledgeAliases[record.organization] ?? record.organization))
    .map((record) => ({ organization: record.organization, slug: record.slug, sourceKey: record.sourceKey, status: record.status }));
  const semantic = {
    taxonomyVersion, coefficientSource: coefficient.source, foundersPledgeHash: foundersPledge.contentHash,
    categories: categorySummary, grantClassifications, organizations: organizationRows, externalOnlyRecommendations,
  };
  return {
    ...semantic, generatedAt,
    summary: {
      grantCount: grants.length,
      publishedAmountUsd: grants.reduce((sum, grant) => sum + (grant.amountUsd ?? 0), 0),
      organizationCount: organizationRows.length,
      missingRecipientGrantCount: grants.filter((grant) => grant.recipients.length === 0).length,
      multiRecipientGrantCount: grants.filter((grant) => grant.recipients.length > 1).length,
      foundersPledgeOverlapCount: organizationRows.filter((organization) => organization.foundersPledge).length,
      foundersPledgeOnlyCount: externalOnlyRecommendations.length,
      roleAssignmentCount: organizationRows.reduce((sum, organization) => sum + organization.roles.length, 0),
    },
    contentHash: semanticHash(semantic),
    coverageNote: 'All accepted Coefficient public-index grants tagged Navigating Transformative AI. Roles are multi-label and non-additive. Published amounts describe historical grant rows, not current room for more funding or effectiveness.',
    classificationNote: 'A role requires a reviewed organization assignment or a visible keyword in the published recipient/purpose text. Unmatched rows remain unclassified. Primary role is a navigation aid, not a rank.',
  };
}

export function validateAiSafetyEcosystem(snapshot) {
  if (snapshot.summary.grantCount !== 630) throw new Error(`Expected 630 AI grants, found ${snapshot.summary.grantCount}.`);
  if (snapshot.summary.publishedAmountUsd !== 972185421) throw new Error(`AI grant total changed: ${snapshot.summary.publishedAmountUsd}.`);
  if (snapshot.summary.organizationCount !== 285 || snapshot.summary.missingRecipientGrantCount !== 1 || snapshot.summary.multiRecipientGrantCount !== 0) {
    throw new Error('AI recipient reconciliation changed.');
  }
  if (snapshot.summary.foundersPledgeOverlapCount !== 5 || snapshot.summary.foundersPledgeOnlyCount !== 1) throw new Error('Founders Pledge reconciliation changed.');
  if (snapshot.categories.length !== 7 || snapshot.categories.some((category) => category.grantCount === 0)) throw new Error('Every AI taxonomy category must retain evidence.');
  if (snapshot.grantClassifications.length !== 630 || new Set(snapshot.grantClassifications.map((grant) => grant.sourceRecordId)).size !== 630) {
    throw new Error('AI grant classifications must be complete and unique.');
  }
  const semantic = {
    taxonomyVersion: snapshot.taxonomyVersion, coefficientSource: snapshot.coefficientSource,
    foundersPledgeHash: snapshot.foundersPledgeHash, categories: snapshot.categories,
    grantClassifications: snapshot.grantClassifications, organizations: snapshot.organizations,
    externalOnlyRecommendations: snapshot.externalOnlyRecommendations,
  };
  if (semanticHash(semantic) !== snapshot.contentHash) throw new Error('AI ecosystem content hash does not reconcile.');
  return snapshot;
}

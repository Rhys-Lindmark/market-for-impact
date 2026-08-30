import { env } from 'cloudflare:workers';
import coefficientAllSnapshot from '@/data/coefficient/all-grants.json';
import coefficientSnapshot from '@/data/normalized/coefficient-effective-giving-and-careers.json';
import giveWellSnapshot from '@/data/normalized/givewell-grants.json';
import renPhilSnapshot from '@/data/renphil/ai-for-math-2025.json';
import givingGreenSnapshot from '@/data/giving-green/recommendations-2025-2026.json';
import { ensureAllCoefficientSnapshot } from '@/db/coefficient-all';
import { ensureCurrentSnapshot } from '@/db/coefficient';
import { ensureGiveWellSnapshot } from '@/db/givewell';
import { ensureRenPhilSnapshot } from '@/db/renphil';
import { ensureGivingGreenSnapshot } from '@/db/giving-green';
import { ensureFoundersPledgeSnapshot } from '@/db/founders-pledge';
import { grantPath, type GrantSourceKey, parseStringArray } from '@/db/detail-contract';

const sourceDefinitions: Record<GrantSourceKey, { url: string; ensure: () => Promise<unknown> }> = {
  coefficient: { url: coefficientAllSnapshot.source.url, ensure: ensureAllCoefficientSnapshot },
  'coefficient-egc': { url: coefficientSnapshot.source.url, ensure: ensureCurrentSnapshot },
  givewell: { url: giveWellSnapshot.source.url, ensure: ensureGiveWellSnapshot },
  renphil: { url: renPhilSnapshot.source.url, ensure: ensureRenPhilSnapshot },
  'giving-green': { url: givingGreenSnapshot.source.url, ensure: ensureGivingGreenSnapshot },
};

const sourceKeyByUrl = new Map(Object.entries(sourceDefinitions).map(([key, value]) => [value.url, key as GrantSourceKey]));

type GrantRow = {
  grant_id: number;
  source_record_id: string;
  source_url: string | null;
  amount_usd: number | null;
  amount_original: number | null;
  currency: string | null;
  status: string;
  decision_date: number | null;
  award_date: number | null;
  source_published_at: number | null;
  recipient_names_json: string;
  focus_areas_json: string;
  listed_funds_json: string;
  topics_json: string;
  funders_json: string;
  countries_json: string;
  cause: string;
  intervention: string | null;
  geography: string | null;
  purpose: string | null;
  grouped_grant: number;
  publisher: string;
  source_title: string;
  ledger_url: string;
  retrieved_at: number;
  coverage_note: string | null;
  recipient_name: string | null;
  recipient_slug: string | null;
  recipient_url: string | null;
  originating_funder_name: string | null;
  originating_funder_slug: string | null;
  advising_funder_name: string | null;
  advising_funder_slug: string | null;
};

type LinkedOrganization = { name: string; slug: string; url: string | null; sourceName: string; position: number };

function projectName(source: GrantSourceKey, sourceRecordId: string) {
  if (source !== 'renphil') return null;
  return renPhilSnapshot.records.find((record) => record.sourceRecordId === sourceRecordId)?.project ?? null;
}

function mapGrant(row: GrantRow, source: GrantSourceKey, recipientOrganizations: LinkedOrganization[] = []) {
  const recipients = parseStringArray(row.recipient_names_json);
  return {
    source,
    sourceRecordId: row.source_record_id,
    path: grantPath(source, row.source_record_id),
    title: projectName(source, row.source_record_id) ?? row.recipient_name ?? recipientOrganizations[0]?.name ?? (recipients.join(' + ') || 'Published grant'),
    sourceUrl: row.source_url,
    amountUsd: row.amount_usd,
    amountOriginal: row.amount_original,
    currency: row.currency,
    status: row.status,
    decisionDate: row.decision_date,
    awardDate: row.award_date,
    sourcePublishedAt: row.source_published_at,
    recipients,
    recipientOrganizations,
    recipient: row.recipient_name ? { name: row.recipient_name, slug: row.recipient_slug, url: row.recipient_url } : null,
    originatingFunder: row.originating_funder_name ? { name: row.originating_funder_name, slug: row.originating_funder_slug } : null,
    advisingFunder: row.advising_funder_name ? { name: row.advising_funder_name, slug: row.advising_funder_slug } : null,
    focusAreas: parseStringArray(row.focus_areas_json),
    listedFunds: parseStringArray(row.listed_funds_json),
    topics: parseStringArray(row.topics_json),
    funders: parseStringArray(row.funders_json),
    countries: parseStringArray(row.countries_json),
    cause: row.cause,
    intervention: row.intervention,
    geography: row.geography,
    purpose: row.purpose,
    groupedGrant: Boolean(row.grouped_grant),
    provenance: {
      publisher: row.publisher,
      title: row.source_title,
      url: row.ledger_url,
      retrievedAt: row.retrieved_at,
      coverageNote: row.coverage_note,
    },
  };
}

const grantSelect = `SELECT g.id AS grant_id, g.source_record_id, g.source_url, g.amount_usd, g.amount_original, g.currency,
  g.status, g.decision_date, g.award_date, g.source_published_at, g.recipient_names_json,
  g.focus_areas_json, g.listed_funds_json, g.topics_json, g.funders_json, g.countries_json,
  g.cause, g.intervention, g.geography, g.purpose, g.grouped_grant,
  s.publisher, s.title AS source_title, s.url AS ledger_url, s.retrieved_at, s.coverage_note,
  recipient.canonical_name AS recipient_name, recipient.slug AS recipient_slug, recipient.website_url AS recipient_url,
  originating.canonical_name AS originating_funder_name, originating.slug AS originating_funder_slug,
  advising.canonical_name AS advising_funder_name, advising.slug AS advising_funder_slug
  FROM grants g JOIN sources s ON s.id = g.source_id
  LEFT JOIN organizations recipient ON recipient.id = g.recipient_id
  LEFT JOIN organizations originating ON originating.id = g.originating_funder_id
  LEFT JOIN organizations advising ON advising.id = g.advising_funder_id`;

export async function getGrantDetail(source: GrantSourceKey, sourceRecordId: string) {
  const definition = sourceDefinitions[source];
  await definition.ensure();
  const row = await env.DB.prepare(`${grantSelect}
    WHERE s.url = ? AND g.source_record_id = ? AND g.last_seen_at = s.retrieved_at LIMIT 1`)
    .bind(definition.url, sourceRecordId).first<GrantRow>();
  if (!row) return null;
  const recipients = await env.DB.prepare(`SELECT o.canonical_name AS name, o.slug, o.website_url AS url,
    role.source_name, role.position FROM grant_organization_roles role
    JOIN organizations o ON o.id = role.organization_id
    WHERE role.grant_id = ? AND role.role = 'recipient' ORDER BY role.position, o.canonical_name`)
    .bind(row.grant_id).all<{ name: string; slug: string; url: string | null; source_name: string; position: number }>();
  return mapGrant(row, source, recipients.results.map((recipient) => ({
    name: recipient.name,
    slug: recipient.slug,
    url: recipient.url,
    sourceName: recipient.source_name,
    position: recipient.position,
  })));
}

async function ensureAllMarketData() {
  // Keep writes deterministic because two Coefficient ledgers share an adviser identity.
  await ensureAllCoefficientSnapshot();
  await ensureCurrentSnapshot();
  await ensureGiveWellSnapshot();
  await ensureRenPhilSnapshot();
  await ensureGivingGreenSnapshot();
  await ensureFoundersPledgeSnapshot();
}

type Relationship = 'received' | 'advised' | 'originated';

function relationshipRole(relationship: Relationship) {
  if (relationship === 'received') return 'recipient';
  if (relationship === 'advised') return 'advising-funder';
  return 'originating-funder';
}

async function relationshipSummary(organizationId: number, relationship: Relationship) {
  const role = relationshipRole(relationship);
  const dedupeSubset = `AND NOT (s.url = ? AND EXISTS (
    SELECT 1 FROM grants superset JOIN sources superset_source ON superset_source.id = superset.source_id
    WHERE superset_source.url = ? AND superset.source_record_id = g.source_record_id
      AND superset.last_seen_at = superset_source.retrieved_at))`;
  const bindings: Array<string | number> = [organizationId, role, coefficientSnapshot.source.url, coefficientAllSnapshot.source.url];
  const summary = await env.DB.prepare(`SELECT COUNT(*) AS count, COALESCE(SUM(amount_usd), 0) AS known_amount_usd,
    SUM(CASE WHEN amount_usd IS NULL THEN 1 ELSE 0 END) AS missing_amount_count
    FROM grant_organization_roles relationship JOIN grants g ON g.id = relationship.grant_id
    JOIN sources s ON s.id = g.source_id
    WHERE relationship.organization_id = ? AND relationship.role = ?
      AND g.last_seen_at = s.retrieved_at ${dedupeSubset}`).bind(...bindings).first<{
      count: number; known_amount_usd: number; missing_amount_count: number;
    }>();
  const rows = await env.DB.prepare(`${grantSelect}
    WHERE g.id IN (SELECT grant_id FROM grant_organization_roles
      WHERE organization_id = ? AND role = ?) AND g.last_seen_at = s.retrieved_at ${dedupeSubset}
    ORDER BY COALESCE(g.award_date, g.decision_date, g.source_published_at) DESC,
      g.amount_usd DESC, g.source_record_id ASC LIMIT 24`).bind(...bindings).all<GrantRow>();
  return {
    relationship,
    summary: summary ?? { count: 0, known_amount_usd: 0, missing_amount_count: 0 },
    grants: rows.results.map((row) => {
      const source = sourceKeyByUrl.get(row.ledger_url);
      return source ? mapGrant(row, source) : null;
    }).filter((grant): grant is NonNullable<typeof grant> => grant !== null),
  };
}

export async function getOrganizationDetail(slug: string) {
  await ensureAllMarketData();
  const organization = await env.DB.prepare(`SELECT id, canonical_name, slug, website_url, organization_type,
    country_code FROM organizations WHERE slug = ?`).bind(slug).first<{
      id: number; canonical_name: string; slug: string; website_url: string | null;
      organization_type: string; country_code: string | null;
    }>();
  if (!organization) return null;

  const [received, advised, originated, assessments, sourceNames] = await Promise.all([
    relationshipSummary(organization.id, 'received'),
    relationshipSummary(organization.id, 'advised'),
    relationshipSummary(organization.id, 'originated'),
    env.DB.prepare(`SELECT a.recommendation_status, a.assessment_date, a.evidence_level,
      a.native_metric_name, a.native_metric_value, a.native_metric_unit, a.benchmark_name,
      a.funding_room_usd, a.funding_room_period, a.summary, a.limitations, a.model_version,
      evaluator.canonical_name AS evaluator_name, evaluator.slug AS evaluator_slug,
      s.title AS source_title, s.url AS source_url, s.retrieved_at
      FROM assessments a JOIN organizations evaluator ON evaluator.id = a.evaluator_id
      JOIN sources s ON s.id = a.source_id WHERE a.organization_id = ?
      ORDER BY a.assessment_date DESC`).bind(organization.id).all(),
    env.DB.prepare(`SELECT alias.source_name, alias.normalized_name, alias.identity_basis,
      s.publisher, s.title AS source_title, s.url AS source_url, s.retrieved_at
      FROM organization_source_names alias JOIN sources s ON s.id = alias.source_id
      WHERE alias.organization_id = ? ORDER BY s.publisher, alias.source_name`)
      .bind(organization.id).all(),
  ]);
  return {
    organization,
    relationships: [received, advised, originated],
    assessments: assessments.results,
    sourceNames: sourceNames.results,
  };
}

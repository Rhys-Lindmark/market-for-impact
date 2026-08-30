import { env } from 'cloudflare:workers';
import grantSnapshot from '@/data/normalized/givewell-grants.json';
import opportunitySnapshot from '@/data/givewell/top-charities.json';
import { organizationGraphComplete, replaceGrantOrganizationRoles, upsertOrganizationIdentities } from '@/db/grant-organizations';
import { canonicalOrganizationName } from '@/db/organization-identity';

type GrantRecord = (typeof grantSnapshot.records)[number];
type Opportunity = (typeof opportunitySnapshot.opportunities)[number];

const BATCH_SIZE = 50;
const grantRecipientCount = new Set(grantSnapshot.records.map((record) => record.recipientSlug)).size;

async function ensureGiveWellOrganizationGraph(sourceId: number) {
  if (await organizationGraphComplete(sourceId, grantSnapshot.records.length, grantRecipientCount)) return;
  await upsertOrganizationIdentities(sourceId, grantSnapshot.records.map((record) => ({
    name: record.recipient,
    canonicalName: canonicalOrganizationName('givewell', record.recipient),
    slug: record.recipientSlug,
    organizationType: 'grantee',
  })));
  await replaceGrantOrganizationRoles(sourceId);
  if (!await organizationGraphComplete(sourceId, grantSnapshot.records.length, grantRecipientCount)) {
    throw new Error('GiveWell organization graph failed reconciliation.');
  }
}

function epoch(value: string | null) {
  return value ? Math.floor(new Date(value).valueOf() / 1000) : null;
}

async function upsertOrganizations(records: GrantRecord[], opportunities: Opportunity[]) {
  const organizations = new Map<string, { name: string; slug: string; url: string | null; type: string }>();
  organizations.set('givewell', { name: 'GiveWell', slug: 'givewell', url: 'https://www.givewell.org/', type: 'evaluator' });
  for (const record of records) {
    organizations.set(record.recipientSlug, {
      name: canonicalOrganizationName('givewell', record.recipient),
      slug: record.recipientSlug,
      url: null,
      type: 'grantee',
    });
  }
  for (const opportunity of opportunities) {
    organizations.set(opportunity.slug, { name: opportunity.organization, slug: opportunity.slug, url: opportunity.researchUrl, type: 'recommended-charity' });
  }
  const statements = [...organizations.values()].map((organization) => env.DB.prepare(`INSERT INTO organizations
    (canonical_name, slug, website_url, organization_type) VALUES (?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name,
      website_url = COALESCE(excluded.website_url, organizations.website_url), organization_type = excluded.organization_type`)
    .bind(organization.name, organization.slug, organization.url, organization.type));
  for (let index = 0; index < statements.length; index += BATCH_SIZE) {
    await env.DB.batch(statements.slice(index, index + BATCH_SIZE));
  }
}

export async function ensureGiveWellSnapshot() {
  const grantSourceUrl = grantSnapshot.source.url;
  const current = await env.DB.prepare('SELECT id, content_hash, retrieved_at FROM sources WHERE url = ?')
    .bind(grantSourceUrl).first<{ id: number; content_hash: string | null; retrieved_at: number }>();
  if (current?.content_hash === grantSnapshot.source.contentHash) {
    await ensureGiveWellOrganizationGraph(current.id);
    return { sourceId: current.id, retrievedAt: current.retrieved_at };
  }

  const retrievedAt = epoch(grantSnapshot.source.retrievedAt);
  if (!retrievedAt) throw new Error('GiveWell snapshot retrieval date is invalid.');
  await upsertOrganizations(grantSnapshot.records, opportunitySnapshot.opportunities);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO sources (publisher, title, url, published_at, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, NULL, ?, ?, NULL)
      ON CONFLICT(url) DO UPDATE SET publisher = excluded.publisher, title = excluded.title,
        retrieved_at = excluded.retrieved_at, coverage_note = excluded.coverage_note, content_hash = NULL`)
      .bind(grantSnapshot.source.publisher, grantSnapshot.source.title, grantSourceUrl, retrievedAt, grantSnapshot.source.coverageNote),
    env.DB.prepare(`INSERT INTO sources (publisher, title, url, published_at, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(url) DO UPDATE SET published_at = excluded.published_at, retrieved_at = excluded.retrieved_at,
        coverage_note = excluded.coverage_note, content_hash = excluded.content_hash`)
      .bind(opportunitySnapshot.source.publisher, opportunitySnapshot.source.title, opportunitySnapshot.source.url,
        epoch(opportunitySnapshot.source.publishedAt), epoch(opportunitySnapshot.source.retrievedAt),
        opportunitySnapshot.source.coverageNote, grantSnapshot.source.contentHash),
  ]);

  const [grantSource, assessmentSource, evaluator, organizationRows] = await Promise.all([
    env.DB.prepare('SELECT id FROM sources WHERE url = ?').bind(grantSourceUrl).first<{ id: number }>(),
    env.DB.prepare('SELECT id FROM sources WHERE url = ?').bind(opportunitySnapshot.source.url).first<{ id: number }>(),
    env.DB.prepare('SELECT id FROM organizations WHERE slug = ?').bind('givewell').first<{ id: number }>(),
    env.DB.prepare('SELECT id, slug FROM organizations').all<{ id: number; slug: string }>(),
  ]);
  if (!grantSource || !assessmentSource || !evaluator) throw new Error('GiveWell source initialization failed.');
  const organizationIds = new Map(organizationRows.results.map((organization) => [organization.slug, organization.id]));

  const grants = grantSnapshot.records.map((record) => env.DB.prepare(`INSERT INTO grants
    (external_id, source_record_id, source_url, source_id, recipient_id, amount_usd, amount_original, currency,
      status, decision_date, award_date, recipient_names_json, recipient_names_text, topics_json, funders_json,
      countries_json, cause, geography, purpose, grouped_grant, first_seen_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    ON CONFLICT(source_id, source_record_id) DO UPDATE SET source_url = excluded.source_url,
      recipient_id = excluded.recipient_id, amount_usd = excluded.amount_usd, amount_original = excluded.amount_original,
      currency = excluded.currency, status = excluded.status, decision_date = excluded.decision_date,
      award_date = excluded.award_date, recipient_names_json = excluded.recipient_names_json,
      recipient_names_text = excluded.recipient_names_text, topics_json = excluded.topics_json,
      funders_json = excluded.funders_json, countries_json = excluded.countries_json,
      cause = excluded.cause, geography = excluded.geography, purpose = excluded.purpose,
      last_seen_at = excluded.last_seen_at`)
    .bind(record.sourceRecordId, record.sourceRecordId, record.sourceUrl, grantSource.id,
      organizationIds.get(record.recipientSlug) ?? null, record.amountUsd, record.amountUsd,
      record.amountUsd == null ? null : 'USD', record.status, epoch(record.decisionDate), epoch(record.decisionDate),
      JSON.stringify([record.recipient]), record.recipient, JSON.stringify(record.topics), JSON.stringify(record.funders),
      JSON.stringify(record.countries), record.topics[0] ?? 'unclassified', record.countries.join(' · ') || null,
      record.grant, retrievedAt, retrievedAt));
  for (let index = 0; index < grants.length; index += BATCH_SIZE) {
    await env.DB.batch(grants.slice(index, index + BATCH_SIZE));
  }
  await ensureGiveWellOrganizationGraph(grantSource.id);

  const assessments = opportunitySnapshot.opportunities.map((opportunity) => {
    const organizationId = organizationIds.get(opportunity.slug);
    if (!organizationId) throw new Error(`Missing GiveWell opportunity organization: ${opportunity.organization}`);
    const summary = `${opportunity.program}. ${opportunity.evidenceNote} Funding room: ${opportunity.fundingRoomNote}`;
    return env.DB.prepare(`INSERT INTO assessments
      (source_id, evaluator_id, organization_id, recommendation_status, assessment_date, evidence_level,
        native_metric_name, native_metric_value, native_metric_unit, benchmark_name, benchmark_multiple,
        funding_room_usd, funding_room_period, summary, limitations, model_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)
      ON CONFLICT(source_id, organization_id, recommendation_status) DO UPDATE SET
        assessment_date = excluded.assessment_date, evidence_level = excluded.evidence_level,
        native_metric_value = excluded.native_metric_value, funding_room_usd = excluded.funding_room_usd,
        funding_room_period = excluded.funding_room_period, summary = excluded.summary,
        limitations = excluded.limitations, model_version = excluded.model_version`)
      .bind(assessmentSource.id, evaluator.id, organizationId, 'top-charity-current',
        epoch(opportunitySnapshot.source.publishedAt), opportunity.evidenceLevel, 'historical reported cost per life saved',
        opportunity.costPerLifeSavedUsd, 'USD per life saved', opportunitySnapshot.source.benchmark.name,
        opportunity.fundingRoomUsd, opportunity.fundingRoomStatus, summary, opportunity.limitations, opportunity.modelVersion);
  });
  await env.DB.batch(assessments);
  await env.DB.batch([
    env.DB.prepare('UPDATE sources SET retrieved_at = ?, coverage_note = ?, content_hash = ? WHERE id = ?')
      .bind(retrievedAt, grantSnapshot.source.coverageNote, grantSnapshot.source.contentHash, grantSource.id),
    env.DB.prepare('PRAGMA optimize'),
  ]);
  return { sourceId: grantSource.id, retrievedAt };
}

function parseJsonArray(value: unknown): string[] {
  try { return typeof value === 'string' ? JSON.parse(value) : []; } catch { return []; }
}

export async function getGiveWellMarket() {
  const { sourceId, retrievedAt } = await ensureGiveWellSnapshot();
  const [summary, recent] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS grant_count, COALESCE(SUM(amount_usd), 0) AS total_amount_usd,
      COUNT(DISTINCT recipient_id) AS recipient_count, MAX(decision_date) AS latest_decision_date,
      SUM(CASE WHEN amount_usd IS NULL THEN 1 ELSE 0 END) AS missing_amount_count
      FROM grants WHERE source_id = ? AND last_seen_at = ?`).bind(sourceId, retrievedAt).first(),
    env.DB.prepare(`SELECT g.source_record_id, g.source_url, g.purpose, g.amount_usd, g.decision_date,
      g.topics_json, g.funders_json, g.countries_json, o.canonical_name AS recipient
      FROM grants g LEFT JOIN organizations o ON o.id = g.recipient_id
      WHERE g.source_id = ? AND g.last_seen_at = ?
      ORDER BY g.decision_date DESC, g.amount_usd DESC, g.source_record_id ASC LIMIT 8`)
      .bind(sourceId, retrievedAt).all<Record<string, unknown>>(),
  ]);
  return {
    source: grantSnapshot.source,
    summary,
    benchmark: opportunitySnapshot.source.benchmark,
    opportunitySource: opportunitySnapshot.source,
    opportunities: opportunitySnapshot.opportunities,
    recent: recent.results.map((record) => ({
      ...record,
      topics: parseJsonArray(record.topics_json), funders: parseJsonArray(record.funders_json),
      countries: parseJsonArray(record.countries_json), topics_json: undefined, funders_json: undefined, countries_json: undefined,
    })),
  };
}

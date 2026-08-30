import { env } from 'cloudflare:workers';
import snapshot from '@/data/giving-green/recommendations-2025-2026.json';
import { organizationGraphComplete, replaceGrantOrganizationRoles, upsertOrganizationIdentities } from '@/db/grant-organizations';

const expectedRoleCount = snapshot.grants.length * 3;

function epoch(value: string) {
  return Math.floor(new Date(value).valueOf() / 1000);
}

async function ensureGivingGreenOrganizationGraph(sourceId: number) {
  if (await organizationGraphComplete(sourceId, expectedRoleCount, snapshot.grants.length)) return;
  await upsertOrganizationIdentities(sourceId, snapshot.grants.map((grant) => ({
    name: grant.name, slug: grant.recipientSlug, websiteUrl: grant.reviewUrl,
    organizationType: grant.category === 'top' ? 'recommended-charity' : 'grantee',
  })));
  await replaceGrantOrganizationRoles(sourceId);
  if (!await organizationGraphComplete(sourceId, expectedRoleCount, snapshot.grants.length)) {
    throw new Error('Giving Green organization graph failed reconciliation.');
  }
}

export async function ensureGivingGreenSnapshot() {
  const current = await env.DB.prepare('SELECT id, content_hash, retrieved_at FROM sources WHERE url = ?')
    .bind(snapshot.source.url).first<{ id: number; content_hash: string | null; retrieved_at: number }>();
  if (current?.content_hash === snapshot.source.contentHash) {
    await ensureGivingGreenOrganizationGraph(current.id);
    return { sourceId: current.id, retrievedAt: current.retrieved_at };
  }
  const retrievedAt = epoch(snapshot.source.retrievedAt);
  const publishedAt = epoch(snapshot.source.publishedAt);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO sources (publisher, title, url, published_at, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, NULL) ON CONFLICT(url) DO UPDATE SET publisher = excluded.publisher,
      title = excluded.title, published_at = excluded.published_at, retrieved_at = excluded.retrieved_at,
      coverage_note = excluded.coverage_note, content_hash = NULL`)
      .bind(snapshot.source.publisher, snapshot.source.title, snapshot.source.url, publishedAt, retrievedAt, snapshot.source.coverageNote),
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES ('Giving Green', 'giving-green', 'https://www.givinggreen.earth/', 'evaluator-advisor')
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name, website_url = excluded.website_url`),
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES ('Giving Green Fund', 'giving-green-fund', 'https://www.givinggreen.earth/giving-green-fund', 'originating-funder')
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name, website_url = excluded.website_url`),
  ]);
  const source = await env.DB.prepare('SELECT id FROM sources WHERE url = ?').bind(snapshot.source.url).first<{ id: number }>();
  if (!source) throw new Error('Giving Green source initialization failed.');
  await upsertOrganizationIdentities(source.id, snapshot.grants.map((grant) => ({
    name: grant.name, slug: grant.recipientSlug, websiteUrl: grant.reviewUrl,
    organizationType: grant.category === 'top' ? 'recommended-charity' : 'grantee',
  })));
  const [organizations, evaluator, fund] = await Promise.all([
    env.DB.prepare('SELECT id, slug FROM organizations').all<{ id: number; slug: string }>(),
    env.DB.prepare("SELECT id FROM organizations WHERE slug = 'giving-green'").first<{ id: number }>(),
    env.DB.prepare("SELECT id FROM organizations WHERE slug = 'giving-green-fund'").first<{ id: number }>(),
  ]);
  if (!evaluator || !fund) throw new Error('Giving Green funder identities are unavailable.');
  const ids = new Map(organizations.results.map((row) => [row.slug, row.id]));
  const grantStatements = snapshot.grants.map((grant) => {
    const recipientId = ids.get(grant.recipientSlug);
    if (!recipientId) throw new Error(`Giving Green recipient missing: ${grant.recipientSlug}`);
    return env.DB.prepare(`INSERT INTO grants
      (external_id, source_record_id, source_url, source_id, originating_funder_id, advising_funder_id,
       recipient_id, amount_usd, amount_original, currency, status, decision_date, award_date,
       source_published_at, recipient_names_json, recipient_names_text, focus_areas_json, listed_funds_json,
       topics_json, funders_json, countries_json, cause, intervention, purpose, grouped_grant, first_seen_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, '[]', 'Climate', ?, ?, 0, ?, ?)
      ON CONFLICT(source_id, source_record_id) DO UPDATE SET source_url = excluded.source_url,
       originating_funder_id = excluded.originating_funder_id, advising_funder_id = excluded.advising_funder_id,
       recipient_id = excluded.recipient_id, amount_usd = excluded.amount_usd, amount_original = excluded.amount_original,
       currency = excluded.currency, status = excluded.status, decision_date = excluded.decision_date,
       source_published_at = excluded.source_published_at, recipient_names_json = excluded.recipient_names_json,
       recipient_names_text = excluded.recipient_names_text, focus_areas_json = excluded.focus_areas_json,
       listed_funds_json = excluded.listed_funds_json, topics_json = excluded.topics_json,
       funders_json = excluded.funders_json, cause = excluded.cause, intervention = excluded.intervention,
       purpose = excluded.purpose, last_seen_at = excluded.last_seen_at`)
      .bind(grant.sourceRecordId, grant.sourceRecordId, grant.reviewUrl, source.id, fund.id, evaluator.id,
        recipientId, grant.amountUsd, grant.amountUsd, snapshot.source.statusSemantics, publishedAt, publishedAt,
        JSON.stringify([grant.name]), grant.name, JSON.stringify(grant.strategies), JSON.stringify(['Giving Green Fund']),
        JSON.stringify(grant.strategies), JSON.stringify(['Giving Green Fund']), grant.strategies.join(' · '),
        `Planned Giving Green Fund grant supporting ${grant.strategies.join(', ')}. ${grant.amountLabel}.`, retrievedAt, retrievedAt);
  });
  for (let index = 0; index < grantStatements.length; index += 50) await env.DB.batch(grantStatements.slice(index, index + 50));
  await ensureGivingGreenOrganizationGraph(source.id);
  const assessmentStatements = snapshot.topRecommendations.map((record) => {
    const organizationId = ids.get(record.slug);
    if (!organizationId) throw new Error(`Giving Green recommendation missing: ${record.slug}`);
    return env.DB.prepare(`INSERT INTO assessments
      (source_id, evaluator_id, organization_id, recommendation_status, assessment_date, evidence_level,
       native_metric_name, native_metric_value, native_metric_unit, funding_room_usd, funding_room_period,
       summary, limitations, model_version)
      VALUES (?, ?, ?, 'top-climate-nonprofit-current', ?, ?, ?, NULL, NULL, ?, ?, ?, ?, 'Giving Green 2025–2026')
      ON CONFLICT(source_id, organization_id, recommendation_status) DO UPDATE SET
       assessment_date = excluded.assessment_date, evidence_level = excluded.evidence_level,
       native_metric_name = excluded.native_metric_name, funding_room_usd = excluded.funding_room_usd,
       funding_room_period = excluded.funding_room_period, summary = excluded.summary,
       limitations = excluded.limitations, model_version = excluded.model_version`)
      .bind(source.id, evaluator.id, organizationId, publishedAt,
        'Qualitative best-bet assessment: scale, feasibility, and funding need',
        'No organization-level quantitative climate-impact estimate published', record.fundingRoomUsd,
        record.fundingRoomPeriod, `${record.evaluationSummary} Funding need: ${record.fundingNeed}`, record.limitations);
  });
  await env.DB.batch(assessmentStatements);
  await env.DB.batch([
    env.DB.prepare('UPDATE sources SET content_hash = ? WHERE id = ?').bind(snapshot.source.contentHash, source.id),
    env.DB.prepare('PRAGMA optimize'),
  ]);
  return { sourceId: source.id, retrievedAt };
}

export async function getGivingGreenMarket() {
  const { sourceId, retrievedAt } = await ensureGivingGreenSnapshot();
  const [summary, assessments, grants] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS grant_count, COALESCE(SUM(amount_usd), 0) AS announced_amount_usd,
      SUM(CASE WHEN award_date IS NULL THEN 1 ELSE 0 END) AS missing_disbursement_date_count
      FROM grants WHERE source_id = ? AND last_seen_at = ?`).bind(sourceId, retrievedAt).first(),
    env.DB.prepare(`SELECT o.canonical_name, o.slug, o.website_url, a.assessment_date, a.evidence_level,
      a.native_metric_name, a.funding_room_usd, a.funding_room_period, a.summary, a.limitations, a.model_version
      FROM assessments a JOIN organizations o ON o.id = a.organization_id
      WHERE a.source_id = ? AND a.recommendation_status = 'top-climate-nonprofit-current'
      ORDER BY o.canonical_name`).bind(sourceId).all<Record<string, unknown>>(),
    env.DB.prepare(`SELECT g.source_record_id, g.source_url, g.amount_usd, g.status, g.focus_areas_json,
      o.canonical_name, o.slug FROM grants g JOIN organizations o ON o.id = g.recipient_id
      WHERE g.source_id = ? AND g.last_seen_at = ? ORDER BY g.amount_usd DESC, o.canonical_name`)
      .bind(sourceId, retrievedAt).all<Record<string, unknown>>(),
  ]);
  const metadata = new Map(snapshot.topRecommendations.map((record) => [record.slug, record]));
  return {
    source: snapshot.source, summary: { ...summary, ...snapshot.summary }, comparabilityWarning: snapshot.comparabilityWarning,
    recommendations: assessments.results.map((assessment) => ({ ...assessment, ...metadata.get(String(assessment.slug)) })),
    grants: grants.results.map((grant) => ({ ...grant, strategies: JSON.parse(String(grant.focus_areas_json)), focus_areas_json: undefined })),
  };
}


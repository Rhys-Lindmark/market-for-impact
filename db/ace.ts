import { env } from 'cloudflare:workers';
import snapshot from '@/data/ace/recommendations-2025.json';

type AceRecord = (typeof snapshot.records)[number];

function epoch(value: string) {
  return Math.floor(new Date(value).valueOf() / 1000);
}

export async function ensureAceSnapshot() {
  const current = await env.DB.prepare('SELECT id, content_hash, retrieved_at FROM sources WHERE url = ?')
    .bind(snapshot.source.url).first<{ id: number; content_hash: string | null; retrieved_at: number }>();
  if (current?.content_hash === snapshot.source.contentHash) return { sourceId: current.id, retrievedAt: current.retrieved_at };

  const retrievedAt = epoch(snapshot.source.retrievedAt);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO sources (publisher, title, url, published_at, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(url) DO UPDATE SET publisher = excluded.publisher, title = excluded.title,
        published_at = excluded.published_at, retrieved_at = excluded.retrieved_at,
        coverage_note = excluded.coverage_note, content_hash = NULL`)
      .bind(snapshot.source.publisher, snapshot.source.title, snapshot.source.url,
        epoch(snapshot.source.publishedAt), retrievedAt, snapshot.source.coverageNote),
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES ('Animal Charity Evaluators', 'animal-charity-evaluators', 'https://animalcharityevaluators.org/', 'evaluator')
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name, website_url = excluded.website_url`),
    ...snapshot.records.map((record) => env.DB.prepare(`INSERT INTO organizations
      (canonical_name, slug, website_url, organization_type) VALUES (?, ?, ?, 'recommended-charity')
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name,
        website_url = excluded.website_url, organization_type = excluded.organization_type`)
      .bind(record.organization, record.slug, record.reviewUrl)),
  ]);
  const [source, evaluator, organizations] = await Promise.all([
    env.DB.prepare('SELECT id FROM sources WHERE url = ?').bind(snapshot.source.url).first<{ id: number }>(),
    env.DB.prepare("SELECT id FROM organizations WHERE slug = 'animal-charity-evaluators'").first<{ id: number }>(),
    env.DB.prepare('SELECT id, slug FROM organizations').all<{ id: number; slug: string }>(),
  ]);
  if (!source || !evaluator) throw new Error('ACE source initialization failed.');
  const ids = new Map(organizations.results.map((row) => [row.slug, row.id]));
  const assessmentStatements = snapshot.records.map((record) => {
    const organizationId = ids.get(record.slug);
    if (!organizationId) throw new Error(`ACE organization missing: ${record.slug}`);
    return env.DB.prepare(`INSERT INTO assessments
      (source_id, evaluator_id, organization_id, recommendation_status, assessment_date, evidence_level,
       native_metric_name, native_metric_value, native_metric_unit, funding_room_usd, funding_room_period,
       funding_capacity_usd, funding_capacity_period, summary, limitations, model_version)
      VALUES (?, ?, ?, 'recommended-charity-current', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_id, organization_id, recommendation_status) DO UPDATE SET
       assessment_date = excluded.assessment_date, evidence_level = excluded.evidence_level,
       native_metric_name = excluded.native_metric_name, native_metric_value = excluded.native_metric_value,
       native_metric_unit = excluded.native_metric_unit, funding_room_usd = excluded.funding_room_usd,
       funding_room_period = excluded.funding_room_period, funding_capacity_usd = excluded.funding_capacity_usd,
       funding_capacity_period = excluded.funding_capacity_period, summary = excluded.summary,
       limitations = excluded.limitations, model_version = excluded.model_version`)
      .bind(source.id, evaluator.id, organizationId, epoch(snapshot.source.recommendationDate), record.evidenceLevel,
        record.headlineMetric.program, record.headlineMetric.value, record.headlineMetric.unit,
        record.fundingRoomUsd, record.fundingPeriod, record.fundingCapacityUsd, record.fundingPeriod,
        record.fundingUse, record.limitations, `ACE ${record.evaluationYear}`);
  });
  await env.DB.batch(assessmentStatements);
  const assessments = await env.DB.prepare(`SELECT a.id, o.slug FROM assessments a
    JOIN organizations o ON o.id = a.organization_id WHERE a.source_id = ?`).bind(source.id).all<{ id: number; slug: string }>();
  const assessmentIds = new Map(assessments.results.map((row) => [row.slug, row.id]));
  const metricStatements = snapshot.records.flatMap((record: AceRecord) => {
    const assessmentId = assessmentIds.get(record.slug);
    if (!assessmentId) throw new Error(`ACE assessment missing: ${record.slug}`);
    return [
      env.DB.prepare('DELETE FROM assessment_metrics WHERE assessment_id = ?').bind(assessmentId),
      ...record.metrics.map((metric) => env.DB.prepare(`INSERT INTO assessment_metrics
        (assessment_id, metric_key, program, value, confidence_low, confidence_high, unit, model_version, limitations)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(assessmentId, metric.key, metric.program, metric.value, metric.low, metric.high,
          metric.unit, metric.modelVersion, metric.limitations)),
    ];
  });
  for (let index = 0; index < metricStatements.length; index += 50) await env.DB.batch(metricStatements.slice(index, index + 50));
  await env.DB.batch([
    env.DB.prepare('UPDATE sources SET content_hash = ? WHERE id = ?').bind(snapshot.source.contentHash, source.id),
    env.DB.prepare('PRAGMA optimize'),
  ]);
  return { sourceId: source.id, retrievedAt };
}

export async function getAceMarket() {
  const { sourceId } = await ensureAceSnapshot();
  const assessments = await env.DB.prepare(`SELECT a.id, o.canonical_name, o.slug, o.website_url,
    a.assessment_date, a.evidence_level, a.native_metric_name, a.native_metric_value, a.native_metric_unit,
    a.funding_room_usd, a.funding_room_period, a.funding_capacity_usd, a.summary, a.limitations, a.model_version
    FROM assessments a JOIN organizations o ON o.id = a.organization_id
    WHERE a.source_id = ? AND a.recommendation_status = 'recommended-charity-current'
    ORDER BY a.funding_room_usd DESC, o.canonical_name`).bind(sourceId).all<Record<string, unknown>>();
  const metrics = await env.DB.prepare(`SELECT am.assessment_id, am.metric_key, am.program, am.value,
    am.confidence_low, am.confidence_high, am.unit, am.model_version, am.limitations
    FROM assessment_metrics am JOIN assessments a ON a.id = am.assessment_id
    WHERE a.source_id = ? ORDER BY am.assessment_id, am.id`).bind(sourceId).all<Record<string, unknown>>();
  const metricsByAssessment = new Map<number, Record<string, unknown>[]>();
  for (const metric of metrics.results) {
    const id = Number(metric.assessment_id);
    metricsByAssessment.set(id, [...(metricsByAssessment.get(id) ?? []), metric]);
  }
  const metadata = new Map(snapshot.records.map((record) => [record.slug, record]));
  return {
    source: snapshot.source,
    summary: snapshot.summary,
    comparabilityWarning: snapshot.comparabilityWarning,
    recommendations: assessments.results.map((assessment) => ({
      ...assessment,
      recommendationCohort: metadata.get(String(assessment.slug))?.recommendationCohort,
      geography: metadata.get(String(assessment.slug))?.geography,
      animalGroups: metadata.get(String(assessment.slug))?.animalGroups ?? [],
      interventions: metadata.get(String(assessment.slug))?.interventions ?? [],
      metrics: metricsByAssessment.get(Number(assessment.id)) ?? [],
    })),
  };
}


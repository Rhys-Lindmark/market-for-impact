import { env } from 'cloudflare:workers';
import snapshot from '@/data/founders-pledge/research-matrix.json';

type MatrixRecord = (typeof snapshot.records)[number];

function epoch(value: string | null) {
  return value == null ? null : Math.floor(new Date(value).valueOf() / 1000);
}

function sourceHash(key: string) {
  return `${snapshot.contentHash}:${key}`;
}

export async function ensureFoundersPledgeSnapshot() {
  const current = await env.DB.prepare(`SELECT url, content_hash FROM sources WHERE publisher = 'Founders Pledge'`).all<{
    url: string; content_hash: string | null;
  }>();
  const expected = new Map(snapshot.sources.map((source) => [source.url, sourceHash(source.key)]));
  if (current.results.length === snapshot.sources.length && current.results.every((source) => expected.get(source.url) === source.content_hash)) {
    return { retrievedAt: Math.floor(new Date(snapshot.retrievedAt).valueOf() / 1000) };
  }

  const retrievedAt = Math.floor(new Date(snapshot.retrievedAt).valueOf() / 1000);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES ('Founders Pledge', 'founders-pledge', 'https://www.founderspledge.com/', 'evaluator-advisor')
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name, website_url = excluded.website_url`),
    ...snapshot.sources.map((source) => env.DB.prepare(`INSERT INTO sources
      (publisher, title, url, published_at, retrieved_at, coverage_note, content_hash)
      VALUES ('Founders Pledge', ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(url) DO UPDATE SET publisher = excluded.publisher, title = excluded.title,
        published_at = excluded.published_at, retrieved_at = excluded.retrieved_at,
        coverage_note = excluded.coverage_note, content_hash = NULL`)
      .bind(source.title, source.url, epoch(source.publishedAt), retrievedAt, snapshot.coverageNote)),
    ...snapshot.records.map((record) => env.DB.prepare(`INSERT INTO organizations
      (canonical_name, slug, website_url, organization_type) VALUES (?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name,
        website_url = COALESCE(organizations.website_url, excluded.website_url)`)
      .bind(record.organization, record.slug,
        snapshot.sources.find((source) => source.key === record.sourceKey)?.url ?? null,
        record.opportunityType === 'current-pooled-fund' ? 'pooled-fund' : 'recommended-funding-opportunity')),
  ]);

  const [evaluator, sources, organizations] = await Promise.all([
    env.DB.prepare("SELECT id FROM organizations WHERE slug = 'founders-pledge'").first<{ id: number }>(),
    env.DB.prepare("SELECT id, url FROM sources WHERE publisher = 'Founders Pledge'").all<{ id: number; url: string }>(),
    env.DB.prepare('SELECT id, slug FROM organizations').all<{ id: number; slug: string }>(),
  ]);
  if (!evaluator) throw new Error('Founders Pledge evaluator initialization failed.');
  const sourceIdByKey = new Map(snapshot.sources.map((source) => [source.key, sources.results.find((row) => row.url === source.url)?.id]));
  const organizationIdBySlug = new Map(organizations.results.map((organization) => [organization.slug, organization.id]));
  const assessments = snapshot.records.map((record: MatrixRecord) => {
    const sourceId = sourceIdByKey.get(record.sourceKey);
    const organizationId = organizationIdBySlug.get(record.slug);
    if (!sourceId || !organizationId) throw new Error(`Founders Pledge matrix identity missing: ${record.slug}`);
    return env.DB.prepare(`INSERT INTO assessments
      (source_id, evaluator_id, organization_id, recommendation_status, assessment_date, evidence_level,
       native_metric_name, native_metric_value, native_metric_unit, benchmark_name, benchmark_multiple,
       funding_room_usd, funding_room_period, summary, limitations, model_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, NULL, ?, ?, ?, ?)
      ON CONFLICT(source_id, organization_id, recommendation_status) DO UPDATE SET
       assessment_date = excluded.assessment_date, evidence_level = excluded.evidence_level,
       native_metric_name = excluded.native_metric_name, native_metric_value = NULL, native_metric_unit = NULL,
       benchmark_name = excluded.benchmark_name, benchmark_multiple = excluded.benchmark_multiple,
       funding_room_usd = NULL, funding_room_period = excluded.funding_room_period,
       summary = excluded.summary, limitations = excluded.limitations, model_version = excluded.model_version`)
      .bind(sourceId, evaluator.id, organizationId, record.status, epoch(record.assessmentDate), record.evidenceModel,
        record.nativeMetric, record.benchmarkName, record.benchmarkMultiple, record.fundingStatus,
        record.summary, record.limitations, record.assessmentDate == null ? 'Current page at retrieval' : record.assessmentDate.slice(0, 10));
  });
  for (let index = 0; index < assessments.length; index += 50) await env.DB.batch(assessments.slice(index, index + 50));
  await env.DB.batch([
    ...snapshot.sources.map((source) => {
      const sourceId = sourceIdByKey.get(source.key);
      if (!sourceId) throw new Error(`Founders Pledge source missing: ${source.key}`);
      return env.DB.prepare('UPDATE sources SET content_hash = ? WHERE id = ?').bind(sourceHash(source.key), sourceId);
    }),
    env.DB.prepare('PRAGMA optimize'),
  ]);
  return { retrievedAt };
}

export async function getFoundersPledgeMatrix() {
  await ensureFoundersPledgeSnapshot();
  const sourceUrls = snapshot.sources.map((source) => source.url);
  const placeholders = sourceUrls.map(() => '?').join(',');
  const rows = await env.DB.prepare(`SELECT a.id, o.canonical_name, o.slug, o.website_url,
    a.recommendation_status, a.assessment_date, a.evidence_level, a.native_metric_name,
    a.benchmark_name, a.benchmark_multiple, a.funding_room_usd, a.funding_room_period,
    a.summary, a.limitations, a.model_version, s.title AS source_title, s.url AS source_url,
    s.published_at AS source_published_at, s.retrieved_at
    FROM assessments a JOIN organizations o ON o.id = a.organization_id
    JOIN sources s ON s.id = a.source_id WHERE s.url IN (${placeholders})
    ORDER BY CASE
      WHEN o.slug = 'founders-pledge-climate-fund' THEN 1
      WHEN o.slug = 'founders-pledge-global-health-development-program' THEN 2
      WHEN o.slug = 'founders-pledge-global-catastrophic-risks-fund' THEN 3
      ELSE 4 END, o.canonical_name`).bind(...sourceUrls).all<Record<string, unknown>>();
  const metadata = new Map(snapshot.records.map((record) => [record.slug, record]));
  return {
    retrievedAt: snapshot.retrievedAt,
    coverageNote: snapshot.coverageNote,
    comparabilityWarning: snapshot.comparabilityWarning,
    summary: snapshot.summary,
    opportunities: rows.results.map((row) => ({ ...row, ...metadata.get(String(row.slug)) })),
  };
}

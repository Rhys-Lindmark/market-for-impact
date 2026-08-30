import { env } from 'cloudflare:workers';
import snapshot from '@/data/comparisons/impact-conversions-v1.json';
import { ensureGiveDirectlyBenchmark } from '@/db/givedirectly';
import { ensureGiveWellSnapshot } from '@/db/givewell';

const epoch = (value: string | null) => value ? Math.floor(new Date(value).valueOf() / 1000) : null;

export async function ensureComparableImpact() {
  await Promise.all([ensureGiveWellSnapshot(), ensureGiveDirectlyBenchmark()]);
  const updatedAt = epoch(snapshot.retrievedAt);
  if (!updatedAt) throw new Error('Comparable-impact retrieval date is invalid.');
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES ('Coefficient Giving', 'coefficient-giving', 'https://coefficientgiving.org/', 'evaluator')
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name, website_url = excluded.website_url`),
    ...snapshot.models.map((model) => env.DB.prepare(`INSERT INTO sources
      (publisher, title, url, published_at, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(url) DO UPDATE SET publisher = excluded.publisher, title = excluded.title,
        published_at = excluded.published_at, retrieved_at = excluded.retrieved_at, coverage_note = excluded.coverage_note`)
      .bind(model.publisher, model.sourceTitle, model.sourceUrl, epoch(model.effectiveAt), updatedAt,
        `Comparable-impact model source for ${model.name}; native evaluator outcomes remain authoritative.`)),
  ]);
  const [sourceRows, organizationRows] = await Promise.all([
    env.DB.prepare(`SELECT id, url FROM sources WHERE url IN (${snapshot.models.map(() => '?').join(',')})`)
      .bind(...snapshot.models.map((model) => model.sourceUrl)).all<{ id: number; url: string }>(),
    env.DB.prepare("SELECT id, slug FROM organizations WHERE slug IN ('givewell', 'coefficient-giving')")
      .all<{ id: number; slug: string }>(),
  ]);
  const sourceIds = new Map(sourceRows.results.map((row) => [row.url, row.id]));
  const organizationIds = new Map(organizationRows.results.map((row) => [row.slug, row.id]));
  await env.DB.batch(snapshot.models.map((model) => {
    const sourceId = sourceIds.get(model.sourceUrl);
    if (!sourceId) throw new Error(`Missing conversion source: ${model.sourceUrl}`);
    return env.DB.prepare(`INSERT INTO impact_conversion_models
      (source_id, evaluator_id, model_key, name, status, source_unit, target_unit, formula, model_version,
       effective_at, parameters_json, assumptions_json, limitations_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(model_key) DO UPDATE SET source_id = excluded.source_id, evaluator_id = excluded.evaluator_id,
       name = excluded.name, status = excluded.status, source_unit = excluded.source_unit,
       target_unit = excluded.target_unit, formula = excluded.formula, model_version = excluded.model_version,
       effective_at = excluded.effective_at, parameters_json = excluded.parameters_json,
       assumptions_json = excluded.assumptions_json, limitations_json = excluded.limitations_json,
       updated_at = excluded.updated_at`)
      .bind(sourceId, model.evaluatorSlug ? organizationIds.get(model.evaluatorSlug) ?? null : null,
        model.modelKey, model.name, model.status, model.sourceUnit, model.targetUnit, model.formula,
        model.modelVersion, epoch(model.effectiveAt), JSON.stringify(model.parameters), JSON.stringify(model.assumptions),
        JSON.stringify(model.limitations), updatedAt);
  }));
  await env.DB.prepare('PRAGMA optimize').run();
  return { updatedAt };
}

export async function getComparableImpact() {
  const { updatedAt } = await ensureComparableImpact();
  const [models, opportunities, benchmarks] = await Promise.all([
    env.DB.prepare(`SELECT m.model_key, m.name, m.status, m.source_unit, m.target_unit, m.formula,
        m.model_version, m.effective_at, m.parameters_json, m.assumptions_json, m.limitations_json,
        s.url AS source_url, s.title AS source_title, o.canonical_name AS evaluator
      FROM impact_conversion_models m JOIN sources s ON s.id = m.source_id
      LEFT JOIN organizations o ON o.id = m.evaluator_id ORDER BY m.id`).all<Record<string, unknown>>(),
    env.DB.prepare(`SELECT o.canonical_name AS organization, o.slug, a.native_metric_name,
        a.native_metric_value, a.native_metric_unit, a.model_version, a.limitations
      FROM assessments a JOIN organizations o ON o.id = a.organization_id
      JOIN organizations e ON e.id = a.evaluator_id
      WHERE e.slug = 'givewell' AND a.recommendation_status = 'top-charity-current'
        AND a.native_metric_unit = 'USD per life saved' ORDER BY a.native_metric_value`).all<Record<string, unknown>>(),
    env.DB.prepare(`SELECT benchmark_key, name, benchmark_type, estimate_low, estimate_high, units_per_usd,
        model_version FROM impact_benchmarks WHERE reference_benchmark_key = 'givewell-consumption-benchmark-2025-11'
        ORDER BY benchmark_type`).all<Record<string, unknown>>(),
  ]);
  const parse = (value: unknown) => JSON.parse(String(value));
  return {
    version: snapshot.version,
    updatedAt: new Date(updatedAt * 1000).toISOString(),
    nativeUnitRule: 'Native evaluator outcomes remain the source of truth. Every translation is optional and versioned.',
    models: models.results.map((row) => ({
      modelKey: row.model_key, name: row.name, status: row.status, sourceUnit: row.source_unit,
      targetUnit: row.target_unit, formula: row.formula, modelVersion: row.model_version,
      effectiveAt: row.effective_at ? new Date(Number(row.effective_at) * 1000).toISOString() : null,
      parameters: parse(row.parameters_json), assumptions: parse(row.assumptions_json),
      limitations: parse(row.limitations_json), sourceUrl: row.source_url, sourceTitle: row.source_title,
      evaluator: row.evaluator,
    })),
    qalyOpportunities: opportunities.results.map((row) => ({
      organization: row.organization, slug: row.slug, nativeMetricName: row.native_metric_name,
      costPerLifeSavedUsd: row.native_metric_value, nativeMetricUnit: row.native_metric_unit,
      modelVersion: row.model_version, limitations: row.limitations,
    })),
    benchmarkTranslations: benchmarks.results.map((row) => ({
      benchmarkKey: row.benchmark_key, name: row.name, benchmarkType: row.benchmark_type,
      multipleLow: row.estimate_low, multipleHigh: row.estimate_high, unitsPerUsdAtLow: Number(row.estimate_low) * 0.003,
      unitsPerUsdAtHigh: Number(row.estimate_high) * 0.003, modelVersion: row.model_version,
    })),
    boundaries: snapshot.boundaries,
  };
}

import { env } from 'cloudflare:workers';
import snapshot from '@/data/givedirectly/benchmark.json';

const epoch = (value: string | null) => value ? Math.floor(new Date(value).valueOf() / 1000) : null;

export async function ensureGiveDirectlyBenchmark() {
  const retrievedAt = epoch(snapshot.retrievedAt);
  if (!retrievedAt) throw new Error('GiveDirectly benchmark retrieval date is invalid.');
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES ('GiveWell', 'givewell', 'https://www.givewell.org/', 'evaluator')
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name, website_url = excluded.website_url`),
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES ('GiveDirectly', 'givedirectly', 'https://www.givedirectly.org/', 'recommended-charity')
      ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name, website_url = excluded.website_url`),
    ...snapshot.sources.map((source) => env.DB.prepare(`INSERT INTO sources
      (publisher, title, url, published_at, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(url) DO UPDATE SET publisher = excluded.publisher, title = excluded.title,
        published_at = excluded.published_at, retrieved_at = excluded.retrieved_at,
        coverage_note = excluded.coverage_note`)
      .bind(source.publisher, source.title, source.url, epoch(source.publishedAt), retrievedAt, source.coverageNote)),
  ]);
  const [evaluator, comparator, sourceRows] = await Promise.all([
    env.DB.prepare("SELECT id FROM organizations WHERE slug = 'givewell'").first<{ id: number }>(),
    env.DB.prepare("SELECT id FROM organizations WHERE slug = 'givedirectly'").first<{ id: number }>(),
    env.DB.prepare(`SELECT id, url FROM sources WHERE url IN (${snapshot.sources.map(() => '?').join(',')})`)
      .bind(...snapshot.sources.map((source) => source.url)).all<{ id: number; url: string }>(),
  ]);
  if (!evaluator || !comparator) throw new Error('GiveDirectly benchmark organizations failed initialization.');
  const sourceIds = new Map(sourceRows.results.map((source) => [source.url, source.id]));
  await env.DB.batch(snapshot.benchmarks.map((benchmark) => {
    const sourceId = sourceIds.get(benchmark.sourceUrl);
    if (!sourceId) throw new Error(`Missing benchmark source: ${benchmark.sourceUrl}`);
    return env.DB.prepare(`INSERT INTO impact_benchmarks
      (source_id, evaluator_id, comparator_organization_id, benchmark_key, name, benchmark_type,
       effective_at, model_version, reference_benchmark_key, estimate_low, estimate_high, unit_name,
       units_per_usd, currency_basis, population_basis, assumptions_json, limitations_json, model_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(benchmark_key) DO UPDATE SET source_id = excluded.source_id,
       evaluator_id = excluded.evaluator_id, comparator_organization_id = excluded.comparator_organization_id,
       name = excluded.name, benchmark_type = excluded.benchmark_type, effective_at = excluded.effective_at,
       model_version = excluded.model_version, reference_benchmark_key = excluded.reference_benchmark_key,
       estimate_low = excluded.estimate_low, estimate_high = excluded.estimate_high,
       unit_name = excluded.unit_name, units_per_usd = excluded.units_per_usd,
       currency_basis = excluded.currency_basis, population_basis = excluded.population_basis,
       assumptions_json = excluded.assumptions_json, limitations_json = excluded.limitations_json,
       model_url = excluded.model_url`)
      .bind(sourceId, evaluator.id, benchmark.benchmarkType === 'program-estimate' ? comparator.id : null,
        benchmark.benchmarkKey, benchmark.name, benchmark.benchmarkType, epoch(benchmark.effectiveAt),
        benchmark.modelVersion, benchmark.referenceBenchmarkKey, benchmark.estimateLow, benchmark.estimateHigh,
        benchmark.unitName, benchmark.unitsPerUsd, benchmark.currencyBasis, benchmark.populationBasis,
        JSON.stringify(benchmark.assumptions), JSON.stringify(benchmark.limitations), benchmark.modelUrl);
  }));
  return { retrievedAt };
}

export async function getGiveDirectlyBenchmark() {
  const { retrievedAt } = await ensureGiveDirectlyBenchmark();
  const rows = await env.DB.prepare(`SELECT b.benchmark_key, b.name, b.benchmark_type, b.effective_at,
      b.model_version, b.reference_benchmark_key, b.estimate_low, b.estimate_high, b.unit_name,
      b.units_per_usd, b.currency_basis, b.population_basis, b.assumptions_json, b.limitations_json,
      b.model_url, s.url AS source_url, s.title AS source_title
    FROM impact_benchmarks b JOIN sources s ON s.id = b.source_id
    WHERE b.evaluator_id = (SELECT id FROM organizations WHERE slug = 'givewell')
    ORDER BY CASE b.benchmark_type WHEN 'welfare-anchor' THEN 1 WHEN 'program-estimate' THEN 2 ELSE 3 END`)
    .all<Record<string, unknown>>();
  return {
    retrievedAt: new Date(retrievedAt * 1000).toISOString(),
    benchmarks: rows.results.map((row) => ({
      benchmarkKey: row.benchmark_key, name: row.name, benchmarkType: row.benchmark_type,
      effectiveAt: row.effective_at ? new Date(Number(row.effective_at) * 1000).toISOString() : null,
      modelVersion: row.model_version, referenceBenchmarkKey: row.reference_benchmark_key,
      estimateLow: row.estimate_low, estimateHigh: row.estimate_high, unitName: row.unit_name,
      unitsPerUsd: row.units_per_usd, currencyBasis: row.currency_basis, populationBasis: row.population_basis,
      assumptions: JSON.parse(String(row.assumptions_json)), limitations: JSON.parse(String(row.limitations_json)),
      modelUrl: row.model_url, sourceUrl: row.source_url, sourceTitle: row.source_title,
    })),
  };
}

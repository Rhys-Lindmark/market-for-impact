import { env } from 'cloudflare:workers';
import snapshot from '@/data/san-francisco/outcome-ontology-v1.json';

function epoch(value: string) {
  const result = Math.floor(new Date(value).valueOf() / 1000);
  if (!result) throw new Error(`Invalid ontology timestamp: ${value}`);
  return result;
}

function parseArray(value: unknown) {
  if (typeof value !== 'string') return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

export async function ensureSfOutcomeOntology() {
  const updatedAt = epoch(snapshot.generatedAt);
  const current = await env.DB.prepare('SELECT COUNT(*) AS count FROM local_outcomes WHERE ontology_version = ? AND updated_at = ?')
    .bind(snapshot.version, updatedAt).first<{ count: number }>();
  if (Number(current?.count ?? 0) === snapshot.outcomes.length) return { updatedAt };
  await env.DB.batch(snapshot.outcomes.map((outcome) => env.DB.prepare(`INSERT INTO local_outcomes
    (slug, geography, label, question, canonical_unit, observable_measure, unit_semantics, population, time_window,
     direction, measurement_state, attribution_state, service_outputs_json, administrative_proxies_json,
     required_inputs_json, allowed_claims_json, blocked_claims_json, equity_cuts_json, qaly_state, wellby_state,
     display_order, ontology_version, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET geography = excluded.geography, label = excluded.label, question = excluded.question,
     canonical_unit = excluded.canonical_unit, observable_measure = excluded.observable_measure,
     unit_semantics = excluded.unit_semantics, population = excluded.population, time_window = excluded.time_window,
     direction = excluded.direction, measurement_state = excluded.measurement_state,
     attribution_state = excluded.attribution_state, service_outputs_json = excluded.service_outputs_json,
     administrative_proxies_json = excluded.administrative_proxies_json, required_inputs_json = excluded.required_inputs_json,
     allowed_claims_json = excluded.allowed_claims_json, blocked_claims_json = excluded.blocked_claims_json,
     equity_cuts_json = excluded.equity_cuts_json, qaly_state = excluded.qaly_state, wellby_state = excluded.wellby_state,
     display_order = excluded.display_order, ontology_version = excluded.ontology_version, updated_at = excluded.updated_at`)
    .bind(outcome.key, snapshot.geography, outcome.label, outcome.question, outcome.canonicalUnit, outcome.observableMeasure,
      outcome.unitSemantics, outcome.population, outcome.timeWindow, outcome.direction, outcome.measurementState,
      outcome.attributionState, JSON.stringify(outcome.serviceOutputs), JSON.stringify(outcome.administrativeProxies),
      JSON.stringify(outcome.requiredInputs), JSON.stringify(outcome.allowedClaims), JSON.stringify(outcome.blockedClaims),
      JSON.stringify(outcome.equityCuts), outcome.qalyState, outcome.wellbyState, outcome.order, snapshot.version, updatedAt)));
  const rows = await env.DB.prepare('SELECT id, slug FROM local_outcomes WHERE ontology_version = ?')
    .bind(snapshot.version).all<{ id: number; slug: string }>();
  const ids = new Map(rows.results.map((row) => [row.slug, row.id]));
  const sourceMap = new Map(snapshot.sources.map((source) => [source.key, source]));
  const sourceStatements = snapshot.outcomes.flatMap((outcome) => outcome.sourceKeys.map((sourceKey) => {
    const outcomeId = ids.get(outcome.key); const source = sourceMap.get(sourceKey);
    if (!outcomeId || !source) throw new Error(`Missing ontology input for ${outcome.key}:${sourceKey}.`);
    return env.DB.prepare(`INSERT INTO local_outcome_sources
      (outcome_id, source_key, publisher, title, source_url, published_at, date_precision, retrieved_at,
       monitor_mode, coverage_note, ontology_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(outcome_id, source_key, ontology_version) DO UPDATE SET publisher = excluded.publisher,
       title = excluded.title, source_url = excluded.source_url, published_at = excluded.published_at,
       date_precision = excluded.date_precision, retrieved_at = excluded.retrieved_at,
       monitor_mode = excluded.monitor_mode, coverage_note = excluded.coverage_note`)
      .bind(outcomeId, source.key, source.publisher, source.title, source.url, source.publishedAt,
        source.datePrecision, epoch(source.retrievedAt), source.monitor.mode, source.coverageNote, snapshot.version);
  }));
  const overlapStatements = snapshot.overlaps.map((overlap) => {
    const left = ids.get(overlap.left); const right = ids.get(overlap.right);
    if (!left || !right) throw new Error(`Missing overlap outcome ${overlap.left}:${overlap.right}.`);
    return env.DB.prepare(`INSERT INTO local_outcome_overlaps
      (left_outcome_id, right_outcome_id, risk, treatment_rule, ontology_version, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(left_outcome_id, right_outcome_id, ontology_version) DO UPDATE SET risk = excluded.risk,
       treatment_rule = excluded.treatment_rule, updated_at = excluded.updated_at`)
      .bind(left, right, overlap.risk, overlap.rule, snapshot.version, updatedAt);
  });
  for (let index = 0; index < sourceStatements.length; index += 50) await env.DB.batch(sourceStatements.slice(index, index + 50));
  await env.DB.batch([...overlapStatements, env.DB.prepare('PRAGMA optimize')]);
  return { updatedAt };
}

export async function getSfOutcomeOntology() {
  const { updatedAt } = await ensureSfOutcomeOntology();
  const [outcomes, sources, overlaps] = await Promise.all([
    env.DB.prepare('SELECT * FROM local_outcomes WHERE ontology_version = ? AND updated_at = ? ORDER BY display_order')
      .bind(snapshot.version, updatedAt).all<Record<string, unknown>>(),
    env.DB.prepare(`SELECT s.*, o.slug AS outcome_slug FROM local_outcome_sources s JOIN local_outcomes o ON o.id = s.outcome_id
      WHERE s.ontology_version = ? ORDER BY o.display_order, s.publisher`).bind(snapshot.version).all<Record<string, unknown>>(),
    env.DB.prepare(`SELECT l.slug AS left_key, l.label AS left_label, r.slug AS right_key, r.label AS right_label,
      x.risk, x.treatment_rule FROM local_outcome_overlaps x JOIN local_outcomes l ON l.id = x.left_outcome_id
      JOIN local_outcomes r ON r.id = x.right_outcome_id WHERE x.ontology_version = ? ORDER BY x.id`)
      .bind(snapshot.version).all<Record<string, unknown>>(),
  ]);
  const sourcesByOutcome = new Map<string, Record<string, unknown>[]>();
  for (const source of sources.results) {
    const key = String(source.outcome_slug);
    sourcesByOutcome.set(key, [...(sourcesByOutcome.get(key) ?? []), source]);
  }
  const resultOutcomes = outcomes.results.map((row) => ({
    key: row.slug, label: row.label, question: row.question, canonicalUnit: row.canonical_unit,
    observableMeasure: row.observable_measure, unitSemantics: row.unit_semantics, population: row.population,
    timeWindow: row.time_window, direction: row.direction, measurementState: row.measurement_state,
    attributionState: row.attribution_state, serviceOutputs: parseArray(row.service_outputs_json),
    administrativeProxies: parseArray(row.administrative_proxies_json), requiredInputs: parseArray(row.required_inputs_json),
    allowedClaims: parseArray(row.allowed_claims_json), blockedClaims: parseArray(row.blocked_claims_json),
    equityCuts: parseArray(row.equity_cuts_json), qalyState: row.qaly_state, wellbyState: row.wellby_state,
    sources: (sourcesByOutcome.get(String(row.slug)) ?? []).map((source) => ({ key: source.source_key,
      publisher: source.publisher, title: source.title, url: source.source_url, publishedAt: source.published_at,
      datePrecision: source.date_precision, retrievedAt: new Date(Number(source.retrieved_at) * 1000).toISOString(),
      monitorMode: source.monitor_mode, coverageNote: source.coverage_note })),
  }));
  return {
    version: snapshot.version, generatedAt: snapshot.generatedAt, geography: snapshot.geography,
    scopeNote: snapshot.scopeNote, classificationRules: snapshot.classificationRules,
    summary: { outcomeCount: resultOutcomes.length, sourceCount: new Set(sources.results.map((row) => row.source_key)).size,
      modelRequiredCount: resultOutcomes.filter((item) => item.measurementState === 'model-required').length,
      conversionBlockedCount: resultOutcomes.filter((item) => String(item.qalyState).startsWith('blocked') && String(item.wellbyState).startsWith('blocked')).length,
      overlapCount: overlaps.results.length }, outcomes: resultOutcomes,
    overlaps: overlaps.results.map((row) => ({ leftKey: row.left_key, leftLabel: row.left_label,
      rightKey: row.right_key, rightLabel: row.right_label, risk: row.risk, rule: row.treatment_rule })),
  };
}

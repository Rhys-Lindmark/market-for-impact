import { env } from 'cloudflare:workers';
import snapshot from '@/data/comparisons/funding-tranches-v1.json';
import { ensureAceSnapshot } from '@/db/ace';
import { ensureFoundersPledgeSnapshot } from '@/db/founders-pledge';
import { ensureGiveWellSnapshot } from '@/db/givewell';
import { ensureGivingGreenSnapshot } from '@/db/giving-green';

export async function ensureFundingTranches() {
  await ensureAceSnapshot();
  await ensureGiveWellSnapshot();
  await ensureGivingGreenSnapshot();
  await ensureFoundersPledgeSnapshot();
  const updatedAt = Math.floor(new Date(snapshot.generatedAt).valueOf() / 1000);
  if (!updatedAt) throw new Error('Funding-tranche generation date is invalid.');
  const assessmentRows = await env.DB.prepare(`SELECT a.id, e.slug AS evaluator_slug, o.slug AS organization_slug
    FROM assessments a JOIN organizations e ON e.id = a.evaluator_id
    JOIN organizations o ON o.id = a.organization_id
    WHERE e.slug IN ('animal-charity-evaluators', 'givewell', 'giving-green', 'founders-pledge')`)
    .all<{ id: number; evaluator_slug: string; organization_slug: string }>();
  const assessmentIds = new Map(assessmentRows.results.map((row) => [`${row.evaluator_slug}:${row.organization_slug}`, row.id]));
  const statements = snapshot.tranches.map((tranche) => {
    const assessmentId = assessmentIds.get(`${tranche.evaluatorSlug}:${tranche.organizationSlug}`);
    if (!assessmentId) throw new Error(`Missing assessment for funding tranche ${tranche.trancheKey}.`);
    return env.DB.prepare(`INSERT INTO funding_tranches
      (assessment_id, tranche_key, evaluator_slug, cause, status, amount_usd, capacity_usd, time_window,
       funding_use, confidence_label, confidence_basis, marginal_metric_name, marginal_metric_value,
       marginal_metric_unit, likely_counterfactual_funder, counterfactual_basis, model_version,
       reference_url, limitations, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(tranche_key) DO UPDATE SET assessment_id = excluded.assessment_id,
       evaluator_slug = excluded.evaluator_slug, cause = excluded.cause, status = excluded.status,
       amount_usd = excluded.amount_usd, capacity_usd = excluded.capacity_usd,
       time_window = excluded.time_window, funding_use = excluded.funding_use,
       confidence_label = excluded.confidence_label, confidence_basis = excluded.confidence_basis,
       marginal_metric_name = excluded.marginal_metric_name,
       marginal_metric_value = excluded.marginal_metric_value,
       marginal_metric_unit = excluded.marginal_metric_unit,
       likely_counterfactual_funder = excluded.likely_counterfactual_funder,
       counterfactual_basis = excluded.counterfactual_basis, model_version = excluded.model_version,
       reference_url = excluded.reference_url, limitations = excluded.limitations,
       updated_at = excluded.updated_at`)
      .bind(assessmentId, tranche.trancheKey, tranche.evaluatorSlug, tranche.cause, tranche.status,
        tranche.amountUsd, tranche.capacityUsd, tranche.timeWindow, tranche.use, tranche.confidenceLabel,
        tranche.confidenceBasis, tranche.marginalMetricName, tranche.marginalMetricValue,
        tranche.marginalMetricUnit, tranche.likelyCounterfactualFunder, tranche.counterfactualBasis,
        tranche.modelVersion, tranche.sourceUrl, tranche.limitations, updatedAt);
  });
  for (let index = 0; index < statements.length; index += 50) await env.DB.batch(statements.slice(index, index + 50));
  await env.DB.prepare('PRAGMA optimize').run();
  return { updatedAt };
}

export async function getFundingTranches() {
  const { updatedAt } = await ensureFundingTranches();
  const [summary, periods, statuses, rows] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS tranche_count,
      SUM(CASE WHEN status = 'published-numeric-current-period' THEN 1 ELSE 0 END) AS current_numeric_count,
      SUM(CASE WHEN amount_usd IS NULL THEN 1 ELSE 0 END) AS amount_unpublished_count,
      SUM(CASE WHEN status = 'stale-published-gap' THEN 1 ELSE 0 END) AS stale_count,
      SUM(CASE WHEN status = 'closed-or-contact-required' THEN 1 ELSE 0 END) AS closed_count
      FROM funding_tranches WHERE updated_at = ?`).bind(updatedAt).first<Record<string, number>>(),
    env.DB.prepare(`SELECT time_window, COUNT(*) AS tranche_count, SUM(amount_usd) AS amount_usd
      FROM funding_tranches WHERE updated_at = ? AND status = 'published-numeric-current-period'
      GROUP BY time_window ORDER BY time_window`).bind(updatedAt).all<Record<string, unknown>>(),
    env.DB.prepare(`SELECT status, COUNT(*) AS tranche_count
      FROM funding_tranches WHERE updated_at = ? GROUP BY status ORDER BY status`).bind(updatedAt).all<Record<string, unknown>>(),
    env.DB.prepare(`SELECT t.tranche_key, t.evaluator_slug, e.canonical_name AS evaluator,
        o.canonical_name AS organization, o.slug AS organization_slug, t.cause, t.status,
        t.amount_usd, t.capacity_usd, t.time_window, t.funding_use, t.confidence_label,
        t.confidence_basis, t.marginal_metric_name, t.marginal_metric_value, t.marginal_metric_unit,
        t.likely_counterfactual_funder, t.counterfactual_basis, t.model_version,
        t.reference_url, t.limitations
      FROM funding_tranches t JOIN assessments a ON a.id = t.assessment_id
      JOIN organizations e ON e.id = a.evaluator_id JOIN organizations o ON o.id = a.organization_id
      WHERE t.updated_at = ?
      ORDER BY CASE t.status WHEN 'published-numeric-current-period' THEN 1
        WHEN 'accepting-amount-unpublished' THEN 2 WHEN 'rolling-allocation-amount-unpublished' THEN 3
        WHEN 'qualitative-need-amount-unpublished' THEN 4
        WHEN 'published-recommendation-gap-unpublished' THEN 5
        WHEN 'stale-published-gap' THEN 6 ELSE 7 END,
        t.amount_usd DESC, e.canonical_name, o.canonical_name`).bind(updatedAt).all<Record<string, unknown>>(),
  ]);
  return {
    version: snapshot.version, updatedAt: new Date(updatedAt * 1000).toISOString(),
    interpretation: snapshot.interpretation, methodologySources: snapshot.methodologySources,
    summary: {
      trancheCount: Number(summary?.tranche_count ?? 0), currentNumericCount: Number(summary?.current_numeric_count ?? 0),
      amountUnpublishedCount: Number(summary?.amount_unpublished_count ?? 0), staleCount: Number(summary?.stale_count ?? 0),
      closedCount: Number(summary?.closed_count ?? 0),
    },
    periods: periods.results.map((row) => ({ timeWindow: row.time_window, trancheCount: row.tranche_count, amountUsd: row.amount_usd })),
    statuses: statuses.results.map((row) => ({ status: row.status, trancheCount: row.tranche_count })),
    tranches: rows.results.map((row) => ({
      trancheKey: row.tranche_key, evaluatorSlug: row.evaluator_slug, evaluator: row.evaluator,
      organization: row.organization, organizationSlug: row.organization_slug, cause: row.cause,
      status: row.status, amountUsd: row.amount_usd, capacityUsd: row.capacity_usd,
      timeWindow: row.time_window, use: row.funding_use, confidenceLabel: row.confidence_label,
      confidenceBasis: row.confidence_basis, marginalMetricName: row.marginal_metric_name,
      marginalMetricValue: row.marginal_metric_value, marginalMetricUnit: row.marginal_metric_unit,
      likelyCounterfactualFunder: row.likely_counterfactual_funder,
      counterfactualBasis: row.counterfactual_basis, modelVersion: row.model_version,
      sourceUrl: row.reference_url, limitations: row.limitations,
    })),
  };
}

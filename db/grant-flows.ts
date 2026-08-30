import { env } from 'cloudflare:workers';
import contract from '@/data/comparisons/grant-flow-contract-v1.json';
import { ensureAllCoefficientSnapshot } from '@/db/coefficient-all';
import { ensureGiveWellSnapshot } from '@/db/givewell';
import { ensureGivingGreenSnapshot } from '@/db/giving-green';
import { ensureRenPhilSnapshot } from '@/db/renphil';

export type GrantFlowQuery = {
  source: string;
  year: number | null;
  cause: string;
  geography: string;
  status: string;
  restriction: 'restricted' | 'unrestricted' | 'not-published' | '';
  query: string;
  sort: 'recent' | 'largest';
  page: number;
  pageSize: number;
};

type SourceRuntime = { sourceId: number; retrievedAt: number };
type SourceConfig = {
  key: string; detailSource: string; dateColumn: string; dateBasis: string;
  causeField: 'focus' | 'topics' | 'cause'; geographyField: 'countries' | 'geography' | 'none';
};

const sourceConfigs: Record<string, SourceConfig> = {
  coefficient: { key: 'coefficient', detailSource: 'coefficient', dateColumn: 'g.award_date', dateBasis: 'award date', causeField: 'focus', geographyField: 'none' },
  givewell: { key: 'givewell', detailSource: 'givewell', dateColumn: 'g.decision_date', dateBasis: 'decision date', causeField: 'topics', geographyField: 'countries' },
  'giving-green': { key: 'giving-green', detailSource: 'giving-green', dateColumn: 'g.source_published_at', dateBasis: 'announcement date', causeField: 'cause', geographyField: 'none' },
  renphil: { key: 'renphil', detailSource: 'renphil', dateColumn: 'g.source_published_at', dateBasis: 'announcement date', causeField: 'cause', geographyField: 'none' },
};

function parseArray(value: unknown): string[] {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
  } catch { return []; }
}

function parseRecipients(value: unknown, fallback: unknown) {
  let parsed: unknown = value;
  try { parsed = typeof value === 'string' ? JSON.parse(value) : value; } catch { parsed = []; }
  const normalized = (Array.isArray(parsed) ? parsed : []).map((item) => {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;
    return { name: String(record.name ?? ''), slug: String(record.slug ?? ''), normalized: true as const };
  }).filter((item): item is { name: string; slug: string; normalized: true } => Boolean(item?.name));
  if (normalized.length) return normalized;
  return parseArray(fallback).map((name) => ({ name, slug: null, normalized: false }));
}

async function ensureAcceptedSources() {
  const runtimes: Record<string, SourceRuntime> = {};
  runtimes.coefficient = await ensureAllCoefficientSnapshot();
  runtimes.givewell = await ensureGiveWellSnapshot();
  runtimes['giving-green'] = await ensureGivingGreenSnapshot();
  runtimes.renphil = await ensureRenPhilSnapshot();
  return runtimes;
}

function baseClauses(source: SourceRuntime) {
  return { clauses: ['g.source_id = ?', 'g.last_seen_at = ?'], bindings: [source.sourceId, source.retrievedAt] as Array<string | number> };
}

function addCauseFilter(config: SourceConfig, clauses: string[], bindings: Array<string | number>, cause: string) {
  if (!cause) return;
  if (cause === 'Not published') {
    clauses.push(config.causeField === 'cause' ? "(g.cause IS NULL OR g.cause = '')"
      : `json_array_length(g.${config.causeField === 'focus' ? 'focus_areas_json' : 'topics_json'}) = 0`);
    return;
  }
  if (config.causeField === 'cause') clauses.push('g.cause = ?');
  else clauses.push(`EXISTS (SELECT 1 FROM json_each(g.${config.causeField === 'focus' ? 'focus_areas_json' : 'topics_json'}) cause_tag WHERE cause_tag.value = ?)`);
  bindings.push(cause);
}

function addGeographyFilter(config: SourceConfig, clauses: string[], bindings: Array<string | number>, geography: string) {
  if (!geography) return;
  if (geography === 'Not published') {
    clauses.push(config.geographyField === 'countries' ? 'json_array_length(g.countries_json) = 0'
      : config.geographyField === 'geography' ? "(g.geography IS NULL OR g.geography = '')" : '1 = 1');
    return;
  }
  if (config.geographyField === 'countries') clauses.push('EXISTS (SELECT 1 FROM json_each(g.countries_json) country WHERE country.value = ?)');
  else if (config.geographyField === 'geography') clauses.push('g.geography = ?');
  else { clauses.push('1 = 0'); return; }
  bindings.push(geography);
}

async function sourceSummary(ledger: (typeof contract.ledgers)[number], source: SourceRuntime, config: SourceConfig) {
  const row = await env.DB.prepare(`SELECT COUNT(*) AS row_count, COALESCE(SUM(g.amount_usd), 0) AS published_amount_usd,
      SUM(CASE WHEN g.amount_usd IS NULL THEN 1 ELSE 0 END) AS missing_amount_count,
      SUM(CASE WHEN ${config.dateColumn} IS NULL THEN 1 ELSE 0 END) AS missing_date_count,
      SUM(CASE WHEN g.originating_funder_id IS NOT NULL THEN 1 ELSE 0 END) AS normalized_originator_count,
      SUM(CASE WHEN g.advising_funder_id IS NOT NULL THEN 1 ELSE 0 END) AS normalized_advisor_count,
      SUM(CASE WHEN json_array_length(g.recipient_names_json) > 0 THEN 1 ELSE 0 END) AS named_recipient_count,
      SUM(CASE WHEN g.restricted IS NULL THEN 1 ELSE 0 END) AS missing_restriction_count
    FROM grants g WHERE g.source_id = ? AND g.last_seen_at = ?`).bind(source.sourceId, source.retrievedAt).first<Record<string, number>>();
  if (!row || row.row_count !== ledger.rowCount || row.published_amount_usd !== ledger.publishedAmountUsd) {
    throw new Error(`${ledger.key} D1 flow summary does not reconcile to the accepted source contract.`);
  }
  return {
    ...ledger,
    rowCount: row.row_count, publishedAmountUsd: row.published_amount_usd,
    missingAmountCount: row.missing_amount_count, missingDateCount: row.missing_date_count,
    normalizedOriginatorCount: row.normalized_originator_count, normalizedAdvisorCount: row.normalized_advisor_count,
    namedRecipientCount: row.named_recipient_count, missingRestrictionCount: row.missing_restriction_count,
    missingStageCount: row.row_count,
  };
}

async function facets(source: SourceRuntime, config: SourceConfig) {
  const { clauses, bindings } = baseClauses(source);
  const where = clauses.join(' AND ');
  const causeColumn = config.causeField === 'focus' ? 'focus_areas_json' : 'topics_json';
  const causeSql = config.causeField === 'cause'
    ? `SELECT COALESCE(NULLIF(g.cause, ''), 'Not published') AS value, COUNT(*) AS count FROM grants g WHERE ${where} GROUP BY value ORDER BY count DESC, value`
    : `SELECT tag.value AS value, COUNT(*) AS count FROM grants g, json_each(g.${causeColumn}) tag WHERE ${where} AND tag.value <> '' GROUP BY tag.value ORDER BY count DESC, tag.value`;
  const geographySql = config.geographyField === 'countries'
    ? `SELECT country.value AS value, COUNT(*) AS count FROM grants g, json_each(g.countries_json) country WHERE ${where} AND country.value <> '' GROUP BY country.value ORDER BY count DESC, country.value`
    : config.geographyField === 'geography'
      ? `SELECT COALESCE(NULLIF(g.geography, ''), 'Not published') AS value, COUNT(*) AS count FROM grants g WHERE ${where} GROUP BY value ORDER BY count DESC, value`
      : null;
  const [years, causes, geographies, statuses, restrictions] = await Promise.all([
    env.DB.prepare(`SELECT CAST(strftime('%Y', datetime(${config.dateColumn}, 'unixepoch')) AS INTEGER) AS value, COUNT(*) AS count FROM grants g WHERE ${where} AND ${config.dateColumn} IS NOT NULL GROUP BY value ORDER BY value DESC`).bind(...bindings).all(),
    env.DB.prepare(causeSql).bind(...bindings).all(),
    geographySql ? env.DB.prepare(geographySql).bind(...bindings).all() : Promise.resolve({ results: [] }),
    env.DB.prepare(`SELECT g.status AS value, COUNT(*) AS count FROM grants g WHERE ${where} GROUP BY g.status ORDER BY count DESC, value`).bind(...bindings).all(),
    env.DB.prepare(`SELECT CASE WHEN g.restricted = 1 THEN 'restricted' WHEN g.restricted = 0 THEN 'unrestricted' ELSE 'not-published' END AS value, COUNT(*) AS count FROM grants g WHERE ${where} GROUP BY value ORDER BY count DESC`).bind(...bindings).all(),
  ]);
  return {
    years: years.results,
    causes: causes.results,
    geographies: geographies.results.length ? geographies.results : [{ value: 'Not published', count: contract.ledgers.find((item) => item.key === config.key)?.rowCount ?? 0 }],
    statuses: statuses.results,
    restrictions: restrictions.results,
    stages: [{ value: 'Not published', count: contract.ledgers.find((item) => item.key === config.key)?.rowCount ?? 0 }],
    causeCountsAreNonAdditive: config.causeField !== 'cause',
  };
}

export async function getGrantFlows(query: GrantFlowQuery) {
  const runtimes = await ensureAcceptedSources();
  const effectiveSource = sourceConfigs[query.source] ? query.source : contract.defaultLedger;
  const config = sourceConfigs[effectiveSource];
  const runtime = runtimes[effectiveSource];
  const ledger = contract.ledgers.find((item) => item.key === effectiveSource);
  if (!ledger) throw new Error(`Missing flow contract for ${effectiveSource}.`);
  const summaries = [];
  for (const item of contract.ledgers) summaries.push(await sourceSummary(item, runtimes[item.key], sourceConfigs[item.key]));

  const { clauses, bindings } = baseClauses(runtime);
  if (query.year) {
    clauses.push(`${config.dateColumn} >= ? AND ${config.dateColumn} < ?`);
    bindings.push(Math.floor(Date.UTC(query.year, 0, 1) / 1000), Math.floor(Date.UTC(query.year + 1, 0, 1) / 1000));
  }
  addCauseFilter(config, clauses, bindings, query.cause);
  addGeographyFilter(config, clauses, bindings, query.geography);
  if (query.status) { clauses.push('g.status = ?'); bindings.push(query.status); }
  if (query.restriction) {
    clauses.push(query.restriction === 'restricted' ? 'g.restricted = 1' : query.restriction === 'unrestricted' ? 'g.restricted = 0' : 'g.restricted IS NULL');
  }
  if (query.query) {
    const escaped = query.query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
    clauses.push("(g.purpose LIKE ? ESCAPE '\\' OR g.recipient_names_text LIKE ? ESCAPE '\\')");
    bindings.push(`%${escaped}%`, `%${escaped}%`);
  }
  const where = clauses.join(' AND ');
  const order = query.sort === 'largest' ? `g.amount_usd DESC, ${config.dateColumn} DESC, g.id` : `${config.dateColumn} DESC, g.amount_usd DESC, g.id`;
  const count = await env.DB.prepare(`SELECT COUNT(*) AS total FROM grants g WHERE ${where}`).bind(...bindings).first<{ total: number }>();
  const offset = (query.page - 1) * query.pageSize;
  const rows = await env.DB.prepare(`SELECT g.id, g.source_record_id, g.source_url, g.amount_usd, g.status,
      ${config.dateColumn} AS event_date, g.purpose, g.intervention, g.cause, g.focus_areas_json,
      g.topics_json, g.countries_json, g.geography, g.restricted, g.recipient_names_json,
      g.funders_json, originating.canonical_name AS originating_funder, originating.slug AS originating_funder_slug,
      advising.canonical_name AS advising_funder, advising.slug AS advising_funder_slug,
      (SELECT json_group_array(json_object('name', role.source_name, 'slug', recipient.slug))
       FROM grant_organization_roles role JOIN organizations recipient ON recipient.id = role.organization_id
       WHERE role.grant_id = g.id AND role.role = 'recipient' ORDER BY role.position) AS normalized_recipients
    FROM grants g
    LEFT JOIN organizations originating ON originating.id = g.originating_funder_id
    LEFT JOIN organizations advising ON advising.id = g.advising_funder_id
    WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).bind(...bindings, query.pageSize, offset).all<Record<string, unknown>>();

  const total = count?.total ?? 0;
  return {
    version: contract.version,
    generatedAt: contract.generatedAt,
    acceptedSourceRowCount: contract.acceptedSourceRowCount,
    aggregationRules: contract.aggregationRules,
    excludedLedgers: contract.excludedLedgers,
    sourceSummaries: summaries,
    selectedSource: { ...ledger, dateBasis: config.dateBasis },
    facets: await facets(runtime, config),
    query: { ...query, source: effectiveSource },
    pagination: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.ceil(total / query.pageSize) },
    flows: rows.results.map((row) => ({
      sourceRecordId: String(row.source_record_id), sourceUrl: row.source_url ? String(row.source_url) : null,
      detailSource: config.detailSource, amountUsd: row.amount_usd == null ? null : Number(row.amount_usd),
      status: String(row.status), eventDate: row.event_date ? new Date(Number(row.event_date) * 1000).toISOString() : null,
      dateBasis: config.dateBasis, purpose: row.purpose ? String(row.purpose) : null,
      intervention: row.intervention ? String(row.intervention) : null,
      causeTags: config.causeField === 'focus' ? parseArray(row.focus_areas_json)
        : config.causeField === 'topics' ? parseArray(row.topics_json) : row.cause ? [String(row.cause)] : [],
      geographies: config.geographyField === 'countries' ? parseArray(row.countries_json)
        : row.geography ? [String(row.geography)] : [],
      stage: null,
      restriction: row.restricted === 1 ? 'restricted' : row.restricted === 0 ? 'unrestricted' : null,
      originatingFunder: row.originating_funder ? { name: String(row.originating_funder), slug: String(row.originating_funder_slug) } : null,
      advisingFunder: row.advising_funder ? { name: String(row.advising_funder), slug: String(row.advising_funder_slug) } : null,
      sourceListedFunders: parseArray(row.funders_json),
      recipients: parseRecipients(row.normalized_recipients, row.recipient_names_json),
    })),
  };
}

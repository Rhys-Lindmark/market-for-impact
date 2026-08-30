import { env } from 'cloudflare:workers';
import snapshot from '@/data/coefficient/all-grants.json';
import marketSummary from '@/data/normalized/coefficient-market-summary.json';
import { organizationGraphComplete, replaceGrantOrganizationRoles, upsertOrganizationIdentities } from '@/db/grant-organizations';
import { organizationIdentityKey, uniqueOrganizationNames } from '@/db/organization-identity';

type SnapshotRecord = (typeof snapshot.records)[number];

export type CoefficientGrantQuery = {
  fund: string | null;
  year: number | null;
  query: string;
  sort: 'recent' | 'largest';
  page: number;
  pageSize: number;
};

const BATCH_SIZE = 50;
const listedFunds = new Set(snapshot.listedFunds);
const recipientNames = uniqueOrganizationNames(snapshot.records.flatMap((record) => record.recipients));
const expectedRoleCount = snapshot.records.length + snapshot.records.reduce((sum, record) => sum + record.recipients.length, 0);

function epoch(value: string | null) {
  return value ? Math.floor(new Date(value).valueOf() / 1000) : null;
}

function normalizedRecipientText(record: SnapshotRecord) {
  return record.recipients.map((name) => name.replace(/\s+/g, ' ').trim()).join(' · ');
}

async function ensureCoefficientOrganizationGraph(sourceId: number) {
  if (await organizationGraphComplete(sourceId, expectedRoleCount, recipientNames.size)) return;
  const organizationIds = await upsertOrganizationIdentities(sourceId,
    [...recipientNames.values()].map((name) => ({ name, organizationType: 'source-listed-recipient' })));
  const recipients = snapshot.records.flatMap((record) => record.recipients.map((name, position) => {
    const organizationId = organizationIds.get(organizationIdentityKey(name));
    if (!organizationId) throw new Error(`Coefficient recipient identity missing: ${name}`);
    return { sourceRecordId: record.sourceRecordId, organizationId, sourceName: name, position };
  }));
  await replaceGrantOrganizationRoles(sourceId, recipients);
  if (!await organizationGraphComplete(sourceId, expectedRoleCount, recipientNames.size)) {
    throw new Error('Complete Coefficient organization graph failed reconciliation.');
  }
}

export async function ensureAllCoefficientSnapshot() {
  const sourceUrl = snapshot.source.url;
  const current = await env.DB.prepare('SELECT id, content_hash, retrieved_at FROM sources WHERE url = ?')
    .bind(sourceUrl).first<{ id: number; content_hash: string | null; retrieved_at: number }>();
  if (current?.content_hash === marketSummary.source.contentHash) {
    await ensureCoefficientOrganizationGraph(current.id);
    return { sourceId: current.id, retrievedAt: current.retrieved_at };
  }

  const retrievedAt = epoch(snapshot.source.retrievedAt);
  if (!retrievedAt) throw new Error('Coefficient snapshot retrieval date is invalid.');
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO sources (publisher, title, url, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, ?, ?, NULL)
      ON CONFLICT(url) DO UPDATE SET publisher = excluded.publisher, title = excluded.title,
        retrieved_at = excluded.retrieved_at, coverage_note = excluded.coverage_note, content_hash = NULL`)
      .bind(snapshot.source.publisher, snapshot.source.title, sourceUrl, retrievedAt, snapshot.source.coverageNote),
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name,
        website_url = excluded.website_url`)
      .bind('Coefficient Giving', 'coefficient-giving', 'https://coefficientgiving.org/', 'funder-advisor'),
  ]);

  const source = await env.DB.prepare('SELECT id FROM sources WHERE url = ?').bind(sourceUrl).first<{ id: number }>();
  const advisor = await env.DB.prepare('SELECT id FROM organizations WHERE slug = ?')
    .bind('coefficient-giving').first<{ id: number }>();
  if (!source || !advisor) throw new Error('Complete Coefficient source initialization failed.');

  const grantStatements = snapshot.records.map((record) => env.DB.prepare(`INSERT INTO grants
    (external_id, source_record_id, source_url, source_id, advising_funder_id, recipient_id,
      amount_usd, amount_original, currency, status, decision_date, award_date, source_published_at,
      source_post_id, recipient_names_json, recipient_names_text, focus_areas_json, listed_funds_json,
      cause, purpose, grouped_grant, first_seen_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(source_id, source_record_id) DO UPDATE SET
      external_id = excluded.external_id, source_url = excluded.source_url,
      advising_funder_id = excluded.advising_funder_id, amount_usd = excluded.amount_usd,
      amount_original = excluded.amount_original, currency = excluded.currency, status = excluded.status,
      decision_date = excluded.decision_date, award_date = excluded.award_date,
      source_published_at = excluded.source_published_at, source_post_id = excluded.source_post_id,
      recipient_names_json = excluded.recipient_names_json, recipient_names_text = excluded.recipient_names_text,
      focus_areas_json = excluded.focus_areas_json, listed_funds_json = excluded.listed_funds_json,
      cause = excluded.cause, purpose = excluded.purpose, last_seen_at = excluded.last_seen_at`)
    .bind(record.sourceRecordId, record.sourceRecordId, record.grantUrl, source.id, advisor.id,
      record.amountUsd, record.amountUsd, record.amountUsd == null ? null : 'USD', snapshot.source.statusSemantics,
      epoch(record.awardDate), epoch(record.awardDate), epoch(record.publicationDate), record.sourcePostId,
      JSON.stringify(record.recipients), normalizedRecipientText(record), JSON.stringify(record.focusAreas),
      JSON.stringify(record.listedFunds), 'coefficient-public-index', record.purpose, 0, retrievedAt, retrievedAt));
  for (let index = 0; index < grantStatements.length; index += BATCH_SIZE) {
    await env.DB.batch(grantStatements.slice(index, index + BATCH_SIZE));
  }
  await ensureCoefficientOrganizationGraph(source.id);

  await env.DB.batch([
    env.DB.prepare('UPDATE sources SET retrieved_at = ?, coverage_note = ?, content_hash = ? WHERE id = ?')
      .bind(retrievedAt, snapshot.source.coverageNote, marketSummary.source.contentHash, source.id),
    env.DB.prepare('PRAGMA optimize'),
  ]);
  return { sourceId: source.id, retrievedAt };
}

function parseStringArray(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

async function getCoefficientMarketOverview(sourceId: number, retrievedAt: number) {
  const [source, summary, recipients, fundRows] = await Promise.all([
    env.DB.prepare(`SELECT publisher, title, url, retrieved_at, coverage_note, content_hash
      FROM sources WHERE id = ?`).bind(sourceId).first<{
        publisher: string; title: string; url: string; retrieved_at: number;
        coverage_note: string | null; content_hash: string | null;
      }>(),
    env.DB.prepare(`SELECT COUNT(*) AS grant_count,
        COALESCE(SUM(amount_usd), 0) AS total_published_amount_usd,
        SUM(CASE WHEN amount_usd IS NULL THEN 1 ELSE 0 END) AS grants_without_published_amount,
        SUM(CASE WHEN json_array_length(recipient_names_json) = 0 THEN 1 ELSE 0 END) AS grants_without_recipient,
        SUM(CASE WHEN json_array_length(listed_funds_json) = 0 THEN 1 ELSE 0 END) AS grants_without_listed_fund,
        SUM(CASE WHEN json_array_length(listed_funds_json) > 1 THEN 1 ELSE 0 END) AS grants_with_multiple_listed_funds,
        SUM(CASE WHEN json_array_length(focus_areas_json) = 0 THEN 1 ELSE 0 END) AS grants_without_focus_area,
        SUM(CASE WHEN award_date IS NULL THEN 1 ELSE 0 END) AS grants_without_award_date,
        SUM(CASE WHEN award_date > ? THEN 1 ELSE 0 END) AS future_dated_grants,
        MIN(award_date) AS earliest_award_date,
        MAX(award_date) AS latest_award_date
      FROM grants WHERE source_id = ? AND last_seen_at = ?`)
      .bind(retrievedAt, sourceId, retrievedAt).first<Record<string, number | null>>(),
    env.DB.prepare(`SELECT COUNT(DISTINCT names.value) AS unique_recipient_count
      FROM grants g, json_each(g.recipient_names_json) names
      WHERE g.source_id = ? AND g.last_seen_at = ? AND names.value <> ''`)
      .bind(sourceId, retrievedAt).first<{ unique_recipient_count: number }>(),
    env.DB.prepare(`SELECT funds.value AS fund, COUNT(*) AS grant_count,
        COALESCE(SUM(g.amount_usd), 0) AS published_amount_usd,
        MAX(g.award_date) AS latest_award_date
      FROM grants g, json_each(g.listed_funds_json) funds
      WHERE g.source_id = ? AND g.last_seen_at = ?
      GROUP BY funds.value`).bind(sourceId, retrievedAt).all<{
        fund: string; grant_count: number; published_amount_usd: number; latest_award_date: number | null;
      }>(),
  ]);
  if (!source || !summary) throw new Error('Complete Coefficient market overview is unavailable.');
  const fundsByName = new Map(fundRows.results.map((row) => [row.fund, row]));
  const funds = marketSummary.funds.map((fund) => {
    const row = fundsByName.get(fund.fund);
    return {
      fund: fund.fund,
      url: fund.url,
      status: fund.status,
      grantCount: row?.grant_count ?? 0,
      publishedAmountUsd: row?.published_amount_usd ?? 0,
      latestAwardDate: row?.latest_award_date ? new Date(row.latest_award_date * 1000).toISOString() : null,
    };
  });
  return {
    source: {
      publisher: source.publisher,
      title: source.title,
      url: source.url,
      retrievedAt: new Date(source.retrieved_at * 1000).toISOString(),
      coverageNote: source.coverage_note,
      contentHash: source.content_hash,
    },
    summary: {
      grantCount: summary.grant_count ?? 0,
      totalPublishedAmountUsd: summary.total_published_amount_usd ?? 0,
      uniqueRecipientCount: recipients?.unique_recipient_count ?? 0,
      listedFundCount: funds.filter((fund) => fund.grantCount > 0).length,
      grantsWithMultipleListedFunds: summary.grants_with_multiple_listed_funds ?? 0,
      grantsWithoutListedFund: summary.grants_without_listed_fund ?? 0,
      grantsWithoutFocusArea: summary.grants_without_focus_area ?? 0,
      grantsWithoutPublishedAmount: summary.grants_without_published_amount ?? 0,
      grantsWithoutRecipient: summary.grants_without_recipient ?? 0,
      grantsWithoutAwardDate: summary.grants_without_award_date ?? 0,
      futureDatedGrants: summary.future_dated_grants ?? 0,
      earliestAwardDate: summary.earliest_award_date ? new Date(summary.earliest_award_date * 1000).toISOString() : null,
      latestAwardDate: summary.latest_award_date ? new Date(summary.latest_award_date * 1000).toISOString() : null,
    },
    funds,
  };
}

export async function getAllCoefficientGrants(query: CoefficientGrantQuery) {
  const { sourceId, retrievedAt } = await ensureAllCoefficientSnapshot();
  const overview = await getCoefficientMarketOverview(sourceId, retrievedAt);
  const effectiveFund = query.fund && listedFunds.has(query.fund) ? query.fund : null;
  const clauses = ['g.source_id = ?', 'g.last_seen_at = ?'];
  const bindings: Array<string | number> = [sourceId, retrievedAt];
  if (effectiveFund) {
    clauses.push('EXISTS (SELECT 1 FROM json_each(g.listed_funds_json) WHERE value = ?)');
    bindings.push(effectiveFund);
  }
  if (query.year) {
    const start = Math.floor(Date.UTC(query.year, 0, 1) / 1000);
    const end = Math.floor(Date.UTC(query.year + 1, 0, 1) / 1000);
    clauses.push('g.award_date >= ? AND g.award_date < ?');
    bindings.push(start, end);
  }
  if (query.query) {
    clauses.push("(g.purpose LIKE ? ESCAPE '\\' OR g.recipient_names_text LIKE ? ESCAPE '\\')");
    const escaped = query.query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');
    bindings.push(`%${escaped}%`, `%${escaped}%`);
  }
  const where = clauses.join(' AND ');
  const order = query.sort === 'largest'
    ? 'g.amount_usd DESC, g.award_date DESC, g.source_record_id ASC'
    : 'g.award_date DESC, g.amount_usd DESC, g.source_record_id ASC';

  const count = await env.DB.prepare(`SELECT COUNT(*) AS total FROM grants g WHERE ${where}`)
    .bind(...bindings).first<{ total: number }>();
  const offset = (query.page - 1) * query.pageSize;
  const result = await env.DB.prepare(`SELECT g.source_record_id, g.source_url, g.purpose, g.amount_usd,
      g.award_date, g.source_published_at, g.recipient_names_json, g.focus_areas_json, g.listed_funds_json
    FROM grants g WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .bind(...bindings, query.pageSize, offset).all<{
      source_record_id: string;
      source_url: string | null;
      purpose: string | null;
      amount_usd: number | null;
      award_date: number | null;
      source_published_at: number | null;
      recipient_names_json: string;
      focus_areas_json: string;
      listed_funds_json: string;
    }>();

  const total = count?.total ?? 0;
  return {
    ...overview,
    query: { ...query, fund: effectiveFund },
    pagination: { page: query.page, pageSize: query.pageSize, total, pageCount: Math.ceil(total / query.pageSize) },
    grants: result.results.map((record) => ({
      sourceRecordId: record.source_record_id,
      sourceUrl: record.source_url,
      purpose: record.purpose,
      amountUsd: record.amount_usd,
      awardDate: record.award_date ? new Date(record.award_date * 1000).toISOString() : null,
      sourcePublishedAt: record.source_published_at ? new Date(record.source_published_at * 1000).toISOString() : null,
      recipients: parseStringArray(record.recipient_names_json),
      focusAreas: parseStringArray(record.focus_areas_json),
      listedFunds: parseStringArray(record.listed_funds_json),
    })),
  };
}

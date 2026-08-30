import { env } from 'cloudflare:workers';
import snapshot from '@/data/renphil/ai-for-math-2025.json';

type AwardRecord = (typeof snapshot.records)[number];

function epoch(value: string | null) {
  return value ? Math.floor(new Date(value).valueOf() / 1000) : null;
}

async function ensureRenPhilSnapshot() {
  const current = await env.DB.prepare('SELECT id, content_hash, retrieved_at FROM sources WHERE url = ?')
    .bind(snapshot.source.url).first<{ id: number; content_hash: string | null; retrieved_at: number }>();
  if (current?.content_hash === snapshot.source.contentHash) {
    return { sourceId: current.id, retrievedAt: current.retrieved_at };
  }

  const retrievedAt = epoch(snapshot.source.retrievedAt);
  if (!retrievedAt) throw new Error('RenPhil snapshot retrieval date is invalid.');
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO sources (publisher, title, url, published_at, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, NULL)
      ON CONFLICT(url) DO UPDATE SET publisher = excluded.publisher, title = excluded.title,
        published_at = excluded.published_at, retrieved_at = excluded.retrieved_at,
        coverage_note = excluded.coverage_note, content_hash = NULL`)
      .bind(snapshot.source.publisher, snapshot.source.title, snapshot.source.url,
        epoch(snapshot.fundSignals.firstRoundAnnouncedAt), retrievedAt, snapshot.source.coverageNote),
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name,
        website_url = excluded.website_url, organization_type = excluded.organization_type`)
      .bind('Renaissance Philanthropy', 'renaissance-philanthropy', 'https://www.renaissancephilanthropy.org/', 'funder-advisor'),
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name,
        website_url = excluded.website_url, organization_type = excluded.organization_type`)
      .bind('XTX Markets', 'xtx-markets', 'https://www.xtxmarkets.com/', 'originating-funder'),
  ]);
  const [source, advisor, funder] = await Promise.all([
    env.DB.prepare('SELECT id FROM sources WHERE url = ?').bind(snapshot.source.url).first<{ id: number }>(),
    env.DB.prepare('SELECT id FROM organizations WHERE slug = ?').bind('renaissance-philanthropy').first<{ id: number }>(),
    env.DB.prepare('SELECT id FROM organizations WHERE slug = ?').bind('xtx-markets').first<{ id: number }>(),
  ]);
  if (!source || !advisor || !funder) throw new Error('RenPhil source initialization failed.');

  const statements = snapshot.records.map((record: AwardRecord) => env.DB.prepare(`INSERT INTO grants
    (external_id, source_record_id, source_url, source_id, originating_funder_id, advising_funder_id,
      recipient_id, amount_usd, amount_original, currency, status, decision_date, award_date,
      source_published_at, recipient_names_json, recipient_names_text, focus_areas_json,
      listed_funds_json, topics_json, funders_json, countries_json, cause, intervention, purpose,
      grouped_grant, first_seen_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, 0, ?, ?)
    ON CONFLICT(source_id, source_record_id) DO UPDATE SET source_url = excluded.source_url,
      originating_funder_id = excluded.originating_funder_id, advising_funder_id = excluded.advising_funder_id,
      status = excluded.status, source_published_at = excluded.source_published_at,
      recipient_names_json = excluded.recipient_names_json, recipient_names_text = excluded.recipient_names_text,
      focus_areas_json = excluded.focus_areas_json, listed_funds_json = excluded.listed_funds_json,
      topics_json = excluded.topics_json, funders_json = excluded.funders_json, cause = excluded.cause,
      intervention = excluded.intervention, purpose = excluded.purpose, last_seen_at = excluded.last_seen_at`)
    .bind(record.sourceRecordId, record.sourceRecordId, record.sourceUrl, source.id, funder.id, advisor.id,
      record.status, epoch(snapshot.fundSignals.firstRoundAnnouncedAt), JSON.stringify(record.recipientNames),
      record.recipientNames.join(' · '), JSON.stringify(['AI for mathematics']), JSON.stringify([record.fund]),
      JSON.stringify(['AI for mathematics', 'open scientific infrastructure']), JSON.stringify([record.namedFunder]),
      record.cause, record.intervention, record.purpose, retrievedAt, retrievedAt));
  for (let index = 0; index < statements.length; index += 50) {
    await env.DB.batch(statements.slice(index, index + 50));
  }
  await env.DB.batch([
    env.DB.prepare('UPDATE sources SET retrieved_at = ?, coverage_note = ?, content_hash = ? WHERE id = ?')
      .bind(retrievedAt, snapshot.source.coverageNote, snapshot.source.contentHash, source.id),
    env.DB.prepare('PRAGMA optimize'),
  ]);
  return { sourceId: source.id, retrievedAt };
}

function parseNames(value: unknown): string[] {
  try { return typeof value === 'string' ? JSON.parse(value) : []; } catch { return []; }
}

export async function getRenPhilMarket() {
  const { sourceId, retrievedAt } = await ensureRenPhilSnapshot();
  const [summary, awards] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS award_count,
      SUM(CASE WHEN amount_usd IS NULL THEN 1 ELSE 0 END) AS missing_amount_count,
      SUM(CASE WHEN decision_date IS NULL THEN 1 ELSE 0 END) AS missing_decision_date_count,
      SUM(CASE WHEN purpose IS NULL OR purpose = '' THEN 1 ELSE 0 END) AS missing_description_count
      FROM grants WHERE source_id = ? AND last_seen_at = ?`).bind(sourceId, retrievedAt).first(),
    env.DB.prepare(`SELECT source_record_id, source_url, purpose, recipient_names_json, recipient_names_text
      FROM grants WHERE source_id = ? AND last_seen_at = ? ORDER BY purpose IS NULL, purpose, source_record_id`)
      .bind(sourceId, retrievedAt).all<{
        source_record_id: string; source_url: string; purpose: string | null;
        recipient_names_json: string; recipient_names_text: string;
      }>(),
  ]);
  const byId = new Map(snapshot.records.map((record) => [record.sourceRecordId, record]));
  return {
    source: snapshot.source,
    summary: { ...summary, declared_award_count: snapshot.summary.declaredAwardCount, unlisted_award_count: snapshot.summary.unlistedAwardCount },
    fundSignals: snapshot.fundSignals,
    organizationSignals: snapshot.organizationSignals,
    awards: awards.results.map((award) => ({
      sourceRecordId: award.source_record_id,
      sourceUrl: award.source_url,
      project: byId.get(award.source_record_id)?.project ?? 'Project title unavailable',
      purpose: award.purpose,
      recipientNames: parseNames(award.recipient_names_json),
      amountUsd: null,
      decisionDate: null,
      status: snapshot.source.statusSemantics,
    })),
  };
}

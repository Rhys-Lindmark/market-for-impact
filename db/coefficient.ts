import { env } from 'cloudflare:workers';
import snapshot from '@/data/normalized/coefficient-effective-giving-and-careers.json';
import { organizationGraphComplete, replaceGrantOrganizationRoles, upsertOrganizationIdentities } from '@/db/grant-organizations';

type GrantRecord = (typeof snapshot.records)[number];
const recipientCount = new Set(snapshot.records.map((record) => record.recipientSlug)).size;
const expectedRoleCount = snapshot.records.length * 2;

async function ensureCoefficientFundOrganizationGraph(sourceId: number) {
  if (await organizationGraphComplete(sourceId, expectedRoleCount, recipientCount)) return;
  await upsertOrganizationIdentities(sourceId, snapshot.records.map((record) => ({
    name: record.recipient,
    slug: record.recipientSlug,
    websiteUrl: record.recipientUrl,
    organizationType: 'grantee',
  })));
  await replaceGrantOrganizationRoles(sourceId);
  if (!await organizationGraphComplete(sourceId, expectedRoleCount, recipientCount)) {
    throw new Error('Coefficient fund organization graph failed reconciliation.');
  }
}

export async function ensureCurrentSnapshot() {
  const sourceUrl = snapshot.source.url;
  const current = await env.DB.prepare('SELECT id, content_hash, retrieved_at FROM sources WHERE url = ?')
    .bind(sourceUrl).first<{ id: number; content_hash: string | null; retrieved_at: number }>();
  if (current?.content_hash === snapshot.source.contentHash) {
    await ensureCoefficientFundOrganizationGraph(current.id);
    return { sourceId: current.id, retrievedAt: current.retrieved_at };
  }

  const retrievedAt = Math.floor(new Date(snapshot.source.retrievedAt).valueOf() / 1000);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO sources (publisher, title, url, retrieved_at, coverage_note, content_hash)
      VALUES (?, ?, ?, ?, ?, NULL)
      ON CONFLICT(url) DO NOTHING`)
      .bind(snapshot.source.publisher, `${snapshot.source.fund} public grants`, sourceUrl, retrievedAt, snapshot.source.coverageNote),
    env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name`)
      .bind('Coefficient Giving', 'coefficient-giving', 'https://coefficientgiving.org/', 'funder-advisor'),
  ]);

  const organizationStatements = [...new Map(snapshot.records.map((record) => [record.recipientSlug, record])).values()]
    .map((record) => env.DB.prepare(`INSERT INTO organizations (canonical_name, slug, website_url, organization_type)
      VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name, website_url = COALESCE(excluded.website_url, organizations.website_url)`)
      .bind(record.recipient, record.recipientSlug, record.recipientUrl, 'grantee'));
  for (let index = 0; index < organizationStatements.length; index += 50) {
    await env.DB.batch(organizationStatements.slice(index, index + 50));
  }

  const source = await env.DB.prepare('SELECT id FROM sources WHERE url = ?').bind(sourceUrl).first<{ id: number }>();
  const advisor = await env.DB.prepare('SELECT id FROM organizations WHERE slug = ?').bind('coefficient-giving').first<{ id: number }>();
  // Organizations can play multiple roles across sources (for example, a grantee in
  // one ledger and an administering funder in another). Resolve recipients by stable
  // slug rather than the legacy single-value organization_type field.
  const recipients = await env.DB.prepare('SELECT id, slug FROM organizations').all<{ id: number; slug: string }>();
  if (!source || !advisor) throw new Error('Coefficient source initialization failed.');
  const recipientIds = new Map(recipients.results.map((recipient) => [recipient.slug, recipient.id]));

  const grantStatements = snapshot.records.map((record: GrantRecord) => {
    const recipientId = recipientIds.get(record.recipientSlug);
    if (!recipientId) throw new Error(`Missing recipient: ${record.recipient}`);
    const decisionDate = Math.floor(new Date(record.decisionMonth).valueOf() / 1000);
    const awardDate = Math.floor(new Date(record.awardDate).valueOf() / 1000);
    const sourcePublishedAt = record.publicationDate ? Math.floor(new Date(record.publicationDate).valueOf() / 1000) : null;
    return env.DB.prepare(`INSERT INTO grants
      (external_id, source_record_id, source_url, source_id, advising_funder_id, recipient_id, amount_usd, amount_original, currency, status, decision_date, award_date, source_published_at, cause, purpose, grouped_grant, first_seen_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_id, external_id) DO UPDATE SET
        source_record_id = excluded.source_record_id, source_url = excluded.source_url, amount_usd = excluded.amount_usd,
        status = excluded.status, decision_date = excluded.decision_date, award_date = excluded.award_date,
        source_published_at = excluded.source_published_at, purpose = excluded.purpose, last_seen_at = excluded.last_seen_at`)
      .bind(record.externalId, record.sourceRecordId, record.grantUrl, source.id, advisor.id, recipientId,
        record.amountUsd, record.amountUsd, record.currency, record.status, decisionDate, awardDate, sourcePublishedAt,
        record.cause, record.purpose, record.groupedGrant ? 1 : 0, retrievedAt, retrievedAt);
  });
  for (let index = 0; index < grantStatements.length; index += 50) {
    await env.DB.batch(grantStatements.slice(index, index + 50));
  }
  await ensureCoefficientFundOrganizationGraph(source.id);
  await env.DB.batch([
    env.DB.prepare(`UPDATE sources SET retrieved_at = ?, coverage_note = ?, content_hash = ? WHERE id = ?`)
      .bind(retrievedAt, snapshot.source.coverageNote, snapshot.source.contentHash, source.id),
    env.DB.prepare('PRAGMA optimize'),
  ]);
  return { sourceId: source.id, retrievedAt };
}

export async function getCoefficientGrantMarket() {
  const { sourceId, retrievedAt } = await ensureCurrentSnapshot();
  const [summary, recipients, recent] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS grant_count, COALESCE(SUM(amount_usd), 0) AS total_amount_usd,
      MAX(decision_date) AS latest_decision_date FROM grants WHERE source_id = ? AND last_seen_at = ?`).bind(sourceId, retrievedAt)
      .first<{ grant_count: number; total_amount_usd: number; latest_decision_date: number }>(),
    env.DB.prepare('SELECT COUNT(DISTINCT recipient_id) AS recipient_count FROM grants WHERE source_id = ? AND last_seen_at = ?').bind(sourceId, retrievedAt)
      .first<{ recipient_count: number }>(),
    env.DB.prepare(`SELECT g.external_id, g.source_record_id, g.source_url, g.source_published_at,
      o.canonical_name AS recipient, o.slug AS recipient_slug, o.website_url AS recipient_url,
      g.purpose, g.amount_usd, g.decision_date, g.award_date, g.status
      FROM grants g JOIN organizations o ON o.id = g.recipient_id
      WHERE g.source_id = ? AND g.last_seen_at = ? ORDER BY g.decision_date DESC, g.amount_usd DESC LIMIT 8`).bind(sourceId, retrievedAt).all(),
  ]);
  return {
    source: snapshot.source,
    summary: { ...summary, recipient_count: recipients?.recipient_count ?? 0 },
    recent: recent.results,
  };
}

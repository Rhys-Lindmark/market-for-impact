import { env } from 'cloudflare:workers';
import { normalizeOrganizationName, organizationIdentityKey, organizationSlug } from '@/db/organization-identity';

const BATCH_SIZE = 50;

export type OrganizationIdentityInput = {
  name: string;
  canonicalName?: string;
  slug?: string;
  websiteUrl?: string | null;
  organizationType?: string;
};

export type ExplicitGrantRecipient = {
  sourceRecordId: string;
  organizationId: number;
  sourceName: string;
  position: number;
};

async function inBatches(statements: ReturnType<typeof env.DB.prepare>[]) {
  for (let index = 0; index < statements.length; index += BATCH_SIZE) {
    await env.DB.batch(statements.slice(index, index + BATCH_SIZE));
  }
}

export async function organizationGraphComplete(sourceId: number, expectedRoleCount: number, expectedAliasCount: number) {
  const [roles, aliases] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS count FROM grant_organization_roles role
      JOIN grants g ON g.id = role.grant_id WHERE g.source_id = ?`).bind(sourceId).first<{ count: number }>(),
    env.DB.prepare('SELECT COUNT(*) AS count FROM organization_source_names WHERE source_id = ?')
      .bind(sourceId).first<{ count: number }>(),
  ]);
  return roles?.count === expectedRoleCount && aliases?.count === expectedAliasCount;
}

export async function upsertOrganizationIdentities(sourceId: number, inputs: OrganizationIdentityInput[]) {
  const identities = new Map<string, {
    sourceName: string; canonicalName: string; slug: string; websiteUrl: string | null; organizationType: string;
  }>();
  const slugs = new Map<string, string>();
  for (const input of inputs) {
    const sourceName = normalizeOrganizationName(input.name);
    const canonicalName = normalizeOrganizationName(input.canonicalName ?? input.name);
    if (!sourceName || !canonicalName) continue;
    const key = organizationIdentityKey(sourceName);
    const slug = input.slug || organizationSlug(canonicalName);
    if (!slug) throw new Error(`Organization name cannot form a stable slug: ${input.name}`);
    const priorKey = slugs.get(slug);
    if (priorKey && priorKey !== key) throw new Error(`Organization slug collision: ${slug}`);
    slugs.set(slug, key);
    identities.set(key, {
      sourceName,
      canonicalName,
      slug,
      websiteUrl: input.websiteUrl ?? null,
      organizationType: input.organizationType ?? 'source-listed-recipient',
    });
  }

  const [existingOrganizations, existingAliases] = await Promise.all([
    env.DB.prepare('SELECT id, canonical_name, slug FROM organizations').all<{
      id: number; canonical_name: string; slug: string;
    }>(),
    env.DB.prepare('SELECT organization_id, normalized_name FROM organization_source_names WHERE source_id = ?')
      .bind(sourceId).all<{ organization_id: number; normalized_name: string }>(),
  ]);
  const organizationBySlug = new Map(existingOrganizations.results.map((row) => [row.slug, row]));
  for (const identity of identities.values()) {
    const existing = organizationBySlug.get(identity.slug);
    if (existing && organizationIdentityKey(existing.canonical_name) !== organizationIdentityKey(identity.canonicalName)) {
      throw new Error(`Existing organization slug maps to a different name: ${identity.slug}`);
    }
  }

  await inBatches([...identities.values()].map((identity) => env.DB.prepare(`INSERT INTO organizations
    (canonical_name, slug, website_url, organization_type) VALUES (?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET canonical_name = excluded.canonical_name,
      website_url = COALESCE(excluded.website_url, organizations.website_url)`)
    .bind(identity.canonicalName, identity.slug, identity.websiteUrl, identity.organizationType)));

  const organizationRows = await env.DB.prepare('SELECT id, canonical_name, slug FROM organizations').all<{
    id: number; canonical_name: string; slug: string;
  }>();
  const idByKey = new Map<string, number>();
  const idBySlug = new Map(organizationRows.results.map((row) => [row.slug, row.id]));
  for (const [key, identity] of identities) {
    const organizationId = idBySlug.get(identity.slug);
    if (!organizationId) throw new Error(`Organization upsert failed: ${identity.canonicalName}`);
    idByKey.set(key, organizationId);
  }

  const aliasByKey = new Map(existingAliases.results.map((row) => [row.normalized_name, row.organization_id]));
  for (const [key, organizationId] of idByKey) {
    const existingId = aliasByKey.get(key);
    if (existingId && existingId !== organizationId) throw new Error(`Source alias identity changed: ${key}`);
  }
  await inBatches([...identities.entries()].map(([key, identity]) => env.DB.prepare(`INSERT INTO organization_source_names
    (source_id, organization_id, source_name, normalized_name, identity_basis) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(source_id, normalized_name) DO UPDATE SET source_name = excluded.source_name`)
    .bind(sourceId, idByKey.get(key), identity.sourceName, key,
      organizationIdentityKey(identity.sourceName) === organizationIdentityKey(identity.canonicalName)
        ? 'exact-normalized-source-name' : 'reviewed-cross-source-alias')));
  return idByKey;
}

export async function replaceGrantOrganizationRoles(sourceId: number, explicitRecipients: ExplicitGrantRecipient[] = []) {
  const grants = await env.DB.prepare(`SELECT id, source_record_id FROM grants WHERE source_id = ?`)
    .bind(sourceId).all<{ id: number; source_record_id: string }>();
  const grantIdByRecord = new Map(grants.results.map((grant) => [grant.source_record_id, grant.id]));
  await env.DB.prepare(`DELETE FROM grant_organization_roles WHERE grant_id IN
    (SELECT id FROM grants WHERE source_id = ?)`).bind(sourceId).run();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO grant_organization_roles (grant_id, organization_id, role, source_name, position)
      SELECT g.id, g.recipient_id, 'recipient', o.canonical_name, 0 FROM grants g
      JOIN organizations o ON o.id = g.recipient_id WHERE g.source_id = ? AND g.recipient_id IS NOT NULL`).bind(sourceId),
    env.DB.prepare(`INSERT INTO grant_organization_roles (grant_id, organization_id, role, source_name, position)
      SELECT g.id, g.advising_funder_id, 'advising-funder', o.canonical_name, 0 FROM grants g
      JOIN organizations o ON o.id = g.advising_funder_id WHERE g.source_id = ? AND g.advising_funder_id IS NOT NULL`).bind(sourceId),
    env.DB.prepare(`INSERT INTO grant_organization_roles (grant_id, organization_id, role, source_name, position)
      SELECT g.id, g.originating_funder_id, 'originating-funder', o.canonical_name, 0 FROM grants g
      JOIN organizations o ON o.id = g.originating_funder_id WHERE g.source_id = ? AND g.originating_funder_id IS NOT NULL`).bind(sourceId),
  ]);
  await inBatches(explicitRecipients.map((recipient) => {
    const grantId = grantIdByRecord.get(recipient.sourceRecordId);
    if (!grantId) throw new Error(`Missing grant for organization role: ${recipient.sourceRecordId}`);
    return env.DB.prepare(`INSERT INTO grant_organization_roles
      (grant_id, organization_id, role, source_name, position) VALUES (?, ?, 'recipient', ?, ?)
      ON CONFLICT(grant_id, organization_id, role) DO UPDATE SET source_name = excluded.source_name,
        position = excluded.position`)
      .bind(grantId, recipient.organizationId, normalizeOrganizationName(recipient.sourceName), recipient.position);
  }));
}

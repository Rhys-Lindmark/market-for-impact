import { env } from 'cloudflare:workers';
import snapshot from '@/data/ai-safety/ecosystem-v1.json';
import { ensureAllCoefficientSnapshot } from '@/db/coefficient-all';
import { organizationIdentityKey } from '@/db/organization-identity';

const LIMITATIONS = 'Roles classify published activity; they do not estimate effectiveness, marginal impact, or current room for more funding.';

export async function ensureAiSafetyEcosystem() {
  const { sourceId } = await ensureAllCoefficientSnapshot();
  const current = await env.DB.prepare(`SELECT COUNT(*) AS count FROM ai_safety_organization_roles
    WHERE source_id = ? AND taxonomy_version = ?`).bind(sourceId, snapshot.taxonomyVersion).first<{ count: number }>();
  if (current?.count === snapshot.summary.roleAssignmentCount) return { sourceId };

  const identities = await env.DB.prepare(`SELECT o.id, osn.source_name FROM organization_source_names osn
    JOIN organizations o ON o.id = osn.organization_id WHERE osn.source_id = ?`).bind(sourceId)
    .all<{ id: number; source_name: string }>();
  const organizationIdByName = new Map(identities.results.map((row) => [organizationIdentityKey(row.source_name), row.id]));
  await env.DB.prepare('DELETE FROM ai_safety_organization_roles WHERE source_id = ?').bind(sourceId).run();
  const updatedAt = Math.floor(new Date(snapshot.generatedAt).valueOf() / 1000);
  const statements = snapshot.organizations.flatMap((organization) => organization.roles.map((role) => {
    const organizationId = organizationIdByName.get(organizationIdentityKey(organization.organization));
    if (!organizationId) throw new Error(`AI safety organization identity missing: ${organization.organization}`);
    return env.DB.prepare(`INSERT INTO ai_safety_organization_roles
      (source_id, organization_id, taxonomy_version, role_key, primary_role, evidence_basis_json,
       source_grant_count, source_amount_usd, founders_pledge_status, limitations, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(sourceId, organizationId, snapshot.taxonomyVersion, role, role === organization.primaryRole ? 1 : 0,
        JSON.stringify(organization.classificationBasis), organization.grantCount, organization.publishedAmountUsd,
        organization.foundersPledge?.status ?? null, LIMITATIONS, updatedAt);
  }));
  for (let index = 0; index < statements.length; index += 50) await env.DB.batch(statements.slice(index, index + 50));
  return { sourceId };
}

export async function getAiSafetyEcosystem() {
  const { sourceId } = await ensureAiSafetyEcosystem();
  const rows = await env.DB.prepare(`SELECT o.canonical_name AS organization, o.slug, r.role_key,
      r.primary_role, r.source_grant_count, r.source_amount_usd, r.founders_pledge_status
    FROM ai_safety_organization_roles r JOIN organizations o ON o.id = r.organization_id
    WHERE r.source_id = ? AND r.taxonomy_version = ?
    ORDER BY r.source_amount_usd DESC, o.canonical_name, r.role_key`).bind(sourceId, snapshot.taxonomyVersion)
    .all<{ organization: string; slug: string; role_key: string; primary_role: number; source_grant_count: number; source_amount_usd: number; founders_pledge_status: string | null }>();
  const organizations = new Map<string, {
    organization: string; slug: string; roles: string[]; primaryRole: string; grantCount: number;
    publishedAmountUsd: number; foundersPledgeStatus: string | null;
  }>();
  for (const row of rows.results) {
    const existing = organizations.get(row.slug) ?? {
      organization: row.organization, slug: row.slug, roles: [], primaryRole: '', grantCount: row.source_grant_count,
      publishedAmountUsd: row.source_amount_usd, foundersPledgeStatus: row.founders_pledge_status,
    };
    existing.roles.push(row.role_key);
    if (row.primary_role) existing.primaryRole = row.role_key;
    organizations.set(row.slug, existing);
  }
  return {
    taxonomyVersion: snapshot.taxonomyVersion,
    generatedAt: snapshot.generatedAt,
    source: snapshot.coefficientSource,
    summary: snapshot.summary,
    categories: snapshot.categories,
    organizations: [...organizations.values()],
    externalOnlyRecommendations: snapshot.externalOnlyRecommendations,
    coverageNote: snapshot.coverageNote,
    classificationNote: snapshot.classificationNote,
  };
}

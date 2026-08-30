export const grantSourceKeys = ['coefficient', 'coefficient-egc', 'givewell', 'renphil', 'giving-green'] as const;

export type GrantSourceKey = (typeof grantSourceKeys)[number];

export function isGrantSourceKey(value: string): value is GrantSourceKey {
  return grantSourceKeys.includes(value as GrantSourceKey);
}

export function grantPath(source: GrantSourceKey, sourceRecordId: string) {
  return `/grants/${source}/${encodeURIComponent(sourceRecordId)}`;
}

export function organizationPath(slug: string) {
  return `/organizations/${encodeURIComponent(slug)}`;
}

export function parseStringArray(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

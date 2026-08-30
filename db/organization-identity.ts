export function normalizeOrganizationName(value: string) {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function organizationIdentityKey(value: string) {
  return normalizeOrganizationName(value).toLocaleLowerCase('en-US');
}

export function organizationSlug(value: string) {
  return normalizeOrganizationName(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function uniqueOrganizationNames(values: string[]) {
  const names = new Map<string, string>();
  for (const value of values) {
    const name = normalizeOrganizationName(value);
    if (!name) continue;
    names.set(organizationIdentityKey(name), name);
  }
  return names;
}

const reviewedCanonicalNames = new Map([
  ['givewell\u0000Good Judgment Inc', 'Good Judgment Inc.'],
]);

const reviewedCanonicalVariants = new Map([
  [organizationIdentityKey('Good Judgment Inc'), 'Good Judgment Inc.'],
  [organizationIdentityKey('Good Judgment Inc.'), 'Good Judgment Inc.'],
]);

export function canonicalOrganizationName(source: string, sourceName: string) {
  return reviewedCanonicalNames.get(`${source}\u0000${sourceName}`) ?? sourceName;
}

export function reviewedCanonicalOrganizationName(value: string) {
  return reviewedCanonicalVariants.get(organizationIdentityKey(value)) ?? value;
}

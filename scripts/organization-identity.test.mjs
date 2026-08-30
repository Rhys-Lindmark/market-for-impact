import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { canonicalOrganizationName, normalizeOrganizationName, organizationIdentityKey, organizationSlug, uniqueOrganizationNames } from '../db/organization-identity.ts';

test('organization identity normalization collapses source whitespace without fuzzy merging', () => {
  assert.equal(normalizeOrganizationName(' Overseas\u00a0Development\u00a0Institute '), 'Overseas Development Institute');
  assert.equal(organizationIdentityKey('Institute for Law & AI'), 'institute for law & ai');
  assert.notEqual(organizationIdentityKey('Institute for Law & AI'), organizationIdentityKey('Institute for Law and AI'));
});

test('organization slugs are stable while identity keys retain punctuation distinctions', () => {
  assert.equal(organizationSlug('Centre for Effective Altruism'), 'centre-for-effective-altruism');
  assert.equal(organizationSlug('Catalyze R&D'), 'catalyze-r-d');
});

test('unique organization names merge only exact normalized source names', () => {
  const names = uniqueOrganizationNames(['Overseas Development Institute', 'Overseas\u00a0Development\u00a0Institute', 'ODI']);
  assert.equal(names.size, 2);
  assert.equal(names.get('overseas development institute'), 'Overseas Development Institute');
});

test('current Coefficient recipient identity coverage is complete and explicit', () => {
  const snapshot = JSON.parse(fs.readFileSync(new URL('../data/coefficient/all-grants.json', import.meta.url), 'utf8'));
  const mentions = snapshot.records.flatMap((record) => record.recipients);
  assert.equal(mentions.length, 2_888);
  assert.equal(uniqueOrganizationNames(mentions).size, 1_132);
  assert.equal(snapshot.records.filter((record) => record.recipients.length === 0).length, 8);
  assert.equal(snapshot.records.filter((record) => record.recipients.length === 2).length, 3);
  assert.equal(Math.max(...snapshot.records.map((record) => record.recipients.length)), 2);
});

test('reviewed aliases resolve every current cross-source slug collision', () => {
  const coefficient = JSON.parse(fs.readFileSync(new URL('../data/coefficient/all-grants.json', import.meta.url), 'utf8'));
  const givewell = JSON.parse(fs.readFileSync(new URL('../data/normalized/givewell-grants.json', import.meta.url), 'utf8'));
  const identities = [
    ...uniqueOrganizationNames(coefficient.records.flatMap((record) => record.recipients)).values()
  ].map((name) => ({ source: 'coefficient', sourceName: name, canonicalName: name }));
  for (const name of uniqueOrganizationNames(givewell.records.map((record) => record.recipient)).values()) {
    identities.push({ source: 'givewell', sourceName: name, canonicalName: canonicalOrganizationName('givewell', name) });
  }
  const bySlug = new Map();
  for (const identity of identities) {
    const slug = organizationSlug(identity.canonicalName);
    const canonicalKey = organizationIdentityKey(identity.canonicalName);
    const prior = bySlug.get(slug);
    if (prior) assert.equal(prior, canonicalKey, `unreviewed slug collision: ${slug}`);
    bySlug.set(slug, canonicalKey);
  }
  assert.equal(canonicalOrganizationName('givewell', 'Good Judgment Inc'), 'Good Judgment Inc.');
  assert.equal(canonicalOrganizationName('coefficient', 'Good Judgment Inc.'), 'Good Judgment Inc.');
});

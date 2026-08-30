import { createHash } from 'node:crypto';

export const ACE_RECOMMENDATIONS_URL = 'https://animalcharityevaluators.org/blog/announcing-our-2025-charity-recommendations/';

export function recommendationSlugs(html) {
  const slugs = [...html.matchAll(/(?:animalcharityevaluators\.org)?\/charity-review\/([^/?#"']+)/gi)]
    .map((match) => match[1].toLowerCase());
  return [...new Set(slugs)].sort();
}

export function recommendationHash(slugs) {
  return createHash('sha256').update(JSON.stringify([...slugs].sort())).digest('hex');
}

export function validateAceSnapshot(snapshot) {
  if (snapshot.records.length !== 10) throw new Error('ACE snapshot must contain 10 current recommendations.');
  const slugs = snapshot.records.map((record) => record.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error('ACE recommendation slugs must be unique.');
  if (snapshot.records.filter((record) => record.recommendationCohort === 2025).length !== 5) throw new Error('ACE snapshot must contain five 2025 recommendations.');
  if (snapshot.records.filter((record) => record.recommendationCohort === 2024).length !== 5) throw new Error('ACE snapshot must contain five retained 2024 recommendations.');
  for (const record of snapshot.records) {
    if (!record.reviewUrl.includes('/charity-review/')) throw new Error(`Invalid review URL for ${record.slug}.`);
    if (!record.fundingPeriod?.startsWith('annual,')) throw new Error(`Missing annual funding period for ${record.slug}.`);
    if (record.fundingCapacityUsd < record.fundingRoomUsd) throw new Error(`Funding room exceeds capacity for ${record.slug}.`);
    if (!record.metrics.length) throw new Error(`No native metrics preserved for ${record.slug}.`);
  }
  const fundingRoom = snapshot.records.reduce((sum, record) => sum + record.fundingRoomUsd, 0);
  if (fundingRoom !== snapshot.summary.annualFundingRoomUsd) throw new Error('ACE funding-room summary does not reconcile.');
  const expectedHash = recommendationHash(snapshot.records.map((record) => new URL(record.reviewUrl).pathname.split('/').filter(Boolean).at(-1)));
  if (snapshot.source.contentHash !== expectedHash) throw new Error('ACE source hash does not match the committed recommendation set.');
  return snapshot;
}

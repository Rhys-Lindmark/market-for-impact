import { createHash } from 'node:crypto';
import { decodeHtmlEntities, removeHtmlElementContents } from './html-entities.mjs';

export function normalizePageText(html) {
  const withoutExecutableContent = removeHtmlElementContents(
    removeHtmlElementContents(html, 'script'),
    'style',
  );
  return decodeHtmlEntities(withoutExecutableContent.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ').trim();
}

export function semanticHash(snapshot) {
  const sources = snapshot.sources.map(({ key, title, url, publishedAt, requiredClaims }) =>
    ({ key, title, url, publishedAt, requiredClaims }));
  const records = snapshot.records.map((record) => ({ ...record })).sort((a, b) => a.slug.localeCompare(b.slug));
  return createHash('sha256').update(JSON.stringify({ sources, records })).digest('hex');
}

export function validateFoundersPledgeSnapshot(snapshot) {
  if (snapshot.sources.length !== 9) throw new Error(`Expected 9 Founders Pledge sources, found ${snapshot.sources.length}.`);
  if (snapshot.records.length !== 12) throw new Error(`Expected 12 Founders Pledge matrix records, found ${snapshot.records.length}.`);
  if (new Set(snapshot.records.map((record) => record.slug)).size !== snapshot.records.length) throw new Error('Founders Pledge slugs must be unique.');
  if (new Set(snapshot.sources.map((source) => source.key)).size !== snapshot.sources.length) throw new Error('Founders Pledge source keys must be unique.');
  const sourceKeys = new Set(snapshot.sources.map((source) => source.key));
  if (snapshot.records.some((record) => !sourceKeys.has(record.sourceKey))) throw new Error('Every matrix record must point to a captured source.');
  const causes = new Set(snapshot.records.map((record) => record.cause));
  for (const cause of ['Education', 'Climate', 'Global health', 'Global catastrophic risks']) {
    if (!causes.has(cause)) throw new Error(`Founders Pledge matrix is missing ${cause}.`);
  }
  const benchmarked = snapshot.records.filter((record) => record.benchmarkMultiple != null);
  if (benchmarked.length !== 1 || benchmarked[0].slug !== 'imagine-worldwide') throw new Error('Only Imagine Worldwide may carry the published GiveDirectly multiple.');
  if (benchmarked[0].benchmarkName !== 'GiveDirectly cash transfers' || benchmarked[0].benchmarkMultiple !== 11) {
    throw new Error('Imagine Worldwide benchmark semantics changed.');
  }
  if (snapshot.records.some((record) => record.fundingRoomUsd != null)) throw new Error('No numeric Founders Pledge funding gap is published for this matrix.');
  if (semanticHash(snapshot) !== snapshot.contentHash) throw new Error('Founders Pledge semantic hash does not reconcile.');
  return snapshot;
}

export function verifySourceClaims(source, html) {
  const text = normalizePageText(html);
  const missing = source.requiredClaims.filter((claim) => !text.includes(claim));
  if (missing.length) throw new Error(`${source.key} is missing reviewed claim(s): ${missing.join(' | ')}`);
  return { key: source.key, claimCount: source.requiredClaims.length };
}

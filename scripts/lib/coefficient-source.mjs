import { createHash } from 'node:crypto';

export const COEFFICIENT_ALGOLIA = Object.freeze({
  applicationId: 'WBC743WF65',
  // Search-only key published by Coefficient's browser application; it cannot modify the index.
  searchKey: 'da168b7a254a1f18a8fd0e6b65d7e0e2',
  index: 'coefficientgiving_grants_award_date_desc',
  endpoint: 'https://WBC743WF65-dsn.algolia.net/1/indexes/coefficientgiving_grants_award_date_desc/query',
  fund: 'Effective Giving & Careers',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long', year: 'numeric', timeZone: 'America/Los_Angeles',
});

export function decodeEntities(value) {
  return String(value ?? '').replaceAll('&amp;', '&').replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

function isoFromEpoch(value, field) {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid ${field}: ${String(value)}`);
  return new Date(value * 1000).toISOString();
}

function validateHit(hit) {
  if (!hit || hit.post_type !== 'Grants') throw new Error('Algolia hit is not a grant.');
  if (typeof hit.objectID !== 'string' || !hit.objectID) throw new Error('Grant is missing objectID.');
  if (!Number.isInteger(hit.post_id) || hit.post_id <= 0) throw new Error(`Grant ${hit.objectID} is missing post_id.`);
  if (typeof hit.title !== 'string' || !hit.title.trim()) throw new Error(`Grant ${hit.objectID} is missing title.`);
  if (!Array.isArray(hit.organization_name) || hit.organization_name.length !== 1 || !hit.organization_name[0]) {
    throw new Error(`Grant ${hit.objectID} must have exactly one organization.`);
  }
  if (!Number.isInteger(hit.grant_amount) || hit.grant_amount <= 0) throw new Error(`Grant ${hit.objectID} has an invalid amount.`);
  if (!Array.isArray(hit['focus-area']) || !hit['focus-area'].some((area) => decodeEntities(area) === COEFFICIENT_ALGOLIA.fund)) {
    throw new Error(`Grant ${hit.objectID} is outside ${COEFFICIENT_ALGOLIA.fund}.`);
  }
}

export function buildSnapshotFromAlgolia(payload, retrievedAt = new Date().toISOString()) {
  if (!payload || !Array.isArray(payload.hits) || !Number.isInteger(payload.nbHits)) {
    throw new Error('Invalid Algolia response.');
  }
  if (payload.hits.length !== payload.nbHits) {
    throw new Error(`Incomplete Algolia response: received ${payload.hits.length} of ${payload.nbHits} hits.`);
  }
  if (payload.hits.length < 70) {
    throw new Error(`Failing closed: expected at least 70 EGC grants; received ${payload.hits.length}.`);
  }

  const sourceIds = new Set();
  const records = payload.hits.map((hit) => {
    validateHit(hit);
    if (sourceIds.has(hit.objectID)) throw new Error(`Duplicate Algolia objectID: ${hit.objectID}`);
    sourceIds.add(hit.objectID);
    const awardDate = isoFromEpoch(hit.award_date, `award_date for ${hit.objectID}`);
    return {
      sourceRecordId: hit.objectID,
      sourcePostId: hit.post_id,
      grantUrl: hit.url || null,
      amount: `$${hit.grant_amount.toLocaleString('en-US')}`,
      date: monthFormatter.format(new Date(awardDate)),
      awardDate,
      publicationDate: isoFromEpoch(hit.publication_date, `publication_date for ${hit.objectID}`),
      purpose: decodeEntities(hit.title).trim(),
      recipient: decodeEntities(hit.organization_name[0]).trim(),
      recipientUrl: hit.organization_website || null,
    };
  }).sort((a, b) => b.awardDate.localeCompare(a.awardDate)
    || Number(b.amount.replace(/[$,]/g, '')) - Number(a.amount.replace(/[$,]/g, ''))
    || a.sourceRecordId.localeCompare(b.sourceRecordId));

  return {
    source: {
      publisher: 'Coefficient Giving',
      fund: COEFFICIENT_ALGOLIA.fund,
      url: 'https://coefficientgiving.org/funds/effective-giving-and-careers/',
      retrievedAt,
      displayedResultCount: records.length,
      statusSemantics: 'published',
      acquisition: {
        type: 'public-algolia-search-index',
        endpoint: COEFFICIENT_ALGOLIA.endpoint,
        index: COEFFICIENT_ALGOLIA.index,
        filters: ['post_type:Grants', `focus-area:${COEFFICIENT_ALGOLIA.fund}`],
      },
      coverageNote: 'Public fund index records only. Coefficient Giving says entries can lag grantmaking by months, some entries group similar grants, sensitive grants may be withheld, and most non–Good Ventures advised funding is not included in its grants database.',
    },
    records,
  };
}

export function semanticFingerprint(record) {
  return createHash('sha256').update([
    record.recipient, record.purpose, record.date, record.amount,
  ].join('|')).digest('hex');
}

export function diffSnapshots(previous, next) {
  const nextSourceIds = new Set(next.records.map((record) => record.sourceRecordId));
  if (nextSourceIds.size !== next.records.length) throw new Error('Source record IDs are not unique.');
  const hasSourceIds = previous.records.every((record) => record.sourceRecordId);
  const previousByKey = new Map(previous.records.map((record) => [
    hasSourceIds ? record.sourceRecordId : semanticFingerprint(record), record,
  ]));
  const nextByKey = new Map(next.records.map((record) => [
    hasSourceIds ? record.sourceRecordId : semanticFingerprint(record), record,
  ]));
  const added = [...nextByKey.keys()].filter((key) => !previousByKey.has(key));
  const removed = [...previousByKey.keys()].filter((key) => !nextByKey.has(key));
  const updated = hasSourceIds ? [...nextByKey.keys()].filter((key) => {
    const before = previousByKey.get(key);
    const after = nextByKey.get(key);
    return before && JSON.stringify(before) !== JSON.stringify(after);
  }) : [];
  if (removed.length > Math.max(5, Math.floor(previous.records.length * 0.2))) {
    throw new Error(`Failing closed: refresh would remove ${removed.length} of ${previous.records.length} records.`);
  }
  return {
    changed: added.length > 0 || removed.length > 0 || updated.length > 0,
    added: added.map((key) => nextByKey.get(key)),
    removed: removed.map((key) => previousByKey.get(key)),
    updated: updated.map((key) => ({ before: previousByKey.get(key), after: nextByKey.get(key) })),
  };
}

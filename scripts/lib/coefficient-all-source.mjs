import { createHash } from 'node:crypto';
import { COEFFICIENT_ALGOLIA, decodeEntities } from './coefficient-source.mjs';

export const COEFFICIENT_LISTED_FUNDS = Object.freeze([
  'Abundance & Growth',
  'Air Quality',
  'Biosecurity & Pandemic Preparedness',
  'Effective Giving & Careers',
  'Farm Animal Welfare',
  'Forecasting',
  'Global Aid Policy',
  'Global Catastrophic Risks Opportunities',
  'Global Growth',
  'Global Health & Wellbeing Opportunities',
  'Lead Exposure Action Fund',
  'Navigating Transformative AI',
  'Science and Global Health R&D',
  'Strep A Vaccine Fund',
]);

export const COEFFICIENT_FUND_METADATA = Object.freeze({
  'Abundance & Growth': { url: 'https://coefficientgiving.org/funds/abundance-and-growth/', status: 'listed' },
  'Air Quality': { url: 'https://coefficientgiving.org/funds/air-quality/', status: 'listed' },
  'Biosecurity & Pandemic Preparedness': { url: 'https://coefficientgiving.org/funds/biosecurity-pandemic-preparedness/', status: 'listed' },
  'Effective Giving & Careers': { url: 'https://coefficientgiving.org/funds/effective-giving-and-careers/', status: 'listed' },
  'Farm Animal Welfare': { url: 'https://coefficientgiving.org/funds/farm-animal-welfare/', status: 'listed' },
  Forecasting: { url: 'https://coefficientgiving.org/funds/forecasting/', status: 'closed' },
  'Global Aid Policy': { url: 'https://coefficientgiving.org/funds/global-aid-policy/', status: 'listed' },
  'Global Catastrophic Risks Opportunities': { url: 'https://coefficientgiving.org/funds/global-catastrophic-risks-opportunities/', status: 'listed' },
  'Global Growth': { url: 'https://coefficientgiving.org/funds/global-growth/', status: 'listed' },
  'Global Health & Wellbeing Opportunities': { url: 'https://coefficientgiving.org/funds/global-health-wellbeing-opportunities/', status: 'listed' },
  'Lead Exposure Action Fund': { url: 'https://coefficientgiving.org/funds/lead-exposure-action-fund/', status: 'listed' },
  'Navigating Transformative AI': { url: 'https://coefficientgiving.org/funds/navigating-transformative-ai/', status: 'listed' },
  'Science and Global Health R&D': { url: 'https://coefficientgiving.org/funds/science-and-global-health-rd/', status: 'listed' },
  'Strep A Vaccine Fund': { url: 'https://coefficientgiving.org/funds/strep-a-vaccine-fund/', status: 'listed' },
});

const listedFundSet = new Set(COEFFICIENT_LISTED_FUNDS);
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long', year: 'numeric', timeZone: 'America/Los_Angeles',
});

function isoFromEpoch(value, field) {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid ${field}: ${String(value)}`);
  return new Date(value * 1000).toISOString();
}

async function queryIndex(body, fetchImplementation = fetch) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchImplementation(COEFFICIENT_ALGOLIA.endpoint, {
        method: 'POST',
        headers: {
          'X-Algolia-Application-Id': COEFFICIENT_ALGOLIA.applicationId,
          'X-Algolia-API-Key': COEFFICIENT_ALGOLIA.searchKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok) return response.json();
      lastError = new Error(`Coefficient index returned HTTP ${response.status}.`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastError = error;
    }
    if (attempt < 3) await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 500));
  }
  throw lastError ?? new Error('Coefficient index refresh failed.');
}

export async function fetchAllCoefficientGrantHits(fetchImplementation = fetch) {
  const facetPayload = await queryIndex({
    query: '', hitsPerPage: 0, facets: ['award_year'], maxValuesPerFacet: 1000,
    facetFilters: ['post_type:Grants'],
  }, fetchImplementation);
  const yearCounts = facetPayload.facets?.award_year;
  if (!yearCounts || !Number.isInteger(facetPayload.nbHits)) throw new Error('Coefficient year facets are unavailable.');

  const yearPayloads = await Promise.all(Object.entries(yearCounts).map(async ([year, expectedCount]) => {
    const payload = await queryIndex({
      query: '', hitsPerPage: 1000,
      facetFilters: ['post_type:Grants', `award_year:${year}`],
    }, fetchImplementation);
    if (payload.nbHits !== expectedCount || payload.hits?.length !== expectedCount) {
      throw new Error(`Incomplete Coefficient year ${year}: expected ${expectedCount}, received ${payload.hits?.length ?? 0}.`);
    }
    return payload.hits;
  }));

  const datedCount = Object.values(yearCounts).reduce((sum, count) => sum + count, 0);
  const undatedExpected = facetPayload.nbHits - datedCount;
  const undatedPayload = undatedExpected > 0 ? await queryIndex({
    query: '', hitsPerPage: 1000,
    facetFilters: ['post_type:Grants', ...Object.keys(yearCounts).map((year) => `award_year:-${year}`)],
  }, fetchImplementation) : { nbHits: 0, hits: [] };
  if (undatedPayload.nbHits !== undatedExpected || undatedPayload.hits?.length !== undatedExpected) {
    throw new Error(`Incomplete undated Coefficient grants: expected ${undatedExpected}, received ${undatedPayload.hits?.length ?? 0}.`);
  }

  const hits = [...yearPayloads.flat(), ...undatedPayload.hits];
  if (hits.length !== facetPayload.nbHits) {
    throw new Error(`Incomplete Coefficient index: expected ${facetPayload.nbHits}, received ${hits.length}.`);
  }
  return { hits, totalHits: facetPayload.nbHits, yearCounts };
}

function validateHit(hit) {
  if (!hit || hit.post_type !== 'Grants') throw new Error('Algolia hit is not a grant.');
  if (typeof hit.objectID !== 'string' || !hit.objectID) throw new Error('Grant is missing objectID.');
  if (!Number.isInteger(hit.post_id) || hit.post_id <= 0) throw new Error(`Grant ${hit.objectID} is missing post_id.`);
  if (typeof hit.title !== 'string' || !hit.title.trim()) throw new Error(`Grant ${hit.objectID} is missing title.`);
  if (hit.grant_amount != null && (!Number.isInteger(hit.grant_amount) || hit.grant_amount < 0)) {
    throw new Error(`Grant ${hit.objectID} has an invalid amount.`);
  }
}

export function buildAllGrantsSnapshot(hits, retrievedAt = new Date().toISOString()) {
  if (!Array.isArray(hits) || hits.length < 2_800) {
    throw new Error(`Failing closed: expected at least 2,800 Coefficient grants; received ${hits?.length ?? 0}.`);
  }
  const sourceIds = new Set();
  const records = hits.map((hit) => {
    validateHit(hit);
    if (sourceIds.has(hit.objectID)) throw new Error(`Duplicate Algolia objectID: ${hit.objectID}`);
    sourceIds.add(hit.objectID);
    const focusAreas = Array.isArray(hit['focus-area']) ? hit['focus-area'].map(decodeEntities).sort() : [];
    const listedFunds = focusAreas.filter((area) => listedFundSet.has(area));
    const awardDate = hit.award_date ? isoFromEpoch(hit.award_date, `award_date for ${hit.objectID}`) : null;
    return {
      sourceRecordId: hit.objectID,
      sourcePostId: hit.post_id,
      grantUrl: hit.url || null,
      amountUsd: Number.isInteger(hit.grant_amount) && hit.grant_amount > 0 ? hit.grant_amount : null,
      amountDisplay: Number.isInteger(hit.grant_amount) && hit.grant_amount > 0 ? `$${hit.grant_amount.toLocaleString('en-US')}` : null,
      awardDate,
      awardMonth: awardDate ? monthFormatter.format(new Date(awardDate)) : null,
      publicationDate: isoFromEpoch(hit.publication_date, `publication_date for ${hit.objectID}`),
      purpose: decodeEntities(hit.title).trim(),
      recipients: Array.isArray(hit.organization_name)
        ? hit.organization_name.filter(Boolean).map((name) => decodeEntities(name).trim()).sort() : [],
      recipientUrl: hit.organization_website || null,
      focusAreas,
      listedFunds,
    };
  }).sort((a, b) => (b.awardDate ?? '').localeCompare(a.awardDate ?? '')
    || (b.amountUsd ?? 0) - (a.amountUsd ?? 0) || a.sourceRecordId.localeCompare(b.sourceRecordId));

  return {
    source: {
      publisher: 'Coefficient Giving',
      title: 'Public grants index',
      url: 'https://coefficientgiving.org/funds/',
      retrievedAt,
      recordCount: records.length,
      statusSemantics: 'published',
      acquisition: {
        type: 'public-algolia-search-index',
        endpoint: COEFFICIENT_ALGOLIA.endpoint,
        index: COEFFICIENT_ALGOLIA.index,
        filters: ['post_type:Grants'],
        partition: 'award_year',
      },
      fundTaxonomyUrl: 'https://coefficientgiving.org/funds/',
      coverageNote: 'Public index records only. Entries can lag grantmaking by months, group similar grants, omit sensitive grants, and omit most non–Good Ventures advised funding. Fund tags are many-to-many and fund totals are not additive.',
    },
    listedFunds: COEFFICIENT_LISTED_FUNDS,
    records,
  };
}

function canonicalRecord(record) {
  return JSON.stringify(record);
}

export function diffAllGrantsSnapshots(previous, next) {
  const previousById = new Map(previous.records.map((record) => [record.sourceRecordId, record]));
  const nextById = new Map(next.records.map((record) => [record.sourceRecordId, record]));
  if (previousById.size !== previous.records.length || nextById.size !== next.records.length) {
    throw new Error('All-grants snapshot contains duplicate source IDs.');
  }
  const added = [...nextById.keys()].filter((id) => !previousById.has(id));
  const removed = [...previousById.keys()].filter((id) => !nextById.has(id));
  const updated = [...nextById.keys()].filter((id) => previousById.has(id)
    && canonicalRecord(previousById.get(id)) !== canonicalRecord(nextById.get(id)));
  if (removed.length > Math.max(25, Math.floor(previous.records.length * 0.05))) {
    throw new Error(`Failing closed: all-grants refresh would remove ${removed.length} of ${previous.records.length} records.`);
  }
  return {
    changed: added.length > 0 || removed.length > 0 || updated.length > 0,
    added: added.map((id) => nextById.get(id)),
    removed: removed.map((id) => previousById.get(id)),
    updated: updated.map((id) => ({ before: previousById.get(id), after: nextById.get(id) })),
  };
}

export function buildCoefficientMarketSummary(snapshot) {
  const records = snapshot.records;
  const fundRows = COEFFICIENT_LISTED_FUNDS.map((fund) => {
    const grants = records.filter((record) => record.listedFunds.includes(fund));
    const datedGrants = grants.filter((record) => record.awardDate);
    return {
      fund,
      ...COEFFICIENT_FUND_METADATA[fund],
      grantCount: grants.length,
      publishedAmountUsd: grants.reduce((sum, record) => sum + (record.amountUsd ?? 0), 0),
      latestAwardDate: datedGrants[0]?.awardDate ?? null,
    };
  }).sort((a, b) => b.publishedAmountUsd - a.publishedAmountUsd);
  const focusAreaCounts = {};
  for (const record of records) {
    for (const area of record.focusAreas) focusAreaCounts[area] = (focusAreaCounts[area] ?? 0) + 1;
  }
  const contentHash = createHash('sha256').update(records.map(canonicalRecord).join('\n')).digest('hex');
  const datedRecords = records.filter((record) => record.awardDate);
  const retrievedAt = new Date(snapshot.source.retrievedAt).valueOf();
  return {
    source: { ...snapshot.source, contentHash },
    summary: {
      grantCount: records.length,
      totalPublishedAmountUsd: records.reduce((sum, record) => sum + (record.amountUsd ?? 0), 0),
      uniqueRecipientCount: new Set(records.flatMap((record) => record.recipients)).size,
      listedFundCount: COEFFICIENT_LISTED_FUNDS.length,
      grantsWithMultipleListedFunds: records.filter((record) => record.listedFunds.length > 1).length,
      grantsWithoutListedFund: records.filter((record) => record.listedFunds.length === 0).length,
      grantsWithoutFocusArea: records.filter((record) => record.focusAreas.length === 0).length,
      grantsWithoutPublishedAmount: records.filter((record) => record.amountUsd == null).length,
      grantsWithoutRecipient: records.filter((record) => record.recipients.length === 0).length,
      grantsWithoutAwardDate: records.length - datedRecords.length,
      futureDatedGrants: datedRecords.filter((record) => new Date(record.awardDate).valueOf() > retrievedAt).length,
      earliestAwardDate: datedRecords.at(-1)?.awardDate ?? null,
      latestAwardDate: datedRecords[0]?.awardDate ?? null,
    },
    funds: fundRows,
    focusAreaCounts: Object.fromEntries(Object.entries(focusAreaCounts).sort(([, a], [, b]) => b - a)),
  };
}

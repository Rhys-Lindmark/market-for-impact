import { createHash } from 'node:crypto';

export const SEARCH_URL = 'https://www.charitynavigator.org/search/?causes=lgbtq%20rights';
export const METHODOLOGY_URL = 'https://www.charitynavigator.org/content/dam/cn/cn/landing-pages/Rating%20Methodology%20Guide%20(Updated%20March%202026).pdf';
export const CURATED_LIST_URL = 'https://www.charitynavigator.org/about-us/our-methodology/curated-lists/';
export const BEACONS = ['Accountability & Finance', 'Impact & Measurement', 'Leadership & Planning', 'Culture & Compensation'];

const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export const searchUrlForPage = (page) => page === 1 ? SEARCH_URL : `${SEARCH_URL}&page=${page}`;

export function parseSearchPage(html, expectedFrom = null) {
  const match = html.match(/\\"results\\":\[((?:\{\\"name\\":).*?)\],\\"totalItems\\":(\d+),\\"from\\":(\d+),\\"size\\":(\d+)/s);
  if (!match) throw new Error('Could not find Charity Navigator search results in the rendered page.');
  const records = JSON.parse(`[${match[1].replaceAll('\\"', '"')}]`);
  const totalItems = Number(match[2]);
  const from = Number(match[3]);
  const size = Number(match[4]);
  if (records.length === 0 || records.length > size || size !== 10 || totalItems < from + records.length || (expectedFrom !== null && from !== expectedFrom)) {
    throw new Error(`Unexpected Charity Navigator result contract: ${records.length}/${totalItems}, from ${from}, size ${size}.`);
  }
  return { records, totalItems, from, size };
}

export function parseProfilePage(html, ein) {
  const completion = html.match(/([0-4]) of 4 BEACONS COMPLETED/i);
  if (!completion) throw new Error(`Profile ${ein} did not expose a completed-beacon count.`);
  const published = html.match(/"datePublished":"([^"]+)"/);
  if (!published) throw new Error(`Profile ${ein} did not expose its source publication timestamp.`);
  const completedBeaconCount = Number(completion[1]);
  return {
    completedBeaconCount,
    completedBeacons: completedBeaconCount === 4 ? BEACONS : [],
    profileSourcePublishedAt: published[1],
    ratingDate: null
  };
}

export function buildSnapshot({ search, profiles, crosswalks = new Map(), retrievedAt }) {
  const candidates = search.records.map((record) => {
    const profile = profiles.get(record.ein);
    const crosswalk = crosswalks.get(record.name.toLocaleLowerCase('en-US')) ?? { evaluatorAssessmentMatches: [], acceptedGrantLedgerMatches: [] };
    return {
      ein: record.ein,
      name: record.name,
      profileUrl: `https://www.charitynavigator.org${record.url}`,
      headquarters: { city: record.city, state: record.state },
      serviceGeography: null,
      ratingScore: Number(record.rating),
      starRating: Number(record.star_rating),
      ratingDate: profile?.ratingDate ?? null,
      profileSourcePublishedAt: profile?.profileSourcePublishedAt ?? null,
      completedBeaconCount: profile?.completedBeaconCount ?? null,
      completedBeacons: profile?.completedBeacons ?? [],
      profileReviewStatus: profile ? 'profile-reviewed' : 'source-index-only',
      highestLevelAdvisory: record.highest_level_advisory,
      causes: record.causes,
      size: record.size,
      profileComplete: record.is_profile_complete,
      donationEligible: record.donation_eligible,
      evaluatorAssessmentMatches: crosswalk.evaluatorAssessmentMatches,
      acceptedGrantLedgerMatches: crosswalk.acceptedGrantLedgerMatches,
      impactEvidenceStatus: 'not-yet-assessed',
      roomForFundingStatus: 'not-yet-assessed'
    };
  });
  const semantic = { totalItems: search.totalItems, candidates };
  return {
    version: 'charity-navigator-lgbtq-discovery-v2',
    retrievedAt,
    source: {
      publisher: 'Charity Navigator',
      searchUrl: SEARCH_URL,
      methodologyUrl: METHODOLOGY_URL,
      curatedListMethodologyUrl: CURATED_LIST_URL,
      query: 'lgbtq rights',
      resultOrder: 'Charity Navigator default ordering',
      pagesRetrieved: Math.ceil(search.totalItems / search.size),
      pageSize: search.size,
      totalItems: search.totalItems,
      contentHash: digest(semantic)
    },
    taxonomy: {
      key: 'lgbtqia',
      label: 'LGBTQIA+ support',
      charityNavigatorCause: 'LGBTQ rights',
      discoveryLenses: [
        { key: 'social-support', label: 'Social support' },
        { key: 'health-care', label: 'Health care' },
        { key: 'legal-services', label: 'Legal services' },
        { key: 'advocacy', label: 'Advocacy' }
      ],
      discoveryLensNote: 'These four lenses are preserved from Charity Navigator’s published LGBTQIA+ cause page. Candidate tags below remain source-authored and are not force-mapped into a lens.'
    },
    summary: {
      discoveredOrganizationCount: search.totalItems,
      reviewedCandidateCount: candidates.length,
      fourStarCount: candidates.filter((row) => row.starRating === 4).length,
      threeStarCount: candidates.filter((row) => row.starRating === 3).length,
      profileReviewedCount: candidates.filter((row) => row.profileReviewStatus === 'profile-reviewed').length,
      fourBeaconCount: candidates.filter((row) => row.completedBeaconCount === 4).length,
      advisoryCount: candidates.filter((row) => row.highestLevelAdvisory).length,
      evaluatorOverlapCount: candidates.filter((row) => row.evaluatorAssessmentMatches.length > 0).length,
      acceptedGrantLedgerOverlapCount: candidates.filter((row) => row.acceptedGrantLedgerMatches.length > 0).length,
      assessedImpactEvidenceCount: 0,
      publishedRoomForFundingCount: 0
    },
    candidates,
    interpretation: {
      coverage: 'This is the complete current Charity Navigator “LGBTQ rights” search universe, paginated in its source-default order. It is not curated-list membership or a ranking by Market for Impact.',
      rating: 'The overall score and stars are Charity Navigator signals. They are not an MFI effectiveness score, and four completed beacons do not establish causal impact or marginal cost-effectiveness.',
      geography: 'City and state are headquarters fields. Service geography is left unknown until an organization-level review establishes it.',
      crosswalk: 'Cross-source links use conservative exact-name matching only. Charity Navigator EINs identify these profiles, but accepted MFI ledgers generally do not publish recipient EINs, so matches are not relabeled as EIN-verified. Absence is not negative evidence.',
      missingness: 'The first ten profiles retain reviewed beacon and source-publication fields. Remaining rows are source-index-only, so those profile fields stay null. Rating-specific dates were not exposed as accepted fields and remain null.',
      decision: 'Every candidate remains a research lead. Impact evidence and current room for more funding have not yet been assessed, so this slice makes no giving recommendation.'
    }
  };
}

export function validateSnapshot(snapshot) {
  if (snapshot.version !== 'charity-navigator-lgbtq-discovery-v2') throw new Error('Unexpected Charity Navigator snapshot version.');
  if (snapshot.candidates.length !== snapshot.source.totalItems || snapshot.source.pageSize !== 10) throw new Error('The discovery snapshot must contain the complete result universe.');
  if (new Set(snapshot.candidates.map((row) => row.ein)).size !== snapshot.candidates.length) throw new Error('Duplicate EIN in Charity Navigator discovery universe.');
  if (snapshot.candidates.some((row) => !/^\d{9}$/.test(row.ein))) throw new Error('Every candidate must retain a nine-digit EIN.');
  if (snapshot.candidates.some((row) => row.serviceGeography !== null || row.ratingDate !== null)) throw new Error('Unpublished geography or rating dates must remain null.');
  if (snapshot.candidates.slice(0, 10).some((row) => row.completedBeaconCount !== 4 || row.completedBeacons.length !== 4 || row.profileReviewStatus !== 'profile-reviewed')) throw new Error('Committed first-page candidates no longer expose reviewed beacon details.');
  if (snapshot.candidates.slice(10).some((row) => row.completedBeaconCount !== null || row.completedBeacons.length !== 0 || row.profileSourcePublishedAt !== null || row.profileReviewStatus !== 'source-index-only')) throw new Error('Source-index-only candidates must preserve unreviewed profile fields as null.');
  if (snapshot.candidates.some((row) => row.impactEvidenceStatus !== 'not-yet-assessed' || row.roomForFundingStatus !== 'not-yet-assessed')) throw new Error('Discovery must not imply completed impact or funding-room diligence.');
  if (snapshot.summary.profileReviewedCount !== 10) throw new Error('Exactly ten profiles must retain deep-review fields in this version.');
  const expectedHash = digest({ totalItems: snapshot.source.totalItems, candidates: snapshot.candidates });
  if (snapshot.source.contentHash !== expectedHash) throw new Error('Charity Navigator snapshot content hash does not reconcile.');
  return snapshot;
}

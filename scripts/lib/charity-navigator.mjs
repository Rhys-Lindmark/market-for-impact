import { createHash } from 'node:crypto';

export const SEARCH_URL = 'https://www.charitynavigator.org/search/?causes=lgbtq%20rights';
export const METHODOLOGY_URL = 'https://www.charitynavigator.org/content/dam/cn/cn/landing-pages/Rating%20Methodology%20Guide%20(Updated%20March%202026).pdf';
export const CURATED_LIST_URL = 'https://www.charitynavigator.org/about-us/our-methodology/curated-lists/';
export const BEACONS = ['Accountability & Finance', 'Impact & Measurement', 'Leadership & Planning', 'Culture & Compensation'];

const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function parseSearchPage(html) {
  const match = html.match(/\\"results\\":\[((?:\{\\"name\\":).*?)\],\\"totalItems\\":(\d+),\\"from\\":(\d+),\\"size\\":(\d+)/s);
  if (!match) throw new Error('Could not find Charity Navigator search results in the rendered page.');
  const records = JSON.parse(`[${match[1].replaceAll('\\"', '"')}]`);
  const totalItems = Number(match[2]);
  const from = Number(match[3]);
  const size = Number(match[4]);
  if (records.length !== size || size !== 10 || from !== 0 || totalItems < records.length) {
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

export function buildSnapshot({ search, profiles, retrievedAt }) {
  const candidates = search.records.map((record) => {
    const profile = profiles.get(record.ein);
    if (!profile) throw new Error(`Missing Charity Navigator profile ${record.ein}.`);
    return {
      ein: record.ein,
      name: record.name,
      profileUrl: `https://www.charitynavigator.org${record.url}`,
      headquarters: { city: record.city, state: record.state },
      serviceGeography: null,
      ratingScore: Number(record.rating),
      starRating: Number(record.star_rating),
      ratingDate: profile.ratingDate,
      profileSourcePublishedAt: profile.profileSourcePublishedAt,
      completedBeaconCount: profile.completedBeaconCount,
      completedBeacons: profile.completedBeacons,
      highestLevelAdvisory: record.highest_level_advisory,
      causes: record.causes,
      size: record.size,
      profileComplete: record.is_profile_complete,
      donationEligible: record.donation_eligible,
      evaluatorAssessmentMatches: [],
      acceptedGrantLedgerMatches: [],
      impactEvidenceStatus: 'not-yet-assessed',
      roomForFundingStatus: 'not-yet-assessed'
    };
  });
  const semantic = { totalItems: search.totalItems, candidates };
  return {
    version: 'charity-navigator-lgbtq-discovery-v1',
    retrievedAt,
    source: {
      publisher: 'Charity Navigator',
      searchUrl: SEARCH_URL,
      methodologyUrl: METHODOLOGY_URL,
      curatedListMethodologyUrl: CURATED_LIST_URL,
      query: 'lgbtq rights',
      resultOrder: 'Charity Navigator default ordering',
      page: 1,
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
      fourBeaconCount: candidates.filter((row) => row.completedBeaconCount === 4).length,
      advisoryCount: candidates.filter((row) => row.highestLevelAdvisory).length,
      evaluatorOverlapCount: 0,
      acceptedGrantLedgerOverlapCount: 0,
      assessedImpactEvidenceCount: 0,
      publishedRoomForFundingCount: 0
    },
    candidates,
    interpretation: {
      coverage: 'This is the first 10-result page of the current Charity Navigator “LGBTQ rights” search, not an exhaustive universe, curated-list membership set, or ranking by Market for Impact.',
      rating: 'The overall score and stars are Charity Navigator signals. They are not an MFI effectiveness score, and four completed beacons do not establish causal impact or marginal cost-effectiveness.',
      geography: 'City and state are headquarters fields. Service geography is left unknown until an organization-level review establishes it.',
      crosswalk: 'No exact identity overlap was found in the currently accepted MFI evaluator recommendations or grant ledgers. Absence is not negative evidence; name and EIN reconciliation will expand in later diligence.',
      missingness: 'Rating-specific dates were not exposed as accepted fields on these profiles, so ratingDate remains null. The separately stored profileSourcePublishedAt is not relabeled as the rating date.',
      decision: 'Every candidate remains a research lead. Impact evidence and current room for more funding have not yet been assessed, so this slice makes no giving recommendation.'
    }
  };
}

export function validateSnapshot(snapshot) {
  if (snapshot.version !== 'charity-navigator-lgbtq-discovery-v1') throw new Error('Unexpected Charity Navigator snapshot version.');
  if (snapshot.candidates.length !== 10 || snapshot.source.pageSize !== 10) throw new Error('The first discovery slice must contain exactly 10 candidates.');
  if (new Set(snapshot.candidates.map((row) => row.ein)).size !== 10) throw new Error('Duplicate EIN in Charity Navigator discovery slice.');
  if (snapshot.candidates.some((row) => !/^\d{9}$/.test(row.ein))) throw new Error('Every candidate must retain a nine-digit EIN.');
  if (snapshot.candidates.some((row) => row.serviceGeography !== null || row.ratingDate !== null)) throw new Error('Unpublished geography or rating dates must remain null.');
  if (snapshot.candidates.some((row) => row.completedBeaconCount !== 4 || row.completedBeacons.length !== 4)) throw new Error('Committed first-page candidates no longer expose four completed beacons.');
  if (snapshot.candidates.some((row) => row.impactEvidenceStatus !== 'not-yet-assessed' || row.roomForFundingStatus !== 'not-yet-assessed')) throw new Error('Discovery must not imply completed impact or funding-room diligence.');
  if (snapshot.summary.evaluatorOverlapCount !== 0 || snapshot.summary.acceptedGrantLedgerOverlapCount !== 0) throw new Error('Unexpected accepted-ledger overlap requires identity review.');
  const expectedHash = digest({ totalItems: snapshot.source.totalItems, candidates: snapshot.candidates });
  if (snapshot.source.contentHash !== expectedHash) throw new Error('Charity Navigator snapshot content hash does not reconcile.');
  return snapshot;
}

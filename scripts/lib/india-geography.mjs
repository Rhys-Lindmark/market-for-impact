const INDIA = 'India';
const RECENT_START = '2024-01-01T00:00:00.000Z';

const total = (rows) => rows.reduce((sum, row) => sum + Number(row.amountUsd ?? 0), 0);
const unique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

function summarizeRecipients(rows) {
  const groups = new Map();
  for (const row of rows) {
    const group = groups.get(row.recipient) ?? {
      recipient: row.recipient,
      grantCount: 0,
      publishedAmountUsd: 0,
      indiaOnlyPublishedAmountUsd: 0,
      multiCountryPublishedAmountUsd: 0,
      latestDecisionDate: null,
      topics: new Set(),
    };
    group.grantCount += 1;
    group.publishedAmountUsd += row.amountUsd;
    group[row.countries.length === 1 ? 'indiaOnlyPublishedAmountUsd' : 'multiCountryPublishedAmountUsd'] += row.amountUsd;
    if (!group.latestDecisionDate || row.decisionDate > group.latestDecisionDate) group.latestDecisionDate = row.decisionDate;
    for (const topic of row.topics) group.topics.add(topic.replace(/^"|"$/g, ''));
    groups.set(row.recipient, group);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, topics: unique([...group.topics]) }))
    .sort((a, b) => b.publishedAmountUsd - a.publishedAmountUsd || a.recipient.localeCompare(b.recipient));
}

export function buildIndiaGeography({ givewell, topCharities, ace, grantFlow }) {
  const indiaGrants = givewell.records.filter((row) => row.countries.includes(INDIA));
  const indiaOnly = indiaGrants.filter((row) => row.countries.length === 1);
  const multiCountry = indiaGrants.filter((row) => row.countries.length > 1);
  const recent = indiaGrants.filter((row) => row.decisionDate >= RECENT_START);
  const recentIndiaOnly = recent.filter((row) => row.countries.length === 1);
  const recentMultiCountry = recent.filter((row) => row.countries.length > 1);
  const aceIndia = ace.records.filter((row) => row.geography.split(/,| and /).some((value) => value.trim() === INDIA));
  const topCharitiesNamingIndia = topCharities.opportunities.filter((row) => row.geographies.includes(INDIA));
  const grantCoverage = new Map(grantFlow.ledgers.map((row) => [row.key, row]));

  return {
    version: 'india-geography-v0.1',
    generatedAt: new Date(Math.max(Date.parse(givewell.source.retrievedAt), Date.parse(ace.source.retrievedAt), Date.parse(grantFlow.generatedAt))).toISOString(),
    geography: { country: INDIA, isoCode: 'IN', level: 'country' },
    summary: {
      givewellGrantCount: indiaGrants.length,
      givewellPublishedAmountUsd: total(indiaGrants),
      indiaOnlyGrantCount: indiaOnly.length,
      indiaOnlyPublishedAmountUsd: total(indiaOnly),
      multiCountryGrantCount: multiCountry.length,
      multiCountryPublishedAmountUsd: total(multiCountry),
      recentGrantCount: recent.length,
      recentPublishedAmountUsd: total(recent),
      recentIndiaOnlyGrantCount: recentIndiaOnly.length,
      recentIndiaOnlyPublishedAmountUsd: total(recentIndiaOnly),
      recentMultiCountryGrantCount: recentMultiCountry.length,
      recentMultiCountryPublishedAmountUsd: total(recentMultiCountry),
      currentEvaluatorOpportunityCount: aceIndia.length,
      currentIndiaSpecificFundingRoomCount: 0,
      currentGiveWellTopCharityCount: topCharitiesNamingIndia.length,
      assessedIndiaDonationVehicleCount: 0,
    },
    interpretation: {
      geography: 'A GiveWell row enters the flow lens only when the accepted country list explicitly contains India. Recipient name, headquarters, purpose text, or evaluator identity never substitutes for a country field.',
      amount: 'Published grant amounts are shown only inside the GiveWell ledger. A multi-country row retains its full source amount because the accepted record does not allocate dollars by country; India-only and multi-country amounts remain separate.',
      recommendation: 'Historical grant flow is not a recommendation. A current evaluator recommendation is shown separately and does not become India-specific unless the accepted evaluation names India.',
      fundingRoom: 'Shrimp Welfare Project’s published annual room is organization-wide. No accepted source allocates that room to its India program, so India-specific room remains unknown.',
      donationVehicle: 'Headquarters, Indian legal registration, tax treatment, local donation rails, and donor-country deductibility are unassessed until an organization-level legal and donation review is completed.',
    },
    currentOpportunities: aceIndia.map((row) => ({
      organization: row.organization,
      slug: row.slug,
      evaluator: 'Animal Charity Evaluators',
      recommendationCohort: row.recommendationCohort,
      evaluationYear: row.evaluationYear,
      serviceGeography: row.geography,
      targetPopulation: row.animalGroups.join(' · '),
      indiaProgram: 'Sustainable Shrimp Farmers of India',
      interventions: row.interventions,
      evidenceLevel: row.evidenceLevel,
      organizationFundingCapacityUsd: row.fundingCapacityUsd,
      organizationFundingRoomUsd: row.fundingRoomUsd,
      fundingPeriod: row.fundingPeriod,
      fundingUse: row.fundingUse,
      indiaSpecificFundingRoomUsd: null,
      headquarters: null,
      indiaDonationVehicle: null,
      indiaMetrics: row.metrics.filter((metric) => metric.program === 'Sustainable Shrimp Farmers of India'),
      limitations: row.limitations,
      reviewUrl: row.reviewUrl,
    })),
    givewellFlow: {
      dateBasis: 'GiveWell decision date',
      periodStart: indiaGrants.at(-1)?.decisionDate ?? null,
      periodEnd: indiaGrants[0]?.decisionDate ?? null,
      recentPeriodStart: RECENT_START,
      recentRecipientGroups: summarizeRecipients(recent),
      recentGrants: recent.map((row) => ({
        sourceRecordId: row.sourceRecordId,
        recipient: row.recipient,
        amountUsd: row.amountUsd,
        decisionDate: row.decisionDate,
        countries: row.countries,
        topics: row.topics.map((topic) => topic.replace(/^"|"$/g, '')),
        sourceUrl: row.sourceUrl,
        amountSemantics: 'published grant amount; payment timing not inferred',
        indiaAmountUsd: row.countries.length === 1 ? row.amountUsd : null,
      })),
    },
    evaluatorCoverage: [
      {
        evaluator: 'GiveWell',
        state: 'grant-country-coverage',
        evidence: `${indiaGrants.length} published grant rows explicitly name India; ${topCharitiesNamingIndia.length} current Top Charity program geographies name India.`,
        boundary: 'Country-tagged grants are historical funding records, not current recommendations or current room for more funding.',
        sourceUrl: givewell.source.url,
        retrievedAt: givewell.source.retrievedAt,
      },
      {
        evaluator: 'Animal Charity Evaluators',
        state: 'current-recommendation-coverage',
        evidence: `${aceIndia.length} current recommended charity explicitly includes India in its accepted service geography.`,
        boundary: 'Organization-level funding room and capacity are not allocated to the India program in the accepted review.',
        sourceUrl: ace.source.url,
        retrievedAt: ace.source.retrievedAt,
      },
      ...['coefficient', 'giving-green', 'renphil'].map((key) => {
        const ledger = grantCoverage.get(key);
        return {
          evaluator: ledger.publisher,
          state: 'structured-country-field-unavailable',
          evidence: `${ledger.rowCount} accepted rows; grant geography is ${ledger.fieldCoverage.geography}.`,
          boundary: 'Names, purpose text, and headquarters are not used to infer India activity or India funding totals.',
          sourceUrl: ledger.sourceUrl,
          retrievedAt: ledger.retrievedAt,
        };
      }),
      {
        evaluator: 'Founders Pledge',
        state: 'country-field-not-standardized',
        evidence: 'The accepted research matrix does not expose a standardized service-country field across opportunities.',
        boundary: 'A cause-area recommendation or benchmark is not labeled India-specific without an accepted country field.',
        sourceUrl: 'https://www.founderspledge.com/research',
        retrievedAt: grantFlow.generatedAt,
      },
    ],
    sources: [
      { publisher: givewell.source.publisher, title: givewell.source.title, url: givewell.source.url, retrievedAt: givewell.source.retrievedAt },
      { publisher: topCharities.source.publisher, title: topCharities.source.title, url: topCharities.source.url, retrievedAt: topCharities.source.retrievedAt },
      { publisher: ace.source.publisher, title: ace.source.title, url: ace.source.url, retrievedAt: ace.source.retrievedAt },
      { publisher: 'Market for Impact', title: 'Grant-flow field-coverage contract', url: 'https://market-for-impact.rhyslindmark.chatgpt.site/#flows', retrievedAt: grantFlow.generatedAt },
    ],
  };
}

export function validateIndiaGeography(snapshot) {
  if (snapshot.version !== 'india-geography-v0.1' || snapshot.geography.isoCode !== 'IN') throw new Error('Unexpected India geography contract.');
  const summary = snapshot.summary;
  if (summary.givewellGrantCount !== summary.indiaOnlyGrantCount + summary.multiCountryGrantCount) throw new Error('India grant counts do not reconcile.');
  if (summary.givewellPublishedAmountUsd !== summary.indiaOnlyPublishedAmountUsd + summary.multiCountryPublishedAmountUsd) throw new Error('India grant amounts do not reconcile.');
  if (summary.recentGrantCount !== summary.recentIndiaOnlyGrantCount + summary.recentMultiCountryGrantCount) throw new Error('Recent India grant counts do not reconcile.');
  if (summary.recentPublishedAmountUsd !== summary.recentIndiaOnlyPublishedAmountUsd + summary.recentMultiCountryPublishedAmountUsd) throw new Error('Recent India grant amounts do not reconcile.');
  if (snapshot.givewellFlow.recentGrants.some((row) => !row.countries.includes(INDIA) || row.amountSemantics !== 'published grant amount; payment timing not inferred')) throw new Error('India flow contains an unsupported row or amount semantic.');
  if (snapshot.givewellFlow.recentGrants.some((row) => row.countries.length > 1 && row.indiaAmountUsd !== null)) throw new Error('A multi-country grant was allocated to India without evidence.');
  if (snapshot.currentOpportunities.some((row) => row.indiaSpecificFundingRoomUsd !== null || row.headquarters !== null || row.indiaDonationVehicle !== null)) throw new Error('India opportunity inferred funding room, headquarters, or a donation vehicle.');
  if (snapshot.currentOpportunities.some((row) => !row.serviceGeography.includes(INDIA) || row.indiaMetrics.some((metric) => !metric.program.includes(INDIA)))) throw new Error('India opportunity lacks an explicit service or program geography.');
  if (snapshot.evaluatorCoverage.length !== 6 || snapshot.evaluatorCoverage.some((row) => !row.evidence || !row.boundary || !row.sourceUrl || !row.retrievedAt)) throw new Error('Evaluator coverage is incomplete.');
  if (snapshot.sources.some((source) => !source.url.startsWith('https://') || !source.retrievedAt)) throw new Error('India source trail is incomplete.');
  return snapshot;
}

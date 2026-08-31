import crypto from 'node:crypto';

const identity = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const stableId = (name) => hash(`sff-fy25:${identity(name)}`).slice(0, 16);

export function buildSfSffGrants({ source, fiscalSponsorSource, currentReceivingEntityReviews, serviceGeographyReviews, candidateDiligenceReviews, irsUniverse, candidateUniverse, diligence }) {
  const irsByName = new Map();
  for (const row of irsUniverse.organizations) {
    const key = identity(row.name);
    if (!irsByName.has(key)) irsByName.set(key, []);
    irsByName.get(key).push({ ein: row.ein, sourceName: row.name, scorecardKey: row.scorecardKey });
  }
  const contractsByName = new Map(candidateUniverse.organizations.map((row) => [identity(row.sourceName), row]));
  const diligenceByName = new Map(diligence.candidates.map((row) => [identity(row.name), row]));
  const sponsorAssertionsByProject = new Map();
  for (const assertion of fiscalSponsorSource.assertions) {
    const key = identity(assertion.projectName);
    if (!sponsorAssertionsByProject.has(key)) sponsorAssertionsByProject.set(key, []);
    sponsorAssertionsByProject.get(key).push(assertion);
  }
  const currentReviewByProject = new Map(currentReceivingEntityReviews.reviews.map((review) => [identity(review.projectName), review]));
  const geographyReviewByProject = new Map(serviceGeographyReviews.reviews.map((review) => [identity(review.projectName), review]));
  const diligenceReviewByProject = new Map(candidateDiligenceReviews.reviews.map((review) => [identity(review.projectName), review]));

  const partners = source.rows.map((row, index) => {
    const key = identity(row.granteeName);
    const exactIrsMatches = (irsByName.get(key) ?? []).sort((a, b) => a.ein.localeCompare(b.ein));
    const contract = contractsByName.get(key) ?? null;
    const dossier = diligenceByName.get(key) ?? null;
    const sponsorAssertions = sponsorAssertionsByProject.get(key) ?? [];
    const currentReceivingEntityReview = currentReviewByProject.get(key) ?? null;
    const currentServiceGeographyReview = geographyReviewByProject.get(key) ?? null;
    const currentDiligenceReview = diligenceReviewByProject.get(key) ?? null;
    const sponsors = new Map();
    for (const assertion of sponsorAssertions) {
      const sponsorKey = identity(assertion.fiscalSponsorName);
      if (!sponsors.has(sponsorKey)) sponsors.set(sponsorKey, {
        sponsorName: assertion.fiscalSponsorName,
        assertionSemantics: assertion.assertionSemantics,
        latestSourcePostTitle: assertion.sourcePostTitle,
        latestSourceUrl: assertion.sourceUrl,
        latestSourcePublishedAt: assertion.sourcePublishedAt,
        latestSourceModifiedAt: assertion.sourceModifiedAt,
        historicalAssertionCount: 0,
      });
      sponsors.get(sponsorKey).historicalAssertionCount += 1;
    }
    const sourceReportedFiscalSponsors = [...sponsors.values()];
    const identityStatus = dossier ? 'diligence-match'
      : exactIrsMatches.length && contract ? 'irs-and-contract'
      : exactIrsMatches.length ? 'irs-only'
      : contract ? 'contract-only'
      : sourceReportedFiscalSponsors.length ? 'sff-sponsor-record'
      : 'source-name-only';
    return {
      id: stableId(row.granteeName),
      sourceOrder: index + 1,
      sourcePage: row.sourcePage,
      granteeName: row.granteeName,
      totalFundingUsd: row.totalFundingUsd,
      amountSemantics: 'aggregated-fy2025-programmatic-funding',
      recipientType: 'not-published-in-list',
      serviceGeography: null,
      serviceGeographyStatus: 'not-published-in-list',
      currentServiceGeographyReview,
      currentDiligenceReview,
      identityStatus,
      exactIrsMatches,
      exactContractSourceName: contract?.sourceName ?? null,
      sourceReportedFiscalSponsors,
      fiscalSponsorConflictStatus: sourceReportedFiscalSponsors.length > 1 ? 'multiple-source-reported-sponsors' : 'none-observed',
      currentReceivingEntityReview,
      diligenceKey: dossier?.key ?? null,
      diligenceName: dossier?.name ?? null,
      impactEvidenceStatus: dossier ? 'deep-evidence-dossier' : 'not-yet-assessed',
      roomForMoreFundingUsd: null,
      roomForMoreFundingStatus: 'not-yet-assessed',
      outcomeKeys: [],
    };
  });
  const totalFundingUsd = partners.reduce((sum, row) => sum + row.totalFundingUsd, 0);
  const semantic = { partners };
  return {
    version: 'sf-sff-community-grants-v0.5',
    generatedAt: source.retrievedAt,
    funder: 'The San Francisco Foundation',
    period: source.period,
    source: {
      ...source.source,
      sourceSnapshotVersion: source.version,
      fiscalSponsorCorpus: {
        version: fiscalSponsorSource.version,
        retrievedAt: fiscalSponsorSource.retrievedAt,
        apiUrl: fiscalSponsorSource.search.apiUrl,
        semanticHash: fiscalSponsorSource.semanticHash,
        coverageBoundary: fiscalSponsorSource.search.coverageBoundary,
      },
      currentReceivingEntityReviews: {
        version: currentReceivingEntityReviews.version,
        reviewedAt: currentReceivingEntityReviews.reviewedAt,
        scope: currentReceivingEntityReviews.scope,
        method: currentReceivingEntityReviews.method,
      },
      serviceGeographyReviews: {
        version: serviceGeographyReviews.version,
        reviewedAt: serviceGeographyReviews.reviewedAt,
        scope: serviceGeographyReviews.scope,
        method: serviceGeographyReviews.method,
      },
      candidateDiligenceReviews: {
        version: candidateDiligenceReviews.version,
        reviewedAt: candidateDiligenceReviews.reviewedAt,
        scope: candidateDiligenceReviews.scope,
        method: candidateDiligenceReviews.method,
      },
      contentHash: hash(JSON.stringify(semantic)),
    },
    summary: {
      publishedPartnerRowCount: partners.length,
      publishedPartnerTotalFundingUsd: totalFundingUsd,
      reportedGrantCount: source.portfolioSummary.reportedGrantCount,
      reportedOrganizationCount: source.portfolioSummary.reportedOrganizationCount,
      reportedIndividualCount: source.portfolioSummary.reportedIndividualCount,
      exactIrsMatchRowCount: partners.filter((row) => row.exactIrsMatches.length > 0).length,
      exactContractMatchRowCount: partners.filter((row) => row.exactContractSourceName !== null).length,
      sourceReportedFiscalSponsorRowCount: partners.filter((row) => row.sourceReportedFiscalSponsors.length > 0).length,
      distinctSourceReportedFiscalSponsorCount: new Set(partners.flatMap((row) => row.sourceReportedFiscalSponsors.map((sponsor) => identity(sponsor.sponsorName)))).size,
      fiscalSponsorConflictRowCount: partners.filter((row) => row.fiscalSponsorConflictStatus !== 'none-observed').length,
      currentReceivingEntityReviewRowCount: partners.filter((row) => row.currentReceivingEntityReview !== null).length,
      currentSponsorConfirmedRowCount: partners.filter((row) => row.currentReceivingEntityReview?.currentFiscalSponsorName).length,
      historicalSponsorChangedRowCount: partners.filter((row) => row.currentReceivingEntityReview?.relationshipStatus === 'historical-sponsor-changed').length,
      currentReceivingEntityUnresolvedRowCount: partners.filter((row) => row.currentReceivingEntityReview?.relationshipStatus === 'current-receiving-entity-unresolved').length,
      currentDonationRouteRowCount: partners.filter((row) => row.currentReceivingEntityReview?.donationRouteStatus !== 'no-current-route-found' && row.currentReceivingEntityReview?.donationRouteStatus).length,
      diligenceMatchRowCount: partners.filter((row) => row.diligenceKey !== null).length,
      sourceNameOnlyRowCount: partners.filter((row) => row.identityStatus === 'source-name-only').length,
      currentServiceGeographyReviewRowCount: partners.filter((row) => row.currentServiceGeographyReview !== null).length,
      explicitSfAudiencePresenceRowCount: partners.filter((row) => row.currentServiceGeographyReview?.sanFranciscoRelevance === 'explicit-audience-presence-within-regional-scope').length,
      regionalBayAreaScopeRowCount: partners.filter((row) => row.currentServiceGeographyReview?.scopeStatus === 'regional-bay-area').length,
      multiLevelCaliforniaAndBayAreaRowCount: partners.filter((row) => row.currentServiceGeographyReview?.scopeStatus === 'multi-level-california-and-bay-area').length,
      namedNonSfLocalGeographyRowCount: partners.filter((row) => row.currentServiceGeographyReview?.scopeStatus === 'named-non-sf-local-geography').length,
      statewideCaliforniaScopeRowCount: partners.filter((row) => row.currentServiceGeographyReview?.scopeStatus === 'statewide-california').length,
      transnationalNoLocalAllocationRowCount: partners.filter((row) => row.currentServiceGeographyReview?.scopeStatus === 'transnational-no-local-allocation').length,
      currentDiligenceReviewRowCount: partners.filter((row) => row.currentDiligenceReview !== null).length,
      recommendationReadyDiligenceRowCount: partners.filter((row) => row.currentDiligenceReview?.reviewStatus === 'recommendation-ready').length,
      rowLevelServiceGeographyCount: 0,
      publishableRoomForFundingCount: 0,
    },
    partners,
    interpretation: {
      denominator: `This lens contains all ${partners.length} rows in SFF's published FY2025 grantee-partner PDF. SFF separately reports ${source.portfolioSummary.reportedGrantCount} grants, ${source.portfolioSummary.reportedOrganizationCount} organizations, and ${source.portfolioSummary.reportedIndividualCount} individuals; the PDF does not classify each row or explain why its row count equals the reported organization count.`,
      amount: source.amountSemantics,
      geography: 'The PDF does not publish a county or service geography per partner. A separate current-source review covers 11 rows while preserving regional, statewide, non-SF local, transnational, and explicit San Francisco audience signals as distinct claims. A name, address, contract, funder mandate, or historical grant never assigns service geography.',
      identity: 'Crosswalks use only exact Unicode-, whitespace-, and case-normalized source names. SFF give-guide fiscal-sponsor statements remain dated historical assertions, not verification of a current legal or donation relationship. A separate 2026-08-30 review uses only current project or fiscal-sponsor pages; donation routes, payee instructions, and sponsor identity remain distinct, and unresolved receiving entities stay visible. IRS, contract, dossier, and sponsor records remain separate; fuzzy matching is prohibited.',
      impact: 'SFF funding is funder-discovery and philanthropic-flow context. An award, amount, city contract, or exact identity link is not evidence of effectiveness, additionality, or recommendation quality.',
      fundingRoom: 'Historical aggregate funding is not current room for more funding. Every partner remains unpriced until a time-bounded marginal plan and counterfactual are reviewed.',
      coverage: source.coverageBoundary,
    },
  };
}

export function validateSfSffGrants(snapshot) {
  if (snapshot.version !== 'sf-sff-community-grants-v0.5') throw new Error('Unexpected SFF community-grants version.');
  if (snapshot.summary.publishedPartnerRowCount !== 424 || snapshot.partners.length !== 424) throw new Error('SFF row count does not reconcile.');
  if (snapshot.summary.publishedPartnerTotalFundingUsd !== 49_516_694) throw new Error('SFF published amount does not reconcile.');
  if (snapshot.partners.reduce((sum, row) => sum + row.totalFundingUsd, 0) !== snapshot.summary.publishedPartnerTotalFundingUsd) throw new Error('SFF partner amounts do not sum to the published total.');
  if (new Set(snapshot.partners.map((row) => row.id)).size !== snapshot.partners.length) throw new Error('Duplicate SFF partner ID.');
  if (new Set(snapshot.partners.map((row) => row.granteeName)).size !== snapshot.partners.length) throw new Error('Duplicate SFF grantee name.');
  if (snapshot.partners.some((row, index) => row.sourceOrder !== index + 1 || !row.sourcePage)) throw new Error('SFF source order or page is invalid.');
  if (snapshot.partners.some((row) => row.amountSemantics !== 'aggregated-fy2025-programmatic-funding')) throw new Error('SFF amount semantics drifted.');
  if (snapshot.partners.some((row) => row.serviceGeography !== null || row.serviceGeographyStatus !== 'not-published-in-list')) throw new Error('SFF row inferred service geography.');
  if (snapshot.partners.some((row) => row.outcomeKeys.length || row.roomForMoreFundingUsd !== null || row.roomForMoreFundingStatus !== 'not-yet-assessed')) throw new Error('SFF discovery row inferred outcome or funding room.');
  if (snapshot.summary.rowLevelServiceGeographyCount !== 0 || snapshot.summary.publishableRoomForFundingCount !== 0) throw new Error('SFF summary inferred decision fields.');
  if (snapshot.summary.exactIrsMatchRowCount !== snapshot.partners.filter((row) => row.exactIrsMatches.length > 0).length) throw new Error('SFF IRS matches do not reconcile.');
  if (snapshot.summary.exactContractMatchRowCount !== snapshot.partners.filter((row) => row.exactContractSourceName !== null).length) throw new Error('SFF contract matches do not reconcile.');
  if (snapshot.summary.sourceReportedFiscalSponsorRowCount !== 11 || snapshot.summary.sourceReportedFiscalSponsorRowCount !== snapshot.partners.filter((row) => row.sourceReportedFiscalSponsors.length > 0).length) throw new Error('SFF fiscal-sponsor source matches do not reconcile.');
  if (snapshot.summary.fiscalSponsorConflictRowCount !== snapshot.partners.filter((row) => row.fiscalSponsorConflictStatus !== 'none-observed').length) throw new Error('SFF fiscal-sponsor conflicts do not reconcile.');
  if (snapshot.partners.flatMap((row) => row.sourceReportedFiscalSponsors).some((sponsor) => sponsor.assertionSemantics !== 'source-reported-at-publication-not-current-verification')) throw new Error('SFF fiscal-sponsor assertion semantics drifted.');
  if (!snapshot.source.fiscalSponsorCorpus?.semanticHash || !snapshot.source.fiscalSponsorCorpus?.coverageBoundary) throw new Error('SFF fiscal-sponsor source provenance is missing.');
  if (snapshot.summary.currentReceivingEntityReviewRowCount !== 11) throw new Error('SFF current receiving-entity review count does not reconcile.');
  if (snapshot.summary.currentSponsorConfirmedRowCount !== 6 || snapshot.summary.historicalSponsorChangedRowCount !== 2 || snapshot.summary.currentReceivingEntityUnresolvedRowCount !== 5 || snapshot.summary.currentDonationRouteRowCount !== 9) throw new Error('SFF current receiving-entity review summary drifted.');
  if (snapshot.partners.some((row) => row.sourceReportedFiscalSponsors.length === 0 && row.currentReceivingEntityReview !== null)) throw new Error('SFF current review escaped the historical 11-row scope.');
  if (snapshot.partners.some((row) => row.currentReceivingEntityReview && !row.sourceReportedFiscalSponsors.some((sponsor) => identity(sponsor.sponsorName) === identity(row.currentReceivingEntityReview.historicalSffSponsorName)))) throw new Error('SFF current review does not preserve its historical sponsor match.');
  if (snapshot.partners.some((row) => row.currentReceivingEntityReview?.relationshipStatus === 'current-receiving-entity-unresolved' && row.currentReceivingEntityReview.currentFiscalSponsorName !== null)) throw new Error('An unresolved current receiving entity was populated.');
  if (snapshot.partners.some((row) => row.currentReceivingEntityReview?.donationRouteStatus === 'no-current-route-found' && row.currentReceivingEntityReview.donationUrl !== null)) throw new Error('A missing donation route has a URL.');
  if (!snapshot.source.currentReceivingEntityReviews?.version || !snapshot.source.currentReceivingEntityReviews?.method) throw new Error('SFF current receiving-entity review provenance is missing.');
  if (snapshot.summary.currentServiceGeographyReviewRowCount !== 11) throw new Error('SFF service-geography review count does not reconcile.');
  if (snapshot.partners.some((row) => row.currentServiceGeographyReview !== null && row.currentReceivingEntityReview === null)) throw new Error('SFF service-geography review escaped the reviewed 11-row scope.');
  if (snapshot.summary.explicitSfAudiencePresenceRowCount !== 1 || snapshot.summary.regionalBayAreaScopeRowCount !== 4 || snapshot.summary.multiLevelCaliforniaAndBayAreaRowCount !== 1 || snapshot.summary.namedNonSfLocalGeographyRowCount !== 4 || snapshot.summary.statewideCaliforniaScopeRowCount !== 1 || snapshot.summary.transnationalNoLocalAllocationRowCount !== 1) throw new Error('SFF service-geography review summary drifted.');
  if (snapshot.partners.filter((row) => row.currentServiceGeographyReview?.sanFranciscoRelevance === 'explicit-audience-presence-within-regional-scope').some((row) => row.granteeName !== 'El Tímpano')) throw new Error('SFF review inferred explicit San Francisco audience presence.');
  if (snapshot.partners.some((row) => row.currentServiceGeographyReview && (!row.currentServiceGeographyReview.sourceUrl || !row.currentServiceGeographyReview.sourceClaim || !row.currentServiceGeographyReview.retrievedAt || !row.currentServiceGeographyReview.limitation))) throw new Error('SFF service-geography provenance is incomplete.');
  if (!snapshot.source.serviceGeographyReviews?.version || !snapshot.source.serviceGeographyReviews?.method) throw new Error('SFF service-geography review provenance is missing.');
  if (snapshot.summary.currentDiligenceReviewRowCount !== 1 || snapshot.summary.recommendationReadyDiligenceRowCount !== 0) throw new Error('SFF candidate diligence summary drifted.');
  if (snapshot.partners.some((row) => row.currentDiligenceReview !== null && (row.currentServiceGeographyReview?.sanFranciscoRelevance !== 'explicit-audience-presence-within-regional-scope' || !row.currentReceivingEntityReview?.currentFiscalSponsorName))) throw new Error('SFF candidate diligence escaped its identity and geography gate.');
  const reviewedCandidate = snapshot.partners.find((row) => row.currentDiligenceReview !== null);
  if (reviewedCandidate?.granteeName !== 'El Tímpano') throw new Error('Unexpected SFF candidate diligence row.');
  if (reviewedCandidate.currentDiligenceReview.financials.projectRevenueUsd !== null || reviewedCandidate.currentDiligenceReview.financials.projectExpensesUsd !== null || reviewedCandidate.currentDiligenceReview.fundingRoom.status !== 'not-published') throw new Error('SFF candidate diligence inferred finances or funding room.');
  if (reviewedCandidate.currentDiligenceReview.evidenceLayers.length < 4 || reviewedCandidate.currentDiligenceReview.evidenceLayers.some((layer) => !layer.url.startsWith('https://') || !layer.retrievedAt || !layer.transferLimit)) throw new Error('SFF candidate diligence evidence trail is incomplete.');
  if (!snapshot.source.candidateDiligenceReviews?.version || !snapshot.source.candidateDiligenceReviews?.method) throw new Error('SFF candidate diligence provenance is missing.');
  if (snapshot.summary.diligenceMatchRowCount !== snapshot.partners.filter((row) => row.diligenceKey !== null).length) throw new Error('SFF diligence matches do not reconcile.');
  const expectedHash = hash(JSON.stringify({ partners: snapshot.partners }));
  if (snapshot.source.contentHash !== expectedHash) throw new Error('SFF snapshot hash does not reconcile.');
  return snapshot;
}

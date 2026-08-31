import crypto from 'node:crypto';

const identity = (value) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const stableId = (name) => hash(`sff-fy25:${identity(name)}`).slice(0, 16);

export function buildSfSffGrants({ source, fiscalSponsorSource, irsUniverse, candidateUniverse, diligence }) {
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

  const partners = source.rows.map((row, index) => {
    const key = identity(row.granteeName);
    const exactIrsMatches = (irsByName.get(key) ?? []).sort((a, b) => a.ein.localeCompare(b.ein));
    const contract = contractsByName.get(key) ?? null;
    const dossier = diligenceByName.get(key) ?? null;
    const sponsorAssertions = sponsorAssertionsByProject.get(key) ?? [];
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
      identityStatus,
      exactIrsMatches,
      exactContractSourceName: contract?.sourceName ?? null,
      sourceReportedFiscalSponsors,
      fiscalSponsorConflictStatus: sourceReportedFiscalSponsors.length > 1 ? 'multiple-source-reported-sponsors' : 'none-observed',
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
    version: 'sf-sff-community-grants-v0.2',
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
      diligenceMatchRowCount: partners.filter((row) => row.diligenceKey !== null).length,
      sourceNameOnlyRowCount: partners.filter((row) => row.identityStatus === 'source-name-only').length,
      rowLevelServiceGeographyCount: 0,
      publishableRoomForFundingCount: 0,
    },
    partners,
    interpretation: {
      denominator: `This lens contains all ${partners.length} rows in SFF's published FY2025 grantee-partner PDF. SFF separately reports ${source.portfolioSummary.reportedGrantCount} grants, ${source.portfolioSummary.reportedOrganizationCount} organizations, and ${source.portfolioSummary.reportedIndividualCount} individuals; the PDF does not classify each row or explain why its row count equals the reported organization count.`,
      amount: source.amountSemantics,
      geography: 'The PDF does not publish a county or service geography per partner. A name, IRS filing address, city contract, or SFF Bay Area mandate is not used to assign a row to San Francisco service.',
      identity: 'Crosswalks use only exact Unicode-, whitespace-, and case-normalized source names. SFF give-guide fiscal-sponsor statements are dated historical assertions, not verification of a current legal or donation relationship. IRS, contract, dossier, and sponsor records remain separate; fuzzy matching is prohibited.',
      impact: 'SFF funding is funder-discovery and philanthropic-flow context. An award, amount, city contract, or exact identity link is not evidence of effectiveness, additionality, or recommendation quality.',
      fundingRoom: 'Historical aggregate funding is not current room for more funding. Every partner remains unpriced until a time-bounded marginal plan and counterfactual are reviewed.',
      coverage: source.coverageBoundary,
    },
  };
}

export function validateSfSffGrants(snapshot) {
  if (snapshot.version !== 'sf-sff-community-grants-v0.2') throw new Error('Unexpected SFF community-grants version.');
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
  if (snapshot.summary.diligenceMatchRowCount !== snapshot.partners.filter((row) => row.diligenceKey !== null).length) throw new Error('SFF diligence matches do not reconcile.');
  const expectedHash = hash(JSON.stringify({ partners: snapshot.partners }));
  if (snapshot.source.contentHash !== expectedHash) throw new Error('SFF snapshot hash does not reconcile.');
  return snapshot;
}

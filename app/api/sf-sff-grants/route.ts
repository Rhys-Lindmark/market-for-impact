import { NextResponse } from 'next/server';
import snapshot from '@/data/san-francisco/sff-community-grants-v1.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();
  const identity = searchParams.get('identity') ?? 'all';
  const sort = searchParams.get('sort') ?? 'alphabetical';
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 12)));
  const requestedPage = Math.max(1, Number(searchParams.get('page') ?? 1));
  const partners = snapshot.partners.filter((row) => {
    const searchable = `${row.granteeName} ${row.exactIrsMatches.map((match) => match.ein).join(' ')} ${row.exactContractSourceName ?? ''} ${row.sourceReportedFiscalSponsors.map((sponsor) => sponsor.sponsorName).join(' ')} ${row.currentReceivingEntityReview?.currentFiscalSponsorName ?? ''} ${row.currentServiceGeographyReview?.serviceGeographyLabel ?? ''} ${row.currentServiceGeographyReview?.namedGeographies.join(' ') ?? ''}`.toLowerCase();
    const identityMatch = identity === 'all'
      || (identity === 'diligence' && row.diligenceKey !== null)
      || (identity === 'irs' && row.exactIrsMatches.length > 0)
      || (identity === 'contract' && row.exactContractSourceName !== null)
      || (identity === 'sponsor' && row.sourceReportedFiscalSponsors.length > 0)
      || (identity === 'current-reviewed' && row.currentReceivingEntityReview !== null)
      || (identity === 'current-confirmed' && row.currentReceivingEntityReview?.currentFiscalSponsorName !== null)
      || (identity === 'current-changed' && row.currentReceivingEntityReview?.relationshipStatus === 'historical-sponsor-changed')
      || (identity === 'current-unresolved' && row.currentReceivingEntityReview?.relationshipStatus === 'current-receiving-entity-unresolved')
      || (identity === 'geography-reviewed' && row.currentServiceGeographyReview !== null)
      || (identity === 'geography-explicit-sf' && row.currentServiceGeographyReview?.sanFranciscoRelevance === 'explicit-audience-presence-within-regional-scope')
      || (identity === 'geography-regional' && row.currentServiceGeographyReview?.scopeStatus === 'regional-bay-area')
      || (identity === 'geography-non-sf-local' && row.currentServiceGeographyReview?.scopeStatus === 'named-non-sf-local-geography')
      || (identity === 'geography-statewide' && row.currentServiceGeographyReview?.scopeStatus === 'statewide-california')
      || (identity === 'geography-transnational' && row.currentServiceGeographyReview?.scopeStatus === 'transnational-no-local-allocation')
      || (identity === 'unlinked' && row.exactIrsMatches.length === 0 && row.exactContractSourceName === null && row.sourceReportedFiscalSponsors.length === 0 && row.diligenceKey === null);
    return searchable.includes(query) && identityMatch;
  }).sort((a, b) => sort === 'funding'
    ? b.totalFundingUsd - a.totalFundingUsd || a.granteeName.localeCompare(b.granteeName)
    : a.sourceOrder - b.sourceOrder);
  const pageCount = Math.max(1, Math.ceil(partners.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  return NextResponse.json({
    version: snapshot.version,
    generatedAt: snapshot.generatedAt,
    funder: snapshot.funder,
    period: snapshot.period,
    source: snapshot.source,
    summary: snapshot.summary,
    interpretation: snapshot.interpretation,
    filters: { query, identity, sort },
    pagination: { page, pageSize, total: partners.length, pageCount },
    partners: partners.slice((page - 1) * pageSize, page * pageSize),
  });
}

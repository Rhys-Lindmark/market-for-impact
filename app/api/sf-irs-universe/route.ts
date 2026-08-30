import { NextResponse } from 'next/server';
import snapshot from '@/data/san-francisco/irs-exempt-universe-v1.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();
  const ntee = searchParams.get('ntee') ?? 'all';
  const subsection = searchParams.get('subsection') ?? 'all';
  const identity = searchParams.get('identity') ?? 'all';
  const sort = searchParams.get('sort') ?? 'revenue';
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 12)));
  const requestedPage = Math.max(1, Number(searchParams.get('page') ?? 1));
  const organizations = snapshot.organizations.filter((row) => {
    const searchable = `${row.name} ${row.ein} ${row.address.street ?? ''} ${row.address.zip ?? ''} ${row.nteeCode ?? ''} ${row.nteeGroup}`.toLowerCase();
    const identityMatch = identity === 'all' || (identity === 'scorecard' && row.scorecardKey !== null) || (identity === 'contract' && row.exactContractSourceName !== null) || (identity === 'unlinked' && row.scorecardKey === null && row.exactContractSourceName === null);
    return searchable.includes(query) && (ntee === 'all' || row.nteeGroupKey === ntee) && (subsection === 'all' || row.subsectionCode === subsection) && identityMatch;
  }).sort((a, b) => sort === 'alphabetical' ? a.name.localeCompare(b.name) || a.ein.localeCompare(b.ein) : (b.revenueAmountUsd ?? -1) - (a.revenueAmountUsd ?? -1) || a.name.localeCompare(b.name));
  const pageCount = Math.max(1, Math.ceil(organizations.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  return NextResponse.json({
    version: snapshot.version, generatedAt: snapshot.generatedAt, geography: snapshot.geography,
    source: snapshot.source, summary: snapshot.summary, groups: snapshot.groups, subsections: snapshot.subsections,
    interpretation: snapshot.interpretation,
    filters: { query, ntee, subsection, identity, sort },
    pagination: { page, pageSize, total: organizations.length, pageCount },
    organizations: organizations.slice((page - 1) * pageSize, page * pageSize)
  });
}

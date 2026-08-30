import { getGrantFlows, type GrantFlowQuery } from '@/db/grant-flows';

const MAX_PAGE_SIZE = 24;
const positiveInteger = (value: string | null, fallback: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const yearValue = params.get('year');
    const restriction = params.get('restriction');
    const query: GrantFlowQuery = {
      source: params.get('source')?.slice(0, 40) || 'coefficient',
      year: yearValue && /^20\d{2}$/.test(yearValue) ? Number(yearValue) : null,
      cause: params.get('cause')?.slice(0, 120) || '',
      geography: params.get('geography')?.slice(0, 120) || '',
      status: params.get('status')?.slice(0, 180) || '',
      restriction: restriction === 'restricted' || restriction === 'unrestricted' || restriction === 'not-published' ? restriction : '',
      query: params.get('q')?.trim().slice(0, 120) || '',
      sort: params.get('sort') === 'largest' ? 'largest' : 'recent',
      page: positiveInteger(params.get('page'), 1, 10_000),
      pageSize: positiveInteger(params.get('pageSize'), 10, MAX_PAGE_SIZE),
    };
    return Response.json(await getGrantFlows(query), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Grant-flow explorer failed', error);
    return Response.json({ error: 'The grant-flow explorer is temporarily unavailable.' }, { status: 503 });
  }
}

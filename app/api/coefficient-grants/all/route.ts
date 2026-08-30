import { getAllCoefficientGrants, type CoefficientGrantQuery } from '@/db/coefficient-all';

const MAX_PAGE_SIZE = 24;

function positiveInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const yearValue = params.get('year');
    const year = yearValue && /^20\d{2}$/.test(yearValue) ? Number(yearValue) : null;
    const sort = params.get('sort') === 'largest' ? 'largest' : 'recent';
    const query: CoefficientGrantQuery = {
      fund: params.get('fund')?.slice(0, 120) || null,
      year,
      query: params.get('q')?.trim().slice(0, 120) || '',
      sort,
      page: positiveInteger(params.get('page'), 1, 10_000),
      pageSize: positiveInteger(params.get('pageSize'), 12, MAX_PAGE_SIZE),
    };
    return Response.json(await getAllCoefficientGrants(query), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Complete Coefficient grant explorer failed', error);
    return Response.json({ error: 'The complete grant ledger is temporarily unavailable.' }, { status: 503 });
  }
}

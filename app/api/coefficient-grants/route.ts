import { getCoefficientGrantMarket } from '@/db/coefficient';

export async function GET() {
  try {
    return Response.json(await getCoefficientGrantMarket(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Coefficient grant market failed', error);
    return Response.json({ error: 'Grant ledger is temporarily unavailable.' }, { status: 503 });
  }
}

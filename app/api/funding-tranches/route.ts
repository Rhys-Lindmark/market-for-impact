import { getFundingTranches } from '@/db/funding-tranches';

export async function GET() {
  try {
    return Response.json(await getFundingTranches(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Funding-tranche market failed', error);
    return Response.json({ error: 'The funding-tranche market is temporarily unavailable.' }, { status: 503 });
  }
}

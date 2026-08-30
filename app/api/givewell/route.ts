import { getGiveWellMarket } from '@/db/givewell';

export async function GET() {
  try {
    return Response.json(await getGiveWellMarket(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('GiveWell market failed', error);
    return Response.json({ error: 'The GiveWell market is temporarily unavailable.' }, { status: 503 });
  }
}

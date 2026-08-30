import { getRenPhilMarket } from '@/db/renphil';

export async function GET() {
  try {
    return Response.json(await getRenPhilMarket(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('RenPhil market failed', error);
    return Response.json({ error: 'The Renaissance Philanthropy market is temporarily unavailable.' }, { status: 503 });
  }
}

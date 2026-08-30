import { getGiveDirectlyBenchmark } from '@/db/givedirectly';

export async function GET() {
  try {
    return Response.json(await getGiveDirectlyBenchmark(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('GiveDirectly benchmark failed', error);
    return Response.json({ error: 'The GiveDirectly benchmark is temporarily unavailable.' }, { status: 503 });
  }
}

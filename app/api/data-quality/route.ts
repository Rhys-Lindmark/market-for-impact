import { getDataQualityDashboard } from '@/db/data-quality';

export async function GET() {
  try {
    return Response.json(await getDataQualityDashboard(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Data-quality dashboard failed', error);
    return Response.json({ error: 'The data-quality dashboard is temporarily unavailable.' }, { status: 503 });
  }
}

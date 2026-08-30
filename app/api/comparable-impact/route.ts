import { getComparableImpact } from '@/db/comparable-impact';

export async function GET() {
  try {
    return Response.json(await getComparableImpact(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Comparable-impact model failed', error);
    return Response.json({ error: 'The comparable-impact model is temporarily unavailable.' }, { status: 503 });
  }
}

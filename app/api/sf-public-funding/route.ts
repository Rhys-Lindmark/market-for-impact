import { getSfPublicFunding } from '@/db/sf-public-funding';

export async function GET() {
  try {
    return Response.json(await getSfPublicFunding(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('San Francisco public-funding baseline failed', error);
    return Response.json({ error: 'The San Francisco public-funding baseline is temporarily unavailable.' }, { status: 503 });
  }
}

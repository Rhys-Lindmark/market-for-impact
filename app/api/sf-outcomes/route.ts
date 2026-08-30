import { getSfOutcomeOntology } from '@/db/sf-outcomes';

export async function GET() {
  try {
    return Response.json(await getSfOutcomeOntology(), {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('San Francisco outcome ontology failed', error);
    return Response.json({ error: 'The San Francisco outcome ontology is temporarily unavailable.' }, { status: 503 });
  }
}

import { getAceMarket } from '@/db/ace';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await getAceMarket());
  } catch (error) {
    console.error('ACE market failed', error);
    return Response.json({ error: 'ACE market unavailable' }, { status: 500 });
  }
}

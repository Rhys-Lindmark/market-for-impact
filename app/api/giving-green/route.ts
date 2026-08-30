import { getGivingGreenMarket } from '@/db/giving-green';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await getGivingGreenMarket());
  } catch (error) {
    console.error('Giving Green market failed', error);
    return Response.json({ error: 'Giving Green market unavailable' }, { status: 500 });
  }
}


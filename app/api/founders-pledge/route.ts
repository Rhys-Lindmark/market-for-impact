import { getFoundersPledgeMatrix } from '@/db/founders-pledge';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await getFoundersPledgeMatrix());
  } catch (error) {
    console.error('Founders Pledge matrix failed', error);
    return Response.json({ error: 'Founders Pledge matrix unavailable' }, { status: 500 });
  }
}

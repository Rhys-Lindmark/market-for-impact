import { getAiSafetyEcosystem } from '@/db/ai-safety';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await getAiSafetyEcosystem());
  } catch (error) {
    console.error('AI safety ecosystem failed', error);
    return Response.json({ error: 'AI safety ecosystem unavailable' }, { status: 500 });
  }
}

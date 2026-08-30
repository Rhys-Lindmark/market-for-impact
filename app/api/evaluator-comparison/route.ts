import { getEvaluatorComparison } from '@/db/evaluator-comparison';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await getEvaluatorComparison());
  } catch (error) {
    console.error('Evaluator comparison failed', error);
    return Response.json({ error: 'Evaluator comparison unavailable' }, { status: 500 });
  }
}

import model from '@/data/san-francisco/jcyc-myeep-cea-v1.json';
import { youthJobsDecisionModel } from '@/lib/youth-jobs-model.mjs';
export function GET() {
  return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...youthJobsDecisionModel(s) })) });
}

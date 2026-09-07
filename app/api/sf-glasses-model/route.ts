import model from '@/data/san-francisco/phc-glasses-cea-v1.json';
import { glassesDecisionModel } from '@/lib/glasses-model.mjs';

export function GET() {
  return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...glassesDecisionModel(s) })) });
}

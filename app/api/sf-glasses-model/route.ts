import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/phc-glasses-cea-v1.json';
import { glassesDecisionModel } from '@/lib/glasses-model.mjs';

export function GET() {
  return Response.json(withImpactDisplay({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...glassesDecisionModel(s) })) }));
}

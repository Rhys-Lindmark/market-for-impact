import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/sfchc-hcv-cea-v1.json';
import { hcvAccessModel } from '@/lib/hcv-access-model.mjs';
export function GET() {
  return Response.json(withImpactDisplay({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...hcvAccessModel(s) })) }));
}

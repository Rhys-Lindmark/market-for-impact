import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/dope-site-cea-v1.json';
import { dopeSiteModel } from '@/lib/dope-site-model.mjs';

export function GET() {
  return Response.json(withImpactDisplay({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...dopeSiteModel(s) })) }));
}

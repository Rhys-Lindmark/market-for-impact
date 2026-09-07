import model from '@/data/san-francisco/dope-site-cea-v1.json';
import { dopeSiteModel } from '@/lib/dope-site-model.mjs';

export function GET() {
  return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...dopeSiteModel(s) })) });
}

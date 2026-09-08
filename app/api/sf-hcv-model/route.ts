import model from '@/data/san-francisco/sfchc-hcv-cea-v1.json';
import { hcvAccessModel } from '@/lib/hcv-access-model.mjs';
export function GET() {
  return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...hcvAccessModel(s) })) });
}

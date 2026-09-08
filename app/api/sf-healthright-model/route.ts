import model from '@/data/san-francisco/healthright-moud-cea-v1.json';
import { moudAccessModel } from '@/lib/moud-access-model.mjs';
export function GET() {
  return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...moudAccessModel(s) })) });
}

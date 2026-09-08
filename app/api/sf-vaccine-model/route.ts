import data from '@/data/san-francisco/sffc-vaccine-cea-v1.json';
import { vaccineAccessModel } from '@/lib/vaccine-access-model.mjs';
export function GET() { return Response.json({ ...data, evaluatedScenarios: data.scenarios.map(s => ({ ...s, ...vaccineAccessModel(s) })) }); }

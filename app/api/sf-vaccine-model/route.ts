import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import data from '@/data/san-francisco/sffc-vaccine-cea-v1.json';
import { vaccineAccessModel } from '@/lib/vaccine-access-model.mjs';
export function GET() { return Response.json(withImpactDisplay({ ...data, evaluatedScenarios: data.scenarios.map(s => ({ ...s, ...vaccineAccessModel(s) })) })); }

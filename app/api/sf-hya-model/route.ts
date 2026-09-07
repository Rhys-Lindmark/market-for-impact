import model from '@/data/san-francisco/hya-medication-access-cea-v1.json';
import { medicationAccessModel } from '@/lib/medication-access-model.mjs';
export function GET() { return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...medicationAccessModel(s) })) }); }

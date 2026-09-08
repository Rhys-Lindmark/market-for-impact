import model from '@/data/san-francisco/nems-hbv-cea-v1.json';
import { hbvRetentionModel } from '@/lib/hbv-retention-model.mjs';
export function GET() { return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...hbvRetentionModel(s) })) }); }

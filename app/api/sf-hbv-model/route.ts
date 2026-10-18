import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/nems-hbv-cea-v1.json';
import { hbvRetentionModel } from '@/lib/hbv-retention-model.mjs';
export function GET() { return Response.json(withImpactDisplay({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...hbvRetentionModel(s) })) })); }

import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/hrtc-therapy-cea-v1.json';
import { therapyDecisionModel } from '@/lib/therapy-model.mjs';
export function GET() { return Response.json(withImpactDisplay({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...therapyDecisionModel(s) })) })); }

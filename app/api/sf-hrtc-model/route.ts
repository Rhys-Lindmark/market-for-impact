import model from '@/data/san-francisco/hrtc-therapy-cea-v1.json';
import { therapyDecisionModel } from '@/lib/therapy-model.mjs';
export function GET() { return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...therapyDecisionModel(s) })) }); }

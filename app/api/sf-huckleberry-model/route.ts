import model from '@/data/san-francisco/huckleberry-counseling-cea-v1.json';
import { directQalyModel } from '@/lib/direct-qaly-model.mjs';
export function GET() { return Response.json({ ...model, evaluatedScenarios: model.scenarios.map(s => ({ ...s, ...directQalyModel(s) })) }); }

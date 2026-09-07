import model from '@/data/san-francisco/sfaf-naloxone-cea-v1.json';
import { discountedSurvivalQalys, naloxoneDecisionModel } from '@/lib/naloxone-model.mjs';

export function GET() {
  return Response.json({
    ...model,
    evaluatedScenarios: model.scenarios.map((s) => {
      const qalysPerDeathPrevented = discountedSurvivalQalys(s);
      return { ...s, qalysPerDeathPrevented, ...naloxoneDecisionModel({ ...s, reportedReversals: model.reported.reversals, distributedDoses: model.reported.doses, qalysPerDeathPrevented }) };
    }),
  });
}

import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/sfaf-naloxone-cea-v1.json';
import { discountedSurvivalQalys, naloxoneDecisionModel } from '@/lib/naloxone-model.mjs';

export function GET() {
  return Response.json(withImpactDisplay({
    ...model,
    evaluatedScenarios: model.scenarios.map((s) => {
      const qalysPerDeathPrevented = discountedSurvivalQalys(s);
      return { ...s, qalysPerDeathPrevented, ...naloxoneDecisionModel({ ...s, reportedReversals: model.reported.reversals, distributedDoses: model.reported.doses, qalysPerDeathPrevented }) };
    }),
  }));
}

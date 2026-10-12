import {withImpactDisplay} from '@/lib/impact-metric.mjs';
import model from '@/data/san-francisco/edc-qaly-decision-v2.json';

export function GET() {
  return Response.json(withImpactDisplay({
    ...model,
    evaluatedScenarios: model.scenarios.map((s) => {
      const qalysPerOutcome = s.affectedAdults * s.healthRelevantDisplacementShare * s.utilityGain * s.durationYears * s.donorAdditionality;
      return { ...s, qalysPerOutcome, costPerTenQalys: qalysPerOutcome > 0 ? 10 * s.costPerOutcomeUsd / qalysPerOutcome : null };
    }),
  }));
}

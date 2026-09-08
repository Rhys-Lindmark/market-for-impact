import hcv from '../data/san-francisco/sfchc-hcv-cea-v1.json' with { type: 'json' };
import { hcvAccessModel } from './hcv-access-model.mjs';
import healthright from '../data/san-francisco/healthright-moud-cea-v1.json' with { type: 'json' };
import { moudAccessModel } from './moud-access-model.mjs';
import dope from '../data/san-francisco/dope-site-cea-v1.json' with { type: 'json' };
import { dopeSiteModel } from './dope-site-model.mjs';
import registry from '../data/san-francisco/city-registry-v1.json' with { type: 'json' };
import naloxone from '../data/san-francisco/sfaf-naloxone-cea-v1.json' with { type: 'json' };
import glasses from '../data/san-francisco/phc-glasses-cea-v1.json' with { type: 'json' };
import { discountedSurvivalQalys, naloxoneDecisionModel } from './naloxone-model.mjs';
import { glassesDecisionModel } from './glasses-model.mjs';

function scenarioRow(slug, model, calculate) {
  const central = model.scenarios.find(s => /central/i.test(s.name));
  if (!central) throw new Error(`Missing central scenario: ${slug}`);
  const result = calculate(central);
  const positive = model.scenarios.map(calculate).map(s => s.costPerTenQalys).filter(v => Number.isFinite(v) && v > 0);
  return { slug, organization: model.organization, centralUsdPerTenQalys: result.costPerTenQalys,
    positiveEffectRangeUsd: { low: Math.min(...positive), high: Math.max(...positive) } };
}

// Rank the central estimate, never the optimistic case or a formatted price.
// A common denominator does not remove different cost scopes or evidence quality.
export const researchCostRanking = [
  ...registry.rows,
  scenarioRow('san-francisco-community-health-center', hcv, hcvAccessModel),
  scenarioRow('healthright-360', healthright, moudAccessModel),
  scenarioRow('national-harm-reduction-coalition', dope, dopeSiteModel),
  scenarioRow('san-francisco-aids-foundation', naloxone, s => naloxoneDecisionModel({ ...s, reportedReversals: naloxone.reported.reversals, distributedDoses: naloxone.reported.doses, qalysPerDeathPrevented: discountedSurvivalQalys(s) })),
  scenarioRow('project-homeless-connect', glasses, glassesDecisionModel),
].sort((a, b) => (a.centralUsdPerTenQalys ?? Infinity) - (b.centralUsdPerTenQalys ?? Infinity) || a.organization.localeCompare(b.organization));

export const researchRankBySlug = new Map(researchCostRanking.map((row, index) => [row.slug, { ...row, rank: index + 1 }]));

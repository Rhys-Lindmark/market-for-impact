import { discountedSurvivalQalys } from './naloxone-model.mjs';

/** Hypothetical added site-year; not a measured DOPE mortality effect. */
export function dopeSiteModel(s) {
  const { annualCost, residentYears, annualOverdoseRisk, opioidResponsiveShare, relativeRiskReduction, fundingAdditionality, responderHarmQalys = 0 } = s;
  for (const [key, value] of Object.entries({ annualCost, residentYears, annualOverdoseRisk, opioidResponsiveShare, fundingAdditionality, responderHarmQalys })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(key + ' must be finite and nonnegative');
  }
  if (annualCost === 0 || annualOverdoseRisk > 1 || opioidResponsiveShare > 1 || fundingAdditionality > 1 || !Number.isFinite(relativeRiskReduction) || relativeRiskReduction < -1 || relativeRiskReduction > 1) throw new RangeError('Invalid cost or probability');
  const qalysPerDeathPrevented = discountedSurvivalQalys(s);
  if (annualOverdoseRisk * (1 - opioidResponsiveShare * relativeRiskReduction) > 1) throw new RangeError('Implied annual fatality probability exceeds one');
  const baselineResponsiveDeaths = residentYears * annualOverdoseRisk * opioidResponsiveShare;
  const additionalDeathsPrevented = baselineResponsiveDeaths * relativeRiskReduction * fundingAdditionality;
  const grossQalys = additionalDeathsPrevented * qalysPerDeathPrevented;
  const netQalys = grossQalys - responderHarmQalys;
  const requiredNetQalysFor100k = annualCost / 10000;
  const requiredDeathsFor100k = qalysPerDeathPrevented > 0 ? (requiredNetQalysFor100k + responderHarmQalys) / qalysPerDeathPrevented : null;
  const denominator = baselineResponsiveDeaths * fundingAdditionality;
  return { qalysPerDeathPrevented, baselineResponsiveDeaths, additionalDeathsPrevented, grossQalys, netQalys,
    costPerQaly: netQalys > 0 ? annualCost / netQalys : null,
    costPerTenQalys: netQalys > 0 ? 10 * annualCost / netQalys : null,
    requiredNetQalysFor100k, requiredDeathsFor100k,
    requiredRelativeRiskReductionFor100k: denominator > 0 && requiredDeathsFor100k !== null ? requiredDeathsFor100k / denominator : null,
    additionalQalysPer100k: 100000 / annualCost * netQalys };
}

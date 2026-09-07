/** Decision model, not measured program effectiveness. All time quantities are years. */
export function discountedSurvivalQalys({ utility, annualHazard, horizonYears, discountRate }) {
  for (const [key, value] of Object.entries({ utility, annualHazard, horizonYears, discountRate })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${key} must be finite and nonnegative`);
  }
  if (utility > 1) throw new RangeError('utility must not exceed one');
  // Continuous survival hazard; effective annual financial/health discount rate.
  const rate = annualHazard + Math.log1p(discountRate);
  return utility * (rate === 0 ? horizonYears : -Math.expm1(-rate * horizonYears) / rate);
}

export function naloxoneDecisionModel({ costPerDose, reportedReversals, distributedDoses, marginalYieldRetention, additionalSurvivalPerReversal, qalysPerDeathPrevented, giftUsd = 100000 }) {
  for (const [key, value] of Object.entries({ costPerDose, reportedReversals, distributedDoses, marginalYieldRetention, additionalSurvivalPerReversal, qalysPerDeathPrevented, giftUsd })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${key} must be finite and nonnegative`);
  }
  if (costPerDose === 0 || distributedDoses === 0) throw new RangeError('Cost and distributed doses must be positive');
  if (marginalYieldRetention > 1 || additionalSurvivalPerReversal > 1) throw new RangeError('Probability and retention must not exceed one');
  const reportedYield = reportedReversals / distributedDoses;
  const incrementalDeathsPreventedPerDose = reportedYield * marginalYieldRetention * additionalSurvivalPerReversal;
  const incrementalQalysPerDose = incrementalDeathsPreventedPerDose * qalysPerDeathPrevented;
  return {
    reportedYield,
    incrementalDeathsPreventedPerDose,
    incrementalQalysPerDose,
    costPerQaly: incrementalQalysPerDose > 0 ? costPerDose / incrementalQalysPerDose : null,
    costPerTenQalys: incrementalQalysPerDose > 0 ? 10 * costPerDose / incrementalQalysPerDose : null,
    additionalDoses: giftUsd / costPerDose,
    additionalDeathsPrevented: giftUsd / costPerDose * incrementalDeathsPreventedPerDose,
    additionalQalys: giftUsd / costPerDose * incrementalQalysPerDose,
    finitePrice: incrementalQalysPerDose > 0,
  };
}

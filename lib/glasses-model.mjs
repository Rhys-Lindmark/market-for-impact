/** A donor-budget scenario, not an empirical estimate of PHC effectiveness. */
export function glassesDecisionModel({ costPerDispensedPair, utilityGain, effectiveUseYears, additionality, giftUsd = 100000 }) {
  for (const [key, value] of Object.entries({ costPerDispensedPair, utilityGain, effectiveUseYears, additionality, giftUsd })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(key + ' must be finite and nonnegative');
  }
  if (costPerDispensedPair === 0 || utilityGain > 1 || additionality > 1 || effectiveUseYears > 1) throw new RangeError('Invalid cost, probability or one-year horizon');
  const qalysPerPair = utilityGain * effectiveUseYears * additionality;
  const fundedPairs = giftUsd / costPerDispensedPair;
  return {
    qalysPerPair, fundedPairs, additionalQalys: fundedPairs * qalysPerPair,
    costPerQaly: qalysPerPair > 0 ? costPerDispensedPair / qalysPerPair : null,
    costPerTenQalys: qalysPerPair > 0 ? 10 * costPerDispensedPair / qalysPerPair : null,
    maximumCostFor100k: 10000 * qalysPerPair,
  };
}

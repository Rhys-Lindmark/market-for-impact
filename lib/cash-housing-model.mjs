/** A donor-cost, housing-mediated health scenario, not an estimator of trial effects. */
export function cashHousingModel({cashUsd, supportUsd, additionalHousingYears, utilityGain, additionality, horizonYears = 2.5, giftUsd = 100000}) {
  for (const [key, value] of Object.entries({cashUsd, supportUsd, additionalHousingYears, utilityGain, additionality, horizonYears, giftUsd})) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${key} must be finite and nonnegative`);
  }
  const costPerParticipant = cashUsd + supportUsd;
  if (costPerParticipant <= 0 || horizonYears <= 0 || additionalHousingYears > horizonYears || utilityGain > 1 || additionality > 1) throw new RangeError('Positive cost/horizon and bounded health inputs required');
  const incrementalQalys = additionalHousingYears * utilityGain * additionality;
  return {costPerParticipant, incrementalQalys, costPerTenQalys: incrementalQalys > 0 ? 10 * costPerParticipant / incrementalQalys : null, additionalQalys: giftUsd / costPerParticipant * incrementalQalys, qalysNeededForSub100k: costPerParticipant / 10000, cashOnlyMaxHealthFloor: 10 * cashUsd / horizonYears};
}

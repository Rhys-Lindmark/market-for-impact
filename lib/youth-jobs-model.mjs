/** Mortality-only transfer from a cumulative, participation-scaled experiment. */
export function youthJobsDecisionModel({ costPerSlot, mortalityReduction, transferRetention, additionality, qalysPerDeath, giftUsd = 100000 }) {
  for (const [key, value] of Object.entries({ costPerSlot, mortalityReduction, transferRetention, additionality, qalysPerDeath, giftUsd })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(key + ' must be finite and nonnegative');
  }
  if (costPerSlot === 0 || mortalityReduction > 1 || transferRetention > 1 || additionality > 1) throw new RangeError('Invalid cost or probability');
  const deathsPreventedPerSlot = mortalityReduction * transferRetention * additionality;
  const qalysPerSlot = deathsPreventedPerSlot * qalysPerDeath;
  return { deathsPreventedPerSlot, qalysPerSlot, fundedSlots: giftUsd / costPerSlot, additionalQalys: giftUsd / costPerSlot * qalysPerSlot, costPerTenQalys: qalysPerSlot > 0 ? 10 * costPerSlot / qalysPerSlot : null };
}

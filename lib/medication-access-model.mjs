/** Small-risk mortality approximation for additional medication-covered time. */
export function medicationAccessModel({ costPerSupportedInitiation, additionality, coveredYears, untreatedAnnualMortality, mortalityHazardRatio, transferRetention, qalysPerDeath, giftUsd = 100000 }) {
  for (const [key, value] of Object.entries({ costPerSupportedInitiation, additionality, coveredYears, untreatedAnnualMortality, mortalityHazardRatio, transferRetention, qalysPerDeath, giftUsd })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(key + ' must be finite and nonnegative');
  }
  if (!costPerSupportedInitiation || additionality > 1 || coveredYears > 1 || mortalityHazardRatio > 1 || transferRetention > 1 || untreatedAnnualMortality > 1) throw new RangeError('Invalid cost, rate or one-year coverage');
  const deathsPreventedPerSupportedInitiation = additionality * coveredYears * untreatedAnnualMortality * (1 - mortalityHazardRatio) * transferRetention;
  const qalysPerSupportedInitiation = deathsPreventedPerSupportedInitiation * qalysPerDeath;
  return { deathsPreventedPerSupportedInitiation, qalysPerSupportedInitiation, supportedInitiations: giftUsd / costPerSupportedInitiation, additionalQalys: giftUsd / costPerSupportedInitiation * qalysPerSupportedInitiation, costPerTenQalys: qalysPerSupportedInitiation > 0 ? 10 * costPerSupportedInitiation / qalysPerSupportedInitiation : null };
}

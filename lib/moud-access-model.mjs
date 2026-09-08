import { discountedSurvivalQalys } from './naloxone-model.mjs';

/** Two-year added clinical capacity scenario; not a provider effect estimate. */
export function moudAccessModel(s) {
  const keys = ['firstYearCost', 'secondYearCost', 'costMultiplier', 'clinicPatients', 'medicationYearsPer10000', 'accessTransfer', 'fundingAdditionality', 'buprenorphineShare', 'mortalityOut', 'mortalityIn', 'causalRetention', 'extraDeaths', 'drugCostPerMedicationYear', 'donorDrugShare', 'benefitDelayYears'];
  for (const k of keys) if (!Number.isFinite(s[k]) || s[k] < 0) throw new RangeError(k + ' must be finite and nonnegative');
  for (const k of ['accessTransfer', 'fundingAdditionality', 'buprenorphineShare', 'causalRetention', 'donorDrugShare']) if (s[k] > 1) throw new RangeError(k + ' exceeds one');
  if (s.firstYearCost + s.secondYearCost <= 0 || s.costMultiplier <= 0) throw new RangeError('Positive capacity cost required');
  if (!Number.isFinite(s.nonfatalUtilityGain) || Math.abs(s.nonfatalUtilityGain) > 1) throw new RangeError('Invalid incremental utility');
  const survivalQalys = discountedSurvivalQalys(s);
  const trialMedicationYears = s.clinicPatients / 10000 * s.medicationYearsPer10000;
  const localMedicationYears = trialMedicationYears * s.accessTransfer;
  const additionalBuprenorphineYears = localMedicationYears * s.buprenorphineShare * s.fundingAdditionality;
  const deathsPrevented = additionalBuprenorphineYears * (s.mortalityOut - s.mortalityIn) * s.causalRetention - s.extraDeaths;
  const presentQalysPerDeath = survivalQalys / (1 + s.discountRate) ** s.benefitDelayYears;
  const mortalityQalys = deathsPrevented * presentQalysPerDeath;
  const nonfatalQalys = additionalBuprenorphineYears * s.nonfatalUtilityGain / (1 + s.discountRate) ** s.benefitDelayYears;
  const netQalys = mortalityQalys + nonfatalQalys;
  const capacityCost = (s.firstYearCost + s.secondYearCost) * s.costMultiplier;
  const incrementalDrugResourceCost = localMedicationYears * s.drugCostPerMedicationYear;
  const donorCost = capacityCost + incrementalDrugResourceCost * s.donorDrugShare;
  const resourceCost = capacityCost + incrementalDrugResourceCost;
  const qPerAdditionalBupYear = (s.mortalityOut - s.mortalityIn) * s.causalRetention * presentQalysPerDeath + s.nonfatalUtilityGain / (1 + s.discountRate) ** s.benefitDelayYears;
  return { trialMedicationYears, localMedicationYears, additionalBuprenorphineYears, deathsPrevented, survivalQalys, presentQalysPerDeath, mortalityQalys, nonfatalQalys, netQalys, capacityCost, incrementalDrugResourceCost, donorCost, resourceCost,
    costPerQaly: netQalys > 0 ? donorCost / netQalys : null,
    costPerTenQalys: netQalys > 0 ? 10 * donorCost / netQalys : null,
    resourceCostPerTenQalys: netQalys > 0 ? 10 * resourceCost / netQalys : null,
    qalysPer100k: 100000 * netQalys / donorCost,
    maximumDonorCostFor100k: netQalys > 0 ? 10000 * netQalys : null,
    requiredAdditionalBupYearsFor100k: qPerAdditionalBupYear > 0 ? (donorCost / 10000 + s.extraDeaths * presentQalysPerDeath) / qPerAdditionalBupYear : null };
}

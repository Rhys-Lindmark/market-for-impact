/** Exploratory integrated-care expansion; not a provider-reported effect or funding quote. */
export function hcvAccessModel(s) {
  const positive = ['costPerEnrollee2020', 'costMultiplier', 'plannedEnrollees', 'referenceQalysPerCure', 'horizonYears'];
  const nonnegative = ['startup2020', 'downtime2020', 'reinfectionHazard', 'excessMortalityHazard', 'laterCureYears', 'discountRate', 'benefitShape', 'drugCostPerStart', 'harmQalysPerEnrollee'];
  const probabilities = ['downtimeShare', 'accessTransfer', 'fundingAdditionality', 'laterCureProbability', 'donorDrugShare'];
  for (const k of [...positive, ...nonnegative, ...probabilities]) if (!Number.isFinite(s[k]) || s[k] < 0 || (positive.includes(k) && s[k] === 0) || (probabilities.includes(k) && s[k] > 1)) throw new RangeError('Invalid ' + k);
  if (!Number.isInteger(s.horizonYears) || s.horizonYears > 100) throw new RangeError('Invalid horizon');
  // Efficacy excludes two ineligible intervention enrollees; costs retain their resources.
  const trialCureDifference = 55 / 82 - 19 / 83;
  const trialStartDifference = 64 / 82 - 22 / 83;
  const addedCures = trialCureDifference * s.accessTransfer * s.fundingAdditionality;
  let referenceWeight = 0;
  let retainedWeight = 0;
  const healthYears = [];
  for (let year = 1; year <= s.horizonYears; year++) {
    const weight = year ** s.benefitShape / (1 + s.discountRate) ** year;
    // No remaining incremental credit once the counterfactual patient is cured.
    const catchupRetention = year > s.laterCureYears ? 1 - s.laterCureProbability : 1;
    const retained = weight * Math.exp(-(s.reinfectionHazard + s.excessMortalityHazard) * year) * catchupRetention;
    referenceWeight += weight;
    retainedWeight += retained;
    healthYears.push({ year, referenceWeight: weight, retainedWeight: retained });
  }
  const healthRetention = retainedWeight / referenceWeight;
  const netQalysPerCure = s.referenceQalysPerCure * healthRetention;
  const netQalys = addedCures * netQalysPerCure - s.harmQalysPerEnrollee;
  const clinicalCost = ((s.costPerEnrollee2020 + s.downtime2020 * s.downtimeShare) * 84 / 82 + s.startup2020 / s.plannedEnrollees) * s.costMultiplier;
  // Gross package resource sensitivity before funding displacement, not gift-attributable net spending.
  const addedDrugResourceCost = trialStartDifference * s.accessTransfer * s.drugCostPerStart;
  const donorCost = clinicalCost + addedDrugResourceCost * s.donorDrugShare;
  const resourceCost = clinicalCost + addedDrugResourceCost;
  return { trialCureDifference, trialStartDifference, addedCures, healthRetention, netQalysPerCure, netQalys, clinicalCost, addedDrugResourceCost, donorCost, resourceCost, healthYears,
    costPerQaly: netQalys > 0 ? donorCost / netQalys : null,
    costPerTenQalys: netQalys > 0 ? 10 * donorCost / netQalys : null,
    resourceCostPerTenQalys: netQalys > 0 ? 10 * resourceCost / netQalys : null,
    qalysPer100k: 100000 * netQalys / donorCost,
    maximumDonorCostFor100k: netQalys > 0 ? 10000 * netQalys : null };
}

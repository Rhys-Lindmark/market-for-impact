/** Judgmental calibration to a published lifetime model, NOT a Markov reconstruction. */
export function hbvRetentionModel(s) {
  const positive = ['panelSize', 'costMultiplier', 'referenceYears'];
  const nonnegative = ['navigatorAnnual', 'supervisionAnnual', 'analystFirstYear', 'analystLaterYear', 'fundedYears', 'discountRate', 'benefitShape', 'harmQalysPerPerson'];
  const fractions = ['localMonitoringIncrement', 'causalTransfer', 'fundingAdditionality'];
  for (const key of [...positive, ...nonnegative, ...fractions]) {
    if (!Number.isFinite(s[key]) || s[key] < 0 || (positive.includes(key) && s[key] === 0) || (fractions.includes(key) && s[key] > 1)) throw new RangeError('Invalid ' + key);
  }
  if (!Number.isInteger(s.referenceYears) || !Number.isInteger(s.fundedYears) || s.referenceYears > 100 || s.fundedYears > s.referenceYears) throw new RangeError('Invalid years');
  const referenceQalys = (1871632 - 1854238) / 100000;
  const referenceMonitoringIncrement = 0.6535 - 0.37;
  let referenceWeight = 0;
  let creditedWeight = 0;
  let donorCost = 0;
  const years = [];
  for (let year = 1; year <= s.referenceYears; year++) {
    const discount = (1 + s.discountRate) ** year;
    const weight = year ** s.benefitShape / discount;
    const funded = year <= s.fundedYears;
    // Closed initial cohort: full fixed capacity is charged despite attrition; no replacement patients counted.
    const cost = funded ? (s.navigatorAnnual + s.supervisionAnnual + (year === 1 ? s.analystFirstYear : s.analystLaterYear)) * s.costMultiplier / s.panelSize / discount : 0;
    referenceWeight += weight;
    creditedWeight += funded ? weight : 0;
    donorCost += cost;
    years.push({ year, referenceWeight: weight, creditedWeight: funded ? weight : 0, discountedDonorCostPerPerson: cost });
  }
  const timingFraction = creditedWeight / referenceWeight;
  // Normalize allocation of an ALREADY discounted total; never discount that total a second time.
  const grossQalys = referenceQalys * s.localMonitoringIncrement / referenceMonitoringIncrement * s.causalTransfer * s.fundingAdditionality * timingFraction;
  const netQalys = grossQalys - s.harmQalysPerPerson;
  return { referenceQalys, referenceMonitoringIncrement, timingFraction, donorCost, grossQalys, netQalys, years,
    costPerQaly: netQalys > 0 ? donorCost / netQalys : null,
    costPerTenQalys: netQalys > 0 ? 10 * donorCost / netQalys : null,
    qalysPer100k: donorCost > 0 ? 100000 * netQalys / donorCost : null,
    maximumDonorCostFor100k: netQalys > 0 ? 10000 * netQalys : null };
}

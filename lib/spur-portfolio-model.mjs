// Output-years already include calendar discounting and comparator catch-up.
// SF and rest-of-Bay are beneficiary allocation judgments, not inferred from addresses.
export function spurPortfolioModel(s, donorCostUsd = 100000, resourceStressAdditionalUsd = 1000000) {
  const {housing: h, transit: t, heat: e, donorSpecificHarm: harm} = s;
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  if (![donorCostUsd, resourceStressAdditionalUsd].every(n => finite(n) && n >= 0)) throw new RangeError('Invalid cost');
  for (const inputs of [h, t, e, harm]) {
    if (!inputs || !Object.values(inputs).every(finite)) throw new RangeError('Nonfinite or missing model input');
  }
  if (t.tripsPerRecurrentRiderYear <= 0) throw new RangeError('Invalid rider-year denominator');
  for (const share of [h.netGiftContribution, h.improvedStateFraction, t.netGiftContribution, t.healthRelevantFraction, e.conditionalRegionalExposureFraction, e.implementationProbability, e.giftAttribution, e.sfHealthShare]) {
    if (share < 0 || share > 1) throw new RangeError('Invalid share');
  }
  for (const quantity of [h.conditionalSfOccupiedHomeYears,h.conditionalRestBayOccupiedHomeYears,h.peoplePerDirectHomeYear,h.spilloverHouseholdYearsPerHomeYear,h.adultsPerSpilloverHousehold,t.conditionalSfUsefulServiceHours,t.conditionalRestBayUsefulServiceHours,t.marginalTripsPerServiceHour,e.effectiveDiscountedMortalityYears,e.modeledRegionalDeathsPerYear,e.qalyPerDeath,harm.sfQaly,harm.restBayQaly]) {
    if (quantity < 0) throw new RangeError('Invalid nonnegative quantity');
  }
  const housingPerYear = h.netGiftContribution * (h.peoplePerDirectHomeYear * h.improvedStateFraction * h.directUtility + h.spilloverHouseholdYearsPerHomeYear * h.adultsPerSpilloverHousehold * h.spilloverUtility);
  const transitPerHour = t.netGiftContribution * t.marginalTripsPerServiceHour / t.tripsPerRecurrentRiderYear * t.healthRelevantFraction * t.netQalyPerChangedRiderYear;
  const heatBay = e.conditionalRegionalExposureFraction * e.implementationProbability * e.giftAttribution * e.effectiveDiscountedMortalityYears * e.modeledRegionalDeathsPerYear * e.qalyPerDeath;
  const housingSfQaly = h.conditionalSfOccupiedHomeYears * housingPerYear;
  const housingRestBayQaly = h.conditionalRestBayOccupiedHomeYears * housingPerYear;
  const transitSfQaly = t.conditionalSfUsefulServiceHours * transitPerHour;
  const transitRestBayQaly = t.conditionalRestBayUsefulServiceHours * transitPerHour;
  const heatSfQaly = heatBay * e.sfHealthShare;
  const heatRestBayQaly = heatBay * (1-e.sfHealthShare);
  const sfNetQaly = housingSfQaly + transitSfQaly + heatSfQaly - harm.sfQaly;
  const restBayNetQaly = housingRestBayQaly + transitRestBayQaly + heatRestBayQaly - harm.restBayQaly;
  const bayIncludingSfNetQaly = sfNetQaly + restBayNetQaly;
  if (![sfNetQaly,restBayNetQaly,bayIncludingSfNetQaly].every(finite)) throw new RangeError('Output overflow');
  const ratio = (q,cost) => q > 0 ? cost/q : null;
  return {housingSfQaly,housingRestBayQaly,transitSfQaly,transitRestBayQaly,heatSfQaly,heatRestBayQaly,sfNetQaly,restBayNetQaly,bayIncludingSfNetQaly,donorCostUsd,
    sfUsdPerQaly:ratio(sfNetQaly,donorCostUsd),bayUsdPerQaly:ratio(bayIncludingSfNetQaly,donorCostUsd),
    sfUsdPer10Qaly:ratio(sfNetQaly,10*donorCostUsd),bayUsdPer10Qaly:ratio(bayIncludingSfNetQaly,10*donorCostUsd),
    resourceStressAdditionalUsd,
    sfResourceStressUsdPer10Qaly:ratio(sfNetQaly,10*(donorCostUsd+resourceStressAdditionalUsd)),
    bayResourceStressUsdPer10Qaly:ratio(bayIncludingSfNetQaly,10*(donorCostUsd+resourceStressAdditionalUsd))};
}

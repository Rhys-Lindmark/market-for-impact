const price = (cost, q) => q > 0 ? 10 * cost / q : null;
export function filtrationModel(s) {
  const integratedBenefitYears = (s.onsetMonths / 24 + s.plateauMonths / 12) * s.realizedExposureFraction;
  const grossBenefitQaly = s.assumedPlateauUtilityGain * integratedBenefitYears;
  const netQalys = s.fundingAdditionality * (grossBenefitQaly - s.sharedHarmQalyPerAdditionalEpisode) - s.donorSpecificHarmQalyPerOffer;
  return { integratedBenefitYears, grossBenefitQaly, netQalys, costPerTenQalys: price(s.paidDirectDeliveryCostUsd, netQalys) };
}
export function homeModificationModel(s) {
  const grossHealthQaly = s.fallRateDifferencePerPersonYear * s.clinicalTransfer * s.effectiveYears * s.expectedQalyLossPerFall;
  // Replacement is assumed identical: service harms are replaced too. This does
  // not model donor-specific disruption; that requires a separate outside term.
  const netQalys = s.fundingAdditionality * (grossHealthQaly - s.incrementalHarmQaly);
  return { grossHealthQaly, netQalys, costPerTenQalys: price(s.conditionalDonorCashCostUsd, netQalys),
    directResourcePrice: price(s.directDeliveryResourceCostUsd, netQalys),
    expandedResourcePrice: price(s.directDeliveryResourceCostUsd + s.participantTimeCostUsd, netQalys) };
}

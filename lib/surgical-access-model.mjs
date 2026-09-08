const positivePrice = (cost, q) => q > 0 ? 10 * cost / q : null;

export function colonoscopyAccessModel(s, resources = {}) {
  const c=s.cashAllocationPerCompletedPathway,a=s.marginallyEnabledFraction,q=s.netQalyPerEnabledCompletion;
  const clinical=resources.clinicalResourceSensitivityPerEnabledCompletion??2000;
  const support=resources.otherDonatedSupportSensitivityPerEnabledCompletion??60;
  if (![c,a,q,clinical,support].every(Number.isFinite) || c<0 || a<0 || a>1 || clinical<0 || support<0) throw new Error('Invalid colonoscopy inputs');
  // Costs already allocate unsuccessful referrals to completed-pathway units.
  // Do not multiply by the offered-navigation RCT completion difference again.
  const netQalys=a===0?0:a*q;
  const expandedCost=c+a*(clinical+support);
  return {netQalys,expandedCost,costPerTenQalys:positivePrice(c,netQalys),expandedResourcePrice:positivePrice(expandedCost,netQalys),thresholdNetQalyPerEnabledCompletion:a>0?c/(10000*a):null};
}

export function cataractAccessModel(s) {
  for (const [key, value] of Object.entries(s)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Invalid input: ${key}`);
  }
  if (s.donorCashCostUsd < 0 || s.completeDirectResourceCostUsd < s.donorCashCostUsd) throw new Error('Invalid cost boundary');
  for (const key of ['clinicalComparatorTransfer', 'fundingAdditionality']) {
    if (s[key] < 0 || s[key] > 1) throw new Error(`Invalid share: ${key}`);
  }
  // The trial coefficient is already integrated over one year and assignment-
  // based. Do not multiply by duration or trial completion a second time.
  const grossTransferredQaly = s.externalIntegratedQaly * s.clinicalComparatorTransfer;
  const netQalys = s.fundingAdditionality * (grossTransferredQaly - s.sharedIncrementalHarmQaly) - s.donorSpecificHarmQaly;
  return { grossTransferredQaly, netQalys,
    costPerTenQalys: positivePrice(s.donorCashCostUsd, netQalys),
    directResourcePrice: positivePrice(s.completeDirectResourceCostUsd, netQalys),
    donorCostCeilingAt100kPerTenQalys: Math.max(0, 10000 * netQalys) };
}

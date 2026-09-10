const inputs = {
  gift: 100000,
  matchedFy2024Expense: 3191947,
  latestFy2025Expense: 3892610,
  observedCountyContractOtpClients: 257,
  methadoneMortalityRateDifferencePerPersonYear: 0.0249,
  buprenorphineMortalityRateDifferencePerPersonYear: 0.0052,
  sfShare: null,
};

const pathwayLedger = [
  {pathway: "OAT mortality during retained treatment", quantified: true, treatment: "mortality-rate difference with causal-transfer discount"},
  {pathway: "OAT morbidity and quality of life", quantified: true, treatment: "small judgmental QALY per retained treatment-year"},
  {pathway: "Counseling and mental-health care", quantified: false, treatment: "zero additional credit; no current MTC outcome/volume bridge"},
  {pathway: "Primary care and care coordination", quantified: false, treatment: "zero additional credit; no disjoint current outcome denominator"},
  {pathway: "HIV/HCV testing and linkage", quantified: false, treatment: "zero additional credit; current completions and counterfactual treatment unknown"},
  {pathway: "Withdrawal management and post-cessation risk", quantified: false, treatment: "no positive credit; risk represented by retention and mortality-transfer discounts"},
  {pathway: "Jail medication continuity", quantified: false, treatment: "zero additional credit; only historical volume located"},
  {pathway: "Outreach and education", quantified: false, treatment: "zero QALY credit; reach is not treatment"},
];

const scenarios = [
  {name: "null", weight: 0.25, retainedTreatmentYears: 0.40, assumedMethadoneShare: 0.00, mortalityCausalTransfer: 0.00, organizationalAccessAdditionality: 0.10, survivalHorizonYears: 10, annualSubsequentSurvival: 0.85, healthUtility: 0.65, healthDiscountRate: 0.03, eventDelayYears: 0.50, morbidityQalyPerTreatmentYear: 0.00, fundingAdditionality: 0.10, bayShare: 0.75},
  {name: "central", weight: 0.60, retainedTreatmentYears: 0.70, assumedMethadoneShare: 0.50, mortalityCausalTransfer: 0.45, organizationalAccessAdditionality: 0.30, survivalHorizonYears: 20, annualSubsequentSurvival: 0.93, healthUtility: 0.70, healthDiscountRate: 0.03, eventDelayYears: 0.50, morbidityQalyPerTreatmentYear: 0.03, fundingAdditionality: 0.35, bayShare: 0.90},
  {name: "upside", weight: 0.15, retainedTreatmentYears: 0.90, assumedMethadoneShare: 1.00, mortalityCausalTransfer: 0.70, organizationalAccessAdditionality: 0.60, survivalHorizonYears: 30, annualSubsequentSurvival: 0.96, healthUtility: 0.80, healthDiscountRate: 0.03, eventDelayYears: 0.25, morbidityQalyPerTreatmentYear: 0.08, fundingAdditionality: 0.70, bayShare: 1.00},
];

export function finiteSurvivalQalys(s) {
  let qaly = 0;
  for (let t = 1; t <= s.survivalHorizonYears; t += 1) {
    qaly += s.healthUtility * s.annualSubsequentSurvival ** (t - 0.5) / (1 + s.healthDiscountRate) ** (t - 0.5 + s.eventDelayYears);
  }
  return qaly;
}

export function calculate(i = inputs, ss = scenarios) {
  const giftShare = i.gift / i.matchedFy2024Expense;
  const impliedGrossCostPerObservedCountyContractClient = i.matchedFy2024Expense / i.observedCountyContractOtpClients;
  const rows = ss.map(s => {
    const evidenceMortalityRateDifferencePerPersonYear =
      s.assumedMethadoneShare * i.methadoneMortalityRateDifferencePerPersonYear +
      (1 - s.assumedMethadoneShare) * i.buprenorphineMortalityRateDifferencePerPersonYear;
    const finiteHealthAdjustedYearsPerDeath = finiteSurvivalQalys(s);
    const mortalityQalyPerClient = s.retainedTreatmentYears * evidenceMortalityRateDifferencePerPersonYear * s.mortalityCausalTransfer * finiteHealthAdjustedYearsPerDeath;
    const morbidityQalyPerClient = s.retainedTreatmentYears * s.morbidityQalyPerTreatmentYear;
    const qalyPerClient = mortalityQalyPerClient + morbidityQalyPerClient;
    const syntheticTreatmentPersonYears = i.observedCountyContractOtpClients * s.retainedTreatmentYears;
    const annualClinicalQalyBeforeAccessCounterfactual = i.observedCountyContractOtpClients * qalyPerClient;
    const annualOrganizationAttributedQaly = annualClinicalQalyBeforeAccessCounterfactual * s.organizationalAccessAdditionality;
    const accountingAttributedQaly = annualOrganizationAttributedQaly * giftShare;
    const giftQaly = accountingAttributedQaly * s.fundingAdditionality;
    return {
      ...s,
      evidenceMortalityRateDifferencePerPersonYear,
      finiteHealthAdjustedYearsPerDeath,
      mortalityQalyPerClient,
      morbidityQalyPerClient,
      qalyPerClient,
      syntheticTreatmentPersonYears,
      annualClinicalQalyBeforeAccessCounterfactual,
      annualOrganizationAttributedQaly,
      accountingAttributedQaly,
      giftQaly,
      modeledOrdinaryGiftCostPer10Qaly: giftQaly === 0 ? null : i.gift * 10 / giftQaly,
      verifiedMarginalGiftCostPer10Qaly: null,
      retrospectiveGrossCostPer10Qaly: annualOrganizationAttributedQaly === 0 ? null : i.matchedFy2024Expense * 10 / annualOrganizationAttributedQaly,
      marginalGrossResources: null,
      marginalGrossCostPer10Qaly: null,
      externalResources: ["patient time and travel", "outside medical care", "public or insurance payments unlocked by a marginal gift"],
      bayQaly: giftQaly * s.bayShare,
      sfQaly: i.sfShare == null ? null : giftQaly * i.sfShare,
    };
  });
  const weighted = rows.reduce((a, r) => {
    a.giftQaly += r.weight * r.giftQaly;
    a.accountingAttributedQaly += r.weight * r.accountingAttributedQaly;
    a.annualOrganizationAttributedQaly += r.weight * r.annualOrganizationAttributedQaly;
    a.bayQaly += r.weight * r.bayQaly;
    if (r.sfQaly != null) a.sfQaly += r.weight * r.sfQaly;
    return a;
  }, {giftQaly: 0, accountingAttributedQaly: 0, annualOrganizationAttributedQaly: 0, bayQaly: 0, sfQaly: i.sfShare == null ? null : 0});
  weighted.modeledOrdinaryGiftCostPer10Qaly = weighted.giftQaly === 0 ? null : i.gift * 10 / weighted.giftQaly;
  weighted.verifiedMarginalGiftCostPer10Qaly = null;
  weighted.retrospectiveGrossCostPer10Qaly = weighted.annualOrganizationAttributedQaly === 0 ? null : i.matchedFy2024Expense * 10 / weighted.annualOrganizationAttributedQaly;
  weighted.marginalGrossResources = null;
  weighted.marginalGrossCostPer10Qaly = null;
  weighted.bayImpactShare = weighted.giftQaly === 0 ? null : weighted.bayQaly / weighted.giftQaly;
  weighted.sfImpactShare = weighted.sfQaly == null || weighted.giftQaly === 0 ? null : weighted.sfQaly / weighted.giftQaly;
  const positiveWeight = rows.filter(r => r.giftQaly > 0).reduce((a, r) => a + r.weight, 0);
  weighted.positiveOnlyExpectedGiftQaly = positiveWeight === 0 ? null : weighted.giftQaly / positiveWeight;
  weighted.positiveOnlyModeledOrdinaryGiftCostPer10Qaly = weighted.positiveOnlyExpectedGiftQaly == null || weighted.positiveOnlyExpectedGiftQaly === 0 ? null : i.gift * 10 / weighted.positiveOnlyExpectedGiftQaly;
  weighted.signedExpectedGiftQaly = weighted.giftQaly;
  return {inputs: i, giftShare, impliedGrossCostPerObservedCountyContractClient, pathwayLedger, scenarios: rows, weighted};
}

export const inputs = {
  modelVersion: "miraclefeet-v5-explicit-prior-finite-qaly",
  giftUsd: 100000,
  fy2025CashExpenseUsd: 10125979,
  fy2025AccrualExpenseUsd: 9958705,
  fy2025EndNetAssetsUsd: 16740144,
  fy2025NewChildrenEnrolled: 17846,
  reportedWholeOrganizationCostPerNewEnrollmentUsd: 567,
  giveWellSupportedEnrollments: 9785,
  giveWellDurableCounterfactualCorrections: 3681,
  giveWellGrantSpecificDurableCounterfactualShare: 3681 / 9785,
  qalyBridgeStatus: "modeled explicit prior from disability-weight proxies; not observed or validated QALYs",
  verifiedQalyPerDurableCorrection: null,
  verifiedMarginalGiftCostPer10Qaly: null,
  verifiedCompleteGrossResourceCostPer10Qaly: null,
  bayDirectHealthShare: 0,
  sfDirectHealthShare: 0,
};

export const scenarios = [
  { name: "independentHarm", weight: 0.05, currentGiftTransferFrom2023Grant: 0.20, durableCounterfactualSharePerEnrollmentEquivalent: 0.15, annualUtilityGainPrior: 0, finiteBenefitYears: 1, annualSurvival: 1, discountRate: 0.03, oneTimeTreatmentBurdenQaly: 0.05, grossResourceMultiplierPrior: 2.50 },
  { name: "null", weight: 0.20, currentGiftTransferFrom2023Grant: 0.20, durableCounterfactualSharePerEnrollmentEquivalent: 0.15, annualUtilityGainPrior: 0, finiteBenefitYears: 1, annualSurvival: 1, discountRate: 0.03, oneTimeTreatmentBurdenQaly: 0, grossResourceMultiplierPrior: 2.50 },
  { name: "downside", weight: 0.30, currentGiftTransferFrom2023Grant: 0.20, durableCounterfactualSharePerEnrollmentEquivalent: 0.15, annualUtilityGainPrior: 0.02, finiteBenefitYears: 20, annualSurvival: 0.98, discountRate: 0.03, oneTimeTreatmentBurdenQaly: 0.10, grossResourceMultiplierPrior: 2.50 },
  { name: "central", weight: 0.35, currentGiftTransferFrom2023Grant: 0.50, durableCounterfactualSharePerEnrollmentEquivalent: 3681 / 9785, annualUtilityGainPrior: 0.08, finiteBenefitYears: 40, annualSurvival: 0.99, discountRate: 0.03, oneTimeTreatmentBurdenQaly: 0.10, grossResourceMultiplierPrior: 1.75 },
  { name: "favorable", weight: 0.10, currentGiftTransferFrom2023Grant: 0.80, durableCounterfactualSharePerEnrollmentEquivalent: 0.60, annualUtilityGainPrior: 0.15, finiteBenefitYears: 50, annualSurvival: 0.995, discountRate: 0.03, oneTimeTreatmentBurdenQaly: 0.05, grossResourceMultiplierPrior: 1.25 },
];

function finite(value, label, { min = -Infinity, max = Infinity, exclusiveMin = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
  if ((exclusiveMin ? value <= min : value < min) || value > max) throw new RangeError(`${label} out of range`);
}

function approximatelyEqual(left, right, tolerance = 1e-12) {
  return Math.abs(left - right) <= tolerance * Math.max(1, Math.abs(left), Math.abs(right));
}

function validate(modelInputs, scenarioInputs) {
  if (!modelInputs || typeof modelInputs !== "object" || Array.isArray(modelInputs)) throw new TypeError("inputs must be an object");
  if (modelInputs.modelVersion !== "miraclefeet-v5-explicit-prior-finite-qaly") throw new RangeError("wrong model version");
  for (const key of ["fy2025CashExpenseUsd", "fy2025AccrualExpenseUsd", "fy2025EndNetAssetsUsd", "fy2025NewChildrenEnrolled", "reportedWholeOrganizationCostPerNewEnrollmentUsd", "giveWellSupportedEnrollments", "giveWellDurableCounterfactualCorrections"]) finite(modelInputs[key], key, { min: 0, exclusiveMin: true });
  finite(modelInputs.giftUsd, "giftUsd", { min: 0 });
  if (modelInputs.giveWellGrantSpecificDurableCounterfactualShare !== modelInputs.giveWellDurableCounterfactualCorrections / modelInputs.giveWellSupportedEnrollments) throw new RangeError("GiveWell share must preserve exact grant arithmetic");
  if (modelInputs.verifiedQalyPerDurableCorrection !== null || modelInputs.verifiedMarginalGiftCostPer10Qaly !== null || modelInputs.verifiedCompleteGrossResourceCostPer10Qaly !== null) throw new RangeError("verified fields must remain null");
  if (modelInputs.bayDirectHealthShare !== 0 || modelInputs.sfDirectHealthShare !== 0) throw new RangeError("direct Bay and SF shares must remain zero");
  if (!Array.isArray(scenarioInputs) || scenarioInputs.length === 0) throw new TypeError("scenarios must be nonempty");
  const names = new Set();
  for (const scenario of scenarioInputs) {
    if (!scenario || typeof scenario !== "object" || names.has(scenario.name)) throw new RangeError("scenario names must be unique");
    names.add(scenario.name);
    finite(scenario.weight, `${scenario.name}.weight`, { min: 0, max: 1 });
    finite(scenario.currentGiftTransferFrom2023Grant, `${scenario.name}.currentGiftTransferFrom2023Grant`, { min: 0, max: 1 });
    finite(scenario.durableCounterfactualSharePerEnrollmentEquivalent, `${scenario.name}.durableCounterfactualSharePerEnrollmentEquivalent`, { min: 0, max: 1 });
    finite(scenario.annualUtilityGainPrior, `${scenario.name}.annualUtilityGainPrior`, { min: 0, max: 1 });
    finite(scenario.finiteBenefitYears, `${scenario.name}.finiteBenefitYears`, { min: 1, max: 100 });
    if (!Number.isInteger(scenario.finiteBenefitYears)) throw new RangeError("finiteBenefitYears must be an integer");
    finite(scenario.annualSurvival, `${scenario.name}.annualSurvival`, { min: 0, max: 1 });
    finite(scenario.discountRate, `${scenario.name}.discountRate`, { min: 0, max: 0.2 });
    finite(scenario.oneTimeTreatmentBurdenQaly, `${scenario.name}.oneTimeTreatmentBurdenQaly`, { min: 0, max: 1 });
    finite(scenario.grossResourceMultiplierPrior, `${scenario.name}.grossResourceMultiplierPrior`, { min: 1, max: 10 });
  }
  if (!approximatelyEqual(scenarioInputs.reduce((sum, scenario) => sum + scenario.weight, 0), 1)) throw new RangeError("scenario weights must sum to 1");
  for (const required of ["independentHarm", "null", "downside", "central", "favorable"]) if (!names.has(required)) throw new RangeError(`missing ${required}`);
}

export function finiteGrossQalyPerDurableCorrection(scenario) {
  let grossUtilityGain = 0;
  for (let year = 1; year <= scenario.finiteBenefitYears; year += 1) {
    const survivalAtStart = scenario.annualSurvival ** (year - 1);
    grossUtilityGain += scenario.annualUtilityGainPrior * survivalAtStart / ((1 + scenario.discountRate) ** (year - 0.5));
  }
  return grossUtilityGain;
}

export function calculate(modelInputs = inputs, scenarioInputs = scenarios) {
  validate(modelInputs, scenarioInputs);
  const steadyStateEnrollmentEquivalents = modelInputs.giftUsd / modelInputs.reportedWholeOrganizationCostPerNewEnrollmentUsd;
  const results = scenarioInputs.map((scenario) => {
    const transferredEnrollmentEquivalents = steadyStateEnrollmentEquivalents * scenario.currentGiftTransferFrom2023Grant;
    const additionalDurableCorrections = transferredEnrollmentEquivalents * scenario.durableCounterfactualSharePerEnrollmentEquivalent;
    const finiteGrossUtilityQalyPerDurableCorrection = finiteGrossQalyPerDurableCorrection(scenario);
    const modeledGrossBenefitQalys = additionalDurableCorrections * finiteGrossUtilityQalyPerDurableCorrection;
    // Casting, tenotomy, bracing, travel, and complication burden is incurred by
    // every attributed treated enrollment, including children who do not reach
    // the durable-correction endpoint.
    const modeledTreatmentBurdenQaly = transferredEnrollmentEquivalents * scenario.oneTimeTreatmentBurdenQaly;
    const modeledGiftQalys = modeledGrossBenefitQalys - modeledTreatmentBurdenQaly;
    const modeledNetQalyPerDurableCorrectionEquivalent = additionalDurableCorrections > 0
      ? modeledGiftQalys / additionalDurableCorrections
      : null;
    const modeledGrossResourcesUsd = modelInputs.giftUsd * scenario.grossResourceMultiplierPrior;
    return {
      ...scenario,
      steadyStateEnrollmentEquivalents,
      transferredEnrollmentEquivalents,
      additionalDurableCorrections,
      finiteGrossUtilityQalyPerDurableCorrection,
      modeledGrossBenefitQalys,
      modeledTreatmentBurdenQaly,
      modeledNetQalyPerDurableCorrectionEquivalent,
      modeledGiftQalys,
      modeledDonorUsdPer10Qaly: modeledGiftQalys > 0 ? modelInputs.giftUsd * 10 / modeledGiftQalys : null,
      modeledGrossResourcesUsd,
      modeledGrossUsdPer10Qaly: modeledGiftQalys > 0 ? modeledGrossResourcesUsd * 10 / modeledGiftQalys : null,
      verifiedQalyPerDurableCorrection: null,
      verifiedMarginalGiftCostPer10Qaly: null,
      verifiedCompleteGrossResourcesUsd: null,
      bayDirectHealthQalys: 0,
      sfDirectHealthQalys: 0,
    };
  });
  const weighted = results.reduce((sum, scenario) => {
    sum.modeledGiftQalys += scenario.weight * scenario.modeledGiftQalys;
    sum.modeledGrossResourcesUsd += scenario.weight * scenario.modeledGrossResourcesUsd;
    return sum;
  }, { modeledGiftQalys: 0, modeledGrossResourcesUsd: 0 });
  const positive = weighted.modeledGiftQalys > 0;
  weighted.modeledOrdinaryGiftCostPer10Qaly = positive ? modelInputs.giftUsd * 10 / weighted.modeledGiftQalys : null;
  weighted.modeledGrossResourceCostPer10Qaly = positive ? weighted.modeledGrossResourcesUsd * 10 / weighted.modeledGiftQalys : null;
  weighted.verifiedQalyPerDurableCorrection = null;
  weighted.verifiedMarginalGiftCostPer10Qaly = null;
  weighted.verifiedCompleteGrossResourceCostPer10Qaly = null;
  weighted.bayDirectHealthShare = 0;
  weighted.sfDirectHealthShare = 0;
  const favorable = results.find(({ name }) => name === "favorable");
  weighted.favorableQalyContribution = favorable.weight * favorable.modeledGiftQalys;
  weighted.favorableShareOfModeledExpectedQaly = positive ? weighted.favorableQalyContribution / weighted.modeledGiftQalys : null;
  const noFavorableWeight = 1 - favorable.weight;
  const noFavorableQaly = results.reduce((sum, scenario) => scenario.name === "favorable" ? sum : sum + scenario.weight * scenario.modeledGiftQalys, 0) / noFavorableWeight;
  const noFavorable = {
    modeledGiftQalys: noFavorableQaly,
    modeledOrdinaryGiftCostPer10Qaly: noFavorableQaly > 0 ? modelInputs.giftUsd * 10 / noFavorableQaly : null,
  };
  return { inputs: modelInputs, scenarios: results, weighted, noFavorable };
}

export default calculate;

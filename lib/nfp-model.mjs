export const inputs = {
  modelVersion: "nurse-family-partnership-v3-resource-timing-aligned",
  gift: 100000,
  fy2024Expense: 30712013,
  fy2024Revenue: 42539779,
  fy2024NetAssets: 111212082,
  fy2024Surplus: 11827766,
  nfpFamiliesServed2024: 57005,
  childFirstFamiliesServed2024: 2564,
  wholeOrgExpensePerNfpFamily: 30712013 / 57005,
  modeledCourseDurationYears: 2.5,
  wholeOrgExpensePerModeledCourse: (30712013 / 57005) * 2.5,
  californiaFullDeliveryCost2019: 14728,
  nationalReplicationCost2012PresentValue: 8580,
  memphisPreventableMortalityRiskDifference: 0.016,
  finiteQalyPerPreventableDeath: 9,
  memphisFiniteMortalityCalibration: 0.016 * 9,
  californiaCapacity2023: 5811,
  californiaShareProxy: 5811 / 57005,
};

export const scenarios = [
  { name: "harm", weight: 0.10, fundingAdditionality: 0.02, serviceRealization: 0.80, qalyPerFamily: -0.01, fullDeliveryCostPerFamily: 14728, bayShare: 0.025, sfShare: 0.002 },
  { name: "null", weight: 0.40, fundingAdditionality: 0.03, serviceRealization: 0.80, qalyPerFamily: 0, fullDeliveryCostPerFamily: 14728, bayShare: 0.025, sfShare: 0.002 },
  { name: "cautiousPositive", weight: 0.30, fundingAdditionality: 0.05, serviceRealization: 0.85, qalyPerFamily: 0.001, fullDeliveryCostPerFamily: 14728, bayShare: 0.025, sfShare: 0.002 },
  { name: "central", weight: 0.15, fundingAdditionality: 0.10, serviceRealization: 0.90, qalyPerFamily: 0.010, fullDeliveryCostPerFamily: 11700, bayShare: 0.025, sfShare: 0.002 },
  { name: "favorableStress", weight: 0.05, fundingAdditionality: 0.20, serviceRealization: 0.95, qalyPerFamily: 0.080, fullDeliveryCostPerFamily: 8580, bayShare: 0.025, sfShare: 0.002 },
];

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function requireFinite(value, label, { min = -Infinity, max = Infinity, exclusiveMin = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`);
  }
  if ((exclusiveMin ? value <= min : value < min) || value > max) {
    const lower = exclusiveMin ? `greater than ${min}` : `at least ${min}`;
    throw new RangeError(`${label} must be ${lower} and at most ${max}`);
  }
}

function approximatelyEqual(left, right, tolerance = 1e-12) {
  return Math.abs(left - right) <= tolerance * Math.max(1, Math.abs(left), Math.abs(right));
}

function validateInputs(modelInputs) {
  requireObject(modelInputs, "inputs");
  if (modelInputs.modelVersion !== "nurse-family-partnership-v3-resource-timing-aligned") {
    throw new RangeError("inputs.modelVersion must preserve the v3 unit- and resource-timing-aligned model");
  }

  for (const key of [
    "fy2024Expense",
    "fy2024Revenue",
    "fy2024NetAssets",
    "nfpFamiliesServed2024",
    "wholeOrgExpensePerNfpFamily",
    "modeledCourseDurationYears",
    "wholeOrgExpensePerModeledCourse",
    "californiaFullDeliveryCost2019",
    "nationalReplicationCost2012PresentValue",
    "finiteQalyPerPreventableDeath",
    "californiaCapacity2023",
  ]) requireFinite(modelInputs[key], `inputs.${key}`, { min: 0, exclusiveMin: true });

  for (const key of ["gift", "fy2024Surplus", "childFirstFamiliesServed2024"]) {
    requireFinite(modelInputs[key], `inputs.${key}`, { min: 0 });
  }
  requireFinite(modelInputs.memphisPreventableMortalityRiskDifference, "inputs.memphisPreventableMortalityRiskDifference", { min: -1, max: 1 });
  requireFinite(modelInputs.memphisFiniteMortalityCalibration, "inputs.memphisFiniteMortalityCalibration");
  requireFinite(modelInputs.californiaShareProxy, "inputs.californiaShareProxy", { min: 0, max: 1 });

  const expectedExpensePerFamily = modelInputs.fy2024Expense / modelInputs.nfpFamiliesServed2024;
  if (!approximatelyEqual(modelInputs.wholeOrgExpensePerNfpFamily, expectedExpensePerFamily)) {
    throw new RangeError("wholeOrgExpensePerNfpFamily must equal fy2024Expense / nfpFamiliesServed2024");
  }
  const expectedExpensePerCourse = modelInputs.wholeOrgExpensePerNfpFamily * modelInputs.modeledCourseDurationYears;
  if (!approximatelyEqual(modelInputs.wholeOrgExpensePerModeledCourse, expectedExpensePerCourse)) {
    throw new RangeError("wholeOrgExpensePerModeledCourse must preserve the full-course conversion");
  }
  const expectedMortalityCalibration = modelInputs.memphisPreventableMortalityRiskDifference * modelInputs.finiteQalyPerPreventableDeath;
  if (!approximatelyEqual(modelInputs.memphisFiniteMortalityCalibration, expectedMortalityCalibration)) {
    throw new RangeError("memphisFiniteMortalityCalibration must equal risk difference × finite QALYs per preventable death");
  }
  const expectedCaliforniaShare = modelInputs.californiaCapacity2023 / modelInputs.nfpFamiliesServed2024;
  if (!approximatelyEqual(modelInputs.californiaShareProxy, expectedCaliforniaShare)) {
    throw new RangeError("californiaShareProxy must equal californiaCapacity2023 / nfpFamiliesServed2024");
  }
}

function validateScenarios(scenarioInputs) {
  if (!Array.isArray(scenarioInputs) || scenarioInputs.length === 0) {
    throw new TypeError("scenarios must be a nonempty array");
  }
  const names = new Set();
  for (const [index, scenario] of scenarioInputs.entries()) {
    requireObject(scenario, `scenarios[${index}]`);
    if (typeof scenario.name !== "string" || scenario.name.length === 0 || names.has(scenario.name)) {
      throw new RangeError(`scenarios[${index}].name must be a unique nonempty string`);
    }
    names.add(scenario.name);
    requireFinite(scenario.weight, `scenarios[${index}].weight`, { min: 0, max: 1 });
    requireFinite(scenario.fundingAdditionality, `scenarios[${index}].fundingAdditionality`, { min: 0, max: 1 });
    requireFinite(scenario.serviceRealization, `scenarios[${index}].serviceRealization`, { min: 0, max: 1 });
    requireFinite(scenario.qalyPerFamily, `scenarios[${index}].qalyPerFamily`);
    requireFinite(scenario.fullDeliveryCostPerFamily, `scenarios[${index}].fullDeliveryCostPerFamily`, { min: 0 });
    requireFinite(scenario.bayShare, `scenarios[${index}].bayShare`, { min: 0, max: 1 });
    requireFinite(scenario.sfShare, `scenarios[${index}].sfShare`, { min: 0, max: 1 });
    if (scenario.sfShare > scenario.bayShare) {
      throw new RangeError(`scenarios[${index}].sfShare must not exceed bayShare`);
    }
  }
  const weightSum = scenarioInputs.reduce((sum, scenario) => sum + scenario.weight, 0);
  if (!approximatelyEqual(weightSum, 1)) throw new RangeError("scenario weights must sum to 1");
  if (!names.has("favorableStress")) throw new RangeError("scenarios must include favorableStress");
}

export function calculate(modelInputs = inputs, scenarioInputs = scenarios) {
  validateInputs(modelInputs);
  validateScenarios(scenarioInputs);

  const results = scenarioInputs.map((scenario) => {
    const additionalSupportCash = modelInputs.gift * scenario.fundingAdditionality;
    const activeFamilyYearEquivalentsBeforeConversion = additionalSupportCash / modelInputs.wholeOrgExpensePerNfpFamily;
    const fullCourseEquivalentsBeforeRealization = activeFamilyYearEquivalentsBeforeConversion / modelInputs.modeledCourseDurationYears;
    const realizedFullCourseEquivalents = fullCourseEquivalentsBeforeRealization * scenario.serviceRealization;
    const giftQaly = realizedFullCourseEquivalents * scenario.qalyPerFamily;
    const externalResourcesPerFullCourse = Math.max(0, scenario.fullDeliveryCostPerFamily - modelInputs.wholeOrgExpensePerModeledCourse);
    // Outside implementation resources are charged when a course-equivalent is
    // funded, before the separate realization factor determines health benefit.
    // This avoids treating incomplete exposure, fidelity failure, or attrition as
    // consuming no partner resources.
    const externalResources = fullCourseEquivalentsBeforeRealization * externalResourcesPerFullCourse;
    const grossResources = modelInputs.gift + externalResources;
    return {
      ...scenario,
      additionalSupportCash,
      activeFamilyYearEquivalentsBeforeConversion,
      fullCourseEquivalentsBeforeRealization,
      realizedFullCourseEquivalents,
      externalResourcesPerFullCourse,
      externalResources,
      grossResources,
      giftQaly,
      bayQaly: giftQaly * scenario.bayShare,
      sfQaly: giftQaly * scenario.sfShare,
      donorCostPer10Qaly: giftQaly > 0 ? modelInputs.gift * 10 / giftQaly : null,
      grossCostPer10Qaly: giftQaly > 0 ? grossResources * 10 / giftQaly : null,
    };
  });

  const weighted = results.reduce((accumulator, result) => {
    accumulator.giftQaly += result.weight * result.giftQaly;
    accumulator.bayQaly += result.weight * result.bayQaly;
    accumulator.sfQaly += result.weight * result.sfQaly;
    accumulator.grossResources += result.weight * result.grossResources;
    return accumulator;
  }, { giftQaly: 0, bayQaly: 0, sfQaly: 0, grossResources: 0 });

  const positive = weighted.giftQaly > 0;
  weighted.donorCostPer10Qaly = positive ? modelInputs.gift * 10 / weighted.giftQaly : null;
  weighted.grossCostPer10Qaly = positive ? weighted.grossResources * 10 / weighted.giftQaly : null;
  weighted.bayImpactShare = positive ? weighted.bayQaly / weighted.giftQaly : null;
  weighted.sfImpactShare = positive ? weighted.sfQaly / weighted.giftQaly : null;
  weighted.bayDonorCostPer10Qaly = weighted.bayQaly > 0 ? modelInputs.gift * 10 / weighted.bayQaly : null;
  weighted.sfDonorCostPer10Qaly = weighted.sfQaly > 0 ? modelInputs.gift * 10 / weighted.sfQaly : null;

  const favorableIndex = results.findIndex((result) => result.name === "favorableStress");
  const favorable = results[favorableIndex];
  weighted.favorableQalyContribution = favorable.weight * favorable.giftQaly;
  weighted.favorableShareOfSignedExpectedQaly = positive ? weighted.favorableQalyContribution / weighted.giftQaly : null;

  const nonFavorableWeight = 1 - favorable.weight;
  if (!(nonFavorableWeight > 0)) throw new RangeError("favorableStress weight must be less than 1");
  const nonFavorableGiftQaly = results.reduce(
    (sum, result, index) => index === favorableIndex ? sum : sum + result.weight * result.giftQaly,
    0,
  ) / nonFavorableWeight;
  const noFavorable = {
    giftQaly: nonFavorableGiftQaly,
    donorCostPer10Qaly: nonFavorableGiftQaly > 0 ? modelInputs.gift * 10 / nonFavorableGiftQaly : null,
  };

  return { inputs: modelInputs, scenarios: results, weighted, noFavorable };
}

export const calculateNfpModel = calculate;
export default calculate;

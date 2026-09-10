export const inputs = {
  modelVersion: "changent-two-program-portfolio-v4",
  gift: 100000,
  fy2024Expense: 30712013,
  fy2024Revenue: 42539779,
  fy2024NetAssets: 111212082,
  fy2024Surplus: 11827766,
  nfpDirectProgramExpense: 15970694,
  childFirstDirectProgramExpense: 5679121,
  totalProgramServiceExpense: 21649815,
  nfpFamiliesServed2024: 57005,
  childFirstFamiliesServed2024: 2564,
  nfpVisits2024: 586081,
  childFirstContacts2024: 60971,
  modeledNfpCourseDurationYears: 2.5,
  californiaNfpCapacity2023: 5811,
  memphisPreventableMortalityRiskDifference: 0.016,
  finiteQalyPerPreventableDeath: 9,
};

// Child First QALY values are finite analyst bridges, not trial-measured QALYs.
// Each is computed transparently as a pre-transfer finite utility bridge times a
// causal-transfer factor. Mixed trial evidence motivates large null weight.
export const scenarios = [
  {
    name: "harm",
    weight: 0.10,
    fundingAdditionality: 0.02,
    nfpServiceRealization: 0.80,
    nfpQalyPerCompletedCourse: -0.01,
    nfpFullDeliveryCostPerCourse: 14728,
    childFirstServiceRealization: 0.80,
    childFirstRecipientUniqueness: 1,
    childFirstFiniteUtilityBridgeBeforeTransfer: -0.005,
    childFirstCausalTransfer: 1,
    childFirstFullDeliveryCostPerFamily: 14643,
    nfpBayShare: 0.025,
    nfpSfShare: 0.002,
  },
  {
    name: "null",
    weight: 0.40,
    fundingAdditionality: 0.03,
    nfpServiceRealization: 0.80,
    nfpQalyPerCompletedCourse: 0,
    nfpFullDeliveryCostPerCourse: 14728,
    childFirstServiceRealization: 0.80,
    childFirstRecipientUniqueness: 1,
    childFirstFiniteUtilityBridgeBeforeTransfer: 0,
    childFirstCausalTransfer: 0,
    childFirstFullDeliveryCostPerFamily: 14643,
    nfpBayShare: 0.025,
    nfpSfShare: 0.002,
  },
  {
    name: "cautiousPositive",
    weight: 0.30,
    fundingAdditionality: 0.05,
    nfpServiceRealization: 0.85,
    nfpQalyPerCompletedCourse: 0.001,
    nfpFullDeliveryCostPerCourse: 14728,
    childFirstServiceRealization: 0.85,
    childFirstRecipientUniqueness: 0.90,
    childFirstFiniteUtilityBridgeBeforeTransfer: 0.005,
    childFirstCausalTransfer: 0.20,
    childFirstFullDeliveryCostPerFamily: 14643,
    nfpBayShare: 0.025,
    nfpSfShare: 0.002,
  },
  {
    name: "central",
    weight: 0.15,
    fundingAdditionality: 0.10,
    nfpServiceRealization: 0.90,
    nfpQalyPerCompletedCourse: 0.010,
    nfpFullDeliveryCostPerCourse: 11700,
    childFirstServiceRealization: 0.90,
    childFirstRecipientUniqueness: 0.95,
    childFirstFiniteUtilityBridgeBeforeTransfer: 0.020,
    childFirstCausalTransfer: 0.50,
    childFirstFullDeliveryCostPerFamily: 10834,
    nfpBayShare: 0.025,
    nfpSfShare: 0.002,
  },
  {
    name: "favorableStress",
    weight: 0.05,
    fundingAdditionality: 0.20,
    nfpServiceRealization: 0.95,
    nfpQalyPerCompletedCourse: 0.080,
    nfpFullDeliveryCostPerCourse: 8580,
    childFirstServiceRealization: 0.95,
    childFirstRecipientUniqueness: 1,
    childFirstFiniteUtilityBridgeBeforeTransfer: 0.080,
    childFirstCausalTransfer: 0.625,
    childFirstFullDeliveryCostPerFamily: 8000,
    nfpBayShare: 0.025,
    nfpSfShare: 0.002,
  },
];

export const mortalityHorizonSensitivityInputs = {
  label: "actuarial-anchored finite NFP mortality-horizon sensitivity",
  assumedMeanCounterfactualDeathAge: 10,
  remainingLifeYearsAtAge10: 68.025,
  sourceMaleRemainingYears: 65.33,
  sourceFemaleRemainingYears: 70.72,
  healthUtility: 0.90,
  annualDiscountRate: 0.03,
  coreFollowupBoundQalyPerPreventedDeath: 9,
};

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function requireFinite(value, label, { min = -Infinity, max = Infinity, exclusiveMin = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${label} must be a finite number`);
  if ((exclusiveMin ? value <= min : value < min) || value > max) {
    throw new RangeError(`${label} is outside the permitted range`);
  }
}

function approximatelyEqual(left, right, tolerance = 1e-12) {
  return Math.abs(left - right) <= tolerance * Math.max(1, Math.abs(left), Math.abs(right));
}

function validateInputs(modelInputs) {
  requireObject(modelInputs, "inputs");
  if (modelInputs.modelVersion !== "changent-two-program-portfolio-v4") {
    throw new RangeError("inputs.modelVersion must identify the v4 portfolio model");
  }
  for (const key of [
    "fy2024Expense", "fy2024Revenue", "fy2024NetAssets", "nfpDirectProgramExpense",
    "childFirstDirectProgramExpense", "totalProgramServiceExpense", "nfpFamiliesServed2024",
    "childFirstFamiliesServed2024", "nfpVisits2024", "childFirstContacts2024",
    "modeledNfpCourseDurationYears", "californiaNfpCapacity2023", "finiteQalyPerPreventableDeath",
  ]) requireFinite(modelInputs[key], `inputs.${key}`, { min: 0, exclusiveMin: true });
  for (const key of ["gift", "fy2024Surplus"]) requireFinite(modelInputs[key], `inputs.${key}`, { min: 0 });
  requireFinite(modelInputs.memphisPreventableMortalityRiskDifference, "inputs.memphisPreventableMortalityRiskDifference", { min: -1, max: 1 });
  if (!approximatelyEqual(
    modelInputs.nfpDirectProgramExpense + modelInputs.childFirstDirectProgramExpense,
    modelInputs.totalProgramServiceExpense,
  )) throw new RangeError("named direct program expenses must sum to totalProgramServiceExpense");
  if (modelInputs.totalProgramServiceExpense > modelInputs.fy2024Expense) {
    throw new RangeError("program-service expense must not exceed whole-organization expense");
  }
}

function validateScenarios(scenarioInputs) {
  if (!Array.isArray(scenarioInputs) || scenarioInputs.length === 0) throw new TypeError("scenarios must be nonempty");
  const names = new Set();
  for (const [index, scenario] of scenarioInputs.entries()) {
    requireObject(scenario, `scenarios[${index}]`);
    if (typeof scenario.name !== "string" || !scenario.name || names.has(scenario.name)) {
      throw new RangeError(`scenarios[${index}].name must be unique and nonempty`);
    }
    names.add(scenario.name);
    for (const key of ["weight", "fundingAdditionality", "nfpServiceRealization", "childFirstServiceRealization", "childFirstRecipientUniqueness", "childFirstCausalTransfer", "nfpBayShare", "nfpSfShare"]) {
      requireFinite(scenario[key], `scenarios[${index}].${key}`, { min: 0, max: 1 });
    }
    for (const key of ["nfpFullDeliveryCostPerCourse", "childFirstFullDeliveryCostPerFamily"]) {
      requireFinite(scenario[key], `scenarios[${index}].${key}`, { min: 0 });
    }
    requireFinite(scenario.nfpQalyPerCompletedCourse, `scenarios[${index}].nfpQalyPerCompletedCourse`);
    requireFinite(scenario.childFirstFiniteUtilityBridgeBeforeTransfer, `scenarios[${index}].childFirstFiniteUtilityBridgeBeforeTransfer`);
    if (scenario.nfpSfShare > scenario.nfpBayShare) throw new RangeError("NFP SF share must be nested within Bay share");
  }
  if (!approximatelyEqual(scenarioInputs.reduce((sum, scenario) => sum + scenario.weight, 0), 1)) {
    throw new RangeError("scenario weights must sum to 1");
  }
  if (!names.has("favorableStress")) throw new RangeError("scenarios must include favorableStress");
}

export function calculate(modelInputs = inputs, scenarioInputs = scenarios) {
  validateInputs(modelInputs);
  validateScenarios(scenarioInputs);

  const childFirstDirectExpenseShareOfWholeOrg = modelInputs.childFirstDirectProgramExpense / modelInputs.fy2024Expense;
  const childFirstShareOfProgramServiceExpense = modelInputs.childFirstDirectProgramExpense / modelInputs.totalProgramServiceExpense;
  const nfpAllocatedWholeOrgExpense = modelInputs.fy2024Expense * modelInputs.nfpDirectProgramExpense / modelInputs.totalProgramServiceExpense;
  const childFirstAllocatedWholeOrgExpense = modelInputs.fy2024Expense * modelInputs.childFirstDirectProgramExpense / modelInputs.totalProgramServiceExpense;
  const nfpAnnualFullCourseDenominator = modelInputs.nfpFamiliesServed2024 / modelInputs.modeledNfpCourseDurationYears;
  const nfpAllocatedExpensePerFullCourse = nfpAllocatedWholeOrgExpense / nfpAnnualFullCourseDenominator;
  const childFirstAllocatedExpensePerFamily = childFirstAllocatedWholeOrgExpense / modelInputs.childFirstFamiliesServed2024;

  const diagnostics = {
    childFirstDirectExpenseShareOfWholeOrg,
    childFirstShareOfProgramServiceExpense,
    childFirstFamilyShareOfNamedPrograms: modelInputs.childFirstFamiliesServed2024 / (modelInputs.nfpFamiliesServed2024 + modelInputs.childFirstFamiliesServed2024),
    childFirstContactShareOfNamedPrograms: modelInputs.childFirstContacts2024 / (modelInputs.nfpVisits2024 + modelInputs.childFirstContacts2024),
    nfpAllocatedWholeOrgExpense,
    childFirstAllocatedWholeOrgExpense,
    nfpAnnualFullCourseDenominator,
    nfpAllocatedExpensePerFullCourse,
    childFirstAllocatedExpensePerFamily,
  };

  const results = scenarioInputs.map((scenario) => {
    const additionalSupportCash = modelInputs.gift * scenario.fundingAdditionality;
    const organizationScaleFraction = additionalSupportCash / modelInputs.fy2024Expense;

    // Preserve accepted-v3 operation order exactly so the NFP component is a
    // bit-for-bit unchanged extension rather than a numerically retuned model.
    const nfpActiveFamilyYearEquivalentsBeforeConversion = additionalSupportCash
      / (modelInputs.fy2024Expense / modelInputs.nfpFamiliesServed2024);
    const nfpFullCourseEquivalentsBeforeRealization = nfpActiveFamilyYearEquivalentsBeforeConversion
      / modelInputs.modeledNfpCourseDurationYears;
    const nfpRealizedFullCourseEquivalents = nfpFullCourseEquivalentsBeforeRealization * scenario.nfpServiceRealization;
    const nfpGiftQaly = nfpRealizedFullCourseEquivalents * scenario.nfpQalyPerCompletedCourse;

    const childFirstReportedFamilyEquivalentsBeforeRealization = additionalSupportCash
      / (modelInputs.fy2024Expense / modelInputs.childFirstFamiliesServed2024);
    const childFirstUniqueRealizedFamilyEquivalents = childFirstReportedFamilyEquivalentsBeforeRealization
      * scenario.childFirstServiceRealization
      * scenario.childFirstRecipientUniqueness;
    const childFirstQalyPerRealizedFamily = scenario.childFirstFiniteUtilityBridgeBeforeTransfer
      * scenario.childFirstCausalTransfer;
    const childFirstGiftQaly = childFirstUniqueRealizedFamilyEquivalents * childFirstQalyPerRealizedFamily;
    const giftQaly = nfpGiftQaly + childFirstGiftQaly;

    // Gross resources count the ordinary gift once. Local delivery resources are
    // charged to funded (pre-realization) equivalents for each program; the
    // proportional overhead allocation ensures their modeled internal Changent
    // expense sums exactly to additionalSupportCash before it is subtracted once.
    const nfpDeliveryResources = nfpFullCourseEquivalentsBeforeRealization * scenario.nfpFullDeliveryCostPerCourse;
    const childFirstDeliveryResources = childFirstReportedFamilyEquivalentsBeforeRealization * scenario.childFirstFullDeliveryCostPerFamily;
    const reconstructedInternalExpense = nfpFullCourseEquivalentsBeforeRealization * nfpAllocatedExpensePerFullCourse
      + childFirstReportedFamilyEquivalentsBeforeRealization * childFirstAllocatedExpensePerFamily;
    if (!approximatelyEqual(reconstructedInternalExpense, additionalSupportCash)) {
      throw new RangeError("allocated program expense must reconstruct additional support cash");
    }
    const modeledInternalExpense = additionalSupportCash;
    const externalResources = Math.max(0, nfpDeliveryResources + childFirstDeliveryResources - modeledInternalExpense);
    const grossResources = modelInputs.gift + externalResources;

    // No Child First Bay/SF affiliate was verified. Local impact is therefore
    // limited to the existing NFP geography priors and is unknown, not observed.
    const bayQaly = nfpGiftQaly * scenario.nfpBayShare;
    const sfQaly = nfpGiftQaly * scenario.nfpSfShare;

    return {
      ...scenario,
      additionalSupportCash,
      organizationScaleFraction,
      nfpActiveFamilyYearEquivalentsBeforeConversion,
      nfpFullCourseEquivalentsBeforeRealization,
      nfpRealizedFullCourseEquivalents,
      nfpGiftQaly,
      childFirstReportedFamilyEquivalentsBeforeRealization,
      childFirstUniqueRealizedFamilyEquivalents,
      childFirstQalyPerRealizedFamily,
      childFirstGiftQaly,
      giftQaly,
      nfpDeliveryResources,
      childFirstDeliveryResources,
      reconstructedInternalExpense,
      modeledInternalExpense,
      externalResources,
      grossResources,
      bayQaly,
      sfQaly,
      donorCostPer10Qaly: giftQaly > 0 ? modelInputs.gift * 10 / giftQaly : null,
      grossCostPer10Qaly: giftQaly > 0 ? grossResources * 10 / giftQaly : null,
    };
  });

  const weighted = results.reduce((accumulator, result) => {
    accumulator.nfpGiftQaly += result.weight * result.nfpGiftQaly;
    accumulator.childFirstGiftQaly += result.weight * result.childFirstGiftQaly;
    accumulator.giftQaly += result.weight * result.giftQaly;
    accumulator.bayQaly += result.weight * result.bayQaly;
    accumulator.sfQaly += result.weight * result.sfQaly;
    accumulator.grossResources += result.weight * result.grossResources;
    return accumulator;
  }, { nfpGiftQaly: 0, childFirstGiftQaly: 0, giftQaly: 0, bayQaly: 0, sfQaly: 0, grossResources: 0 });

  const positive = weighted.giftQaly > 0;
  weighted.childFirstShareOfSignedExpectedQaly = positive ? weighted.childFirstGiftQaly / weighted.giftQaly : null;
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

  return { inputs: modelInputs, diagnostics, scenarios: results, weighted, noFavorable };
}

export const calculateChangentPortfolio = calculate;

export function calculateNfpMortalityHorizonSensitivity(
  modelInputs = inputs,
  scenarioInputs = scenarios,
  horizonInputs = mortalityHorizonSensitivityInputs,
) {
  requireObject(horizonInputs, "horizonInputs");
  for (const key of ["remainingLifeYearsAtAge10", "healthUtility", "coreFollowupBoundQalyPerPreventedDeath"]) {
    requireFinite(horizonInputs[key], `horizonInputs.${key}`, { min: 0, exclusiveMin: true });
  }
  requireFinite(horizonInputs.annualDiscountRate, "horizonInputs.annualDiscountRate", { min: 0, max: 1 });
  const discountedFiniteQalyPerPreventedDeath = horizonInputs.annualDiscountRate === 0
    ? horizonInputs.healthUtility * horizonInputs.remainingLifeYearsAtAge10
    : horizonInputs.healthUtility
      * (1 - Math.pow(1 + horizonInputs.annualDiscountRate, -horizonInputs.remainingLifeYearsAtAge10))
      / horizonInputs.annualDiscountRate;
  const positiveNfpQalyScale = discountedFiniteQalyPerPreventedDeath
    / horizonInputs.coreFollowupBoundQalyPerPreventedDeath;
  const adjustedScenarios = scenarioInputs.map((scenario) => ({
    ...scenario,
    nfpQalyPerCompletedCourse: scenario.nfpQalyPerCompletedCourse > 0
      ? scenario.nfpQalyPerCompletedCourse * positiveNfpQalyScale
      : scenario.nfpQalyPerCompletedCourse,
  }));
  const result = calculate(modelInputs, adjustedScenarios);
  return {
    assumptions: horizonInputs,
    discountedFiniteQalyPerPreventedDeath,
    positiveNfpQalyScale,
    weighted: result.weighted,
    noFavorable: result.noFavorable,
    scenarioQalyPerCompletedCourse: adjustedScenarios.map(({ name, nfpQalyPerCompletedCourse }) => ({ name, nfpQalyPerCompletedCourse })),
  };
}

export default calculate;

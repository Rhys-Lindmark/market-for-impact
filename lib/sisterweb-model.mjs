
// SisterWeb historically operated under Heluna Health and appears to have become a
// separate charity in 2025. No standalone filing/current expense is public, so the
// annual project-expense and gift-use inputs below are explicit priors.
const ordinaryGift = 100000;
const clientEpisodes = 103; // FY2023-24 people receiving care; not completed births.
const zeroCreditActivities = [
  'breastfeeding initiation and continuation',
  'care coordination and hospital-systems work',
  'doula workforce training, apprenticeship, mentoring, and field-building',
  'supplies and non-health family support',
  'advocacy, research partnership, and national dissemination'
];

export const scenarios = [
  {
    name: 'harm', weight: 0.10, annualExpenseProxy: 1500000,
    completion: 0.60, giftDeployability: 0.20, giftRealization: 0.75,
    grossMultiplier: 1.30, baySharePrior: 1.00, sfSharePrior: 0.95,
    morbidity: {
      cesareanAbsoluteChange: -0.005, qalyPerCesareanAvoided: 0.03,
      psychosocialAffectedShare: 0.10, psychosocialUtilityChange: -0.04,
      psychosocialDurationYears: 0.25,
      pretermAbsoluteChange: 0, qalyPerPretermMorbidityAvoided: 0
    }
  },
  {
    name: 'null', weight: 0.25, annualExpenseProxy: 1200000,
    completion: 0.80, giftDeployability: 0.45, giftRealization: 0.85,
    grossMultiplier: 1.15, baySharePrior: 1.00, sfSharePrior: 0.95,
    morbidity: {
      cesareanAbsoluteChange: 0, qalyPerCesareanAvoided: 0,
      psychosocialAffectedShare: 0, psychosocialUtilityChange: 0,
      psychosocialDurationYears: 0,
      pretermAbsoluteChange: 0, qalyPerPretermMorbidityAvoided: 0
    }
  },
  {
    name: 'central', weight: 0.60, annualExpenseProxy: 1200000,
    completion: 0.80, giftDeployability: 0.45, giftRealization: 0.85,
    grossMultiplier: 1.15, baySharePrior: 1.00, sfSharePrior: 0.95,
    morbidity: {
      cesareanAbsoluteChange: 0.015, qalyPerCesareanAvoided: 0.03,
      psychosocialAffectedShare: 0.30, psychosocialUtilityChange: 0.04,
      psychosocialDurationYears: 0.25,
      pretermAbsoluteChange: 0.001, qalyPerPretermMorbidityAvoided: 0.50
    }
  },
  {
    name: 'favorable-stress', weight: 0.05, annualExpenseProxy: 900000,
    completion: 0.90, giftDeployability: 0.70, giftRealization: 0.95,
    grossMultiplier: 1.05, baySharePrior: 1.00, sfSharePrior: 1.00,
    morbidity: {
      cesareanAbsoluteChange: 0.040, qalyPerCesareanAvoided: 0.08,
      psychosocialAffectedShare: 0.50, psychosocialUtilityChange: 0.08,
      psychosocialDurationYears: 0.50,
      pretermAbsoluteChange: 0.005, qalyPerPretermMorbidityAvoided: 1.00
    }
  }
];

export function calculateScenario(s) {
  const completedCourses = clientEpisodes * s.completion;
  const cesareanQalyPerCourse = s.morbidity.cesareanAbsoluteChange * s.morbidity.qalyPerCesareanAvoided;
  const psychosocialQalyPerCourse = s.morbidity.psychosocialAffectedShare *
    s.morbidity.psychosocialUtilityChange * s.morbidity.psychosocialDurationYears;
  const pretermMorbidityQalyPerCourse = s.morbidity.pretermAbsoluteChange *
    s.morbidity.qalyPerPretermMorbidityAvoided;
  const qalyPerCompletedCourse = cesareanQalyPerCourse + psychosocialQalyPerCourse + pretermMorbidityQalyPerCourse;
  const annualProjectQaly = completedCourses * qalyPerCompletedCourse;
  const giftQaly = annualProjectQaly * (ordinaryGift / s.annualExpenseProxy) *
    s.giftDeployability * s.giftRealization;
  const grossResources = ordinaryGift * s.grossMultiplier;
  const positive = giftQaly > 0;
  return {
    name: s.name,
    completedCourses,
    qalyPerCompletedCourse,
    pathwayQalyPerCourse: {cesarean: cesareanQalyPerCourse, psychosocial: psychosocialQalyPerCourse, pretermMorbidity: pretermMorbidityQalyPerCourse},
    annualProjectQaly,
    giftQaly,
    giftBayQaly: giftQaly * s.baySharePrior,
    giftSfQaly: giftQaly * s.sfSharePrior,
    donorPer10Qaly: positive ? ordinaryGift * 10 / giftQaly : null,
    grossResources,
    illustrativeGrossPer10Qaly: positive ? grossResources * 10 / giftQaly : null,
    illustrativeWholeProjectExpensePer10Qaly: annualProjectQaly > 0 ? s.annualExpenseProxy * 10 / annualProjectQaly : null,
    interpretation: giftQaly < 0 ? 'modeled net harm' : giftQaly === 0 ? 'no modeled health benefit' : 'positive modeled health benefit',
    inputs: s
  };
}

const results = scenarios.map(calculateScenario);
const weightSum = scenarios.reduce((a, s) => a + s.weight, 0);
if (Math.abs(weightSum - 1) > 1e-12) throw Error('scenario weights must sum to one');
for (const r of results) {
  if (!Number.isFinite(r.giftQaly)) throw Error(`${r.name}: nonfinite QALY`);
  if (r.inputs.sfSharePrior > r.inputs.baySharePrior) throw Error(`${r.name}: SF must nest within Bay`);
}
const weightedGiftQaly = results.reduce((a, r) => a + r.inputs.weight * r.giftQaly, 0);
const weightedBayGiftQaly = results.reduce((a, r) => a + r.inputs.weight * r.giftBayQaly, 0);
const weightedSfGiftQaly = results.reduce((a, r) => a + r.inputs.weight * r.giftSfQaly, 0);
const weightedGrossResources = results.reduce((a, r) => a + r.inputs.weight * r.grossResources, 0);
if (!(weightedGiftQaly > 0)) throw Error('weighted QALY must be positive');
const weighted = {
  scenarioWeights: Object.fromEntries(scenarios.map(s => [s.name, s.weight])),
  gift: ordinaryGift,
  weightedGiftQaly,
  weightedBayGiftQaly,
  weightedSfGiftQaly,
  assumedBayShareOfSignedQaly: weightedBayGiftQaly / weightedGiftQaly,
  assumedSfShareOfSignedQaly: weightedSfGiftQaly / weightedGiftQaly,
  donorPer10Qaly: ordinaryGift * 10 / weightedGiftQaly,
  illustrativeGrossResources: weightedGrossResources,
  illustrativeGrossPer10Qaly: weightedGrossResources * 10 / weightedGiftQaly,
  bayDonorPer10Qaly: ordinaryGift * 10 / weightedBayGiftQaly,
  sfDonorPer10Qaly: ordinaryGift * 10 / weightedSfGiftQaly,
  interpretation: 'signed reasoned-prior illustration; not audited SisterWeb expense, observed causal effect, or verified next-gift offer'
};

export function calculate(){return {ordinaryGift, clientEpisodes, zeroCreditActivities, weighted, results};}

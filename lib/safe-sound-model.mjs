
// Safe & Sound whole-organization ordinary-gift illustration.
// Organization outputs are reported; effect and gift factors are explicit analyst priors.
export const inputs = {
  modelVersion: "safe-sound-whole-org-v2",
  gift: 100000,
  fy2024Expense: 13205575,
  fy2024ResourceOutlayBeforeDirectDonorBenefits: 13463573,
  directDonorBenefits: 257998,
  fy2024ProgramExpense: 10631789,
  childrenFamilyExpense: 4194131,
  communityEducationExpense: 2697576,
  strategicPolicyExpense: 3740082,
  fy2024Revenue: 11332023,
  fy2024Deficit: 1873552,
  unrestrictedNetAssets: 15605308,
  cashAndInvestments: 10920345,
  recognizedInKind: 258071,
  reportedDirectPeople: 13325,
  reportedIFSChildrenCaregivers: 333,
};

export const scenarios = [
  {
    name: "harm",
    weight: 0.10,
    effectiveIFSShare: 0.30,
    causalTransfer: 0.50,
    components: {
      stress: { affectedShare: 0.20, utilityChange: -0.03, years: 0.50 },
      familyFunction: { affectedShare: 0, utilityChange: 0, years: 0 },
      maltreatment: { absoluteCasesAverted: 0, qalyPerCase: 0 },
    },
    giftDeployability: 0.20,
    giftRealization: 0.75,
    partnerResourceMultiplier: 1.00,
    bayShare: 1.00,
    sfShare: 0.90,
  },
  {
    name: "null",
    weight: 0.35,
    effectiveIFSShare: 0.60,
    causalTransfer: 0,
    components: {
      stress: { affectedShare: 0, utilityChange: 0, years: 0 },
      familyFunction: { affectedShare: 0, utilityChange: 0, years: 0 },
      maltreatment: { absoluteCasesAverted: 0, qalyPerCase: 0 },
    },
    giftDeployability: 0.30,
    giftRealization: 0.80,
    partnerResourceMultiplier: 1.00,
    bayShare: 1.00,
    sfShare: 0.95,
  },
  {
    name: "central",
    weight: 0.50,
    effectiveIFSShare: 0.60,
    causalTransfer: 0.30,
    components: {
      stress: { affectedShare: 0.30, utilityChange: 0.03, years: 0.50 },
      familyFunction: { affectedShare: 0.20, utilityChange: 0.02, years: 0.50 },
      maltreatment: { absoluteCasesAverted: 0, qalyPerCase: 0 },
    },
    giftDeployability: 0.30,
    giftRealization: 0.85,
    partnerResourceMultiplier: 1.02,
    bayShare: 1.00,
    sfShare: 0.95,
  },
  {
    name: "favorableStress",
    weight: 0.05,
    effectiveIFSShare: 0.80,
    causalTransfer: 0.60,
    components: {
      stress: { affectedShare: 0.50, utilityChange: 0.06, years: 1.00 },
      familyFunction: { affectedShare: 0.30, utilityChange: 0.04, years: 1.00 },
      maltreatment: { absoluteCasesAverted: 0.01, qalyPerCase: 0.50 },
    },
    giftDeployability: 0.60,
    giftRealization: 0.95,
    partnerResourceMultiplier: 1.05,
    bayShare: 1.00,
    sfShare: 0.98,
  },
];

export function modelScenario(s) {
  const qalyPerEffectiveIFS = Object.values(s.components).reduce((sum, c) => {
    if (Object.prototype.hasOwnProperty.call(c, "absoluteCasesAverted")) return sum + c.absoluteCasesAverted * c.qalyPerCase;
    return sum + c.affectedShare * c.utilityChange * c.years;
  }, 0);
  const effectiveIFSPersonEquivalents = inputs.reportedIFSChildrenCaregivers * s.effectiveIFSShare;
  const annualOrganizationQaly = effectiveIFSPersonEquivalents * qalyPerEffectiveIFS * s.causalTransfer;
  const giftShareOfWholeExpense = inputs.gift / inputs.fy2024Expense;
  const giftQaly = annualOrganizationQaly * giftShareOfWholeExpense * s.giftDeployability * s.giftRealization;
  const auditedGrossBaseMultiplier = inputs.fy2024ResourceOutlayBeforeDirectDonorBenefits / inputs.fy2024Expense;
  return {
    ...s,
    qalyPerEffectiveIFS,
    effectiveIFSPersonEquivalents,
    annualOrganizationQaly,
    giftShareOfWholeExpense,
    giftLinkedReportedIFSBeforeFactors: inputs.reportedIFSChildrenCaregivers * giftShareOfWholeExpense,
    giftQaly,
    bayQaly: giftQaly * s.bayShare,
    sfQaly: giftQaly * s.sfShare,
    donorCostPer10Qaly: giftQaly > 0 ? inputs.gift * 10 / giftQaly : null,
    auditedGrossBaseMultiplier,
    grossResources: inputs.gift * auditedGrossBaseMultiplier * s.partnerResourceMultiplier,
    grossCostPer10Qaly: giftQaly > 0 ? inputs.gift * auditedGrossBaseMultiplier * s.partnerResourceMultiplier * 10 / giftQaly : null,
    wholeOrgExpensePer10ScenarioQaly: annualOrganizationQaly > 0 ? inputs.fy2024Expense * 10 / annualOrganizationQaly : null,
  };
}

const results = scenarios.map(modelScenario);
const weighted = results.reduce((a, r) => {
  a.giftQaly += r.weight * r.giftQaly;
  a.bayQaly += r.weight * r.bayQaly;
  a.sfQaly += r.weight * r.sfQaly;
  a.grossResources += r.weight * r.grossResources;
  return a;
}, { giftQaly: 0, bayQaly: 0, sfQaly: 0, grossResources: 0 });
weighted.donorCostPer10Qaly = weighted.giftQaly > 0 ? inputs.gift * 10 / weighted.giftQaly : null;
weighted.grossCostPer10Qaly = weighted.giftQaly > 0 ? weighted.grossResources * 10 / weighted.giftQaly : null;
weighted.bayImpactShare = weighted.giftQaly !== 0 ? weighted.bayQaly / weighted.giftQaly : null;
weighted.sfImpactShare = weighted.giftQaly !== 0 ? weighted.sfQaly / weighted.giftQaly : null;
weighted.favorableShareOfSignedExpectedQaly = results[3].weight * results[3].giftQaly / weighted.giftQaly;

const zeroFavorable = {
  // Retains harm and null probability; renormalizes the first three cases.
  retainedWeight: scenarios[0].weight + scenarios[1].weight + scenarios[2].weight,
};
zeroFavorable.giftQaly = (results[0].weight * results[0].giftQaly + results[1].weight * results[1].giftQaly + results[2].weight * results[2].giftQaly) / zeroFavorable.retainedWeight;
zeroFavorable.donorCostPer10Qaly = zeroFavorable.giftQaly > 0 ? inputs.gift * 10 / zeroFavorable.giftQaly : null;

export function calculate(){return {inputs,scenarios:results,weighted,zeroFavorable};}

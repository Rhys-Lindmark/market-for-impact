
export const inputs = {
  modelVersion: "california-immunization-coalition-v1",
  gift: 100000,
  fy2024Expense: 422714,
  fy2024Revenue: 402482,
  fy2024NetAssets: 213077,
  benchmarkKindergartenCohort: 500000,
  sb277StateMmrCoverageIncrease: 0.033,
  highSideFullScheduleResourceProxyPerCoverageAffectedChild: 2050,
  cdcBirthCohortChildren: 117000000,
  cdcMmrDeathsPrevented: 87600,
  cdcMmrIllnessesPrevented: 222581000,
  cdcMmrHospitalizationsPrevented: 15417000,
};

const benchmarkCoverageAffectedChildEquivalents = inputs.benchmarkKindergartenCohort * inputs.sb277StateMmrCoverageIncrease;

export const scenarios = [
  {name:"harm",weight:0.10,annualPolicyEquivalent:0.01,organizationAttribution:0.02,harmQalyPerCoverageAffectedChild:-0.0002,finiteQalyPerDeath:0,qalyPerIllness:0,qalyPerHospitalization:0,modernMarginalTransfer:0,giftDeployability:0.25,realization:0.75,bayShare:0.20,sfShare:0.02},
  {name:"null",weight:0.40,annualPolicyEquivalent:0,organizationAttribution:0.00,harmQalyPerCoverageAffectedChild:0,finiteQalyPerDeath:0,qalyPerIllness:0,qalyPerHospitalization:0,modernMarginalTransfer:0,giftDeployability:0.35,realization:0.80,bayShare:0.20,sfShare:0.02},
  {name:"central",weight:0.45,annualPolicyEquivalent:0.05,organizationAttribution:0.05,harmQalyPerCoverageAffectedChild:0,finiteQalyPerDeath:30,qalyPerIllness:0.002,qalyPerHospitalization:0.03,modernMarginalTransfer:0.05,giftDeployability:0.35,realization:0.85,bayShare:0.20,sfShare:0.02},
  {name:"favorableStress",weight:0.05,annualPolicyEquivalent:0.20,organizationAttribution:0.15,harmQalyPerCoverageAffectedChild:0,finiteQalyPerDeath:35,qalyPerIllness:0.004,qalyPerHospitalization:0.05,modernMarginalTransfer:0.15,giftDeployability:0.65,realization:0.95,bayShare:0.20,sfShare:0.02},
];

const giftShare = inputs.gift / inputs.fy2024Expense;
const results = scenarios.map(s => {
  const historicalMmrQalyUpperCalibration =
    inputs.cdcMmrDeathsPrevented / inputs.cdcBirthCohortChildren * s.finiteQalyPerDeath +
    inputs.cdcMmrIllnessesPrevented / inputs.cdcBirthCohortChildren * s.qalyPerIllness +
    inputs.cdcMmrHospitalizationsPrevented / inputs.cdcBirthCohortChildren * s.qalyPerHospitalization;
  const qalyPerCoverageAffectedChild = s.harmQalyPerCoverageAffectedChild || historicalMmrQalyUpperCalibration * s.modernMarginalTransfer;
  const annualOrganizationCoverageAffectedChildEquivalents = benchmarkCoverageAffectedChildEquivalents * s.annualPolicyEquivalent * s.organizationAttribution;
  const annualOrganizationQaly = annualOrganizationCoverageAffectedChildEquivalents * qalyPerCoverageAffectedChild;
  const giftCoverageAffectedChildEquivalents = annualOrganizationCoverageAffectedChildEquivalents * giftShare * s.giftDeployability * s.realization;
  const giftQaly = giftCoverageAffectedChildEquivalents * qalyPerCoverageAffectedChild;
  const deliveryResource = Math.abs(giftCoverageAffectedChildEquivalents) * inputs.highSideFullScheduleResourceProxyPerCoverageAffectedChild;
  const grossResources = inputs.gift + deliveryResource;
  return {...s,historicalMmrQalyUpperCalibration,qalyPerCoverageAffectedChild,annualOrganizationCoverageAffectedChildEquivalents,annualOrganizationQaly,giftShare,giftCoverageAffectedChildEquivalents,giftQaly,deliveryResource,grossResources,bayQaly:giftQaly*s.bayShare,sfQaly:giftQaly*s.sfShare,donorCostPer10Qaly:giftQaly>0?inputs.gift*10/giftQaly:null,grossCostPer10Qaly:giftQaly>0?grossResources*10/giftQaly:null,wholeOrgExpensePer10ScenarioQaly:annualOrganizationQaly>0?inputs.fy2024Expense*10/annualOrganizationQaly:null};
});

const weighted = results.reduce((a,r)=>{a.giftQaly+=r.weight*r.giftQaly;a.bayQaly+=r.weight*r.bayQaly;a.sfQaly+=r.weight*r.sfQaly;a.grossResources+=r.weight*r.grossResources;return a;},{giftQaly:0,bayQaly:0,sfQaly:0,grossResources:0});
weighted.donorCostPer10Qaly=weighted.giftQaly>0?inputs.gift*10/weighted.giftQaly:null;
weighted.grossCostPer10Qaly=weighted.giftQaly>0?weighted.grossResources*10/weighted.giftQaly:null;
weighted.bayImpactShare=weighted.giftQaly?weighted.bayQaly/weighted.giftQaly:null;
weighted.sfImpactShare=weighted.giftQaly?weighted.sfQaly/weighted.giftQaly:null;
weighted.favorableShareOfSignedExpectedQaly=results[3].weight*results[3].giftQaly/weighted.giftQaly;

const noFavorableWeight=scenarios[0].weight+scenarios[1].weight+scenarios[2].weight;
const noFavorableQaly=(results[0].weight*results[0].giftQaly+results[1].weight*results[1].giftQaly+results[2].weight*results[2].giftQaly)/noFavorableWeight;

export function calculate(){return {inputs,benchmarkCoverageAffectedChildEquivalents,scenarios:results,weighted,noFavorable:{giftQaly:noFavorableQaly,donorCostPer10Qaly:noFavorableQaly>0?inputs.gift*10/noFavorableQaly:null}};}

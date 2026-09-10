export const inputs = {
  giftUsd: 100000,
  fy2024WholeOrganizationExpenseUsd: 5975906,
  fy2024Meals: 226432,
  fy2024ReportedClients: 1489,
  fy2024VolunteerHours: 42519,
  fy2024ReportedVolunteerValueUsd: 1037591,
  fy2024ReportedInKindAtLeastUsd: 266482,
  mealsPerTrialCourse: 70,
  trialParticipants: 1977,
  trialMealArm: 993,
  trialUsualCareArm: 984,
  primaryHospitalizationHazardRatio: 1.02,
  exploratoryMealArmMortalityRisk: 0.041,
  exploratoryUsualCareMortalityRisk: 0.054,
  sfShare: 0
};

export const scenarios = [
  {name:'null',weight:.60,fundingAdditionality:.05,trialLikeCaseShare:.05,uniqueDoseReliability:.60,mortalityAbsoluteRiskReduction:0,durableMortalityTransfer:0,survivalHorizonYears:2,annualSubsequentSurvival:.50,healthUtility:.55,eventDelayYears:.25,grossResourceMultiplier:1.1736290698012988,bayShare:.80},
  {name:'central',weight:.30,fundingAdditionality:.20,trialLikeCaseShare:.10,uniqueDoseReliability:.75,mortalityAbsoluteRiskReduction:.003,durableMortalityTransfer:.25,survivalHorizonYears:3,annualSubsequentSurvival:.65,healthUtility:.60,eventDelayYears:.25,grossResourceMultiplier:1.1736290698012988,bayShare:.90},
  {name:'upside',weight:.10,fundingAdditionality:.50,trialLikeCaseShare:.30,uniqueDoseReliability:.90,mortalityAbsoluteRiskReduction:.013,durableMortalityTransfer:.50,survivalHorizonYears:5,annualSubsequentSurvival:.75,healthUtility:.70,eventDelayYears:.25,grossResourceMultiplier:1.1736290698012988,bayShare:1.00}
];

export function finiteSurvivalQalys(s, discountRate=.03) {
  if(!Number.isInteger(s.survivalHorizonYears)||s.survivalHorizonYears<0||s.annualSubsequentSurvival<0||s.annualSubsequentSurvival>1||s.healthUtility<0||s.healthUtility>1||discountRate<0)throw new RangeError('finite survival inputs');
  let total=0;
  for(let t=1;t<=s.survivalHorizonYears;t+=1){
    total += s.healthUtility*s.annualSubsequentSurvival**(t-.5)/(1+discountRate)**(t-.5+s.eventDelayYears);
  }
  return total;
}

export function calculate(i=inputs, ss=scenarios) {
  const weight=ss.reduce((a,s)=>a+s.weight,0);if(Math.abs(weight-1)>1e-12)throw new RangeError('scenario weights');
  const giftShare=i.giftUsd/i.fy2024WholeOrganizationExpenseUsd;
  const giftLinkedMeals=i.fy2024Meals*giftShare;
  const giftLinkedReportedClients=i.fy2024ReportedClients*giftShare;
  const nominalTrialCourses=giftLinkedMeals/i.mealsPerTrialCourse;
  const clientBoundedNominalCourses=Math.min(giftLinkedReportedClients,nominalTrialCourses);
  const rows=ss.map(s=>{
    const effectiveTrialLikeCourses=clientBoundedNominalCourses*s.fundingAdditionality*s.trialLikeCaseShare*s.uniqueDoseReliability;
    const finiteQalyTailPerAverted90DayDeath=finiteSurvivalQalys(s);
    const qalyPerAverted90DayDeath=finiteQalyTailPerAverted90DayDeath*s.durableMortalityTransfer;
    const giftQaly=effectiveTrialLikeCourses*s.mortalityAbsoluteRiskReduction*qalyPerAverted90DayDeath;
    const modeledGrossResourcesUsd=i.giftUsd*s.grossResourceMultiplier;
    return {...s,effectiveTrialLikeCourses,finiteQalyTailPerAverted90DayDeath,qalyPerAverted90DayDeath,giftQaly,
      modeledOrdinaryGiftCostPer10Qaly:giftQaly===0?null:i.giftUsd*10/giftQaly,
      modeledGrossResourceCostPer10Qaly:giftQaly===0?null:modeledGrossResourcesUsd*10/giftQaly,
      modeledGrossResourcesUsd,verifiedMarginalGiftCostPer10Qaly:null,verifiedMarginalGrossCostPer10Qaly:null,
      bayQaly:giftQaly*s.bayShare,sfQaly:giftQaly*i.sfShare};
  });
  const weighted=rows.reduce((a,r)=>{a.giftQaly+=r.weight*r.giftQaly;a.modeledGrossResourcesUsd+=r.weight*r.modeledGrossResourcesUsd;a.bayQaly+=r.weight*r.bayQaly;return a;},{giftQaly:0,modeledGrossResourcesUsd:0,bayQaly:0});
  weighted.modeledOrdinaryGiftCostPer10Qaly=weighted.giftQaly===0?null:i.giftUsd*10/weighted.giftQaly;
  weighted.modeledGrossResourceCostPer10Qaly=weighted.giftQaly===0?null:weighted.modeledGrossResourcesUsd*10/weighted.giftQaly;
  weighted.bayImpactShare=weighted.giftQaly===0?null:weighted.bayQaly/weighted.giftQaly;
  weighted.sfImpactShare=i.sfShare;
  weighted.verifiedMarginalGiftCostPer10Qaly=null;
  weighted.verifiedMarginalGrossCostPer10Qaly=null;
  return {inputs:i,giftShare,giftLinkedMeals,giftLinkedReportedClients,nominalTrialCourses,clientBoundedNominalCourses,scenarios:rows,weighted,
    unknownExternalResources:['reported in-kind goods if outside Form 990 expense (overlap unconfirmed)','organic-food opportunity cost beyond booked expense','patient and caregiver time','outside clinical care','payer resources caused by a marginal course'],
    verdict:'PUBLISH AS UNFAVORABLE/UNCERTAIN: randomized primary endpoint null; modeled mortality pathway is exploratory and prior-dependent.'};
}

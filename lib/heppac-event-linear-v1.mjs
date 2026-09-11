const expense=4953186;
const ordinaryGift=100000;
const noBenefitWeight=0.20;
const noBenefitGrossMultiplier=1.10;
const zeroCreditPathways=['drop-in basic needs','HIV/HCV screening-counseling-referral-linkage','community/mobile outreach and condoms','abscess wound care','acupuncture/herbalist','B-DUHB interventions','unresolved fiscal-sponsorship/pass-through activity'];
const scenarios=[
 // Reversal, treatment-engagement, infection, and checking volumes are judgment-only
 // sensitivities. In particular, the 10/25/50 treatment engagements are not HEPPAC
 // observations and are not annualized from Anderson et al.'s five-month SUN study.
 {name:'downside',weight:0.24,giftDeployableShare:0.20,giftRealizationDiscount:0.70,bayImpactSharePrior:0.85,sfImpactSharePrior:0.00,grossMultiplier:1.10,mortalityOverlapAdjustment:0.80,survival:{horizon:5,annualSurvival:0.65,utility:0.55,discount:0.03},
  naloxone:{reversals:20,otherwiseFatal:0.05,attribution:0.60,outcomeAdditionality:0.25},
  moud:{starts:10,retainedEffective:0.50,qalyPerRetainedEffectiveEngagementSensitivity:0.25,outcomeAdditionality:0.25},
  syringe:{infectionsAverted:0.25,attribution:0.50,qaly:3,outcomeAdditionality:0.25},
  checking:{fatalOverdosesAverted:0.05,attribution:0.25,outcomeAdditionality:0.25}},
 {name:'central',weight:0.48,giftDeployableShare:0.45,giftRealizationDiscount:0.85,bayImpactSharePrior:0.95,sfImpactSharePrior:0.02,grossMultiplier:1.15,mortalityOverlapAdjustment:0.70,survival:{horizon:10,annualSurvival:0.75,utility:0.65,discount:0.03},
  naloxone:{reversals:50,otherwiseFatal:0.10,attribution:0.75,outcomeAdditionality:0.50},
  moud:{starts:25,retainedEffective:0.60,qalyPerRetainedEffectiveEngagementSensitivity:0.50,outcomeAdditionality:0.50},
  syringe:{infectionsAverted:1,attribution:0.65,qaly:5,outcomeAdditionality:0.50},
  checking:{fatalOverdosesAverted:0.25,attribution:0.50,outcomeAdditionality:0.50}},
 {name:'favorable-stress',weight:0.08,giftDeployableShare:0.70,giftRealizationDiscount:0.95,bayImpactSharePrior:0.99,sfImpactSharePrior:0.05,grossMultiplier:1.30,mortalityOverlapAdjustment:0.60,survival:{horizon:20,annualSurvival:0.82,utility:0.75,discount:0.03},
  naloxone:{reversals:137,otherwiseFatal:0.15,attribution:0.85,outcomeAdditionality:0.75},
  moud:{starts:50,retainedEffective:0.70,qalyPerRetainedEffectiveEngagementSensitivity:1.0,outcomeAdditionality:0.75},
  syringe:{infectionsAverted:3,attribution:0.80,qaly:8,outcomeAdditionality:0.75},
  checking:{fatalOverdosesAverted:1,attribution:0.75,outcomeAdditionality:0.75}}
];
export function calc(s){
 let perFatalEventQaly=0;
 for(let t=0;t<s.survival.horizon;t++) perFatalEventQaly+=Math.pow(s.survival.annualSurvival,t)*s.survival.utility/Math.pow(1+s.survival.discount,t);
 const n=s.naloxone.reversals*s.naloxone.otherwiseFatal*s.naloxone.attribution*perFatalEventQaly*s.naloxone.outcomeAdditionality;
 const m=s.moud.starts*s.moud.retainedEffective*s.moud.qalyPerRetainedEffectiveEngagementSensitivity*s.moud.outcomeAdditionality;
 const y=s.syringe.infectionsAverted*s.syringe.attribution*s.syringe.qaly*s.syringe.outcomeAdditionality;
 const c=s.checking.fatalOverdosesAverted*s.checking.attribution*perFatalEventQaly*s.checking.outcomeAdditionality;
 const sharedMortalityRaw=n+m+c;
 const sharedMortalityAdjusted=sharedMortalityRaw*s.mortalityOverlapAdjustment;
 const total=sharedMortalityAdjusted+y;
 // Conditional ordinary-gift estimate retains pathway outcome-additionality and then
 // funds the explicit deployable fraction of a $100k gift pro rata. Constant returns assumed.
 const annualOrgAttributedQaly=total;
 const giftQaly=annualOrgAttributedQaly*(ordinaryGift*s.giftDeployableShare/expense)*s.giftRealizationDiscount;
 const giftBayQaly=giftQaly*s.bayImpactSharePrior;
 const giftSfQaly=giftQaly*s.sfImpactSharePrior;
 return {name:s.name,perFatalEventQaly,pathwayQalyRaw:{naloxone:n,moud:m,syringe:y,drugChecking:c},sharedMortalityRaw,sharedMortalityAdjusted,totalQaly:total,illustrativeWholeOrgSpendingPer10AttributedQaly:expense*10/total,illustrativeGrossResources:expense*s.grossMultiplier,illustrativeGrossPer10AttributedQaly:expense*s.grossMultiplier*10/total,conditionalOrdinaryGift:{gift:ordinaryGift,annualOrgAttributedQaly,giftQaly,giftBayQaly,giftSfQaly,donorPer10Qaly:ordinaryGift*10/giftQaly,grossResources:ordinaryGift*s.grossMultiplier,grossPer10Qaly:ordinaryGift*s.grossMultiplier*10/giftQaly,bayDonorPer10Qaly:giftBayQaly?ordinaryGift*10/giftBayQaly:null,sfDonorPer10Qaly:giftSfQaly?ordinaryGift*10/giftSfQaly:null},inputs:s};
}
const results=scenarios.map(calc);
for(const r of results) for(const v of [r.totalQaly,r.illustrativeWholeOrgSpendingPer10AttributedQaly,r.illustrativeGrossPer10AttributedQaly]) if(!Number.isFinite(v)||v<=0) throw Error('invalid');
if(!(results[0].illustrativeWholeOrgSpendingPer10AttributedQaly>results[1].illustrativeWholeOrgSpendingPer10AttributedQaly&&results[1].illustrativeWholeOrgSpendingPer10AttributedQaly>results[2].illustrativeWholeOrgSpendingPer10AttributedQaly)) throw Error('ordering');
const noBenefit={weight:noBenefitWeight,totalQaly:0,giftQaly:0,grossResources:ordinaryGift*noBenefitGrossMultiplier,illustrativeWholeOrgSpendingPer10AttributedQaly:null,illustrativeGrossPer10AttributedQaly:null,conditionalOrdinaryGiftDonorPer10Qaly:null,conditionalOrdinaryGiftGrossPer10Qaly:null,interpretation:'infinite/undefined spending per QALY'};
const weightSum=scenarios.reduce((a,s)=>a+s.weight,0);
if(Math.abs(weightSum+noBenefitWeight-1)>1e-12) throw Error('weights');
const weightedGiftQaly=results.reduce((a,r)=>a+r.inputs.weight*r.conditionalOrdinaryGift.giftQaly,0);
const weightedBayGiftQaly=results.reduce((a,r)=>a+r.inputs.weight*r.conditionalOrdinaryGift.giftBayQaly,0);
const weightedSfGiftQaly=results.reduce((a,r)=>a+r.inputs.weight*r.conditionalOrdinaryGift.giftSfQaly,0);
const weightedGrossResources=results.reduce((a,r)=>a+r.inputs.weight*r.conditionalOrdinaryGift.grossResources,0)+noBenefitWeight*noBenefit.grossResources;
const conditionalOrdinaryGiftWeighted={scenarioWeights:{...Object.fromEntries(scenarios.map(s=>[s.name,s.weight])),'no-benefit':noBenefitWeight},gift:ordinaryGift,weightedGiftQaly,weightedBayGiftQaly,weightedSfGiftQaly,donorPer10Qaly:ordinaryGift*10/weightedGiftQaly,grossResources:weightedGrossResources,grossPer10Qaly:weightedGrossResources*10/weightedGiftQaly,bayDonorPer10Qaly:ordinaryGift*10/weightedBayGiftQaly,sfDonorPer10Qaly:ordinaryGift*10/weightedSfGiftQaly,interpretation:'reasoned-prior conditional estimate including explicit no-benefit weight; not a verified funding offer or empirically identified effect'};
export function calculate(){return {expense,ordinaryGift,zeroCreditPathways,noBenefit,conditionalOrdinaryGiftWeighted,results};}

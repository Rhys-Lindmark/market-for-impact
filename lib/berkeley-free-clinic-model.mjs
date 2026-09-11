

const INPUTS=Object.freeze({
 organization:'Berkeley Free Clinic',ordinaryGiftUsd:100000,fy2025ExpenseUsd:453528,fy2025RevenueUsd:371976,
 fy2025DeficitUsd:81552,fy2025ProgramExpenseUsd:376133,fy2025NetAssetsOrFundBalancesUsd:1193255,
 fy2025CashUsd:642665,fy2025InvestmentsUsd:405895,fy2025Clients:2007,fy2025Encounters:3153,
 fy2025Volunteers:150,archivalVolunteerCount:180,archivalVolunteerHours:31000,volunteerHourValueUsd:40.14,
 cityLabContractNteUsd:150000,cityLabContractYears:3,currentRenovationCostUsd:196809,
 currentRenovationAccountingTreatment:null,verifiedBayServiceSiteShare:1,
 measuredBayResidentShare:null,measuredSfResidentShare:null
});

const CENTRAL_VOLUNTEER_HOURS=INPUTS.archivalVolunteerHours*INPUTS.fy2025Volunteers/INPUTS.archivalVolunteerCount;
const CENTRAL_GROSS_FACTOR=(INPUTS.fy2025ExpenseUsd+CENTRAL_VOLUNTEER_HOURS*INPUTS.volunteerHourValueUsd)/INPUTS.fy2025ExpenseUsd;

const SCENARIOS=Object.freeze([
 Object.freeze({name:'harm',weight:.10,fundingAdditionality:.03,currentCapacityTransfer:.50,recipientUniqueness:.80,healthBenefitRealization:1,finiteQalyPerHealthBenefitingClient:-.002,volunteerGrossFactor:4,modeledBayResidentShare:.80,modeledSfResidentShare:.03}),
 Object.freeze({name:'null',weight:.30,fundingAdditionality:.05,currentCapacityTransfer:.40,recipientUniqueness:.80,healthBenefitRealization:0,finiteQalyPerHealthBenefitingClient:0,volunteerGrossFactor:CENTRAL_GROSS_FACTOR,modeledBayResidentShare:.90,modeledSfResidentShare:.03}),
 Object.freeze({name:'cautiousPositive',weight:.30,fundingAdditionality:.08,currentCapacityTransfer:.50,recipientUniqueness:.85,healthBenefitRealization:.10,finiteQalyPerHealthBenefitingClient:.01,volunteerGrossFactor:CENTRAL_GROSS_FACTOR,modeledBayResidentShare:.85,modeledSfResidentShare:.03}),
 Object.freeze({name:'central',weight:.25,fundingAdditionality:.15,currentCapacityTransfer:.70,recipientUniqueness:.90,healthBenefitRealization:.25,finiteQalyPerHealthBenefitingClient:.02,volunteerGrossFactor:CENTRAL_GROSS_FACTOR,modeledBayResidentShare:.90,modeledSfResidentShare:.03}),
 Object.freeze({name:'favorableStress',weight:.05,fundingAdditionality:.35,currentCapacityTransfer:1,recipientUniqueness:.95,healthBenefitRealization:.50,finiteQalyPerHealthBenefitingClient:.06,volunteerGrossFactor:4,modeledBayResidentShare:.95,modeledSfResidentShare:.03})
]);

function price(cost,qaly){return qaly>0?cost*10/qaly:null;}
function validate(i,ss){
 ['ordinaryGiftUsd','fy2025ExpenseUsd','fy2025Clients','fy2025Encounters','volunteerHourValueUsd'].forEach(function(k){if(!(i[k]>0))throw new Error(k+' must be positive');});
 const w=ss.reduce(function(a,s){return a+s.weight;},0);if(Math.abs(w-1)>1e-12)throw new Error('weights must sum to one');
 ss.forEach(function(s){['weight','fundingAdditionality','currentCapacityTransfer','recipientUniqueness','healthBenefitRealization','modeledBayResidentShare','modeledSfResidentShare'].forEach(function(k){if(!(s[k]>=0&&s[k]<=1))throw new Error(k+' must be in [0,1]');});if(s.modeledSfResidentShare>s.modeledBayResidentShare)throw new Error('SF must nest in Bay');if(!(s.volunteerGrossFactor>=1))throw new Error('gross factor must be >=1');});
}

function calculate(inputs,scenarios){
 const i=Object.assign({},INPUTS,inputs||{}),ss=scenarios||SCENARIOS;validate(i,ss);
 const encountersPerReportedClient=i.fy2025Encounters/i.fy2025Clients;
 const cashCostPerReportedClient=i.fy2025ExpenseUsd/i.fy2025Clients;
 const wholeOrgClientScaleBeforeMarginality=i.ordinaryGiftUsd/cashCostPerReportedClient;
 const currentVolunteerHoursProxy=i.archivalVolunteerHours*i.fy2025Volunteers/i.archivalVolunteerCount;
 const currentVolunteerValueProxy=currentVolunteerHoursProxy*i.volunteerHourValueUsd;
 const currentVolunteerInclusiveWholeOrgResourceProxy=i.fy2025ExpenseUsd+currentVolunteerValueProxy;
 const currentVolunteerInclusiveGrossFactor=currentVolunteerInclusiveWholeOrgResourceProxy/i.fy2025ExpenseUsd;
 const outputs=ss.map(function(s){
  const marginalClientEquivalentsBeforeCapacity=wholeOrgClientScaleBeforeMarginality*s.fundingAdditionality;
  const serviceClientEquivalents=marginalClientEquivalentsBeforeCapacity*s.currentCapacityTransfer;
  const uniqueServiceClientEquivalents=serviceClientEquivalents*s.recipientUniqueness;
  const healthBenefitingClientEquivalents=uniqueServiceClientEquivalents*s.healthBenefitRealization;
  const giftQaly=healthBenefitingClientEquivalents*s.finiteQalyPerHealthBenefitingClient;
  const grossResourceUsd=i.ordinaryGiftUsd*s.volunteerGrossFactor;
  return {name:s.name,weight:s.weight,fundingAdditionality:s.fundingAdditionality,currentCapacityTransfer:s.currentCapacityTransfer,
   recipientUniqueness:s.recipientUniqueness,healthBenefitRealization:s.healthBenefitRealization,
   finiteQalyPerHealthBenefitingClient:s.finiteQalyPerHealthBenefitingClient,marginalClientEquivalentsBeforeCapacity:marginalClientEquivalentsBeforeCapacity,
   serviceClientEquivalents:serviceClientEquivalents,uniqueServiceClientEquivalents:uniqueServiceClientEquivalents,
   healthBenefitingClientEquivalents:healthBenefitingClientEquivalents,giftQaly:giftQaly,donorUsdPer10Qaly:price(i.ordinaryGiftUsd,giftQaly),
   volunteerGrossFactor:s.volunteerGrossFactor,illustrativeVolunteerInclusiveGrossResourceUsd:grossResourceUsd,
   illustrativeVolunteerInclusiveGrossUsdPer10Qaly:price(grossResourceUsd,giftQaly),modeledBayResidentShare:s.modeledBayResidentShare,
   modeledSfResidentShare:s.modeledSfResidentShare,bayResidentQaly:giftQaly*s.modeledBayResidentShare,sfResidentQaly:giftQaly*s.modeledSfResidentShare};
 });
 function weighted(k){return outputs.reduce(function(a,s){return a+s.weight*s[k];},0);}
 const expectedGiftQaly=weighted('giftQaly'),expectedGross=weighted('illustrativeVolunteerInclusiveGrossResourceUsd'),bayQ=weighted('bayResidentQaly'),sfQ=weighted('sfResidentQaly');
 const fav=outputs.find(function(s){return s.name==='favorableStress';}),nonFavWeight=1-fav.weight;
 const noFavQ=outputs.filter(function(s){return s.name!=='favorableStress';}).reduce(function(a,s){return a+s.weight*s.giftQaly;},0)/nonFavWeight;
 return {organization:i.organization,recommendation:'PUBLISH_UNFAVORABLE_HOLD_GIVING',estimateStatus:'conditional whole-organization prior; no observed marginal health effect',
  expectedGiftQaly:expectedGiftQaly,donorUsdPer10Qaly:price(i.ordinaryGiftUsd,expectedGiftQaly),verifiedCompleteGrossResourceUsdPer10Qaly:null,
  illustrativeVolunteerInclusiveExpectedGrossResourceUsd:expectedGross,illustrativeVolunteerInclusiveGrossUsdPer10Qaly:price(expectedGross,expectedGiftQaly),
  favorableTailShareOfSignedExpectedQaly:expectedGiftQaly>0?fav.weight*fav.giftQaly/expectedGiftQaly:null,noFavorableExpectedQaly:noFavQ,
  noFavorableDonorUsdPer10Qaly:price(i.ordinaryGiftUsd,noFavQ),verifiedBayServiceSiteShare:i.verifiedBayServiceSiteShare,
  measuredBayResidentShare:i.measuredBayResidentShare,measuredSfResidentShare:i.measuredSfResidentShare,
  modeledBayResidentImpactShare:expectedGiftQaly>0?bayQ/expectedGiftQaly:null,modeledBayResidentUsdPer10Qaly:price(i.ordinaryGiftUsd,bayQ),
  modeledSfResidentImpactShare:expectedGiftQaly>0?sfQ/expectedGiftQaly:null,modeledSfResidentUsdPer10Qaly:price(i.ordinaryGiftUsd,sfQ),
  diagnostics:{encountersPerReportedClient:encountersPerReportedClient,cashCostPerReportedClient:cashCostPerReportedClient,
   wholeOrgClientScaleBeforeMarginality:wholeOrgClientScaleBeforeMarginality,currentVolunteerHoursProxy:currentVolunteerHoursProxy,
   currentVolunteerValueProxy:currentVolunteerValueProxy,currentVolunteerInclusiveWholeOrgResourceProxy:currentVolunteerInclusiveWholeOrgResourceProxy,
   currentVolunteerInclusiveGrossFactor:currentVolunteerInclusiveGrossFactor},
  scope:'All FY2025 expense is charged against the filing-reported clinical client denominator. Referrals, benefits enrollment, outreach, counseling, current transition/buildout and paused dental/TB pathways receive no separate QALY credit.',
  rfmf:'A general donation route, FY2025 deficit, move/buildout and claimed state/local cuts are real. A March 2026 City record documents $196,809 of renovations already undertaken and links the renovated facility to expanded capacity and hours, but does not price resulting clinical throughput. The filing reports $1.193m total net assets/fund balances; restriction and availability are not reported.',
  scenarios:outputs,inputs:i};
}

export {INPUTS,SCENARIOS,calculate};
export default calculate;

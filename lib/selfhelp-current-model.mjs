import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export const version='selfhelp-integrated-health-signed-household-20261004';
const n=(v,key,min=-1e10,max=1e10)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new RangeError(key);return v;};
const fraction=(v,key)=>n(v,key,0,1);
const clone=x=>JSON.parse(JSON.stringify(x));
export const defaults={
 id:'conditionalCourseReference',scope:'targetedCourse',budgetUsd:100000,courseAllocation:1,courseCostUsd:600,
 // Reported six-month integrated QALY increment, counted once, not endpoint utility.
 integratedTrialQaly:.04,positiveClinicalTransfer:.5,serviceAdditionality:.5,
 activationDelayYears:0,clinicalMidpointYears:.25,discountRate:.03,
 sfResidentShare:1,bayResidentShare:1,
 household:{members:1,annualResourcesUsd:40000,years:.5,delayYears:0,positiveIndependentShare:.75,
  // Hypotheses of additional resources versus realistic alternative exercise.
  outOfPocketSavingsUsd:0,netTakeHomeGainUsd:0,netTransferUsd:0,feesUsd:0,incrementalTravelCareUsd:48,incrementalTimeHours:12,timeValueUsd:4},
 independentGiftHarms:{sf:0,restBay:0,outsideBay:0},
 externalResourceUsd:null
};
export function calculate(s=defaults){
 if(!['targetedCourse','annualWork'].includes(s.scope))throw new TypeError('scope');
 n(s.budgetUsd,'budget',0,s.scope==='targetedCourse'?100000:1e10);fraction(s.courseAllocation,'courseAllocation');n(s.courseCostUsd,'course cost',.01,1e8);
 n(s.integratedTrialQaly,'integrated QALY',-1,1);fraction(s.positiveClinicalTransfer,'clinical transfer');fraction(s.serviceAdditionality,'additionality');
 n(s.activationDelayYears,'activation delay',0,100);n(s.clinicalMidpointYears,'clinical midpoint',0,1);n(s.discountRate,'discount',0,1);
 fraction(s.sfResidentShare,'SF residence');fraction(s.bayResidentShare,'Bay residence');if(s.sfResidentShare>s.bayResidentShare)throw new RangeError('nested residence');
 if(!s.independentGiftHarms||Object.keys(s.independentGiftHarms).sort().join(',')!=='outsideBay,restBay,sf')throw new TypeError('exact harm regions');
 Object.values(s.independentGiftHarms).forEach(v=>n(v,'independent harm',0,1e6));
 const harm=Object.fromEntries(Object.entries(s.independentGiftHarms).map(([k,v])=>[k,s.budgetUsd===0?0:v]));
 const h=s.household;n(h.members,'members',1,20);n(h.annualResourcesUsd,'baseline',.01,1e8);n(h.years,'finite income period',.001,20);n(h.delayYears,'income delay',0,100);fraction(h.positiveIndependentShare,'positive income independence');
 for(const k of ['feesUsd','incrementalTravelCareUsd','incrementalTimeHours','timeValueUsd'])n(h[k],k,0,1e8);
 for(const k of ['outOfPocketSavingsUsd','netTakeHomeGainUsd','netTransferUsd'])n(h[k],k);
 const rows=[h.outOfPocketSavingsUsd,h.netTakeHomeGainUsd,h.netTransferUsd,-h.feesUsd,-h.incrementalTravelCareUsd,-h.incrementalTimeHours*h.timeValueUsd];
 const netResourceUsd=rows.reduce((sum,v)=>sum+(v>0?v*h.positiveIndependentShare:v),0);
 const netCashUsd=rows.slice(0,-1).reduce((sum,v)=>sum+v,0);
 const rawIncome=incomeHealthyYearEquivalent({people:h.members,annualIncomeBeforeUSD:h.annualResourcesUsd/h.members,annualIncomeGainUSD:netResourceUsd/h.years/h.members,years:h.years,delayYears:s.activationDelayYears+h.delayYears,discountRate:s.discountRate,independentShare:1});
 const clinicalPerOfferedCourse=s.integratedTrialQaly*(s.integratedTrialQaly>0?s.positiveClinicalTransfer:1)/(1+s.discountRate)**(s.activationDelayYears+s.clinicalMidpointYears);
 const offeredCourses=s.budgetUsd*s.courseAllocation/s.courseCostUsd,causedCourses=offeredCourses*s.serviceAdditionality;
 const health=causedCourses*clinicalPerOfferedCourse,income=causedCourses*rawIncome;
 const region=(share,independentHarm)=>({healthQaly:health*share-independentHarm,incomeEquivalentYears:income*share,combinedEquivalentYears:(health+income)*share-independentHarm});
 const sf=region(s.sfResidentShare,harm.sf),bay=region(s.bayResidentShare,harm.sf+harm.restBay);
 for(const r of [sf,bay])r.usdPerBetterLife=r.combinedEquivalentYears>0?10*s.budgetUsd/r.combinedEquivalentYears:null;
 if(s.externalResourceUsd!==null)n(s.externalResourceUsd,'specified external resources',0,1e10);
 return {version,id:s.id,scope:s.scope,budgetUsd:s.budgetUsd,donorCostUsd:s.scope==='targetedCourse'?s.budgetUsd:null,annualWorkBudgetUsd:s.scope==='annualWork'?s.budgetUsd:null,
  offeredCourses,causedCourses,unassessedAllocationUsd:s.budgetUsd*(1-s.courseAllocation),clinicalPerOfferedCourse,incomeEquivalentPerOfferedCourse:rawIncome,
  signedHouseholdRows:rows,netCashUsdPerOfferedHousehold:netCashUsd,netOverlapAdjustedResourceUsdPerOfferedHousehold:netResourceUsd,household:h,
  sf,bay,restBayCombinedEquivalentYears:bay.combinedEquivalentYears-sf.combinedEquivalentYears,allResidenceCombinedEquivalentYears:health+income-Object.values(harm).reduce((sum,v)=>sum+v,0),
  specifiedResourceStressBayPrice:s.externalResourceUsd===null||bay.combinedEquivalentYears<=0?null:10*(s.budgetUsd+s.externalResourceUsd)/bay.combinedEquivalentYears,
  fullSocialResourceCostUsd:null,ordinaryDonationExpectedValue:null,weightedExpectedValue:null,
  interpretation:'Conditional prospective trial-matched course, not measured local delivery or ordinary-gift EV. Positive household rows adjusted before netting/log; all negative burdens full. Integrated clinical QALYs counted once; income-equivalent units are normative, not clinical QALYs.'};
}
const variant=(id,fn)=>{const s=clone(defaults);s.id=id;fn(s);return s;};
export const cases=[clone(defaults),
 variant('legacyEndpointBridgeDiagnostic',s=>{s.integratedTrialQaly=.04*.5*.5;s.clinicalMidpointYears=0;s.household.incrementalTravelCareUsd=0;s.household.incrementalTimeHours=0;}),
 variant('integratedHealthOnlyDiagnostic',s=>{s.clinicalMidpointYears=0;s.household.incrementalTravelCareUsd=0;s.household.incrementalTimeHours=0;}),
 variant('zeroAdditionalServices',s=>{s.serviceAdditionality=0;}),
 variant('independentGiftHarm',s=>{s.serviceAdditionality=0;s.independentGiftHarms.sf=.001;}),
 variant('negativeClinicalEffect',s=>{s.integratedTrialQaly=-.01;s.positiveClinicalTransfer=0;}),
 variant('negativeResourcesNoPositiveIndependence',s=>{s.household.positiveIndependentShare=0;}),
 variant('equalGrossCashRows',s=>{s.household.netTransferUsd=100;s.household.feesUsd=100;s.household.positiveIndependentShare=1;s.household.incrementalTravelCareUsd=0;s.household.incrementalTimeHours=0;}),
 variant('equalRowsPartialPositiveCredit',s=>{s.household.netTransferUsd=100;s.household.feesUsd=100;s.household.incrementalTravelCareUsd=0;s.household.incrementalTimeHours=0;}),
 variant('outOfPocketSavingsHypothesis',s=>{s.household.outOfPocketSavingsUsd=150;}),
 variant('additionalNetWorkHypothesis',s=>{s.household.netTakeHomeGainUsd=500;}),
 variant('highParticipantBurden',s=>{s.household.incrementalTravelCareUsd=400;s.household.incrementalTimeHours=72;s.household.timeValueUsd=8;}),
 variant('lowerClinicalTransfer',s=>{s.positiveClinicalTransfer=.1;}),
 variant('noLocalClinicalTransfer',s=>{s.positiveClinicalTransfer=0;}),
 variant('oneYearActivationDelay',s=>{s.activationDelayYears=1;}),
 variant('smallerTranche',s=>{s.budgetUsd=10000;}),
 variant('outsideSFResidence',s=>{s.sfResidentShare=.7;s.bayResidentShare=.9;}),
 variant('specifiedExternalResources',s=>{s.externalResourceUsd=50000;}),
 variant('annualWorkTenPercentCourseHypothesis',s=>{s.scope='annualWork';s.budgetUsd=33282597;s.courseAllocation=.1;})
];

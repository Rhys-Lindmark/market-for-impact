import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export const version='huckleberry-conditional-course-health-signed-income-20261004';
const number=(v,k,min,max)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new RangeError(k);return v;};
const fraction=(v,k)=>number(v,k,0,1);
const clone=v=>JSON.parse(JSON.stringify(v));
// Planning assumptions, not identified local efficacy, funding room or unrestricted-gift EV.
export const defaults={id:'conditionalCourseReference',budgetUsd:2400,courseCostUsd:2400,
 integratedTrialQaly:.026,positiveClinicalTransfer:.5,serviceAdditionality:.5,
 delayYears:0,clinicalMidpointYears:16/52,discountRate:.03,sfResidentShare:1,bayResidentShare:1,
 households:[{id:'recipient-and-caregiver',members:3,annualResourcesUsd:30000,years:32/52,delayYears:0,
 rows:[{id:'travel',amountUsd:-30,positiveIndependentCredit:1},{id:'fees',amountUsd:0,positiveIndependentCredit:0},
 {id:'caregiver-net-pay',amountUsd:0,positiveIndependentCredit:0},{id:'adolescent-net-pay',amountUsd:0,positiveIndependentCredit:0},
 {id:'household-oop-savings',amountUsd:0,positiveIndependentCredit:0},{id:'cash-assistance',amountUsd:0,positiveIndependentCredit:0}]}],
 independentGiftHarms:{sf:0,restBay:0,outsideBay:0},externalResourcesUsd:null};
export function calculate(s=defaults){
 number(s.budgetUsd,'budget',0,1e8);number(s.courseCostUsd,'course cost',.01,1e7);
 number(s.integratedTrialQaly,'integrated QALY',-1,1);fraction(s.positiveClinicalTransfer,'clinical transfer');fraction(s.serviceAdditionality,'additionality');
 number(s.delayYears,'delay',0,100);number(s.clinicalMidpointYears,'clinical midpoint within observed horizon',0,32/52);number(s.discountRate,'discount',0,1);
 fraction(s.sfResidentShare,'SF residence');fraction(s.bayResidentShare,'Bay residence');if(s.sfResidentShare>s.bayResidentShare)throw new RangeError('nested residence');
 if(!s.independentGiftHarms||Object.keys(s.independentGiftHarms).sort().join(',')!=='outsideBay,restBay,sf')throw new TypeError('exact harm regions');
 Object.values(s.independentGiftHarms).forEach(v=>number(v,'independent harm',0,1e6));
 if(!Array.isArray(s.households)||s.households.length>20)throw new TypeError('household ledger');
 const ids=new Set();const householdResults=s.households.map(h=>{
  if(typeof h.id!=='string'||!h.id||ids.has(h.id))throw new TypeError('unique household');ids.add(h.id);
  number(h.members,'members',1,20);number(h.annualResourcesUsd,'baseline',.01,1e8);number(h.years,'finite horizon',.001,20);number(h.delayYears,'household delay',0,100);
  if(!Array.isArray(h.rows)||h.rows.length>100)throw new TypeError('household rows');
  const rowIds=new Set();let net=0,rawNet=0;
  for(const row of h.rows){if(typeof row.id!=='string'||!row.id||rowIds.has(row.id))throw new TypeError('unique household row');rowIds.add(row.id);
   number(row.amountUsd,'signed cash',-1e10,1e10);fraction(row.positiveIndependentCredit,'positive independence');
   rawNet+=row.amountUsd;net+=row.amountUsd>0?row.amountUsd*row.positiveIndependentCredit:row.amountUsd;}
  if(h.annualResourcesUsd*h.years+net<=0)throw new RangeError('household log domain');
  const equivalent=incomeHealthyYearEquivalent({people:h.members,annualIncomeBeforeUSD:h.annualResourcesUsd/h.members,
   annualIncomeGainUSD:net/h.years/h.members,years:h.years,delayYears:s.delayYears+h.delayYears,discountRate:s.discountRate});
  return {id:h.id,rawNetCashUsd:rawNet,overlapAdjustedNetResourceUsd:net,incomeEquivalentPerCausedCourse:equivalent};
 });
 const offeredCourses=s.budgetUsd/s.courseCostUsd,causedCourses=offeredCourses*s.serviceAdditionality;
 const clinicalPerCausedCourse=s.integratedTrialQaly*(s.integratedTrialQaly>0?s.positiveClinicalTransfer:1)/(1+s.discountRate)**(s.delayYears+s.clinicalMidpointYears);
 const incomePerCausedCourse=householdResults.reduce((sum,h)=>sum+h.incomeEquivalentPerCausedCourse,0);
 // Actual causal exposure applies to ALL course effects; positive overlap discounts never attenuate a negative effect.
 const health=causedCourses*clinicalPerCausedCourse,income=causedCourses*incomePerCausedCourse;
 const harms=s.budgetUsd===0?{sf:0,restBay:0,outsideBay:0}:s.independentGiftHarms;
 const region=(share,harm)=>{const r={healthQaly:health*share,incomeEquivalentYears:income*share,independentHarmEquivalentYears:harm,combinedEquivalentYears:(health+income)*share-harm};
  r.usdPerBetterLife=r.combinedEquivalentYears>0?10*s.budgetUsd/r.combinedEquivalentYears:null;
  if(Object.values(r).some(v=>v!==null&&!Number.isFinite(v)))throw new RangeError('finite regional outputs');return r;};
 const sf=region(s.sfResidentShare,harms.sf),bay=region(s.bayResidentShare,harms.sf+harms.restBay);
 if(s.externalResourcesUsd!==null)number(s.externalResourcesUsd,'external resources',0,1e10);
 return {version,id:s.id,offeredCourses,causedCourses,clinicalPerCausedCourse,incomePerCausedCourse,householdResults,sf,bay,
  healthOnlyPrice:bay.healthQaly>0?10*s.budgetUsd/bay.healthQaly:null,
  specifiedResourceStressPrice:s.externalResourcesUsd!==null&&bay.combinedEquivalentYears>0?10*(s.budgetUsd+s.externalResourcesUsd)/bay.combinedEquivalentYears:null,
  fullSocialCost:null,ordinaryGiftExpectedValue:null,verifiedFundingRoom:null,
  allResidenceCombinedEquivalentYears:health+income-Object.values(harms).reduce((sum,v)=>sum+v,0)};
}
const variant=(id,fn)=>{const s=clone(defaults);s.id=id;fn(s);return s;};
export const cases=[clone(defaults),
 variant('healthOnlyUndiscountedDiagnostic',s=>{s.clinicalMidpointYears=0;s.households=[];}),
 variant('noAdditionalCourses',s=>{s.serviceAdditionality=0;}),
 variant('independentGiftHarmWithoutCourses',s=>{s.serviceAdditionality=0;s.independentGiftHarms.sf=.001;}),
 variant('noClinicalTransfer',s=>{s.positiveClinicalTransfer=0;}),
 variant('negativeClinicalFullPerCausedCourse',s=>{s.integratedTrialQaly=-.01;s.positiveClinicalTransfer=0;}),
 variant('noPositiveCashCreditNegativeTravelFull',s=>{s.households[0].rows[0].positiveIndependentCredit=0;}),
 variant('zeroBudget',s=>{s.budgetUsd=0;s.independentGiftHarms.sf=.001;}),
 variant('positiveCaregiverPayHypothesis',s=>{s.households[0].rows[2].amountUsd=300;s.households[0].rows[2].positiveIndependentCredit=.5;}),
 variant('equalCashRows',s=>{s.households[0].rows=[{id:'gain',amountUsd:100,positiveIndependentCredit:1},{id:'loss',amountUsd:-100,positiveIndependentCredit:0}];}),
 variant('equalCashPartialPositiveCredit',s=>{s.households[0].rows=[{id:'gain',amountUsd:100,positiveIndependentCredit:.5},{id:'loss',amountUsd:-100,positiveIndependentCredit:0}];}),
 variant('highTravelBurden',s=>{s.households[0].rows[0].amountUsd=-300;}),
 variant('zeroIncrementalTravelHypothesis',s=>{s.households[0].rows[0].amountUsd=0;}),
 variant('sourceLowQaly',s=>{s.integratedTrialQaly=.009;}),variant('sourceHighQaly',s=>{s.integratedTrialQaly=.046;}),
 variant('higherCourseCost',s=>{s.courseCostUsd=4000;}),variant('lowerCourseCost',s=>{s.courseCostUsd=1600;}),
 variant('oneYearDelay',s=>{s.delayYears=1;}),variant('SFWithinBay',s=>{s.sfResidentShare=.4;s.bayResidentShare=.8;}),
 variant('externalResourceStress',s=>{s.externalResourcesUsd=2400;})];

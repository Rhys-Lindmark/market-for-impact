import assert from 'node:assert/strict';
import {calculate,cases,defaults} from '../../lib/selfhelp-current-model.mjs';
const copy=x=>structuredClone(x), near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
// Independent direct equations: no candidate income helper or result ledger used.
function independent(s){
 const h=s.household;
 const rows=[h.outOfPocketSavingsUsd,h.netTakeHomeGainUsd,h.netTransferUsd,-h.feesUsd,-h.incrementalTravelCareUsd,-h.incrementalTimeHours*h.timeValueUsd];
 const net=rows.reduce((a,x)=>a+(x>0?x*h.positiveIndependentShare:x),0);
 let duration=0;for(let i=0;i<Math.ceil(h.years);i++)duration+=Math.min(1,h.years-i)/(1+s.discountRate)**(s.activationDelayYears+h.delayYears+i);
 const income=.5*h.members*duration*Math.log(1+net/(h.years*h.annualResourcesUsd));
 const clinical=s.integratedTrialQaly*(s.integratedTrialQaly>0?s.positiveClinicalTransfer:1)/(1+s.discountRate)**(s.activationDelayYears+s.clinicalMidpointYears);
 const offered=s.budgetUsd*s.courseAllocation/s.courseCostUsd,caused=offered*s.serviceAdditionality;
 const harm=s.budgetUsd===0?{sf:0,restBay:0,outsideBay:0}:s.independentGiftHarms;
 const total=caused*(clinical+income);
 return {offered,caused,income,clinical,sf:total*s.sfResidentShare-harm.sf,bay:total*s.bayResidentShare-harm.sf-harm.restBay,all:total-harm.sf-harm.restBay-harm.outsideBay};
}
const result=[];
for(const s of cases){const a=calculate(s),b=independent(s);near(a.offeredCourses,b.offered);near(a.causedCourses,b.caused);near(a.incomeEquivalentPerOfferedCourse,b.income);near(a.clinicalPerOfferedCourse,b.clinical);near(a.sf.combinedEquivalentYears,b.sf);near(a.bay.combinedEquivalentYears,b.bay);near(a.allResidenceCombinedEquivalentYears,b.all);near(a.sf.usdPerBetterLife??0,b.sf>0?10*s.budgetUsd/b.sf:0);near(a.bay.usdPerBetterLife??0,b.bay>0?10*s.budgetUsd/b.bay:0);assert.equal(a.ordinaryDonationExpectedValue,null);assert.equal(a.fullSocialResourceCostUsd,null);result.push({id:s.id,sf:b.sf,bay:b.bay,sfPrice:a.sf.usdPerBetterLife,bayPrice:a.bay.usdPerBetterLife});}
const scenario=f=>{const s=copy(defaults);f(s);return calculate(s);};
assert.ok(scenario(s=>{s.integratedTrialQaly=-.01;s.positiveClinicalTransfer=0;s.household.positiveIndependentShare=0;}).bay.combinedEquivalentYears<0);
near(scenario(s=>{s.household.netTransferUsd=100;s.household.feesUsd=100;s.household.positiveIndependentShare=1;s.household.incrementalTravelCareUsd=0;s.household.incrementalTimeHours=0;}).incomeEquivalentPerOfferedCourse,0);
near(scenario(s=>{s.serviceAdditionality=0;s.independentGiftHarms.sf=.001;}).bay.combinedEquivalentYears,-.001);
near(scenario(s=>{s.budgetUsd=0;s.independentGiftHarms.sf=.001;}).bay.combinedEquivalentYears,0);
near(scenario(s=>{s.household.positiveIndependentShare=0;}).netOverlapAdjustedResourceUsdPerOfferedHousehold,-96);
near(scenario(s=>{s.activationDelayYears=1;}).bay.combinedEquivalentYears,calculate(defaults).bay.combinedEquivalentYears/1.03);
const annual=scenario(s=>{s.scope='annualWork';s.budgetUsd=33282597;s.courseAllocation=.1;});near(annual.bay.usdPerBetterLife,calculate(defaults).bay.usdPerBetterLife*10);assert.equal(annual.donorCostUsd,null);near(annual.unassessedAllocationUsd,33282597*.9);
const invalid=[s=>s.budgetUsd=-1,s=>s.budgetUsd=100001,s=>s.courseCostUsd=0,s=>s.serviceAdditionality=2,s=>s.sfResidentShare=1.01,s=>{s.sfResidentShare=.9;s.bayResidentShare=.8;},s=>s.household.annualResourcesUsd=0,s=>s.household.years=0,s=>s.household.netTransferUsd=-20000,s=>s.integratedTrialQaly=NaN,s=>s.activationDelayYears=-1,s=>s.household.positiveIndependentShare=-1,s=>s.independentGiftHarms.sf=-1,s=>s.independentGiftHarms.extra=1,s=>s.externalResourceUsd=-1];
for(const change of invalid){const s=copy(defaults);change(s);assert.throws(()=>calculate(s));}
console.log(JSON.stringify({status:'PASS',cases:result,additionalProbes:8,invalidDomainProbes:invalid.length},null,2));

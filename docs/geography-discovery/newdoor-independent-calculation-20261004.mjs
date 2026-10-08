import assert from 'node:assert/strict';
import {cases,calculate as author} from './newdoor-author-candidate-20261004.mjs';
const copy=x=>structuredClone(x);
// Independent implementation; never calls author's ledger or income helper.
function period(p,n,rate,share=1,rowCorrection=false){
 let years=0;for(let i=0;i<Math.ceil(p.years);i++)years+=Math.min(1,p.years-i)/(1+rate)**(p.delayYears+i);
 return p.branches.reduce((z,b)=>{
  const wage=b.paidHours*b.hourlyWageUsd;
  const rows=[wage,-wage*b.taxShare,-wage*b.benefitDisplacementShare,-b.counterfactualTakeHomeUsd,-b.uncoveredTravelChildcareUsd,b.otherHouseholdNetChangeUsd,-b.incrementalTimeHours*b.timeValueUsd];
  const delta=rows.reduce((s,v)=>s+(rowCorrection&&v>0?v*share:v),0);
  if(p.baselineAnnualHouseholdResourcesUsd+delta/p.years<=0)throw Error('invalid revised log domain');
  return z+b.probability*.5*n*years*Math.log1p(delta/(p.years*p.baselineAnnualHouseholdResourcesUsd))*(rowCorrection?1:share);
 },0);
}
function independent(s,correct=false){
 const offers=s.budgetUsd*s.allocationShares.employment/s.costPerOfferedPlaceUsd;
 const h=s.health;
 const health=[h.utilityGain,h.effectiveYears,h.independentShare].includes(null)?null:offers*h.utilityGain*h.effectiveYears*(correct&&h.utilityGain<0?1:h.independentShare)/(1+s.discountRate)**h.delayYears;
 const income=s.income===null?null:offers*s.income.uniqueHouseholdsPerOfferedPlace*s.income.periods.reduce((a,p)=>a+period(p,s.income.householdSize,s.discountRate,s.income.independentShare,correct),0);
 const caused=x=>s.serviceAdditionality===0?0:s.serviceAdditionality===null||x===null?null:x*s.serviceAdditionality;
 const total=caused(health)===null||caused(income)===null?null:caused(health)+caused(income);
 const geo=(r,harm)=>total===null||r===null?null:total*r-harm;
 const bay=geo(s.bayResidentShare,s.independentGiftHarm.sf+s.independentGiftHarm.restBay),sf=geo(s.sfResidentShare,s.independentGiftHarm.sf);
 return {health:caused(health),income:caused(income),bay,sf,bayPrice:bay>0?10*s.budgetUsd/bay:null,sfPrice:sf>0?10*s.budgetUsd/sf:null};
}
const close=(a,b)=>a===null||b===null?assert.equal(a,b):assert(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)));
const results=cases.map(s=>{const a=author(s),i=independent(s);close(i.health,a.causedHealthQaly);close(i.income,a.causedIncomeHealthyYearEquivalent);close(i.bay,a.bayIncludingSfCombinedHealthyYearEquivalent);close(i.sf,a.sfCombinedHealthyYearEquivalent);close(i.bayPrice,a.bayUsdPer10ConditionalCombinedHealthyYearEquivalent);close(i.sfPrice,a.sfUsdPer10ConditionalCombinedHealthyYearEquivalent);return {id:s.id,author:i,positiveRowIndependentCorrection:independent(s,true)};});
const base=cases[1],probes=[];
function probe(id,fn){const x=copy(base);fn(x);try{const a=author(x);probes.push({id,accepted:true,bay:a.bayIncludingSfCombinedHealthyYearEquivalent});}catch(e){probes.push({id,accepted:false,error:e.message});}}
probe('donationAbove100k',x=>x.budgetUsd=100001);
probe('partialNullInvalidHealth',x=>{x.health.utilityGain=null;x.health.effectiveYears=NaN;});
probe('missingHarmRegion',x=>delete x.independentGiftHarm.restBay);
probe('zeroGiftWithIndependentHarm',x=>{x.budgetUsd=0;x.independentGiftHarm.sf=.001;});
probe('noAffectedIncomeHousehold',x=>x.income.uniqueHouseholdsPerOfferedPlace=0);
probe('negativeHealthZeroOverlap',x=>{x.health.utilityGain=-.0025;x.health.independentShare=0;});
probe('negativeIncomeZeroOverlap',x=>{x.income.independentShare=0;x.income.periods[0].branches.forEach(b=>b.timeValueUsd=8);});
probe('periodOverlap',x=>x.income.periods.push({...copy(x.income.periods[0]),delayYears:.25}));
probe('badBranchSum',x=>x.income.periods[0].branches[0].probability=.4);
probe('sfOutsideBay',x=>x.bayResidentShare=.2);
probe('infiniteBudget',x=>x.budgetUsd=Infinity);
// Same-household accounting: 100 gain and 100 cost cancel before log when
// share=1; reducing only positive rows by .75 yields -25, never artificial zero.
const synthetic={years:.5,delayYears:0,baselineAnnualHouseholdResourcesUsd:24000,branches:[{probability:1,paidHours:100,hourlyWageUsd:1,taxShare:0,benefitDisplacementShare:0,counterfactualTakeHomeUsd:100,uncoveredTravelChildcareUsd:0,otherHouseholdNetChangeUsd:0,incrementalTimeHours:0,timeValueUsd:0}]};
close(period(synthetic,3,.03,1),0);assert(period(synthetic,3,.03,.75,true)<0);
const wage=base.income.periods[0].branches[0].paidHours*19.61;close(wage,6883.11);
const work=results[1];close(work.author.bayPrice,27057924.491282165);assert(work.positiveRowIndependentCorrection.bay<0);
console.log(JSON.stringify({status:'REVISE',reproduction:{cases:13,matched:true},results,probes,synthetic:{cancelWithShare1:0,positiveOnlyShare075:period(synthetic,3,.03,.75,true)}},null,2));

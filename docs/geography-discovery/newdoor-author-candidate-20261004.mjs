// Author proposal. Run with existing Node24; no checkout edits or package installs.
// The repo bridge values economic welfare in healthy-year-equivalent units; these
// are NOT measured clinical QALYs. Imports are absolute only for isolated review.
import {incomeHealthyYearEquivalent} from '/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta/lib/income-health-equivalence.mjs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

export const defaults = {
  id:'unidentifiedOrdinaryDonation', scope:'donation', budgetUsd:100000,
  allocationShares:{employment:.7,education:.15,careerAdditional:.1,reserveStrategy:.05},
  costPerOfferedPlaceUsd:20000, // retained budget PRIOR, no verified marginal quote
  serviceAdditionality:null, // no measured ordinary gift additionality
  sfResidentShare:null, bayResidentShare:null, // accounting location is not residence
  health:{utilityGain:null,effectiveYears:null,delayYears:0,independentShare:null},
  income:null, // actual household resources/dose/counterfactual/overlap unidentified
  discountRate:.03,
  independentGiftHarm:{sf:0,restBay:0,outsideBay:0}, // explicit hypothetical only
  externalResourceNetUsd:null,
  unknownChannels:['education and career effects outside modeled employment cohort','all-funder marginal resources','displacement of other people/jobs/services','income-health overlap','true prospective allocation/additionality/residence','effect distribution and sustained earnings'],
  evidenceStatus:'Unknown ordinary donation EV; no positive central evidence claim'
};
const clone=x=>JSON.parse(JSON.stringify(x));
const finite=(x,name,min=-1e12,max=1e12)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw new RangeError(name+' must be finite within bounds');return x;};
const share=(x,name)=>finite(x,name,0,1);
const nullable=(x,fn)=>x===null?null:fn(x);
const ratio=(amount,effect)=>effect!==null&&effect>0?10*amount/effect:null;

// Every branch describes one SAME household over a finite period. Net cash and
// time-equivalent costs are combined BEFORE logarithms; no log(gain)-log(cost).
export function householdPeriodLedger(p,householdSize){
  finite(householdSize,'householdSize',1,20);
  finite(p.years,'period years',.001,20);finite(p.delayYears,'period delay',0,100);
  finite(p.baselineAnnualHouseholdResourcesUsd,'baseline household resources',.01,1e8);
  if(!Array.isArray(p.branches)||!p.branches.length)throw new TypeError('period branches required');
  let weightedCash=0,weightedNet=0,weightedWages=0,weightedTime=0,equivalent=0;
  const probabilitySum=p.branches.reduce((a,b)=>a+share(b.probability,'branch probability'),0);
  if(Math.abs(probabilitySum-1)>1e-10)throw new RangeError('branch probabilities must sum to1');
  const branches=p.branches.map(b=>{
    for(const k of ['paidHours','hourlyWageUsd','counterfactualTakeHomeUsd','uncoveredTravelChildcareUsd','incrementalTimeHours','timeValueUsd'])finite(b[k],k,0,1e8);
    share(b.taxShare,'taxShare');share(b.benefitDisplacementShare,'benefitDisplacementShare');
    finite(b.otherHouseholdNetChangeUsd,'other household net change');
    // otherHouseholdNetChange must already net any taxes/benefits; income of other
    // members and negative later earnings belong here, not an additional log.
    const grossPaidWagesUsd=b.paidHours*b.hourlyWageUsd;
    const takeHomeAfterTaxUsd=grossPaidWagesUsd*(1-b.taxShare);
    const benefitDisplacementUsd=grossPaidWagesUsd*b.benefitDisplacementShare;
    const netCashChangeUsd=takeHomeAfterTaxUsd-benefitDisplacementUsd-b.counterfactualTakeHomeUsd-b.uncoveredTravelChildcareUsd+b.otherHouseholdNetChangeUsd;
    const timeOpportunityUsd=b.incrementalTimeHours*b.timeValueUsd;
    const netResourceEquivalentChangeUsd=netCashChangeUsd-timeOpportunityUsd;
    const annualGain=netResourceEquivalentChangeUsd/p.years;
    if(p.baselineAnnualHouseholdResourcesUsd+annualGain<=0)throw new RangeError('post-intervention household resources must remain positive');
    const healthyYearEquivalent=incomeHealthyYearEquivalent({people:householdSize,annualIncomeBeforeUSD:p.baselineAnnualHouseholdResourcesUsd/householdSize,annualIncomeGainUSD:annualGain/householdSize,years:p.years,delayYears:p.delayYears,discountRate:p.discountRate,causalShare:1,editionShare:1,independentShare:1});
    weightedCash+=b.probability*netCashChangeUsd;weightedNet+=b.probability*netResourceEquivalentChangeUsd;weightedWages+=b.probability*grossPaidWagesUsd;weightedTime+=b.probability*timeOpportunityUsd;equivalent+=b.probability*healthyYearEquivalent;
    return {...b,grossPaidWagesUsd,takeHomeAfterTaxUsd,benefitDisplacementUsd,netCashChangeUsd,timeOpportunityUsd,netResourceEquivalentChangeUsd,healthyYearEquivalent};
  });
  return {years:p.years,delayYears:p.delayYears,branches,expectedNetCashChangeUsd:weightedCash,expectedNetResourceEquivalentChangeUsd:weightedNet,expectedGrossPaidWagesUsd:weightedWages,expectedTimeOpportunityUsd:weightedTime,healthyYearEquivalentPerOfferedHousehold:equivalent};
}

export function calculate(s=defaults){
  if(!['donation','annualWork'].includes(s.scope))throw new TypeError('scope must be donation or annualWork');
  finite(s.budgetUsd,'budget',0,1e10);finite(s.costPerOfferedPlaceUsd,'offered place cost',.01,1e8);
  if(Object.keys(s.allocationShares).sort().join(',')!=='careerAdditional,education,employment,reserveStrategy')throw new TypeError('four allocation shares required');
  for(const [k,v]of Object.entries(s.allocationShares))share(v,k);
  if(Math.abs(Object.values(s.allocationShares).reduce((a,b)=>a+b,0)-1)>1e-10)throw new RangeError('allocate entire budget once');
  const a=nullable(s.serviceAdditionality,x=>share(x,'additionality'));
  const sf=nullable(s.sfResidentShare,x=>share(x,'SF residence')),bay=nullable(s.bayResidentShare,x=>share(x,'Bay residence'));
  if(sf!==null&&bay!==null&&sf>bay)throw new RangeError('SF must be subset of Bay');
  finite(s.discountRate,'discount',0,1);
  for(const v of Object.values(s.independentGiftHarm))finite(v,'independent harm',0,1e6);
  const offeredPlaces=s.budgetUsd*s.allocationShares.employment/s.costPerOfferedPlaceUsd;
  let grossHealth=null,grossIncome=null,periods=null,incomePerOffer=null,healthPerOffer=null;
  if(s.health.utilityGain!==null&&s.health.effectiveYears!==null&&s.health.independentShare!==null){
    finite(s.health.utilityGain,'utility',-1,1);finite(s.health.effectiveYears,'effective years',0,1);share(s.health.independentShare,'health independent share');finite(s.health.delayYears,'health delay',0,100);
    // Health is offered-cohort averaged INCLUDING noncompletion. No branch
    // engagement multiplier again. Effective years integrate within-year onset.
    healthPerOffer=s.health.utilityGain*s.health.effectiveYears*s.health.independentShare/(1+s.discountRate)**s.health.delayYears;
    grossHealth=offeredPlaces*healthPerOffer;
  }
  if(s.income!==null){
    finite(s.income.householdSize,'householdSize',1,20);
    share(s.income.independentShare,'income independent share');
    finite(s.income.uniqueHouseholdsPerOfferedPlace,'unique households per offer',0,1);
    if(!Array.isArray(s.income.periods)||!s.income.periods.length)throw new TypeError('finite income periods required');
    let priorEnd=0;
    periods=s.income.periods.map(p=>{
      if(p.delayYears<priorEnd-1e-10)throw new RangeError('income periods may not overlap');priorEnd=p.delayYears+p.years;
      return householdPeriodLedger({...p,discountRate:s.discountRate},s.income.householdSize);
    });
    incomePerOffer=periods.reduce((sum,p)=>sum+p.healthyYearEquivalentPerOfferedHousehold,0)*s.income.uniqueHouseholdsPerOfferedPlace*s.income.independentShare;
    grossIncome=offeredPlaces*incomePerOffer;
  }
  // Null additionality identifies modeled caused channels at zero even if their
  // within-course effect is unidentified. Independent gift harm survives.
  const caused=x=>a===0?0:(a===null||x===null?null:a*x);
  const causedHealth=caused(grossHealth),causedIncome=caused(grossIncome);
  const combined=causedHealth===null||causedIncome===null?null:causedHealth+causedIncome;
  const geographic=(q,r,h)=>q===null||r===null?null:q*r-h;
  const sfHealth=geographic(causedHealth,sf,s.independentGiftHarm.sf);
  const bayHealth=geographic(causedHealth,bay,s.independentGiftHarm.sf+s.independentGiftHarm.restBay);
  const sfIncome=geographic(causedIncome,sf,0),bayIncome=geographic(causedIncome,bay,0);
  const sfCombined=geographic(combined,sf,s.independentGiftHarm.sf);
  const bayCombined=geographic(combined,bay,s.independentGiftHarm.sf+s.independentGiftHarm.restBay);
  const restBayCombined=sfCombined===null||bayCombined===null?null:bayCombined-sfCombined;
  const netAll=combined===null?null:combined-Object.values(s.independentGiftHarm).reduce((x,y)=>x+y,0);
  const expectedWageTransfers=periods===null?null:offeredPlaces*periods.reduce((x,p)=>x+p.expectedGrossPaidWagesUsd,0);
  if(s.externalResourceNetUsd!==null)finite(s.externalResourceNetUsd,'external resource stress',0,1e10);
  return {id:s.id,scope:s.scope,budgetUsd:s.budgetUsd,donorCostUsd:s.scope==='donation'?s.budgetUsd:null,annualWorkBudgetUsd:s.scope==='annualWork'?s.budgetUsd:null,
    offeredPlaces,unassessedAllocationUsd:s.budgetUsd*(1-s.allocationShares.employment),grossHealthQaly:grossHealth,grossIncomeHealthyYearEquivalent:grossIncome,
    causedHealthQaly:causedHealth,causedIncomeHealthyYearEquivalent:causedIncome,healthQalyPerOffer:healthPerOffer,incomeHealthyYearEquivalentPerOffer:incomePerOffer,
    sfHealthQaly:sfHealth,bayHealthQaly:bayHealth,sfIncomeHealthyYearEquivalent:sfIncome,bayIncomeHealthyYearEquivalent:bayIncome,
    sfCombinedHealthyYearEquivalent:sfCombined,restBayCombinedHealthyYearEquivalent:restBayCombined,bayIncludingSfCombinedHealthyYearEquivalent:bayCombined,allResidenceCombinedHealthyYearEquivalent:netAll,
    sfUsdPer10HealthQaly:ratio(s.budgetUsd,sfHealth),bayUsdPer10HealthQaly:ratio(s.budgetUsd,bayHealth),
    sfUsdPer10ConditionalCombinedHealthyYearEquivalent:ratio(s.budgetUsd,sfCombined),bayUsdPer10ConditionalCombinedHealthyYearEquivalent:ratio(s.budgetUsd,bayCombined),
    extraResourceStressBayUsdPer10:s.externalResourceNetUsd===null?null:ratio(s.budgetUsd+s.externalResourceNetUsd,bayCombined),
    expectedGrossProgramWageTransfersUsd:expectedWageTransfers,periodLedgers:periods,
    socialResourceCostUsd:null,ordinaryDonationExpectedValue:null,
    ordinaryDonationEVStatus:'Unidentified: unassessed channels and current marginal/counterfactual resources remain unknown; scenario is not a probability-weighted donation EV.',
    perspective:'Entire budget donor/annual cash cost, including transfer wages, is counted once. This is not full societal resource cost. Labor/time burdens reduce participant resource-equivalent gain; employer output, external public/volunteer inputs and displaced nonparticipants remain unpriced.',
    units:'HealthQaly is conditional health only. Income and combined units are normative CG healthy-year equivalents, never clinical QALYs.'};
}

const base=clone(defaults);
Object.assign(base,{id:'finiteCourseWorkingPrior',serviceAdditionality:.5,sfResidentShare:.45,bayResidentShare:1,evidenceStatus:'Conditional partial assessed-channel comparison; every unobserved number is an explicit prior'});
base.health={utilityGain:.0025,effectiveYears:.25,delayYears:0,independentShare:1};
base.income={householdSize:3,uniqueHouseholdsPerOfferedPlace:1,independentShare:.75,periods:[{
  years:.5,delayYears:0,baselineAnnualHouseholdResourcesUsd:24000,
  branches:[
    {id:'fullDose',probability:.5,paidHours:13.5*26,hourlyWageUsd:19.61,taxShare:.1,benefitDisplacementShare:.1,counterfactualTakeHomeUsd:2000,uncoveredTravelChildcareUsd:300,incrementalTimeHours:609,timeValueUsd:4,otherHouseholdNetChangeUsd:0},
    {id:'partialDose',probability:.2,paidHours:13.5*13,hourlyWageUsd:19.61,taxShare:.1,benefitDisplacementShare:.1,counterfactualTakeHomeUsd:1000,uncoveredTravelChildcareUsd:150,incrementalTimeHours:304.5,timeValueUsd:4,otherHouseholdNetChangeUsd:0},
    {id:'noPaidDose',probability:.3,paidHours:0,hourlyWageUsd:19.61,taxShare:0,benefitDisplacementShare:0,counterfactualTakeHomeUsd:0,uncoveredTravelChildcareUsd:0,incrementalTimeHours:10,timeValueUsd:4,otherHouseholdNetChangeUsd:0}
  ]
}]};
const variant=(id,fn)=>{const x=clone(base);x.id=id;fn(x);return x;};
export const cases=[clone(defaults),base,
  variant('nullAdditionality',x=>{x.serviceAdditionality=0;}),
  variant('nullAdditionalityIndependentHarm',x=>{x.serviceAdditionality=0;x.independentGiftHarm={sf:.001,restBay:.001,outsideBay:0};}),
  variant('nullIncomeNet',x=>{x.income.periods[0].branches.forEach(b=>{b.otherHouseholdNetChangeUsd=-(b.paidHours*b.hourlyWageUsd*(1-b.taxShare-b.benefitDisplacementShare)-b.counterfactualTakeHomeUsd-b.uncoveredTravelChildcareUsd-b.incrementalTimeHours*b.timeValueUsd);});}),
  variant('adverseTimeBurden',x=>{x.income.periods[0].branches.forEach(b=>{b.timeValueUsd=8;});x.health.utilityGain=-.0025;}),
  variant('adverseEarningsTail',x=>{x.income.periods.push({years:3,delayYears:.5,baselineAnnualHouseholdResourcesUsd:24000,branches:[{id:'laterLoss',probability:1,paidHours:0,hourlyWageUsd:0,taxShare:0,benefitDisplacementShare:0,counterfactualTakeHomeUsd:0,uncoveredTravelChildcareUsd:0,incrementalTimeHours:0,timeValueUsd:0,otherHouseholdNetChangeUsd:-1500}]});}),
  variant('positiveLowDisplacement',x=>{x.health.utilityGain=.005;x.health.effectiveYears=.5;x.income.periods[0].branches.forEach(b=>{b.benefitDisplacementShare=.03;b.counterfactualTakeHomeUsd*=.25;b.timeValueUsd=2;});}),
  variant('oaklandWorksiteWageStress',x=>{x.income.periods[0].branches.forEach(b=>{b.hourlyWageUsd=17.34;});}),
  variant('noIndependentIncomeIncrement',x=>{x.income.independentShare=0;}),
  variant('outsideBayResidenceStress',x=>{x.sfResidentShare=.35;x.bayResidentShare=.8;}),
  variant('extraResourceStress',x=>{x.externalResourceNetUsd=100000;}),
  variant('annualWorkConditionalScale',x=>{x.scope='annualWork';x.budgetUsd=6505120;})
];

export function selfTest(){
  const out=cases.map(calculate);
  assert.equal(out[0].ordinaryDonationExpectedValue,null);assert.equal(out[0].bayIncludingSfCombinedHealthyYearEquivalent,null);
  assert.equal(out[2].bayIncludingSfCombinedHealthyYearEquivalent,0);assert.equal(out[2].bayUsdPer10ConditionalCombinedHealthyYearEquivalent,null);
  assert.equal(out[3].bayIncludingSfCombinedHealthyYearEquivalent,-.002);assert.equal(out[3].bayUsdPer10ConditionalCombinedHealthyYearEquivalent,null);
  assert(Math.abs(out[4].causedIncomeHealthyYearEquivalent)<1e-12);
  assert(out[5].causedIncomeHealthyYearEquivalent<0);assert.equal(out[5].bayUsdPer10ConditionalCombinedHealthyYearEquivalent,null);
  assert(out[6].causedIncomeHealthyYearEquivalent<out[1].causedIncomeHealthyYearEquivalent);
  assert(out[7].causedIncomeHealthyYearEquivalent>out[1].causedIncomeHealthyYearEquivalent);
  assert(out[8].causedIncomeHealthyYearEquivalent<out[1].causedIncomeHealthyYearEquivalent);
  assert.equal(out[9].causedIncomeHealthyYearEquivalent,0);
  for(const o of out){assert.equal(o.ordinaryDonationExpectedValue,null);if(o.sfCombinedHealthyYearEquivalent!==null)assert(Math.abs(o.sfCombinedHealthyYearEquivalent+o.restBayCombinedHealthyYearEquivalent-o.bayIncludingSfCombinedHealthyYearEquivalent)<1e-10);}
  assert.equal(out[12].donorCostUsd,null);assert.equal(out[12].annualWorkBudgetUsd,6505120);
  assert(Math.abs(out[12].grossIncomeHealthyYearEquivalent/out[1].grossIncomeHealthyYearEquivalent-65.0512)<1e-10);
  const bad=clone(base);bad.allocationShares.education=.4;assert.throws(()=>calculate(bad));
  const badIncome=clone(base);badIncome.income.periods[0].branches[0].otherHouseholdNetChangeUsd=-20000;assert.throws(()=>calculate(badIncome));
  const overlap=clone(base);overlap.income.periods.push({...clone(overlap.income.periods[0]),delayYears:.25});assert.throws(()=>calculate(overlap));
  const badResidence=clone(base);badResidence.bayResidentShare=.2;assert.throws(()=>calculate(badResidence));
  const noEngagement=clone(base);noEngagement.income.periods[0].branches[0].probability=.4;assert.throws(()=>calculate(noEngagement));
  return {passed:true,cases:out.length,checks:'unknown, signed netting, null, independent harm, adverse tail, geography conservation, household domain, finite periods, non-overlap, all-budget allocation and annual/donation scope'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv.includes('--self-test'))console.log(JSON.stringify(selfTest()));
  else console.log(JSON.stringify(cases.map(c=>calculate(c)),null,2));
}

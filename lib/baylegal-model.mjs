'use strict';

const INPUTS=Object.freeze({
 organization:'Bay Area Legal Aid',ordinaryGiftUsd:100000,fy2024ExpenseUsd:30238844,
 fy2024AuditedExpenseIncludingDonatedServicesUsd:35286276,fy2024RevenueUsd:31426545,
 fy2024GovernmentGrantsUsd:28500264,fy2024OtherContributionsUsd:1043220,
 fy2024NetAssetsWithoutRestrictionsUsd:14574749,fy2024CashAndTemporaryInvestmentsUsd:8017936,
 fy2024PubliclyTradedInvestmentsUsd:2193874,
 housingPartnerSubgrantsUsd:3896303,verifiedDonationUrl:null,verifiedDonationRecipientEin:null,filingEntityEin:'94-1631316',
 programs:Object.freeze({
  healthEconomicConsumer:Object.freeze({expenseUsd:11660776,reportedIndividuals:7828}),
  housing:Object.freeze({expenseUsd:7888871,reportedIndividuals:9719}),
  domesticViolence:Object.freeze({expenseUsd:3740661,reportedIndividuals:4637}),
  otherVulnerablePopulations:Object.freeze({expenseUsd:2091672,reportedIndividuals:null})
 }),
 reportedBayServicePopulationShare:1,measuredCurrentSfResidentShare:null,historicalSfCaseShare:.21
});

const SCENARIOS=Object.freeze([
 Object.freeze({name:'harm',weight:.10,fundingAdditionality:.02,deliveryRealization:.60,withinPathUniqueness:.80,crossPathOverlapAdjustment:.70,
  healthOutcomeShare:1,healthUtilityDelta:-.001,healthDurationYears:1,housingOutcomeShare:1,housingUtilityDelta:-.001,housingDurationYears:1,dvOutcomeShare:1,dvUtilityDelta:-.001,dvDurationYears:1,modeledSfShare:.20}),
 Object.freeze({name:'null',weight:.35,fundingAdditionality:.03,deliveryRealization:.60,withinPathUniqueness:.80,crossPathOverlapAdjustment:.70,
  healthOutcomeShare:0,healthUtilityDelta:0,healthDurationYears:1,housingOutcomeShare:0,housingUtilityDelta:0,housingDurationYears:1,dvOutcomeShare:0,dvUtilityDelta:0,dvDurationYears:1,modeledSfShare:.20}),
 Object.freeze({name:'cautiousPositive',weight:.25,fundingAdditionality:.04,deliveryRealization:.70,withinPathUniqueness:.85,crossPathOverlapAdjustment:.75,
  healthOutcomeShare:.05,healthUtilityDelta:.02,healthDurationYears:1,housingOutcomeShare:.08,housingUtilityDelta:.02,housingDurationYears:1,dvOutcomeShare:.06,dvUtilityDelta:.03,dvDurationYears:1,modeledSfShare:.15}),
 Object.freeze({name:'central',weight:.25,fundingAdditionality:.08,deliveryRealization:.80,withinPathUniqueness:.90,crossPathOverlapAdjustment:.80,
  healthOutcomeShare:.12,healthUtilityDelta:.05,healthDurationYears:1,housingOutcomeShare:.15,housingUtilityDelta:.03,housingDurationYears:2,dvOutcomeShare:.12,dvUtilityDelta:.05,dvDurationYears:2,modeledSfShare:.20}),
 Object.freeze({name:'favorableStress',weight:.05,fundingAdditionality:.20,deliveryRealization:1,withinPathUniqueness:.95,crossPathOverlapAdjustment:.90,
  healthOutcomeShare:.25,healthUtilityDelta:.10,healthDurationYears:2,housingOutcomeShare:.30,housingUtilityDelta:.05,housingDurationYears:3,dvOutcomeShare:.25,dvUtilityDelta:.10,dvDurationYears:3,modeledSfShare:.25})
]);

function price(cost,qaly){return qaly>0?cost*10/qaly:null;}
function validate(i,ss){
 const nonnegative=['ordinaryGiftUsd','fy2024GovernmentGrantsUsd','fy2024OtherContributionsUsd','fy2024NetAssetsWithoutRestrictionsUsd','fy2024CashAndTemporaryInvestmentsUsd','fy2024PubliclyTradedInvestmentsUsd','housingPartnerSubgrantsUsd'];
 const positive=['fy2024ExpenseUsd','fy2024AuditedExpenseIncludingDonatedServicesUsd','fy2024RevenueUsd'];
 for(const k of [...nonnegative,...positive])if(!Number.isFinite(i[k])||i[k]<0||(positive.includes(k)&&i[k]===0))throw new RangeError(k+' must be finite and '+(positive.includes(k)?'positive':'nonnegative'));
 if(i.fy2024AuditedExpenseIncludingDonatedServicesUsd<i.fy2024ExpenseUsd)throw new RangeError('audited resource expense must be >= Form 990 expense');
 for(const k of ['reportedBayServicePopulationShare','historicalSfCaseShare'])if(!Number.isFinite(i[k])||i[k]<0||i[k]>1)throw new RangeError(k);
 if(i.measuredCurrentSfResidentShare!==null&&(!Number.isFinite(i.measuredCurrentSfResidentShare)||i.measuredCurrentSfResidentShare<0||i.measuredCurrentSfResidentShare>i.reportedBayServicePopulationShare))throw new RangeError('measuredCurrentSfResidentShare');
 const keys=['healthEconomicConsumer','housing','domesticViolence','otherVulnerablePopulations'];
 if(!i.programs||typeof i.programs!=='object'||Array.isArray(i.programs)||Object.keys(i.programs).length!==keys.length)throw new TypeError('programs must contain exactly the four modeled ledgers');
 let total=0;
 for(const k of keys){const p=i.programs[k];if(!p||typeof p!=='object'||!Number.isFinite(p.expenseUsd)||p.expenseUsd<0||(k!=='otherVulnerablePopulations'&&p.expenseUsd===0))throw new RangeError(k+' expense');
 if(k!=='otherVulnerablePopulations'&&(!Number.isFinite(p.reportedIndividuals)||p.reportedIndividuals<=0))throw new RangeError(k+' reportedIndividuals');
 if(k==='otherVulnerablePopulations'&&p.reportedIndividuals!==null&&(!Number.isFinite(p.reportedIndividuals)||p.reportedIndividuals<0))throw new RangeError(k+' reportedIndividuals');
 total+=p.expenseUsd;}
 if(!Number.isFinite(total)||total>i.fy2024ExpenseUsd)throw new RangeError('program expense exceeds whole expense');
 if(i.housingPartnerSubgrantsUsd>i.programs.housing.expenseUsd)throw new RangeError('partner subgrants exceed housing expense');
 if(!Array.isArray(ss)||!ss.length)throw new TypeError('scenarios must be a nonempty array');
 const names=new Set();let w=0;
 for(const s of ss){if(!s||typeof s!=='object'||typeof s.name!=='string'||!s.name||names.has(s.name))throw new TypeError('scenario names must be unique');names.add(s.name);
 for(const k of ['weight','fundingAdditionality','deliveryRealization','withinPathUniqueness','crossPathOverlapAdjustment','healthOutcomeShare','housingOutcomeShare','dvOutcomeShare','modeledSfShare'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1)throw new RangeError(k+' must be finite in [0,1]');
 if(s.modeledSfShare>i.reportedBayServicePopulationShare)throw new RangeError('SF share must nest within Bay');
 for(const k of ['healthUtilityDelta','housingUtilityDelta','dvUtilityDelta'])if(!Number.isFinite(s[k])||Math.abs(s[k])>1)throw new RangeError(k+' must be finite in [-1,1]');
 for(const k of ['healthDurationYears','housingDurationYears','dvDurationYears'])if(!Number.isFinite(s[k])||s[k]<=0||s[k]>3)throw new RangeError(k+' must be finite in (0,3]');
 w+=s.weight;}
 if(Math.abs(w-1)>1e-12)throw new RangeError('weights must sum to one');
 const f=ss.find(s=>s.name==='favorableStress');if(!f||f.weight>=1)throw new RangeError('one favorableStress with weight below one is required for removal diagnostic');
}

function calculate(inputs,scenarios){
 if(inputs!==undefined&&inputs!==null&&(typeof inputs!=='object'||Array.isArray(inputs)))throw new TypeError('inputs must be an object');
 const i=Object.assign({},INPUTS,inputs||{}),ss=scenarios===undefined?SCENARIOS:scenarios;validate(i,ss);
 const p=i.programs,historicalAuditedResourceFactor=i.fy2024AuditedExpenseIncludingDonatedServicesUsd/i.fy2024ExpenseUsd;
 const programExpenseSum=Object.keys(p).reduce(function(a,k){return a+p[k].expenseUsd;},0);
 const unmodeledExpenseUsd=i.fy2024ExpenseUsd-p.healthEconomicConsumer.expenseUsd-p.housing.expenseUsd-p.domesticViolence.expenseUsd;
 function pathway(s,key,outcomeShare,qalyPerOutcome){
  const program=p[key],giftAllocation=i.ordinaryGiftUsd*program.expenseUsd/i.fy2024ExpenseUsd;
  const costPerReportedIndividual=program.expenseUsd/program.reportedIndividuals;
  const reportedIndividualEquivalents=giftAllocation/costPerReportedIndividual;
  const deliveredUniqueIndividualEquivalents=reportedIndividualEquivalents*s.fundingAdditionality*s.deliveryRealization*s.withinPathUniqueness;
  const materialOutcomeEquivalents=deliveredUniqueIndividualEquivalents*outcomeShare;
  return {giftAllocationUsd:giftAllocation,costPerReportedIndividual:costPerReportedIndividual,reportedIndividualEquivalents:reportedIndividualEquivalents,
   deliveredUniqueIndividualEquivalents:deliveredUniqueIndividualEquivalents,materialOutcomeEquivalents:materialOutcomeEquivalents,
   preOverlapQaly:materialOutcomeEquivalents*qalyPerOutcome};
 }
 const outputs=ss.map(function(s){
  const health=pathway(s,'healthEconomicConsumer',s.healthOutcomeShare,s.healthUtilityDelta*s.healthDurationYears);
  const housing=pathway(s,'housing',s.housingOutcomeShare,s.housingUtilityDelta*s.housingDurationYears);
  const dv=pathway(s,'domesticViolence',s.dvOutcomeShare,s.dvUtilityDelta*s.dvDurationYears);
  const giftQaly=(health.preOverlapQaly+housing.preOverlapQaly+dv.preOverlapQaly)*s.crossPathOverlapAdjustment;
  const historicalProRataAuditedResourceGiftUsd=i.ordinaryGiftUsd*historicalAuditedResourceFactor;
  return {name:s.name,weight:s.weight,fundingAdditionality:s.fundingAdditionality,deliveryRealization:s.deliveryRealization,
   withinPathUniqueness:s.withinPathUniqueness,crossPathOverlapAdjustment:s.crossPathOverlapAdjustment,
   pathways:{healthEconomicConsumer:health,housing:housing,domesticViolence:dv},giftQaly:giftQaly,
   finiteQalyPackages:{health:{utilityDelta:s.healthUtilityDelta,durationYears:s.healthDurationYears,qaly:s.healthUtilityDelta*s.healthDurationYears},housing:{utilityDelta:s.housingUtilityDelta,durationYears:s.housingDurationYears,qaly:s.housingUtilityDelta*s.housingDurationYears},domesticViolence:{utilityDelta:s.dvUtilityDelta,durationYears:s.dvDurationYears,qaly:s.dvUtilityDelta*s.dvDurationYears}},
   donorUsdPer10Qaly:price(i.ordinaryGiftUsd,giftQaly),historicalProRataAuditedResourceUsdPer10Qaly:price(historicalProRataAuditedResourceGiftUsd,giftQaly),
   verifiedMarginalGrossResourceUsdPer10Qaly:null,verifiedCompleteSocietalGrossUsdPer10Qaly:null,
   bayQaly:giftQaly*i.reportedBayServicePopulationShare,sfQaly:giftQaly*s.modeledSfShare,modeledSfShare:s.modeledSfShare};
 });
 function weighted(k){return outputs.reduce(function(a,s){return a+s.weight*s[k];},0);}
 const expectedGiftQaly=weighted('giftQaly'),bayQ=weighted('bayQaly'),sfQ=weighted('sfQaly');
 const favorable=outputs.filter(function(s){return s.name==='favorableStress';})[0],nonFavWeight=1-favorable.weight;
 const noFavQ=outputs.filter(function(s){return s.name!=='favorableStress';}).reduce(function(a,s){return a+s.weight*s.giftQaly;},0)/nonFavWeight;
 const result = {organization:i.organization,recommendation:'PUBLISH_UNFAVORABLE_HOLD_GIVING',estimateStatus:'conditional whole-organization best-guess prior; no BayLegal-measured health effect',
  expectedGiftQaly:expectedGiftQaly,donorUsdPer10Qaly:price(i.ordinaryGiftUsd,expectedGiftQaly),
  historicalProRataAuditedResourceGiftUsd:i.ordinaryGiftUsd*historicalAuditedResourceFactor,historicalProRataAuditedResourceUsdPer10Qaly:price(i.ordinaryGiftUsd*historicalAuditedResourceFactor,expectedGiftQaly),
  verifiedMarginalGrossResourceUsdPer10Qaly:null,verifiedCompleteSocietalGrossUsdPer10Qaly:null,favorableTailShareOfSignedExpectedQaly:expectedGiftQaly>0?favorable.weight*favorable.giftQaly/expectedGiftQaly:null,
  noFavorableExpectedQaly:noFavQ,noFavorableDonorUsdPer10Qaly:price(i.ordinaryGiftUsd,noFavQ),
  modeledBayImpactShare:expectedGiftQaly>0?bayQ/expectedGiftQaly:null,modeledBayUsdPer10Qaly:price(i.ordinaryGiftUsd,bayQ),
  measuredCurrentSfResidentShare:i.measuredCurrentSfResidentShare,modeledSfImpactShare:expectedGiftQaly>0?sfQ/expectedGiftQaly:null,modeledSfUsdPer10Qaly:price(i.ordinaryGiftUsd,sfQ),
  diagnostics:{historicalAuditedResourceFactor:historicalAuditedResourceFactor,programExpenseSum:programExpenseSum,unmodeledExpenseUsd:unmodeledExpenseUsd,
   unmodeledExpenseShare:unmodeledExpenseUsd/i.fy2024ExpenseUsd,governmentGrantShareOfRevenue:i.fy2024GovernmentGrantsUsd/i.fy2024RevenueUsd,
   cashAndInvestmentsUsd:i.fy2024CashAndTemporaryInvestmentsUsd+i.fy2024PubliclyTradedInvestmentsUsd},
  scope:'Ordinary gift follows FY2024 expense shares. Three reported program populations receive bounded health credit; other vulnerable-population work, grants/partner spillovers, systems advocacy, administration and fundraising remain costed without separate QALY credit. Housing expense includes $3.896m of partner subgrants, but no separate partner clients or benefits are credited because overlap with BayLegal reported individuals is unresolved.',
  rfmf:'The filing evidences charitable receipts, but the filing entity EIN94-1631316 is verified but no current official payment page/recipient route was verified in this research environment; marginal health-producing capacity is unpriced and unverified. Government grants fund about 90.7% of revenue; unrestricted net assets are $14.575m.',
  scenarios:outputs,inputs:i};
 function check(v){if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite model output');if(v&&typeof v==='object')Object.values(v).forEach(check);}
 check(result);return result;
}

export {INPUTS,SCENARIOS,calculate};
export default calculate;

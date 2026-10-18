// Accepted October 1 calibration. Historical models remain unchanged.
import {calculate as prior, inputs, scenarios as originalScenarios} from './recares-v2-model.mjs';
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export {inputs};
export const modelVersion='recares-health-income-calibration-2026-10-01';
export const rankingStatistic='central marginal scenario';
export const scenarios=structuredClone(originalScenarios);
const families={cautious_positive:[[.01,.10],[.01,.10],[.001,.03]],central:[[.03,.25],[.02,.25],[.002,.05]],favorable:[[.05,.50],[.03,.50],[.004,.08]]};
for(const s of scenarios)if(families[s.name])s.mix.forEach((d,k)=>{[d.utility,d.years]=families[s.name][k];});
export const incomeJudgments=Object.fromEntries(scenarios.map(s=>[s.name,{purchaseShare:0,netSavingsUSD:0,baselineUSD:50000}]));
// Unmet-access health and counterfactual purchasers are disjoint modeled groups.
// Zero net economic credit is a provisional judgment, not measured absence.
export function calculate({scope='marginal',judgments=incomeJudgments,healthScenarios=scenarios,costInputs=inputs}={}){
 if(!['annual','marginal'].includes(scope))throw new RangeError('scope');
 const original=prior(costInputs,healthScenarios);
 const rows=original.rows.map(r=>{
  const j=judgments[r.name];
  const validProbability=x=>Number.isFinite(x)&&x>=0&&x<=1;
  if(!j||!validProbability(j.purchaseShare)||!validProbability(j.adverseShare??1)||!validProbability(j.welfareShare??1))throw new RangeError('income incidence');
  if(!Number.isFinite(j.netSavingsUSD)||!Number.isFinite(j.baselineUSD)||j.baselineUSD<=0||j.baselineUSD+j.netSavingsUSD<=0)throw new RangeError('income inputs');
  const unmet=r.mix.reduce((n,d)=>n+d.share*d.unmet,0);
  if(j.purchaseShare+unmet>1+1e-12)throw new RangeError('overlapping purchase/unmet groups');
  const uniqueRecipients=scope==='annual'?costInputs.reportedRecipientEquivalents*r.uniqueFraction:r.incrementalUniqueRecipients;
  const people=uniqueRecipients*(j.netSavingsUSD<0?(j.adverseShare??1):j.purchaseShare);
  const incomeBeforeGeography=people===0?0:incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD:j.baselineUSD,annualIncomeGainUSD:j.netSavingsUSD,years:1,editionShare:1,independentShare:j.netSavingsUSD>0?(j.welfareShare??1):1});
  const healthBeforeGeography=uniqueRecipients*(r.mix.reduce((n,d)=>n+d.share*d.unmet*d.safeUse*d.utility*d.years,0)-r.harmPerUnique);
  const incomeYears=r.bayShare===0?0:incomeBeforeGeography*r.bayShare;
  const healthYears=r.bayShare===0?0:healthBeforeGeography*r.bayShare;
  const costUSD=scope==='annual'?costInputs.totalExpenseUsd:costInputs.giftUsd;
  const totalYears=healthYears+incomeYears;
  const sfTotalYears=r.sfShare===0?0:(healthBeforeGeography+incomeBeforeGeography)*r.sfShare;
  return {name:r.name,label:r.name==='cautious_positive'?'cautious signed':r.name,weight:r.weight,costUSD,uniqueRecipients,healthYears,incomeYears,totalYears,sfTotalYears,
   usdPerBetterLife:totalYears>0?10*costUSD/totalYears:null,sfUsdPerBetterLife:sfTotalYears>0?10*costUSD/sfTotalYears:null};
 });
 const healthYears=rows.reduce((n,r)=>n+r.weight*r.healthYears,0),incomeYears=rows.reduce((n,r)=>n+r.weight*r.incomeYears,0),totalYears=healthYears+incomeYears,costUSD=rows[0].costUSD;
 return {scope,rankingStatistic,rows,weighted:{healthYears,incomeYears,totalYears,usdPerBetterLife:totalYears>0?10*costUSD/totalYears:null}};
}
const centralOf=result=>result.rows.find(r=>r.name==='central');
const judgmentsFor=j=>Object.fromEntries(scenarios.map(s=>[s.name,j]));
export function diagnostics(){
 const economic={
  zero:{purchaseShare:0,netSavingsUSD:0,baselineUSD:50000},
  smallPositive:{purchaseShare:.01,netSavingsUSD:45,baselineUSD:50000},
  transferOffset:{purchaseShare:.01,netSavingsUSD:45,baselineUSD:50000,welfareShare:.5},
  higherPurchase:{purchaseShare:.1,netSavingsUSD:225,baselineUSD:20000},
  sparsePickup:{purchaseShare:0,netSavingsUSD:-3,baselineUSD:50000,adverseShare:.1},
  adverse:{purchaseShare:0,netSavingsUSD:-20,baselineUSD:20000},
 };
 const incomeCases=Object.fromEntries(Object.entries(economic).map(([name,j])=>[name,centralOf(calculate({judgments:judgmentsFor(j)}))]));
 const healthCases={};
 for(const [name,index]of [['mobilityZero',0],['bathingZero',1],['suppliesZero',2]]){
  const changed=structuredClone(scenarios);for(const s of changed)s.mix[index].utility=0;
  healthCases[name]=centralOf(calculate({healthScenarios:changed}));
 }
 const noUtility=structuredClone(scenarios);for(const s of noUtility)for(const d of s.mix)d.utility=0;
 healthCases.utilityZeroWithHarm=centralOf(calculate({healthScenarios:noUtility}));
 const nullHealth=structuredClone(noUtility);for(const s of nullHealth)s.harmPerUnique=0;
 healthCases.completeNull=centralOf(calculate({healthScenarios:nullHealth}));
 healthCases.nullHealthPositiveIncome=centralOf(calculate({healthScenarios:nullHealth,judgments:judgmentsFor(economic.smallPositive)}));
 healthCases.jointAdverse=centralOf(calculate({healthScenarios:noUtility,judgments:judgmentsFor(economic.adverse)}));
 healthCases.originalClinical=centralOf(calculate({healthScenarios:originalScenarios}));
 const halved=structuredClone(scenarios);for(const s of halved)for(const d of s.mix)d.years*=.5;
 healthCases.halfDuration=centralOf(calculate({healthScenarios:halved}));
 const weaker=structuredClone(scenarios);for(const s of weaker){s.uniqueFraction*=.5;for(const d of s.mix)d.safeUse*=.5;}
 healthCases.halfUniqueAndSafeUse=centralOf(calculate({healthScenarios:weaker}));
 const fundingCases=Object.fromEntries([0,.25,.5,.75].map(value=>{const changed=structuredClone(scenarios);for(const s of changed)s.throughput=value;return [String(value),centralOf(calculate({healthScenarios:changed}))];}));
 const marginal=calculate(),annual=calculate({scope:'annual'});
 const tail=result=>{const favorable=result.rows.find(r=>r.name==='favorable');return {favorableShare:favorable.weight*favorable.totalYears/result.weighted.totalYears,withoutFavorableSignedYears:result.weighted.totalYears-favorable.weight*favorable.totalYears};};
 return {incomeCases,healthCases,fundingCases,annual,marginal,tail:{annual:tail(annual),marginal:tail(marginal)},mixedBasisMeanCostStress:{annual:centralOf(calculate({scope:'annual',costInputs:{...inputs,totalExpenseUsd:88845}})),marginal:centralOf(calculate({costInputs:{...inputs,totalExpenseUsd:88845}}))},historical:prior()};
}

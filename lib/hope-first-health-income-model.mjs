// Current assessment; historical health-only models remain reproducible.
import {calculate as prior, costWorlds, deliveryWorlds} from './hope-v2-model.mjs';
export {costWorlds, deliveryWorlds};
export const modelVersion='hope-health-income-calibration-2026-10-01';
export const currentEvidence={reviewDate:'2026-10-01',listedSites:9,cumulativeClaimLowerBound:6000,annualExpense:null,annualUniqueRiskPeople:null,annualRescues:null,currentMarginalOffer:null};
export const rankingStatistic='central marginal scenario';
export const incomeJudgment={purchaseShare:0,netSavingsUSD:0,baselineUSD:50000};
const price=(cost,years)=>years>0?10*cost/years:null;
export function calculate({scope='marginal',income=incomeJudgment,...options}={}){
 if(!['annual','marginal'].includes(scope))throw new RangeError('scope');
 if(!income||!Number.isFinite(income.purchaseShare)||income.purchaseShare<0||income.purchaseShare>1||!Number.isFinite(income.netSavingsUSD)||!Number.isFinite(income.baselineUSD)||income.baselineUSD<=0||income.baselineUSD+income.netSavingsUSD<=0)throw new RangeError('income inputs');
 const original=prior(options);
 const rows=original.rows.map(r=>{
  const s=r.inputs,costUSD=scope==='annual'?r.expense:original.gift;
  const factor=scope==='annual'?1:original.gift/r.expense*s.funding;
  const holderEquivalents=s.packs*s.ready/s.repeats*factor;
  // Counterfactual purchasers already have access: remove their health credit.
  const additionalPeople=r.riskPeople*factor*(1-income.purchaseShare);
  const grossQ=additionalPeople*r.qPerPerson,harmQ=additionalPeople*s.harm;
  const healthAllYears=grossQ-harmQ;
  const incomeAllYears=holderEquivalents*(income.netSavingsUSD<0?1:income.purchaseShare)*.5*Math.log1p(income.netSavingsUSD/income.baselineUSD);
  const healthYears=healthAllYears*s.bay,incomeYears=incomeAllYears*s.bay;
  const totalYears=healthYears+incomeYears;
  const out={...r,costUSD,holderEquivalents,additionalPeople,grossQ,harmQ,healthAllYears,incomeAllYears,allQ:healthAllYears+incomeAllYears,healthYears,incomeYears,totalYears,bayQ:totalYears,bayCostPer10:price(costUSD,totalYears),usdPerBetterLife:price(costUSD,totalYears)};
  for(const v of Object.values(out))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite output');
  return out;
 });
 const healthYears=rows.reduce((n,r)=>n+r.weight*r.healthYears,0),incomeYears=rows.reduce((n,r)=>n+r.weight*r.incomeYears,0),totalYears=healthYears+incomeYears;
 const weightedCost=rows.reduce((n,r)=>n+r.weight*r.costUSD,0);
 const allQ=rows.reduce((n,r)=>n+r.weight*r.allQ,0),favorable=rows.filter(r=>r.deliveryId==='favorable'),rest=rows.filter(r=>r.deliveryId!=='favorable'),restMass=rest.reduce((n,r)=>n+r.weight,0);
 return {...original,modelVersion,currentEvidence,scope,income:{...income},rankingStatistic,rows,centralScenario:rows.find(r=>r.costId==='central_cost'&&r.deliveryId==='central')??null,weighted:{healthYears,incomeYears,totalYears,costUSD:weightedCost,usdPerBetterLife:price(weightedCost,totalYears)},allQ,allCostPer10:price(weightedCost,allQ),bayQ:totalYears,bayCostPer10:price(weightedCost,totalYears),favorableShareOfSignedQ:totalYears>0?favorable.reduce((n,r)=>n+r.weight*r.totalYears,0)/totalYears:null,withoutFavorableBayCostPer10:restMass>0?price(rest.reduce((n,r)=>n+r.weight*r.costUSD,0)/restMass,rest.reduce((n,r)=>n+r.weight*r.totalYears,0)/restMass):null,subjectiveMassBelow1m:rows.reduce((n,r)=>n+(r.bayCostPer10!==null&&r.bayCostPer10<1e6?r.weight:0),0),subjectiveMassBelow100k:rows.reduce((n,r)=>n+(r.bayCostPer10!==null&&r.bayCostPer10<1e5?r.weight:0),0),historicalHealthOnly:original,incomeBasis:'Provisional zero central net income; independent signed cash cases, not measured absence.'};
}
export function diagnostics(){
 const central=o=>calculate(o).centralScenario;
 const change=f=>deliveryWorlds.map(w=>f({...w}));
 const horizonCases=Object.fromEntries([1,2,5,10,20].map(h=>[h,central({worlds:change(w=>({...w,horizon:h}))})]));
 const fundingCases=Object.fromEntries([0,.1,.25,.5,1].map(f=>[f,central({worlds:change(w=>({...w,funding:f}))})]));
 const incomeCases={zero:central({}),counterfactualPurchase:central({income:{purchaseShare:.1,netSavingsUSD:19,baselineUSD:50000}}),adversePickup:central({income:{purchaseShare:0,netSavingsUSD:-5,baselineUSD:50000}}),nullHealthPositiveIncome:central({worlds:change(w=>({...w,hazardGain:0,harm:0})),income:{purchaseShare:.1,netSavingsUSD:19,baselineUSD:50000}}),jointAdverse:central({worlds:change(w=>({...w,hazardGain:0})),income:{purchaseShare:0,netSavingsUSD:-5,baselineUSD:50000}})};
 const postHazardCases=Object.fromEntries([.02,.047,.07,.1,.2].map(h=>[h,central({worlds:change(w=>({...w,postHazard:h}))})]));
 const c=central({}),s=c.inputs,d=Math.log1p(.03),infiniteHealthYears=c.additionalPeople*(s.utility*(c.activeSurvivalYears+c.survivalGap*Math.exp(-d)/(s.postHazard+d))-s.harm)*s.bay;
 return {horizonCases,postHazardCases,analyticInfiniteHorizon:{notLocalPrognosis:true,healthYears:infiniteHealthYears,usdPerBetterLife:price(c.costUSD,infiniteHealthYears)},fundingCases,incomeCases,annual:calculate({scope:'annual'}),marginal:calculate(),historical:prior()};
}

// Conditional Hamilton prevention award welfare ledger; all-in cost and dose are judgments. Frozen native/VA bridges remain historical.
import native from '../data/san-francisco/hamilton-prevention-cea-v1.json' with {type:'json'};
import bridge from '../data/san-francisco/hamilton-prevention-qaly-bridge-audit-v1.json' with {type:'json'};
import {referenceIncomeUSD,healthyYearValueCG} from './income-health-equivalence.mjs';
export const modelVersion='hamilton-health-income-calibration-2026-10-01';
export const central={
 donorBudgetUSD:100000,costPerCaseUSD:10000,transferPerCaseUSD:5000,
 transportedWelfareYears:.144*.5,netTenantShare:.8,baselineHouseholdResourcesUSD:50000,
 receiptDelayYears:.25,discountRate:.03,overlapShare:1,
 fundingAdditionality:1,completionShare:1,portfolioShare:1,sfShare:1,bayShare:1,
 recipientBurdenUSD:0,burdenDelayYears:.25,burdenExposureShare:1,
};
const price=(cost,years)=>years>0?10*cost/years:null;
export function calculate(overrides={}){
 const x={...central,...overrides},p=v=>Number.isFinite(v)&&v>=0&&v<=1;
 if(![x.donorBudgetUSD,x.costPerCaseUSD,x.baselineHouseholdResourcesUSD].every(v=>Number.isFinite(v)&&v>0)||
  ![x.transferPerCaseUSD,x.transportedWelfareYears,x.receiptDelayYears,x.discountRate,x.recipientBurdenUSD,x.burdenDelayYears].every(v=>Number.isFinite(v)&&v>=0)||
  x.recipientBurdenUSD>=x.baselineHouseholdResourcesUSD||x.transferPerCaseUSD>x.costPerCaseUSD||(x.transferPerCaseUSD===0&&x.transportedWelfareYears>0)||
  ![x.netTenantShare,x.overlapShare,x.fundingAdditionality,x.completionShare,x.portfolioShare,x.sfShare,x.bayShare,x.burdenExposureShare].every(p)||x.sfShare>x.bayShare){
  throw new RangeError('Invalid Hamilton cost, welfare, net-resource, timing, incidence or geography input');
 }
 const cases=x.donorBudgetUSD/x.costPerCaseUSD,weight=referenceIncomeUSD/healthyYearValueCG;
 // One-off tenant resources, not recurring wages. Already discounted VA envelope
 // is not discounted again; no native homelessness ITT or clinical haircut on cash.
 const cashPerCase=weight*Math.log1p(x.netTenantShare*x.transferPerCaseUSD/x.baselineHouseholdResourcesUSD)/(1+x.discountRate)**x.receiptDelayYears;
 const residualPerCase=Math.max(0,x.transportedWelfareYears-x.overlapShare*cashPerCase);
 const burdenPerCase=weight*Math.log1p(-x.recipientBurdenUSD/x.baselineHouseholdResourcesUSD)/(1+x.discountRate)**x.burdenDelayYears;
 const assignedCases=cases*x.portfolioShare,additionalCases=assignedCases*x.fundingAdditionality*x.completionShare;
 const noncashProxyYears=additionalCases*residualPerCase;
 const cashEquivalentYears=additionalCases*cashPerCase;
 // Recipient process burdens can occur even when the award is substituted or
 // never completed. Exposure is explicit; these harms are not overlap-discounted.
 const recipientBurdenYears=assignedCases*x.burdenExposureShare*burdenPerCase;
 const incomeEquivalentYears=cashEquivalentYears+recipientBurdenYears;
 const combinedYears=noncashProxyYears+incomeEquivalentYears;
 const region=share=>({noncashProxyYears:noncashProxyYears*share,incomeEquivalentYears:incomeEquivalentYears*share,combinedYears:combinedYears*share,costPerBetterLifeUSD:price(x.donorBudgetUSD,combinedYears*share)});
 const result={modelVersion,inputs:x,cases,additionalCases,cashPerCase,residualPerCase,burdenPerCase,
  noncashProxyYears,cashEquivalentYears,recipientBurdenYears,incomeEquivalentYears,combinedYears,
  costPerBetterLifeUSD:price(x.donorBudgetUSD,combinedYears),status:combinedYears>0?'positive':combinedYears<0?'harm':'null',sf:region(x.sfShare),bay:region(x.bayShare),
  historical:{nativeEpisodePriceUSD:native.bottomLine.costPerAdditionalHomelessnessEpisodeAvertedUsd,healthLabelledPriceUSD:bridge.modeledBridge.bestCostPerTenQalysUsd},
 };
 for(const v of Object.values(result))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Nonfinite Hamilton result');
 return result;
}
export const sharedSupportLoading=1+4976124/13822877;
export const scenarios={
 central:{},halfOverlap:{overlapShare:.5},noOverlap:{overlapShare:0},cashOnly:{transportedWelfareYears:0},
 cautious:{costPerCaseUSD:25000,transferPerCaseUSD:8000,transportedWelfareYears:.0144,fundingAdditionality:.5,netTenantShare:.5,baselineHouseholdResourcesUSD:75000,recipientBurdenUSD:100},
 favorable:{costPerCaseUSD:5000,transferPerCaseUSD:4000,transportedWelfareYears:.144,netTenantShare:1,baselineHouseholdResourcesUSD:25000,overlapShare:.5},
 noFunding:{fundingAdditionality:0},replacementHarm:{fundingAdditionality:0,recipientBurdenUSD:250},
 noCompletion:{completionShare:0,burdenExposureShare:0},noPortfolio:{portfolioShare:0},
 higherDose:{costPerCaseUSD:15000,transferPerCaseUSD:12000},noTransfer:{transferPerCaseUSD:0,transportedWelfareYears:0},noCash:{netTenantShare:0},allNull:{transportedWelfareYears:0,netTenantShare:0},
 loadedCost:{costPerCaseUSD:central.costPerCaseUSD*sharedSupportLoading},halfFunding:{fundingAdditionality:.5},
};
export const diagnostics=()=>Object.fromEntries(Object.entries(scenarios).map(([id,x])=>[id,calculate(x)]));

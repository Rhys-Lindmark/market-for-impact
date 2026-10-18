// Current conditional hearing-course welfare ledger; the health-only engine stays frozen.
import data from '../data/san-francisco/hearing-access-cea-v2.json' with {type:'json'};
import {hearingAccessModel as historicalModel} from './hearing-access-model.mjs';
import {referenceIncomeUSD,healthyYearValueCG} from './income-health-equivalence.mjs';
export const modelVersion='hsc-health-income-calibration-2026-10-01';
export const incomeJudgments={
 baselineHouseholdIncomeUSD:50000,earningsShare:0,netEarningsFraction:0,
 annualExposure:[.515],acquisitionLossUSD:0,receiptDelayYears:.25,
 nonoverlapShare:1,bayShare:1,sfShare:1,
};
const price=(cost,q)=>q>0?10*cost/q:null;
export function hearingCalibratedModel(s,income=incomeJudgments){
 const old=historicalModel(s),j=income;
 const probability=v=>Number.isFinite(v)&&v>=0&&v<=1;
 if(!j||!Number.isFinite(j.baselineHouseholdIncomeUSD)||j.baselineHouseholdIncomeUSD<=0||
  !Number.isFinite(j.netEarningsFraction)||j.netEarningsFraction<=-1||
  !Number.isFinite(j.acquisitionLossUSD)||j.acquisitionLossUSD<0||j.acquisitionLossUSD>=j.baselineHouseholdIncomeUSD||
  !Number.isFinite(j.receiptDelayYears)||j.receiptDelayYears<0||
  ![j.earningsShare,j.nonoverlapShare,j.bayShare,j.sfShare].every(probability)||j.sfShare>j.bayShare||
  !Array.isArray(j.annualExposure)||j.annualExposure.length>s.calendar_horizon_years||!j.annualExposure.every(probability)){
   throw new RangeError('Invalid hearing income incidence, exposure, timing or geography');
 }
 // Shared clinical/household outcomes belong to one portfolio ledger. Independent
 // donor harm persists even if shared benefit is assigned elsewhere.
 const healthYears=(old.netQalys+s.donor_specific_harm_qaly_per_offer)*j.nonoverlapShare-s.donor_specific_harm_qaly_per_offer;
 const completedHouseholds=s.funding_additionality*s.pre_fitting_completion*j.nonoverlapShare;
 // Own end-year income schedule: never multiply wages by clinical utility transfer.
 const incomeYears=j.annualExposure.reduce((sum,f,i)=>sum+f/(1+s.discount_rate)**(i+1),0);
 const weight=referenceIncomeUSD/healthyYearValueCG;
 const earningsYears=weight*completedHouseholds*j.earningsShare*incomeYears*Math.log1p(j.netEarningsFraction);
 // One-off unreimbursed household burden is not part of the donor cash budget.
 const receiptFactor=(1+s.discount_rate)**(-j.receiptDelayYears);
 const acquisitionYears=weight*completedHouseholds*receiptFactor*Math.log1p(-j.acquisitionLossUSD/j.baselineHouseholdIncomeUSD);
 const incomeEquivalentYears=earningsYears+acquisitionYears,totalYears=healthYears+incomeEquivalentYears;
 const result={...old,modelVersion,incomeInputs:structuredClone(j),completedHouseholds,incomeYears,receiptFactor,
  healthYears,earningsYears,acquisitionYears,incomeEquivalentYears,totalYears,
  netQalys:totalYears,costPerTenQalys:price(s.cash_cost_per_offer,totalYears),
  resourceCostPerTenQalys:price(old.grossResourceCost,totalYears),
  bayHealthYears:healthYears*j.bayShare,bayIncomeYears:incomeEquivalentYears*j.bayShare,
  sfHealthYears:healthYears*j.sfShare,sfIncomeYears:incomeEquivalentYears*j.sfShare,
  bayCostPerTenQalys:price(s.cash_cost_per_offer,totalYears*j.bayShare),
  sfCostPerTenQalys:price(s.cash_cost_per_offer,totalYears*j.sfShare),
  status:totalYears>0?'positive':totalYears<0?'harm':'null',historicalHealthOnly:old};
 for(const v of Object.values(result))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Nonfinite hearing result');
 return result;
}
export function hearingDiagnostics(){
 const central=data.scenarios.find(s=>s.name==='central');
 const earnings={...incomeJudgments,earningsShare:.1,netEarningsFraction:.05};
 const loss={...earnings,netEarningsFraction:-.05};
 const acquisition={...incomeJudgments,acquisitionLossUSD:6};
 const noHealth={...central,utility_increment:0};
 return {
  central:hearingCalibratedModel(central),
  earnings:hearingCalibratedModel(central,earnings),
  earningsLoss:hearingCalibratedModel(central,loss),
  acquisition:hearingCalibratedModel(central,acquisition),
  noHealthPositiveIncome:hearingCalibratedModel(noHealth,earnings),
  completeNull:hearingCalibratedModel(noHealth),
  jointHarm:hearingCalibratedModel({...noHealth,donor_specific_harm_qaly_per_offer:.001},acquisition),
  noFunding:hearingCalibratedModel({...central,funding_additionality:0},earnings),
  noCompletion:hearingCalibratedModel({...central,pre_fitting_completion:0},acquisition),
  noPortfolioCredit:hearingCalibratedModel(central,{...earnings,nonoverlapShare:0}),
 };
}

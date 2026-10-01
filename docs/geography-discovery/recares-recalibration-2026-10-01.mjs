// Candidate model: NOT connected to published rankings until independent acceptance.
import {calculate as prior, inputs, scenarios} from '../../lib/recares-v2-model.mjs';
import {incomeHealthyYearEquivalent} from '../../lib/income-health-equivalence.mjs';

export const incomeJudgments = {
 harm: {purchaseShare:0, netSavingsUSD:-20, baselineUSD:20000},
 null: {purchaseShare:0, netSavingsUSD:0, baselineUSD:20000},
 cautious_positive: {purchaseShare:.15, netSavingsUSD:20, baselineUSD:20000},
 central: {purchaseShare:.30, netSavingsUSD:50, baselineUSD:20000},
 favorable: {purchaseShare:.40, netSavingsUSD:100, baselineUSD:20000},
};

// Purchase savings apply ONLY to people who would otherwise buy an equivalent
// item. Health benefits apply to otherwise unmet need. No earnings/caregiver bonus.
export function calculate({scope='annual', judgments=incomeJudgments, healthScenarios=scenarios}={}) {
 if(!['annual','marginal'].includes(scope)) throw new RangeError('scope');
 const original=prior(inputs,healthScenarios);
 const rows=original.rows.map(r=>{
  const j=judgments[r.name];
  if(!j || !Number.isFinite(j.purchaseShare) || j.purchaseShare<0 || j.purchaseShare>1) throw new RangeError('purchase share');
  if(!Number.isFinite(j.netSavingsUSD)||!Number.isFinite(j.baselineUSD)||j.baselineUSD<=0||j.baselineUSD+j.netSavingsUSD<=0) throw new RangeError('income inputs');
  const healthUnmetShare=r.mix.reduce((sum,d)=>sum+d.share*d.unmet,0);
  if(j.purchaseShare+healthUnmetShare>1+1e-12) throw new RangeError('overlapping purchase/unmet groups');
  const uniqueRecipients=scope==='annual'?inputs.reportedRecipientEquivalents*r.uniqueFraction:r.incrementalUniqueRecipients;
  const people=j.netSavingsUSD<0?uniqueRecipients:uniqueRecipients*j.purchaseShare;
  const incomeYears=people===0?0:incomeHealthyYearEquivalent({people,
   annualIncomeBeforeUSD:j.baselineUSD,annualIncomeGainUSD:j.netSavingsUSD,
   years:1,editionShare:r.bayShare});
  const healthYears=uniqueRecipients*(r.mix.reduce((sum,d)=>sum+d.share*d.unmet*d.safeUse*d.utility*d.years,0)-r.harmPerUnique)*r.bayShare;
  const costUSD=scope==='annual'?inputs.totalExpenseUsd:inputs.giftUsd;
  const totalYears=healthYears+incomeYears;
  return {name:r.name,weight:r.weight,costUSD,uniqueRecipients,healthYears,incomeYears,totalYears,
   usdPerBetterLife:totalYears>0?10*costUSD/totalYears:null};
 });
 const healthYears=rows.reduce((sum,r)=>sum+r.weight*r.healthYears,0);
 const incomeYears=rows.reduce((sum,r)=>sum+r.weight*r.incomeYears,0);
 const costUSD=rows[0].costUSD;
 return {scope,rows,weighted:{healthYears,incomeYears,totalYears:healthYears+incomeYears,
  usdPerBetterLife:healthYears+incomeYears>0?10*costUSD/(healthYears+incomeYears):null}};
}

export function diagnostics(){
 const zero=Object.fromEntries(Object.entries(incomeJudgments).map(([k,j])=>[k,{...j,netSavingsUSD:0}]));
 const lowerClinical=structuredClone(scenarios);
 const nullHealth=structuredClone(scenarios);
 for(const s of nullHealth){s.harmPerUnique=0;for(const d of s.mix)d.utility=0;}
 const adverseIncome=Object.fromEntries(Object.entries(incomeJudgments).map(([k,j])=>[k,{...j,netSavingsUSD:-20}]));
 const families={cautious_positive:[[.01,.10],[.01,.10],[.001,.03]],central:[[.03,.25],[.02,.25],[.002,.05]],favorable:[[.05,.50],[.03,.50],[.004,.08]]};
 for(const s of lowerClinical)if(families[s.name])s.mix.forEach((d,k)=>{[d.utility,d.years]=families[s.name][k];});
 return {annual:calculate(),marginal:calculate({scope:'marginal'}),
  annualNoIncome:calculate({judgments:zero}),marginalNoIncome:calculate({scope:'marginal',judgments:zero}),
  annualLowerClinical:calculate({healthScenarios:lowerClinical}),
  marginalLowerClinical:calculate({scope:'marginal',healthScenarios:lowerClinical}),
  marginalNullHealth:calculate({scope:'marginal',healthScenarios:nullHealth}),
  marginalAdverseIncome:calculate({scope:'marginal',judgments:adverseIncome})};
}

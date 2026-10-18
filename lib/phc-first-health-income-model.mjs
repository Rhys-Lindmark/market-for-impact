// Current marginal health + income ledger. Historical portfolio remains frozen.
import model from '../data/san-francisco/phc-portfolio-model-v1.json' with {type:'json'};
import {calculate as healthModel,inputsFor} from './phc-portfolio-model.mjs';
export {inputsFor};
export const modelVersion='phc-health-income-calibration-2026-10-01';
export const incomeJudgments=Object.fromEntries(model.central_inputs.pathways.map(p=>[p.id,{purchaseShare:0,purchaseSavingUSD:0,acquisitionCostUSD:0,earningsShare:0,netEarningsGainFraction:0,baselineIncomeUSD:50000}]));
const price=(cost,q)=>q>0?10*cost/q:null;
export function calculate(p,income=incomeJudgments){
 const historicalHealthOnly=healthModel(p);
 if(!income||typeof income!=='object'||Array.isArray(income)||Object.keys(income).some(id=>!p.pathways.some(x=>x.id===id)))throw new RangeError('income pathways');
 const rate=Math.log1p(p.discount_rate)+p.annual_mortality;
 const components=historicalHealthOnly.components.map((c,i)=>{
  const x=p.pathways[i],j=income[x.id],prob=v=>Number.isFinite(v)&&v>=0&&v<=1;
  if(!j||!prob(j.purchaseShare)||!prob(j.earningsShare)||j.purchaseShare+x.alternative_free_share>1+1e-12||!Number.isFinite(j.purchaseSavingUSD)||j.purchaseSavingUSD<0||!Number.isFinite(j.acquisitionCostUSD)||j.acquisitionCostUSD<0||!Number.isFinite(j.netEarningsGainFraction)||j.netEarningsGainFraction<=-1||!Number.isFinite(j.baselineIncomeUSD)||j.baselineIncomeUSD<=0)throw new RangeError('income inputs or overlapping groups');
  const receiptFactor=Math.exp(-rate*x.delay);
  // Purchasers are outside the original unmet-care cohort: do not subtract twice.
  const purchaseIncomeUS=.5*c.distinct*j.purchaseShare*receiptFactor*Math.log1p(j.purchaseSavingUSD/j.baselineIncomeUSD);
  if(j.acquisitionCostUSD>=j.baselineIncomeUSD)throw new RangeError('nonpositive remaining income');
  const acquisitionIncomeUS=.5*c.distinct*receiptFactor*Math.log1p(-j.acquisitionCostUSD/j.baselineIncomeUSD);
  // Fraction eligible for an earnings response, before actual use. Net of offsets.
  const earningsIncomeUS=.5*c.distinct*x.alternative_free_share*j.earningsShare*c.years*Math.log1p(j.netEarningsGainFraction);
  const incomeUS=purchaseIncomeUS+acquisitionIncomeUS+earningsIncomeUS;
  const out={...c,incomeInputs:{...j},receiptFactor,purchaseIncomeUS,acquisitionIncomeUS,earningsIncomeUS,incomeUS,healthUS:c.net_q,totalUS:c.net_q+incomeUS};
  for(const v of Object.values(out))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite income output');
  return out;
 });
 const healthUS=historicalHealthOnly.us_q,incomeUS=components.reduce((n,c)=>n+c.incomeUS,0),us_q=healthUS+incomeUS,bay_q=us_q*p.bay_share,sf_q=us_q*p.sf_share;
 const result={...historicalHealthOnly,modelVersion,scope:'marginal project-directed support',rankingStatistic:'central marginal scenario',incomeInputs:structuredClone(income),components,healthUS,incomeUS,healthBay:healthUS*p.bay_share,incomeBay:incomeUS*p.bay_share,healthSF:healthUS*p.sf_share,incomeSF:incomeUS*p.sf_share,us_q,bay_q,sf_q,donor_us_per_10q:price(p.gift_usd,us_q),donor_bay_per_10q:price(p.gift_usd,bay_q),donor_sf_per_10q:price(p.gift_usd,sf_q),resource_us_per_10q:price(historicalHealthOnly.gross_resource_usd,us_q),resource_bay_per_10q:price(historicalHealthOnly.gross_resource_usd,bay_q),resource_sf_per_10q:price(historicalHealthOnly.gross_resource_usd,sf_q),status:us_q>0?'positive':us_q<0?'harm':'zero',historicalHealthOnly};
 const finite=o=>{for(const v of Object.values(o)){if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite result');if(v&&typeof v==='object')finite(v);}};finite(result);return result;
}
export function diagnostics(){
 const change=f=>({...model.central_inputs,pathways:model.central_inputs.pathways.map(x=>f({...x}))});
 const economic={
  zero:structuredClone(incomeJudgments),
  purchase:structuredClone(incomeJudgments),
  earnings:structuredClone(incomeJudgments),
  adverse:structuredClone(incomeJudgments),
 };
 economic.purchase.glasses.purchaseShare=.05;economic.purchase.glasses.purchaseSavingUSD=50;
 economic.earnings.glasses.earningsShare=.1;economic.earnings.glasses.netEarningsGainFraction=.05;
 for(const j of Object.values(economic.adverse))j.acquisitionCostUSD=6;
 const incomeCases=Object.fromEntries(Object.entries(economic).map(([name,j])=>[name,calculate(model.central_inputs,j)]));
 const healthNull=change(x=>({...x,utility:0,procedure_harm_q:0}));
 const healthCases={completeNull:calculate(healthNull),nullHealthPositiveCash:calculate(healthNull,economic.purchase),nullHealthPositiveEarnings:calculate(healthNull,economic.earnings),jointAdverse:calculate(change(x=>({...x,utility:-.02})),economic.adverse),noFunding:calculate(change(x=>({...x,financial_additionality:0})),economic.purchase),noCapacity:calculate(change(x=>({...x,max_additional_completed:0})),economic.earnings),halfUtility:calculate(change(x=>({...x,utility:x.utility*.5}))),halfDuration:calculate(change(x=>({...x,horizon:x.horizon*.5})))};
 for(const id of model.central_inputs.pathways.map(x=>x.id))healthCases[id+'Zero']=calculate(change(x=>x.id===id?{...x,utility:0}:x));
 return {incomeCases,healthCases,central:calculate(model.central_inputs),scenarios:model.scenarios.map(s=>({id:s.id,...calculate(inputsFor(model,s))})),annual:{available:false,reason:'Whole PHC project expense and annual completed cohort unknown. Sponsor totals and historical contract budgets are not substitutes.'}};
}

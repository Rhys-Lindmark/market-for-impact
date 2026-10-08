// Current independent reassessment. Earlier engines and coefficients remain frozen.
import {calculate,central} from './hearing-independent-anchor.mjs';
export const modelVersion='hsc-independent-health-income-current-2026-10-01';
export {central};
export const scenarios=[{name:'central',overrides:{}},{name:'clinical and income coexist',overrides:{overlapHealthRetention:1}},{name:'low instrument utility',overrides:{utility:.01}},{name:'shorter clinical exposure',overrides:{duration:.375}},{name:'zero income',overrides:{netResourceGain:0}},{name:'negative income',overrides:{netResourceGain:-.02}},{name:'no additional funding',overrides:{funding:0}},{name:'independent harm despite no funding',overrides:{funding:0,donorHarm:.001}}];
const price=(cost,q)=>q>0?10*cost/q:null;
export function hearingCalibratedModel(overrides={}){
 const r=calculate(overrides),x=r.inputs,grossResourceCost=x.costUSD+600;
 const result={...r,modelVersion,effectiveYears:r.clinicalYears,healthYears:r.health,incomeEquivalentYears:r.income,earningsYears:r.income,acquisitionYears:0,totalYears:r.health+r.income,netQalys:r.health+r.income,bayHealthYears:r.bayHealth,bayIncomeYears:r.bayIncome,sfHealthYears:r.health*x.sfShare,sfIncomeYears:r.income*x.sfShare,bayTotalYears:r.total,sfTotalYears:(r.health+r.income)*x.sfShare,costPerTenQalys:price(x.costUSD,r.health+r.income),bayCostPerTenQalys:r.price,sfCostPerTenQalys:price(x.costUSD,(r.health+r.income)*x.sfShare),grossResourceCost,resourceCostPerTenQalys:price(grossResourceCost,r.health+r.income),resourceBayCostPerTenQalys:price(grossResourceCost,r.total),status:r.total>0?'positive':r.total<0?'harm':'null'};
 const finite=o=>{for(const v of Object.values(o)){if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite wrapper output');if(v&&typeof v==='object')finite(v);}};finite(result);return result;
}
export function hearingDiagnostics(){return Object.fromEntries(scenarios.map(s=>[s.name,hearingCalibratedModel(s.overrides)]));}

import {calculate as anchor,inputs,resources} from './phc-independent-anchor.mjs';
export {inputs,resources};
export const modelVersion='phc-independent-health-income-current-2026-10-01';
const change=f=>({...inputs,paths:inputs.paths.map(x=>f({...x}))});
export const scenarios=[
 {id:'central',name:'central',inputs,resources},
 {id:'coexisting',name:'coexisting distinct health and income',inputs,resources:{...resources,reserveWorkerClinical:false}},
 {id:'noIncome',name:'zero net resources',inputs,resources:{...resources,p:0,workerShare:0}},
 {id:'negativeIncome',name:'negative net earnings',inputs,resources:{...resources,netAnnualGainUSD:-1000}},
 {id:'lowVisionUtility',name:'lower vision utility',inputs:change(x=>x.id==='glasses'?{...x,utility:.01}:x),resources},
 {id:'shortHealth',name:'quarter-year health exposure',inputs:change(x=>({...x,horizon:.25})),resources},
 {id:'noFunding',name:'no additional funding',inputs:change(x=>({...x,funding:0})),resources},
 {id:'failedBurden',name:'gift-induced failed access burden',inputs:change(x=>({...x,funding:0})),resources:{...resources,B:6,inducedExposure:20}},
 {id:'signedHarm',name:'adverse health and income',inputs:change(x=>({...x,utility:-.02})),resources:{...resources,netAnnualGainUSD:-1000,B:6,inducedExposure:20}},
];
const price=(cost,q)=>q>0?10*cost/q:null;
export function calculate(p=inputs,j=resources){
 const r=anchor(p,j);
 const result={...r,modelVersion,scope:'project-directed support; entire donor budget retained',rankingStatistic:'central independent scenario',
  inputParameters:structuredClone(p),incomeInputs:structuredClone(j),components:r.rows,
  healthBay:r.bayHealth,incomeBay:r.bayIncome,healthSF:r.healthUS*p.sf,incomeSF:r.incomeUS*p.sf,
  us_q:r.totalUS,bay_q:r.bayTotal,sf_q:r.sfTotal,gift_usd:p.gift,gross_resource_usd:r.grossResources,
  donor_us_per_10q:price(p.gift,r.totalUS),donor_bay_per_10q:r.bayPrice,donor_sf_per_10q:r.sfPrice,
  resource_us_per_10q:price(r.grossResources,r.totalUS),resource_bay_per_10q:r.grossResourceBayPrice,resource_sf_per_10q:price(r.grossResources,r.sfTotal),
  status:r.totalUS>0?'positive':r.totalUS<0?'harm':'zero'};
 const finite=o=>{for(const v of Object.values(o)){if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite wrapper output');if(v&&typeof v==='object')finite(v);}};finite(result);return result;
}
export function diagnostics(){return {central:calculate(),scenarios:scenarios.map(s=>({id:s.id,...calculate(s.inputs,s.resources)})),annual:{available:false,reason:'Current whole-project expense and matched completed annual cohort are unknown; sponsor expense and historical city budget are not substitutes.'}};}

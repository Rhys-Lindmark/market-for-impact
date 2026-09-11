import {calculate as oldCalculate, inputs as oldInputs, scenarios as oldScenarios} from './fuf-model.mjs';
export const inputs={giftUsd:100000,wholeExpenseUsd:5410095,treesPlanted:1506,expenseYear:2025,outputYear:2025,bayShare:1,sfShare:1,discountRate:.03};
export const scenarios=structuredClone(oldScenarios);
export const finances=[
 {year:2023,revenue:4217920,expense:4655009,program:3299016,management:663236,fundraising:692757,governmentGrants:2917846,netAssets:3285858,cashAndSavings:2352170},
 {year:2024,revenue:5006971,expense:5673426,program:4136547,management:764372,fundraising:772507,governmentGrants:3418485,netAssets:2595103,cashAndSavings:918214},
 {year:2025,revenue:5142060,expense:5410095,program:3984632,management:867580,fundraising:557883,governmentGrants:3761445,netAssets:2327068,cashAndSavings:1054801}
];
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function finite(x,name,min=0,max=Number.MAX_VALUE){if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw new RangeError(name);return x;}
function checkTree(x){if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite derived result');if(x&&typeof x==='object')for(const v of Object.values(x))checkTree(v);}
const price=(gift,q)=>q>0?gift*10/q:null;
export function historical(){return oldCalculate();}
export function calculate(overrides={},worlds=scenarios,options={}){
 if(!object(options))throw new TypeError('diagnostic options object');
 for(const k of Object.keys(options))if(!['lagYears','rampYears','netNewShare'].includes(k))throw new TypeError(`unknown diagnostic ${k}`);
 const {lagYears=0,rampYears=0,netNewShare=1}=options;
 if(!object(overrides))throw new TypeError('input object required');
 for(const k of Object.keys(overrides))if(!(k in inputs))throw new TypeError(`unknown input ${k}`);
 const i={...inputs,...overrides};
 finite(i.giftUsd,'gift',Number.MIN_VALUE,100000);finite(i.wholeExpenseUsd,'expense',Number.MIN_VALUE);
 finite(i.treesPlanted,'trees',Number.MIN_VALUE);finite(i.discountRate,'discount',0,1);
 finite(i.bayShare,'Bay',0,1);finite(i.sfShare,'SF',0,i.bayShare);
 for(const k of ['expenseYear','outputYear']){finite(i[k],k,1900,2100);if(!Number.isInteger(i[k]))throw new RangeError(k);}
 finite(lagYears,'lag',0,30);finite(rampYears,'ramp',0,30);finite(netNewShare,'net-new',0,1);
 if(!Array.isArray(worlds)||!worlds.length)throw new TypeError('worlds');const ids=new Set();
 for(const s of worlds){if(!object(s)||typeof s.name!=='string'||!s.name.trim()||ids.has(s.name.trim()))throw new TypeError('unique nonempty names');ids.add(s.name.trim());
  for(const k of ['weight','fundingAdditionality','establishmentSurvival','annualPostEstablishmentMortality'])finite(s[k],k,0,1);
  finite(s.horizonYears,'horizon',0,30);if(!Number.isInteger(s.horizonYears))throw new RangeError('integer horizon');
  finite(s.qalyPerSurvivingTreeYear,'health',0,1);finite(s.harmQalyPerIncrementalTree,'harm',0,1);finite(s.grossResourceMultiplier,'resources',1,100);
 }
 const legacy={...oldInputs,giftUsd:i.giftUsd,fy2024ExpenseUsd:i.wholeExpenseUsd,fy2024TreesPlanted:i.treesPlanted,bayShare:i.bayShare,sfShare:i.sfShare,discountRate:i.discountRate};
 const result=oldCalculate(legacy,worlds);result.inputs=i;
 if(lagYears||rampYears||netNewShare!==1){
  for(const r of result.scenarios){let effective=0;for(let t=1;t<=r.horizonYears;t++){const onset=t<=lagYears?0:(rampYears?Math.min((t-lagYears)/rampYears,1):1);effective+=r.establishmentSurvival*(1-r.annualPostEstablishmentMortality)**(t-1)/(1+i.discountRate)**(t-.5)*onset;}
   r.effectiveHealthTreeYears=effective;r.benefitQaly=r.incrementalTrees*effective*r.qalyPerSurvivingTreeYear*netNewShare;
   r.netQaly=r.benefitQaly-r.harmQaly;r.bayQaly=r.netQaly*i.bayShare;r.sfQaly=r.netQaly*i.sfShare;
   r.modeledOrdinaryGiftCostPer10Qaly=price(i.giftUsd,r.netQaly);r.modeledGrossResourceCostPer10Qaly=price(r.modeledGrossResourcesUsd,r.netQaly);
  }
  const w=result.weighted;w.netQaly=result.scenarios.reduce((a,r)=>a+r.weight*r.netQaly,0);w.positiveQaly=result.scenarios.reduce((a,r)=>a+r.weight*Math.max(r.netQaly,0),0);
  w.modeledOrdinaryGiftCostPer10Qaly=price(i.giftUsd,w.netQaly);w.positiveOnlyModeledGiftCostPer10Qaly=price(i.giftUsd,w.positiveQaly);w.modeledGrossResourceCostPer10Qaly=price(w.modeledGrossResourcesUsd,w.netQaly);
  const f=result.scenarios.find(r=>r.name==='favorable');w.favorableTailQalyContribution=f?f.weight*f.netQaly:0;w.favorableTailShareOfNetQaly=w.netQaly===0?null:w.favorableTailQalyContribution/w.netQaly;
  const rest=result.scenarios.filter(r=>r.name!=='favorable');const mass=rest.reduce((a,r)=>a+r.weight,0);const q=mass?rest.reduce((a,r)=>a+r.weight*r.netQaly,0)/mass:0;result.noFavorableTail={netQaly:q,modeledOrdinaryGiftCostPer10Qaly:price(i.giftUsd,q)};
 }
 for(const r of result.scenarios)r.modeledOrdinaryGiftCostPer10BayQaly=price(i.giftUsd,r.bayQaly);
 result.weighted.bayQaly=result.weighted.netQaly*i.bayShare;result.weighted.sfQaly=result.weighted.netQaly*i.sfShare;
 result.weighted.modeledOrdinaryGiftCostPer10BayQaly=price(i.giftUsd,result.weighted.bayQaly);
 result.unknownExternalResources=['FY2025 volunteer hours known (6,806), their opportunity cost unknown','public-funded downstream maintenance and water not fully costed','resident time and infrastructure costs unknown'];
 result.verdict='EXPLORATORY / HOLD GIVING: source-updated accounting and volume, unchanged unvalidated health and funding priors; no verified marginal offer.';
 checkTree(result);return result;
}
export function diagnostics(){const current=calculate();return {
 historical:historical(),current,
 cityCount:calculate({treesPlanted:1502}),
 halfFunding:calculate({},scenarios.map(s=>({...s,fundingAdditionality:s.fundingAdditionality/2}))),
 halfNetNewHealthExposure:calculate({},scenarios,{netNewShare:.5}),
 threeYearLag:calculate({},scenarios,{lagYears:3}),
 tenYearRamp:calculate({},scenarios,{rampYears:10}),
 geography:calculate({bayShare:.95,sfShare:.90}),
 tenYearHorizon:calculate({},scenarios.map(s=>({...s,horizonYears:Math.min(s.horizonYears,10)}))),
 zeroHealth:calculate({},scenarios.map(s=>({...s,qalyPerSurvivingTreeYear:0}))),
 volunteerIllustrations:[25,50].map(hourlyValue=>({hourlyValue,annualHours:6806,matchedGiftResourceUsd:6806*hourlyValue*inputs.giftUsd/inputs.wholeExpenseUsd,costPer10BayQaly:price(inputs.giftUsd+6806*hourlyValue*inputs.giftUsd/inputs.wholeExpenseUsd,current.weighted.bayQaly)}))
};}
if(import.meta.url===`file://${process.argv[1]}`)console.log(JSON.stringify(diagnostics(),null,2));

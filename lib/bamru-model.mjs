export const modelVersion='bamru-whole-org-v1';
export const inputs=Object.freeze({giftUsd:5000,maxModeledGiftUsd:5000,observed2024Missions:16,observed2024DeploymentDays:29,historical2017ExpenseExtractUsd:32052,historical2017RevenueExtractUsd:50775,historical2017NetAssetsExtractUsd:182585,currentVerifiedAnnualExpenseUsd:null,currentVerifiedNetAssetsUsd:null,measuredBayResidentShare:null,measuredLivesSaved:null,completeSocietalResourcesUsd:null});
const base={annualCashExpenseUsd:60000,volumeMultiplier:1,cashAdditionality:.3,responsivePersonsPerMission:0,earlierSafeAccessProbability:0,mortalityRiskDifference:0,survivalYears:1,survivalUtility:.8,morbidityUtility:0,morbidityYears:.1,harmPerReadinessMission:0,bayShare:.4,sfShare:.05};
export const scenarios=Object.freeze([
{...base,name:'funding_null',weight:.30,cashAdditionality:0},
{...base,name:'clinical_null',weight:.20},
{...base,name:'harm',weight:.10,annualCashExpenseUsd:80000,harmPerReadinessMission:.01},
{...base,name:'cautious',weight:.20,annualCashExpenseUsd:100000,volumeMultiplier:.75,cashAdditionality:.1,responsivePersonsPerMission:.2,earlierSafeAccessProbability:.1,mortalityRiskDifference:.01,survivalYears:2,morbidityUtility:.01,morbidityYears:.1,harmPerReadinessMission:.0005,bayShare:.2,sfShare:.02},
{...base,name:'central',weight:.15,responsivePersonsPerMission:.4,earlierSafeAccessProbability:.2,mortalityRiskDifference:.04,survivalYears:5,morbidityUtility:.02,morbidityYears:.25,harmPerReadinessMission:.0005},
{...base,name:'favorable',weight:.05,annualCashExpenseUsd:40000,volumeMultiplier:1.25,cashAdditionality:.6,responsivePersonsPerMission:.7,earlierSafeAccessProbability:.4,mortalityRiskDifference:.1,survivalYears:10,morbidityUtility:.04,morbidityYears:.5,harmPerReadinessMission:.001,bayShare:.65,sfShare:.10}
].map(Object.freeze));
const price=(g,q)=>q>0?10*g/q:null;
export function calculate(overrides={},worlds=scenarios){
if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw new TypeError('Overrides must be an object');
if(!Array.isArray(worlds)||!worlds.length)throw new TypeError('Worlds must be a nonempty array');
const names=new Set();
for(const s of worlds){if(!s||typeof s!=='object'||typeof s.name!=='string'||!s.name||names.has(s.name))throw new TypeError('World names must be unique nonempty strings');names.add(s.name);if(!Number.isFinite(s.weight)||s.weight<0||s.weight>1)throw new RangeError('Invalid weight');}
const favorableWorld=worlds.find(s=>s.name==='favorable');
if(!favorableWorld||favorableWorld.weight>=1)throw new RangeError('One favorable world with weight below one is required for removal diagnostic');
const i={...inputs,...overrides};if(!Number.isFinite(i.giftUsd)||i.giftUsd<0||i.giftUsd>inputs.maxModeledGiftUsd)throw Error('Gift outside [0,5000]; no validated larger scaling');
if(!Number.isFinite(i.observed2024Missions)||i.observed2024Missions<0)throw new RangeError('Mission count must be finite and nonnegative');
for(const [k,v] of Object.entries(i))if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Nonfinite input: '+k);
if(Math.abs(worlds.reduce((a,s)=>a+s.weight,0)-1)>1e-10)throw Error('Weights must sum to one');
const rows=worlds.map(s=>{
for(const k of ['annualCashExpenseUsd','volumeMultiplier','survivalYears','morbidityYears','harmPerReadinessMission'])if(!Number.isFinite(s[k]))throw new RangeError('Nonfinite parameter: '+k);
for(const k of ['weight','cashAdditionality','responsivePersonsPerMission','earlierSafeAccessProbability','mortalityRiskDifference','survivalUtility','morbidityUtility','bayShare','sfShare'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1)throw Error(k);
if(s.sfShare>s.bayShare||s.annualCashExpenseUsd<=0||s.survivalYears<=0||s.survivalYears>10||s.morbidityYears<0||s.morbidityYears>.5||s.harmPerReadinessMission<0||s.volumeMultiplier<0)throw Error('Invalid finite/boundary parameter');
const readinessEquivalentMissions=i.giftUsd/s.annualCashExpenseUsd*i.observed2024Missions*s.volumeMultiplier*s.cashAdditionality;
const changedAccessPersons=readinessEquivalentMissions*s.responsivePersonsPerMission*s.earlierSafeAccessProbability;
const deathsAverted=changedAccessPersons*s.mortalityRiskDifference;
const mortalityQaly=deathsAverted*s.survivalYears*s.survivalUtility;
const morbidityQaly=changedAccessPersons*s.morbidityUtility*s.morbidityYears;
const harmQaly=readinessEquivalentMissions*s.harmPerReadinessMission;
const netQaly=mortalityQaly+morbidityQaly-harmQaly;
const bayQaly=netQaly*s.bayShare,sfQaly=netQaly*s.sfShare;
return {...s,readinessEquivalentMissions,changedAccessPersons,deathsAverted,mortalityQaly,morbidityQaly,harmQaly,netQaly,bayQaly,sfQaly,bayDonorCostPer10Qaly:price(i.giftUsd,bayQaly)};
});
const weighted={};for(const k of ['readinessEquivalentMissions','changedAccessPersons','deathsAverted','mortalityQaly','morbidityQaly','harmQaly','netQaly','bayQaly','sfQaly'])weighted[k]=rows.reduce((a,s)=>a+s.weight*s[k],0);
weighted.bayDonorCostPer10Qaly=price(i.giftUsd,weighted.bayQaly);weighted.sfDonorCostPer10Qaly=price(i.giftUsd,weighted.sfQaly);weighted.donorCostPer10Qaly=price(i.giftUsd,weighted.netQaly);
const f=rows.find(s=>s.name==='favorable');const noFavorableBayQaly=rows.filter(s=>s.name!=='favorable').reduce((a,s)=>a+s.weight*s.bayQaly,0)/(1-f.weight);
const result={modelVersion,inputs:i,rows,weighted,favorableShareOfSignedBayQaly:weighted.bayQaly>0?f.weight*f.bayQaly/weighted.bayQaly:null,noFavorable:{bayQaly:noFavorableBayQaly,bayDonorCostPer10Qaly:price(i.giftUsd,noFavorableBayQaly)},thresholdJudgments:{below1m:rows.filter(s=>s.bayDonorCostPer10Qaly!==null&&s.bayDonorCostPer10Qaly<1e6).reduce((a,s)=>a+s.weight,0),below100k:rows.filter(s=>s.bayDonorCostPer10Qaly!==null&&s.bayDonorCostPer10Qaly<1e5).reduce((a,s)=>a+s.weight,0),interpretation:'Subjective scenario mass, not calibrated probability'},currentVerifiedAnnualExpenseUsd:null,verifiedMarginalFundingOffer:null,completeSocietalResourcesUsd:null,measuredQaly:null,status:'exploratory draft; HOLD giving; independent audit required'};
function finiteOutput(v){if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Nonfinite model output');if(v&&typeof v==='object')Object.values(v).forEach(finiteOutput);}
finiteOutput(result);return result;
}

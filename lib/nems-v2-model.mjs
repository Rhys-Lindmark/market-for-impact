import {hbvRetentionModel as original} from './hbv-retention-model.mjs';
import sourceData from '../data/san-francisco/nems-hbv-cea-v1.json' with {type:'json'};
export const modelVersion='nems-depth-v2-conditional-hbv-preserved';
export const data=sourceData;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const finite=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite derived quantity');if(x&&typeof x==='object')Object.values(x).forEach(finite);};
export function evaluate(s=data.scenarios[1]){if(!object(s))throw new TypeError('scenario');const out=original(s);finite(out);return out;}
export function calculate(){const scenarios=data.scenarios.map(s=>({name:s.name,inputs:s,result:evaluate(s)}));const c=data.scenarios[1];const changes=[['funding_null',{fundingAdditionality:0}],['monitoring_null',{localMonitoringIncrement:0}],['causal_null',{causalTransfer:0}],['harm',{harmQalysPerPerson:.01}],['zero_years',{fundedYears:0}],...([1,5,10,35].map(t=>['funded_'+t,{fundedYears:t}])),['uniform_timing',{benefitShape:0}],['later_timing',{benefitShape:2}]];
const diagnostics=changes.map(([id,patch])=>({id,inputs:{...c,...patch},result:evaluate({...c,...patch})}));
const central=scenarios[1].result;
const transferDiagnostics=[1,.5,.1,0].flatMap(allocation=>[1,.9,.5].map(bay=>{const q=central.qalysPer100k*allocation*bay;return{allocationToHypotheticalNavigation:allocation,bayShare:bay,gift:100000,quantifiedBayQalys:q,donorPer10:q>0?1000000/q:null,notWholePortfolioExpectedValue:true};}));
const out={modelVersion,central,scenarios,diagnostics,transferDiagnostics,weightedExpectation:null,ordinaryFoundationGiftExpectedQalys:null,ordinaryFoundationGiftBayShare:null,currentMarginalOffer:null,scope:'Preserved targeted recurring HBV navigation calibration; not ordinary Foundation or complete operating NEMS health'};finite(out);return out;}

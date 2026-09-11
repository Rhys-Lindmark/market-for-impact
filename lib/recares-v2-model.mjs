import {calculate as legacy,inputs as oldInputs,scenarios as oldScenarios} from './recares-v1-frozen.mjs';
export const modelVersion='recares-depth-v2-fy2025';
export const originalInputs=structuredClone(oldInputs);
export const inputs={...originalInputs,totalExpenseUsd:72583,programExpenseUsd:69412,reportedRecipientEquivalents:11000,reportedItems:45000,equipmentDonors:4700,cashSavingsInvestmentsUsd:253225,netAssetsUsd:313082};
export const scenarios=structuredClone(oldScenarios);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const finiteTree=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite derived output');if(x&&typeof x==='object')for(const v of Object.values(x))finiteTree(v);};
function identifiers(rows,key){const ids=new Set();for(const row of rows){if(!obj(row)||typeof row[key]!=='string'||!row[key].trim()||row[key]!==row[key].trim()||ids.has(row[key].trim()))throw new RangeError('invalid/duplicate id');ids.add(row[key].trim());}}
export function calculate(i=inputs,ss=scenarios){
 if(!obj(i)||!Array.isArray(ss)||!ss.length)throw new TypeError('input/world shape');
 for(const key of Object.keys(inputs))if(!(key in i))throw new TypeError('missing input '+key);
 finiteTree(i);identifiers(ss,'name');
 for(const key of Object.keys(inputs))if(!(key==='externalResourceCostPerIncrementalUnique'&&i[key]===null)&&(typeof i[key]!=='number'||i[key]<0))throw new RangeError('nonnegative numeric input '+key);
 for(const s of ss){if(!Array.isArray(s.mix)||!s.mix.length)throw new TypeError('mix');identifiers(s.mix,'name');finiteTree(s);}
 if(!ss.some(s=>s.name!=='favorable'&&s.weight>0))throw new RangeError('no nonfavorable mass');
 const result=legacy(i,ss);finiteTree(result);
 return {...result,modelVersion,publicationStatus:'v2_draft_for_independent_audit',basis:'FY2025 cash/output update; original subjective health and funding priors retained'};
}
export function diagnostics(){
 const clone=()=>structuredClone(scenarios);
 const scale=(field,factor)=>{const ss=clone();for(const s of ss)if(['cautious_positive','central','favorable'].includes(s.name))for(const d of s.mix)d[field]*=factor;return ss;};
 const shortBoth=scale('utility',.5);for(const s of shortBoth)if(['cautious_positive','central','favorable'].includes(s.name))for(const d of s.mix)d.years*=.5;
 const slow=clone();for(const s of slow)s.throughput*=.5;
 const shared=clone();const map={cautious_positive:[[.01,.10],[.01,.10],[.001,.03]],central:[[.03,.25],[.02,.25],[.002,.05]],favorable:[[.05,.50],[.03,.50],[.004,.08]]};for(const s of shared)if(map[s.name])s.mix.forEach((d,k)=>{[d.utility,d.years]=map[s.name][k];});
 const cases={old:calculate(originalInputs),expenseOnly:calculate({...originalInputs,totalExpenseUsd:inputs.totalExpenseUsd}),recipientsOnly:calculate({...originalInputs,reportedRecipientEquivalents:11000}),updated:calculate(),halfUtility:calculate(inputs,scale('utility',.5)),halfDuration:calculate(inputs,scale('years',.5)),halfUtilityAndDuration:calculate(inputs,shortBoth),halfThroughput:calculate(inputs,slow),sharedClinicalFamily:calculate(inputs,shared)};
 return {cases,resourceBenchmarks:[...([20,35,50].map(hourly=>({label:`5400 volunteer hours at hypothetical $${hourly}/hour`,added:5400*hourly}))),...([10,50,100].map(each=>({label:`Hypothetical $${each} equipment opportunity cost per reported equivalent`,added:11000*each})))].map(x=>({...x,notCompleteSocietalCost:true,result:calculate({...inputs,totalExpenseUsd:inputs.totalExpenseUsd+x.added})})),definition:'Resource benchmarks scale cash/output by an added annual resource charge; not an observed marginal resource cost or a gift budget.'};
}

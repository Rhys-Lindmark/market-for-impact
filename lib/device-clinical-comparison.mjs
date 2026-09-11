import * as melp from './melp-model.mjs';
import * as recares from './recares-model.mjs';
export const categoryPairs=[['adult_mobility','mobility'],['bathing_transfer','bathing_transfer'],['consumables_other','supplies_other']];
export const positiveScenarioNames=['cautious_positive','central','favorable'];
// Positive means a modeled positive-benefit pathway, not necessarily positive NET health.
// Null/harm worlds are never remapped. Only utility and years may change.
export function replacement(target,source,pairs,names){
 const maps=[];
 const scenarios=target.map(s=>{
  if(!names.includes(s.name))return {...s,mix:s.mix.map(d=>({...d}))};
  const from=source.find(x=>x.name===s.name);if(!from)throw Error('Unmatched scenario '+s.name);
  return {...s,mix:s.mix.map(d=>{
   const pair=pairs.find(x=>x[0]===d.name);if(!pair)return {...d};
   const sd=from.mix.find(x=>x.name===pair[1]);if(!sd)throw Error('Unmatched category');
   maps.push({scenario:s.name,targetCategory:d.name,sourceCategory:sd.name,before:{utility:d.utility,years:d.years},after:{utility:sd.utility,years:sd.years}});
   return {...d,utility:sd.utility,years:sd.years};
  })};
 });
 return {scenarios,maps};
}
const summarize=r=>({centralBayPrice:r.rows.find(s=>s.name==='central').bayDonorCostPer10Qaly,weightedBayPrice:r.weighted.bayDonorCostPer10Qaly,weightedBayQaly:r.weighted.bayQaly,centralBayQaly:r.rows.find(s=>s.name==='central').bayQaly});
export function compare(){
 const results={version:'device-clinical-crosswalk-v1',scope:'Diagnostics only; neither clinical family is empirically established; no base model modified',baseline:{melp:summarize(melp.calculate()),recares:summarize(recares.calculate())},diagnostics:[]};
 for(const [targetName,target,source,pairs]of [['melp',melp,recares,categoryPairs],['recares',recares,melp,categoryPairs.map(([a,b])=>[b,a])]]){
  for(const [mode,names]of [['central_only',['central']],['matching_positive_scenarios',positiveScenarioNames]]){
   const {scenarios,maps}=replacement(target.scenarios,source.scenarios,pairs,names);
   results.diagnostics.push({target:targetName,mode,replacements:maps,...summarize(target.calculate(target.inputs,scenarios))});
  }
 }
 return results;
}

import config from '../data/featured-unit-costs.json' with {type:'json'};
import {inputs as recaresInputs} from './recares-calibrated-model.mjs';
import {defaults as selfHelpInputs} from './selfhelp-current-model.mjs';
import {defaultInputs as hopeInputs} from './hope-calibrated-model.mjs';
import {inputs as phcInputs} from './phc-calibrated-model.mjs';
import recaresSources from '../data/bay/recares-v2-sources.json' with {type:'json'};
import {calculate as calculateCca} from './cca-ca-calibrated-model.mjs';
import {calculate as calculateCspi} from './cspi-usa-calibrated-model.mjs';

const positive=(v,label)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<=0)throw new RangeError('Invalid native-unit '+label);return v;};
function field(context,path){let value=context;for(const key of path.split('.')){if(!value||!Object.hasOwn(value,key))throw new Error('Missing native-unit input: '+path);value=value[key];}return value;}
export function evaluateUnitExpression(expression,context){
  if(Object.hasOwn(expression,'value')){
    if(expression.evidence&&!String(field(context,expression.evidence.ref)).includes(expression.evidence.includes))throw new Error('Stale native-unit evidence');
    return positive(expression.value,'constant');
  }
  if(expression.ref){
    return positive(field(context,expression.ref),expression.ref);
  }
  if(expression.multiply)return positive(expression.multiply.reduce((n,x)=>n*evaluateUnitExpression(x,context),1),'product');
  if(expression.add)return positive(expression.add.reduce((n,x)=>n+evaluateUnitExpression(x,context),0),'sum');
  if(expression.divide)return positive(evaluateUnitExpression(expression.divide[0],context)/evaluateUnitExpression(expression.divide[1],context),'quotient');
  if(expression.sumField){const rows=field(context,expression.sumField.ref);if(!Array.isArray(rows)||!rows.length)throw new Error('Missing native-unit rows');return positive(rows.reduce((n,row)=>n+positive(row[expression.sumField.field],'row count'),0),'row sum');}
  if(expression.jsonSum){const value=JSON.parse(field(context,expression.jsonSum));if(!value||Array.isArray(value)||typeof value!=='object')throw new Error('Invalid native-unit count map');return positive(Object.values(value).reduce((n,v)=>n+positive(v,'category count'),0),'category sum');}
  throw new Error('Unknown native-unit expression');
}
export const nativeUnitKinds={
  'observed-average':'Reported annual spending average',
  'modeled-output':'Conditional modeled estimate',
  'assumed-unit':'Assumed delivery cost',
  'annual-work':'Reported annual spending',
  unknown:'Per-outcome cost not established',
};
export function formatNativeUnitMoney(value){
  positive(value,'price');
  // These are actual native-unit dollars: never apply the /10 DALY conversion.
  // Round display only: retain full precision in priceUSD and the source model.
  // Choose notation after rounding so values near a K/M boundary roll over cleanly.
  const rounded=Number(value.toPrecision(2));
  return new Intl.NumberFormat('en-US',{
    style:'currency',currency:'USD',maximumSignificantDigits:2,
    notation:rounded<10000?'standard':'compact',
  }).format(rounded);
}
export function calculateUnitCost(entry,context){
  if(!nativeUnitKinds[entry.kind])throw new Error('Unknown native-unit basis');
  if(entry.kind==='unknown')return {...entry,costUSD:null,units:null,priceUSD:null,line:'A reliable cost per concrete outcome is not yet established.',basis:nativeUnitKinds.unknown};
  const costUSD=evaluateUnitExpression(entry.numerator,context),units=evaluateUnitExpression(entry.denominator,context);
  const priceUSD=positive(costUSD/units,'ratio');
  return {...entry,costUSD,units,priceUSD,line:`${entry.lead??'About'} ${formatNativeUnitMoney(priceUSD)} ${entry.unit}`,basis:nativeUnitKinds[entry.kind]};
}
export function nativeUnitContext(report){return {
  inputs:Object.fromEntries(report.model.inputs.map(input=>[input.name,input.value])),
  central:report.model.scenarios.find(s=>s.id==='central'),report,
  ...(report.edition==='california'&&report.slug==='coalition-for-clean-air'?{native:calculateCca()}:{}),
  ...(report.edition==='usa'&&report.slug==='center-for-science-in-the-public-interest'?{native:calculateCspi()}:{}),
};}
function resolve(key,context,sources){
  const entry=config.entries[key];if(!entry)throw new Error('Missing featured native-unit entry: '+key);
  const result=calculateUnitCost(entry,context);
  const selected=(entry.sourceIds??[]).map(id=>{const source=sources.find(s=>s.id===id);if(!source)throw new Error('Unknown native-unit source '+key+'/'+id);return source;});
  return {...result,key,sources:selected};
}
export function nativeUnitForReport(report){
  const key=report.edition+'/'+report.slug;
  // Newly ranked reports can lack a reviewed native-unit denominator. Keep the
  // DALY reference rather than suppressing the charity or inventing a unit cost.
  if(!Object.hasOwn(config.entries,key))return {...calculateUnitCost({kind:'unknown',key,scope:'A reviewed native-unit cost is not established for this report; see its modeled DALY reference and assumptions.'},{}),sources:[]};
  return resolve(key,nativeUnitContext(report),report.sources);
}
const sfContexts={
  recares:{inputs:recaresInputs},
  'self-help-for-the-elderly':{inputs:selfHelpInputs},
  'hope-pacifica':{inputs:hopeInputs},
  'project-homeless-connect':{inputs:{glassesCost:phcInputs.paths.find(p=>p.id==='glasses').cost}},
};
export function nativeUnitForSF(slug){return resolve('san-francisco/'+slug,sfContexts[slug],slug==='recares'?recaresSources:[]);}

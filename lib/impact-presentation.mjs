import {impactText,impactMetric} from './impact-metric.mjs';
import geographyOverrides from '../data/impact-metric-geography-overrides.json' with {type:'json'};

export function presentEditionReport(original){
 const overrides=geographyOverrides.reports[original.edition+':'+original.slug]??[];
 const field=(path,text)=>impactText(text,{overrides:overrides.filter(x=>x.field===path)});
 return {...original,
  sections:Object.fromEntries(Object.entries(original.sections).map(([key,text])=>[key,field('sections.'+key,text)])),
  model:{...original.model,
   formula:field('model.formula',original.model.formula),
   sensitivity:original.model.sensitivity.map((s,i)=>typeof s==='string'?field('model.sensitivity.'+i,s):s),
  },
 };
}

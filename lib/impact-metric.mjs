import legacyOverrides from '../data/impact-metric-legacy-overrides.json' with {type:'json'};
const legacyMap=new Map(legacyOverrides.entries.map(row=>[row.text,row.overrides]));
function matchingLegacyOverrides(source){
 const exact=legacyMap.get(source);if(exact)return exact;
 const results=[];for(const row of legacyOverrides.entries){if(row.text.length>source.length)continue;let pos=-1;while((pos=source.indexOf(row.text,pos+1))>=0)results.push(...row.overrides.map(x=>({...x,offset:x.offset+pos})));}return results;
}
/** Backend-only display setting. Canonical calculators still return dollars/10 years. */
export const impactMetricConfig = Object.freeze({ id: 'daly-equivalent' });
export const impactMetrics = Object.freeze({
  'daly-equivalent': {id:'daly-equivalent',years:1,label:'DALY-equivalent',priceLabel:'$ / DALY-equivalent'},
  'better-life': {id:'better-life',years:10,label:'better life',priceLabel:'$ / better life'},
});
export function impactMetric(id=impactMetricConfig.id){if(!impactMetrics[id])throw Error('Unknown impact metric: '+id);return impactMetrics[id];}
export function displayImpactPrice(price,id=impactMetricConfig.id){
  if(price===null||price===undefined)return null;
  if(!Number.isFinite(price))throw Error('Nonfinite comparison price');
  return price/(10/impactMetric(id).years);
}
export function formatImpactMoney(value){
  if(value===null||value===undefined)return 'Not estimated';
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:2}).format(value);
}
export function formatImpactPrice(price,id=impactMetricConfig.id){return formatImpactMoney(displayImpactPrice(price,id));}
export function impactDisplayMetadata(price,id=impactMetricConfig.id){return {metric:impactMetric(id),priceUSD:displayImpactPrice(price,id),canonicalPriceUSDPerTenEquivalentYears:price,conversion:'display only; QALYs and income equivalents are not measured clinical DALYs'};}
/** Add an explicitly labelled display view without breaking existing canonical model API fields. */
export function withImpactDisplay(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return payload;
 const prices={};const visit=(value,path='')=>{if(!value||typeof value!=='object')return;for(const[key,v]of Object.entries(value)){const p=path?path+'.'+key:key;if(/(?:per(?:ten|10)(?:(?:global|direct|sf|bay|local|clinical|income|combined|net))*?(?:qal|equivalent|healthy|health)|(?:price|cost)per10$|price10$|(?:usd|cost)perbetterlife)/i.test(key)&&(v===null||Number.isFinite(v)))prices[p]=displayImpactPrice(v);else if(v&&typeof v==='object')visit(v,p);}};visit(payload);
 return Object.keys(prices).length?{...payload,comparisonDisplay:{metric:impactMetric(),canonicalSourceUnit:'ten modeled equivalent years',priceUSDByCanonicalField:prices,explanation:impactUnitExplanation}}:payload;
}
const moneySource='\\$\\s*-?[0-9](?:[0-9,]*[0-9])?(?:\\.[0-9]+)?(?:\\s*(?:trillion|billion|million|thousand|bn|[TBMK])\\b)?';
const units='(?:per\\s*(?:a\\s+)?better life|(?:per|USD/|\\$/|/)\\s*(?:10|ten)[- ]*(?:(?:additional|incremental|combined|equivalent|modeled|local|global|clinical|health|Bay Area|Bay|SF|SF-resident|MSA|U\\.S\\.|USA|LA/Orange|LA|California|metro|nationwide)\\s*)*(?:QALYs?|DALYs?|Q\\b|healthy[- ]year(?: welfare)? equivalents?|healthy years|health and income-equivalent years|health/income-equivalent years|income-equivalent and noncash health-proxy years|equivalent healthy years|equivalent years|equivalents|years)|per\\s*(?:10|ten)(?=[.,;:*]|$))';
export function parseImpactMoney(token){const m=token.trim().match(/^\$\s*(-?[0-9][0-9,]*(?:\.[0-9]+)?)\s*(trillion|billion|million|thousand|bn|[TBMK])?$/i);if(!m)throw Error('Invalid money token: '+token);return Number(m[1].replaceAll(',',''))*({t:1e12,trillion:1e12,bn:1e9,b:1e9,billion:1e9,m:1e6,million:1e6,k:1e3,thousand:1e3}[m[2]?.toLowerCase()]??1);}
/** Exact-span presentation edits; never mutate analytical input/model data. */
export function impactTextEdits(source,{id=impactMetricConfig.id,priceOnly=false,overrides=[]}={}){
  if(id==='better-life')return [];
  const edits=[];
  const add=(start,end,text)=>{if(!edits.some(e=>start<e.end&&end>e.start))edits.push({start,end,text});};
  for(const token of [...matchingLegacyOverrides(source),...overrides]){if(typeof token==='object'){if(source.slice(token.offset,token.offset+token.source.length)!==token.source)throw Error('Stale price override');add(token.offset,token.offset+token.source.length,formatImpactPrice(token.canonicalPriceUSD??parseImpactMoney(token.source),id));}else{let pos=0;while((pos=source.indexOf(token,pos))>=0){add(pos,pos+token.length,formatImpactPrice(parseImpactMoney(token),id));pos+=token.length;}}}
  const group=moneySource+'(?:\\s*(?:[–—→/-]|,\\s*(?:and)?|to|and|or|becomes|→ current|SF\\s*/|Bay\\s*/)\\s*'+moneySource+')*';
  const bound=new RegExp('('+group+')\\s*\\*{0,2}\\s*(?:(?:(?:in|for) (?:the )?)?(?:Bay Area|San Francisco|SF|Bay|USA|California|LA|local residents|San Francisco residents)\\s*)?('+units+')','gi');
  for(const match of source.matchAll(bound)){
    for(const amount of match[1].matchAll(new RegExp(moneySource,'gi')))add(match.index+amount.index,match.index+amount.index+amount[0].length,formatImpactPrice(parseImpactMoney(amount[0]),id));
  }
  const following=new RegExp(units+'\\s*(?:are|is|:|=)\\s*('+moneySource+'(?:\\s*(?:US|Bay|SF|nationwide)?\\s*(?:,\\s*(?:and\\s*)?|/|and|or)\\s*'+moneySource+')*)','gi');
  for(const match of source.matchAll(following)){const base=match.index+match[0].lastIndexOf(match[1]);for(const amount of match[1].matchAll(new RegExp(moneySource,'gi')))add(base+amount.index,base+amount.index+amount[0].length,formatImpactPrice(parseImpactMoney(amount[0]),id));}
  if(priceOnly)for(const amount of source.matchAll(new RegExp(moneySource,'gi')))add(amount.index,amount.index+amount[0].length,formatImpactPrice(parseImpactMoney(amount[0]),id));
  for(const match of source.matchAll(/(?:A|One|one|a) better life (?:means|=|is|counts|represents) (?:(?:our |a )?comparison unit of )?(?:10|ten) (?:additional |incremental |combined )?(?:QALYs|healthy-year welfare equivalents|healthy-year equivalents|health and income-equivalent years|healthy years)[.]?/g))add(match.index,match.index+match[0].length,'One DALY-equivalent is one modeled healthy-year welfare equivalent.');
  for(const match of source.matchAll(/(?:Ten|ten|10) combined years are the better[- ]life comparison unit/gi))add(match.index,match.index+match[0].length,'One modeled equivalent year is the DALY-equivalent comparison unit');
  for(const match of source.matchAll(/A better life means ten combined modeled health and income-equivalent years[.]?/gi))add(match.index,match.index+match[0].length,'One DALY-equivalent is one modeled healthy-year welfare equivalent.');
  for(const match of source.matchAll(new RegExp(units,'gi')))add(match.index,match.index+match[0].length,(match[0].startsWith('/')?' ':'')+'per '+impactMetric(id).label);
  for(const match of source.matchAll(/per better life\s*[:—-]\s*((?:ten|10) (?:(?:combined|modeled|health|and|income-equivalent|healthy-year|welfare|clinical)[- ]+)*(?:years|QALYs|equivalents))/gi)){const start=match.index+match[0].indexOf(match[1]);add(start,start+match[1].length,'one modeled equivalent year');}
  for(const match of source.matchAll(/(?:per better life|\bA better life)[^.!?;]{0,140}?(?:[:—]|\bmeans\b|\bis\b|\bremains\b|defined here as|combining)\s*((?:ten|10)\s+(?:[A-Za-z/-]+\s+){0,12}(?:QALYs|years|equivalents))/gi)){const start=match.index+match[0].lastIndexOf(match[1]);add(start,start+match[1].length,'one modeled equivalent year');}
  for(const match of source.matchAll(/\((?:10|ten) (?:(?:additional|incremental|combined|modeled|Bay Area|Bay|SF|clinical) )*(?:QALYs|health and income-equivalent years|healthy[- ]year(?: welfare)? equivalents)\)/gi))add(match.index,match.index+match[0].length,'(one modeled equivalent year)');
  for(const match of source.matchAll(/\((?:10|ten) (?:(?:Bay|SF|local) )?(?:health-plus-income-equivalent|health-and-income-equivalent) years\)/gi))add(match.index,match.index+match[0].length,'(one modeled equivalent year)');
  if(new RegExp(units,'i').test(source)||legacyMap.has(source)){
   for(const match of source.matchAll(/\b(?:using|counting|means) (?:ten|10) (?:(?:combined|modeled|clinical|healthy|health|and|income-equivalent|healthy-year|welfare)[- ]+)*(?:years|QALYs|equivalents)/gi))add(match.index,match.index+match[0].length,'using one modeled equivalent year');
   for(const match of source.matchAll(/\bten times (?=\$)|\b10\s*[×*]\s*(?=\$|donor|cost|full|annual|expense|budget|G\b)/gi))add(match.index,match.index+match[0].length,'');
  }
  for(const match of source.matchAll(/(?:\$|DOLLARS|COST)\s+(?:PER|per)\s+(?:A |a )?BETTER LIFE|better-life|better life/gi))add(match.index,match.index+match[0].length,match[0].startsWith('$')?impactMetric(id).priceLabel:match[0].toUpperCase()===match[0]?( /^(?:DOLLARS|COST)/.test(match[0])?'COST PER DALY-EQUIVALENT':'DALY-EQUIVALENT'):'DALY-equivalent');
  return edits.sort((a,b)=>a.start-b.start);
}
export function impactText(source,options){if(typeof source!=='string')return source;const edits=impactTextEdits(source,options);let out='',pos=0;for(const e of edits){out+=source.slice(pos,e.start)+e.text;pos=e.end;}return out+source.slice(pos);}
export function legacyImpactText(source){return matchingLegacyOverrides(source).length?impactText(source):source;}
export function impactEquation(equation){
 const normalized=/\b10\s*[×*]|[×*]\s*10\b|per (?:10|ten)|better life/i.test(equation.expression+' '+equation.label+' '+equation.result);
 const amounts=[...equation.result.matchAll(new RegExp(moneySource,'gi'))],last=amounts.at(-1);
 const overrides=normalized&&last&&(amounts.length===1||/=[^=]*$/.test(equation.result.slice(0,last.index)))?[{source:last[0],offset:last.index,canonicalPriceUSD:parseImpactMoney(last[0])}]:[];
 const strip=s=>s.replace(/^\s*10\s*[×*]\s*/,'').replace(/(price\s*=\s*)10\s*[×*]\s*/gi,'$1').replace(/(÷\s*QALYs|\/\s*Q)\s*[×*]\s*10\b/gi,'$1').replace(/\s*[×*]\s*10\s*$/,'').replace(/\s*[×*]\s*10(\s*=)/,'$1');
 return {...equation,label:impactText(equation.label),expression:impactMetric().years===1&&normalized?strip(equation.expression):equation.expression,result:impactMetric().years===1&&normalized?strip(impactText(equation.result,{overrides})):impactText(equation.result,{overrides})};
}
export const impactUnitExplanation=impactMetricConfig.id==='daly-equivalent'?'DALY-equivalent is our one-year comparison unit. QALY-based health gains and income-welfare equivalents retain their original assumptions; they are not measured clinical DALYs.':'A better life is ten modeled health and income-equivalent years, potentially spread across people.';

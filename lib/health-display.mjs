/** Presentation only. Never feed rounded values back into analytical models. */
export const healthDisplayDecimals=2;
export function formatQalys(value){
 if(value===null||value===undefined)return 'unknown';
 if(!Number.isFinite(value))throw Error('Nonfinite QALY value');
 return (Object.is(Math.round(value*100),-0)?0:value).toFixed(healthDisplayDecimals);
}
const number='[-−–]?(?:[0-9][0-9,]*(?:\\.[0-9]+)?|\\.[0-9]+)(?:e[-+]?[0-9]+)?';
const qualifier='(?:(?:US|USA|U\\.S\\.|Bay(?: Area)?|SF(?:-resident)?|California|local|global|clinical|health|net|gross|incremental|additional|combined|modeled|modelled|discounted|annual|lifetime|direct|overseas|present-value|equivalent|income-equivalent|healthy-year|welfare|gift|total)[ -]+)*';
const unit='(?:QALYs?|DALYs?|(?:income-equivalent|healthy-year|health|combined) (?:healthy )?(?:years|equivalents))';
const quantities=number+'(?:\\s*(?:[–—−-]|\\bto\\b|,|and|or)\\s*'+number+')*';
/** Return exact spans so React/Markdown formatting and source URLs stay intact. */
export function healthTextEdits(source,{quantityOnly=false}={}){
 const edits=[];const add=(offset,token)=>{if(edits.some(e=>offset<e.end&&offset+token.length>e.start))return;edits.push({start:offset,end:offset+token.length,text:formatQalys(Number(token.replaceAll(',','').replace(/[−–]/,'-')))});};
 const protectedSpans=[...source.matchAll(/https?:\/\/[^\s)]+|\]\([^)]*\)/g)].map(m=>[m.index,m.index+m[0].length]);
 const eligible=(at,token)=>!protectedSpans.some(([a,b])=>at>=a&&at<b)&&!/[\w$%]/.test(source[at-1]??'')&&!/[%\w]/.test(source[at+token.length]??'');
 for(const m of source.matchAll(new RegExp('('+number+')(?=\\s*\\([0-9]+% CI [^)]{0,80}QALYs?\\b)','gi')))if(eligible(m.index,m[1]))add(m.index,m[1]);
 for(const m of source.matchAll(new RegExp('('+quantities+')(?=\\s*(?:\\*\\*|`)?\\s*'+qualifier+unit+'\\b)','gi')))for(const n of m[1].matchAll(new RegExp(number,'gi'))){let at=m.index+n.index,token=n[0];if(n.index>0&&/^[-−–]/.test(token)&&/[0-9]/.test(source[at-1])){at++;token=token.slice(1);}if(eligible(at,token))add(at,token);}
 for(const m of source.matchAll(new RegExp('\\b'+unit+'\\s*(?:\\*\\*|`)?\\s*[:=]\\s*(?:\\*\\*|`)?\\s*('+number+')','gi'))){if(/\bper\s*$/i.test(source.slice(Math.max(0,m.index-8),m.index)))continue;const at=m.index+m[0].lastIndexOf(m[1]);if(eligible(at,m[1]))add(at,m[1]);}
 // A QALY-labelled table cell has semantic context supplied by its row/column.
 if(quantityOnly)for(const m of source.matchAll(new RegExp(number,'gi'))){let at=m.index,token=m[0];if(/^[-−–]/.test(token)&&/[0-9]/.test(source[at-1]??'')){at++;token=token.slice(1);}if(eligible(at,token))add(at,token);}
 return edits.sort((a,b)=>a.start-b.start);
}
export function formatQalyText(source,options){const edits=healthTextEdits(source,options);let out='',at=0;for(const e of edits){out+=source.slice(at,e.start)+e.text;at=e.end;}return out+source.slice(at);}
export function formatQalyValue(value){if(value===null||value===undefined||typeof value==='number')return formatQalys(value);if(Array.isArray(value))return '['+value.map(formatQalyValue).join(', ')+']';return formatQalyText(String(value),{quantityOnly:true});}
export function isQalyQuantityLabel(label){return /QALY|DALY|income-equivalent.*years|healthy-year.*equivalent/i.test(label)&&!/(?:\$|USD|dollars?|cost|price|per\s*(?:10|ten)|\/\s*(?:QALY|DALY))/i.test(label);}

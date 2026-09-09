import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculate,inputsFor} from '../lib/hkf-model.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL(n,import.meta.url)));
const m=read('../data/bay/hkf-model-v1.json'),r=read('../data/bay/hkf-report.json'),saved=read('../data/bay/hkf-results.json');
let checks=0;const ok=x=>{assert.ok(x);checks++};
const fields=(o,ks)=>{for(const k of ks.split(','))ok(typeof o[k]==='string'&&o[k].length>0);};
fields(r,'organization,eyebrow,program,donationUrl,published,modelVersion');fields(r.nutshell,'headline,body,whyItMayWork,whyWeAreCautious,recommendationBlocker');
ok(Array.isArray(r.summary));r.summary.forEach(x=>fields(x,'label,value,detail'));
fields(r.programSection,'body,boundary');ok(Array.isArray(r.programSection.steps));r.programSection.steps.forEach(x=>fields(x,'title,detail'));
fields(r.model,'headline,body,giftHeading,fundingBoundary,uncertaintyBoundary');fields(r.model.equation,'label,expression,result');
for(const section of [r.model,r.comparisonBridge]){ok(Array.isArray(section.inputs));section.inputs.forEach(x=>fields(x,'key,label,confidence,best,range,basis'));ok(Array.isArray(section.sensitivity));section.sensitivity.forEach(x=>fields(x,'case,headline,detail'));}
fields(r.comparisonBridge,'headline,body,boundary');fields(r.comparisonBridge.equation,'label,expression,result');
ok(Array.isArray(r.evidence));r.evidence.forEach(x=>fields(x,'key,design,population,result,transfer'));
for(const k of ['reservations','excludedBenefits']){ok(Array.isArray(r[k]));r[k].forEach(x=>ok(typeof x==='string'&&x.length>0));}
ok(Array.isArray(r.sources));r.sources.forEach(x=>{fields(x,'publisher,title,url,published,retrieved,sourceType');ok(new URL(x.url).protocol==='https:');});
ok(r.modelVersion===m.model_version);ok(r.organization===m.organization);ok(r.donationUrl===m.recipient.giving_url);
ok(r.model.sensitivity.length===m.scenarios.length);ok(saved.length===m.scenarios.length);
const money=x=>x===null?'No finite positive ratio':'$'+Math.round(x).toLocaleString('en-US');
for(const [i,s]of m.scenarios.entries()){
 const out={case:s.id,...calculate(inputsFor(m,s))};
 // JSON normalization intentionally handles negative zero identically to saved JSON.
 assert.deepEqual(JSON.parse(JSON.stringify(out)),saved[i]);checks++;
 const row=r.model.sensitivity[i];ok(row.case===s.id);
 for(const key of ['us_q','bay_q','sf_q'])ok(row.detail.includes(out[key].toPrecision(10)));
 for(const geo of ['us','bay','sf'])for(const prefix of ['donor','resource'])ok(row.detail.includes(money(out[prefix+'_'+geo+'_per_10q'])));
 ok(row.detail.includes(money(out.gross_resource_usd)));ok(row.headline.includes(money(out.resource_bay_per_10q)));
}
const c=saved[0],f=saved[1];for(const v of [c.donor_bay_per_10q,c.resource_bay_per_10q])ok(r.nutshell.body.includes(money(v)));
ok(r.summary[2].value.includes(money(f.donor_bay_per_10q)));ok(r.summary[2].value.includes(money(f.resource_bay_per_10q)));
// Financial category crosswalk is exact; not a claim historical mix is current marginal allocation.
const a=m.finance;ok(a.vision+a.dental+a.hearing+a.other_programs===a.program_expenses);ok(a.program_expenses+a.management_general+a.fundraising===a.total_expenses);
console.log(JSON.stringify({status:'PASS',schema:'Actual CharityReportContent required fields and nested arrays',scenarios:m.scenarios.length,checks}));

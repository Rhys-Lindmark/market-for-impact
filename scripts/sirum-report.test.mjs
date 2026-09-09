import fs from 'node:fs';import assert from 'node:assert/strict';import {calculate} from '../lib/sirum-model.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL(n,import.meta.url)));const m=read('../data/us/sirum-model-v1.json'),r=read('../data/us/sirum-report.json'),saved=read('../data/us/sirum-results.json');let checks=0;
const check=x=>{assert.ok(x);checks++;};
for(const k of ['organization','eyebrow','program','donationUrl','published','modelVersion','nutshell','summary','programSection','model','evidence','reservations','excludedBenefits','sources'])check(Object.hasOwn(r,k));
for(const k of ['headline','body','whyItMayWork','whyWeAreCautious','recommendationBlocker'])check(typeof r.nutshell[k]==='string');
for(const k of ['headline','body','equation','inputs','giftHeading','fundingBoundary','sensitivity'])check(Object.hasOwn(r.model,k));
// Required nested fields copied from actual CharityReportContent type.
for(const [rows,ks] of [[r.summary,['label','value','detail']],[r.programSection.steps,['title','detail']],[r.model.inputs,['key','label','confidence','best','range','basis']],[r.model.sensitivity,['case','headline','detail']],[r.evidence,['key','design','population','result','transfer']]]){check(Array.isArray(rows));for(const row of rows)for(const k of ks)check(typeof row[k]==='string');}
for(const k of ['body','boundary'])check(typeof r.programSection[k]==='string');for(const k of ['label','expression','result'])check(typeof r.model.equation[k]==='string');for(const rows of [r.reservations,r.excludedBenefits]){check(Array.isArray(rows));for(const v of rows)check(typeof v==='string');}
for(const s of r.sources)for(const k of ['publisher','title','url','published','retrieved','sourceType'])check(typeof s[k]==='string'&&s[k].length>0);
const cash=n=>n===null?'unpriced':'$'+Math.round(n).toLocaleString('en-US');
for(let i=0;i<m.scenarios.length;i++){const s=m.scenarios[i],a=calculate({...m.central,...s.overrides}),b=saved[i];assert.deepEqual(a,Object.fromEntries(Object.entries(b).filter(([k])=>k!=='id')));checks++;check(b.id===s.id&&r.model.sensitivity[i].case===s.id);for(const [g,z]of Object.entries(a.regions)){check(r.model.sensitivity[i].detail.includes(`${g}: Q=${z.q};`));for(const v of [z.donorPer10Q,z.grossResourcePer10Q,z.netResourcePer10Q])check(r.model.sensitivity[i].detail.includes(cash(v)));}}
check(!JSON.stringify(r).includes('$unpriced'));check(r.model.inputs.length===Object.keys(m.central).length);check(r.model.sensitivity.length===m.scenarios.length);console.log(JSON.stringify({status:'pass',checks,scenarios:m.scenarios.length}));


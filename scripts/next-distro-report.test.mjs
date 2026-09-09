import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {central,scenarios,runScenarios} from '../lib/next-distro-model.mjs';
const read=s=>JSON.parse(readFileSync(new URL('../data/us/next-distro-'+({'model.json':'model-v1.json','report-content.json':'report.json'}[s]||s),import.meta.url)));
const r=read('report-content.json'),m=read('model.json'),saved=read('results.json'),live=runScenarios();let checks=0;
const strings=(obj,keys)=>{for(const k of keys){assert.equal(typeof obj[k],'string',k);assert.ok(obj[k].length,k);checks+=2;}};
strings(r,['organization','eyebrow','program','published','modelVersion']);strings(r.nutshell,['headline','body','whyItMayWork','whyWeAreCautious','recommendationBlocker']);
strings(r.programSection,['body','boundary']);for(const s of r.programSection.steps)strings(s,['title','detail']);for(const s of r.summary)strings(s,['label','value','detail']);
strings(r.model,['headline','body','giftHeading','fundingBoundary']);strings(r.model.equation,['label','expression','result']);
for(const i of r.model.inputs)strings(i,['key','label','confidence','best','range','basis']);for(const e of r.evidence)strings(e,['key','design','population','result','transfer']);
for(const s of r.sources)strings(s,['publisher','title','url','published','retrieved','sourceType']);
for(const key of ['reservations','excludedBenefits']){assert.ok(Array.isArray(r[key])&&r[key].length);checks++;for(const s of r[key]){assert.equal(typeof s,'string');checks++;}}
assert.deepEqual(m.central,central);assert.deepEqual(m.scenarios,scenarios);assert.deepEqual(m.results,live);assert.deepEqual(saved,live);checks+=4;
assert.equal(r.model.inputs.length,Object.keys(central).length);checks++;
const money=v=>v===null?'No finite positive-health ratio':'$'+Math.round(v).toLocaleString('en-US');const num=v=>Number(v.toPrecision(8)).toString();
for(const [k,v] of Object.entries(live)){const row=r.model.sensitivity.find(x=>x.case===k);strings(row,['case','headline','detail']);for(const geo of ['us','bay','sf']){assert.ok(row.detail.includes(num(v.q[geo])));checks++;for(const type of ['donor','gross','net']){assert.ok(row.detail.includes(money(v.prices[geo][type])));checks++;}}}
const f=m.finance;assert.equal(f.program+f.management+f.fundraising,f.expense);assert.equal(f.total_assets-f.total_liabilities,f.net_assets);assert.equal(f.revenue-f.expense,-426200);checks+=3;
console.log(JSON.stringify({status:'PASS',checks,scenarios:Object.keys(live).length,schema:'CharityReportContent: inspected work/market-for-impact-sfaf-portfolio/components/CharityResearchReport.tsx'},null,2));

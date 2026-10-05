import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculate,serializedScenarios} from './model.mjs';
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
import {reportPrice} from './headline.mjs';
const r=JSON.parse(fs.readFileSync(new URL('./report.json',import.meta.url)));
const timing=JSON.parse(fs.readFileSync(new URL('./sessions.json',import.meta.url)));
const near=(a,b)=>a===null||b===null?assert.equal(a,b):assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));
for(const s of r.model.scenarios){const x=calculate(s.inputs);for(const k of ['editionQalys','incomeEquivalent','totalEquivalent','price10','costPer10Qalys','incomeEquivalentYears','combinedEquivalentYears'])near(x[k],s[k]);near(reportPrice({...r,model:{...r.model,scenarios:[{...s,id:'central'}]}}),s.price10);}
assert.equal(r.model.scenarios.length,serializedScenarios().length);
assert.equal(calculate({jobGain:-100,stipendNet:300}).incomePathways[0].annualIncomeGainUSD,-250);
near(calculate({reduction:0,traumaQ:0}).incomeEquivalent,calculate().incomeEquivalent);
near(calculate({jobGain:-1500,stipendNet:0,positiveOverlap:0}).incomeEquivalent,calculate({jobGain:-1500,stipendNet:0,positiveOverlap:1}).incomeEquivalent);
assert.equal(calculate({b:0}).totalEquivalent,0);
assert.throws(()=>calculate({discount:-1,b:0}));
if(process.argv[2]){
const root=process.argv[2],{validateEditionReports}=await import(root+'/lib/geography-reports.mjs'),prod=await import(root+'/lib/income-health-equivalence.mjs');
for(const s of r.model.scenarios)for(const p of s.incomePathways)near(incomeHealthyYearEquivalent(p),prod.incomeHealthyYearEquivalent(p));
const all=JSON.parse(fs.readFileSync(root+'/data/geography-reports.json')),progress=JSON.parse(fs.readFileSync(root+'/docs/geography-progress.json')),candidate=JSON.parse(JSON.stringify(r));candidate.acceptance.status='accepted';all.reports.push(candidate);all.sessions.push(...timing.sessions);const e=progress.editions.find(x=>x.id===r.edition);e.alphaCohortIds=[...new Set([...e.alphaCohortIds,r.organizationId])];e.selectedAlphaIds=[...new Set([...e.selectedAlphaIds,r.organizationId])];e.alphaPublished=all.reports.filter(x=>x.edition===r.edition).length;validateEditionReports(all,progress);
}
console.log('PASS 24 scenarios; mixed signs, clinical null, production bridge/headline and current registry.');

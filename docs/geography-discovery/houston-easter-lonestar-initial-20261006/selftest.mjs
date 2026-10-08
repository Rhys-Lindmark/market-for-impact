import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as easter from './easter-model.mjs';
import * as lonestar from './lonestar-model.mjs';
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
const root=process.argv[2];
let checks=0;
for(const [id,m] of [['easter',easter],['lonestar',lonestar]]){
 const r=JSON.parse(fs.readFileSync(new URL(id+'-report.json',import.meta.url)));
 for(const s of r.model.scenarios){const x=m.calculate(s.overrides);for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10']){assert.equal(x[k],s[k]);checks++;}assert.equal(x.incomePathways.reduce((v,p)=>v+incomeHealthyYearEquivalent(p),0),x.incomeEquivalent);checks++;}
 assert.equal(m.calculate({q:0}).incomeEquivalent,m.calculate().incomeEquivalent);checks++;
 assert.equal(m.calculate({b:0}).totalEquivalent,0);checks++;
 assert(m.calculate({resourceYears:0}).incomeEquivalent<0);checks++;
 assert.equal(m.calculate({medicalGain:-300,workGain:0,transferGain:0,overlap:0}).incomeEquivalent,m.calculate({medicalGain:-300,workGain:0,transferGain:0,overlap:1}).incomeEquivalent);checks++;
 assert(m.calculate({payerLoss:2000}).incomeEquivalent<m.calculate().incomeEquivalent);checks++;
}
if(root){const {validateEditionReports,reportPrice}=await import(root+'/lib/geography-reports.mjs');const data=JSON.parse(fs.readFileSync(root+'/data/geography-reports.json'));const progress=JSON.parse(fs.readFileSync(root+'/docs/geography-progress.json'));const sessions=JSON.parse(fs.readFileSync(new URL('sessions.json',import.meta.url)));data.sessions.push(...sessions);for(const id of ['easter','lonestar']){const r=JSON.parse(fs.readFileSync(new URL(id+'-report.json',import.meta.url)));r.acceptance.status='accepted';data.reports.push(r);assert.equal(reportPrice(r),r.model.scenarios[0].price10);}const e=progress.editions.find(x=>x.id==='houston');e.alphaCohortIds=[...new Set([...e.alphaCohortIds,'org:easter-seals-greater-houston','org:lone-star-legal-aid'])];e.alphaPublished=data.reports.filter(x=>x.edition==='houston').length;validateEditionReports(data,progress);console.log('Current registry schema PASS');}
console.log('Portable arithmetic PASS '+checks+' checks / '+(easter.scenarios().length+lonestar.scenarios().length)+' serialized cases');

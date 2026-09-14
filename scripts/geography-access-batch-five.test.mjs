import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const reports=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url))).reports;
const get=slug=>reports.find(r=>r.slug===slug);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9);
const params=s=>Object.fromEntries([...s.assumptions.matchAll(/\b(c|b|s|u|p|T|m|h|g|f|e|t|q|z)=(\d+(?:\.\d+)?)/g)].map(m=>[m[1],+m[2]]));
test('Hearing aid scenarios retain use, mortality, alternatives and harm',()=>{
 const r=get('help-america-hear');
 for(const s of r.model.scenarios){
  const p=params(s),D=Array.from({length:p.T},(_,i)=>((1-p.m)/1.03)**(i+1)).reduce((a,b)=>a+b,0);
  const q=s.costUSD/p.c*p.b*(p.s*p.u*p.p*D-p.h);
  close(q,s.allPopulationQalys);close(q*p.g,s.editionQalys);
 }
 assert.equal(r.donationUrl,null);
 close(r.model.scenarios[0].editionQalys,0.14511181107982615);
});
test('Medication access benchmarks use a secondary ITT effect only once',()=>{
 const r=get('rx-outreach');close(r.model.scenarios[0].editionQalys,0.015925);
 for(const s of r.model.scenarios){
  const p=params(s),q=s.costUSD/p.c*p.b*(p.f*p.e*p.t*p.q+p.z-p.h);
  close(q,s.allPopulationQalys);close(q*p.g,s.editionQalys);
 }
 assert.ok(r.model.scenarios.find(s=>s.id==='no-clinical').editionQalys<0);
});
test('Local clinical thresholds are not estimated recipient yields',()=>{
 close(.1*14/365,.0038356164383561648);
 close((2.1/14)*.1,.015);
 assert.equal(get('comite-civico-del-valle').model.scenarios[0].editionQalys,null);
 // CIL now has an independently reviewed partial repair model, tested separately.
 assert.match(get('center-for-independent-living').priceScope,/other benefits unestimated/);
 assert.equal(get('comite-civico-del-valle').donationUrl,null);
 assert.match(get('comite-civico-del-valle').sections.qualitative,/no statistically detected effect/);
});

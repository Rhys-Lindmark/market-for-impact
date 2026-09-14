import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));
const cases=[
 ['didi-hirsch-mental-health-services',5498*.6*.32*.5*.057*.5*.25*.99/1.03],
 ['breathe-southern-california',100*.25*(2.1/14)*.1*.5*.75/1.03],
 ['champions-for-health',2378718*.25/5000*.5*.25*.05/1.03],
 ['childrens-partnership',400000*.1*.5*.02*.05*.1*.25*(1/1.03**2+1/1.03**3)],
 ['nourish-california',10000*.5*.1*.2*.25*.005/1.03],
 ['california-school-based-health-alliance',2290208*.4/20000*20*.25*.25*.05*112/365/1.03]
];
for(const [slug,q] of cases)test(slug+' CA central and partial-health safeguards',()=>{
 const r=d.reports.find(r=>r.edition==='california'&&r.slug===slug);
 close(r.model.scenarios.find(s=>s.id==='central').editionQalys,q);
 assert.ok(r.priceScope.length);assert.equal(r.acceptance.status,'accepted');
 assert.equal(r.summary.reservations.length,3);
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 assert.ok(r.model.scenarios.every(s=>typeof s.assumptions==='string'));
});
test('Surgery beta finite survival and resource scenarios',()=>{
 const r=d.reports.find(r=>r.edition==='usa'&&r.slug==='surgery-on-sunday');
 assert.equal(r.stage,'beta');assert.equal(r.model.scenarios.length,10);
 for(const s of r.model.scenarios){
  if(s.id.startsWith('resource-cost')){close(s.editionQalys,.24680642920507342);assert.ok(s.costUSD>10000);continue;}
  const p=Object.fromEntries([...s.assumptions.matchAll(/(?:^|, )([A-Za-zΔ]+)=([0-9.]+)/g)].map(m=>[m[1],parseFloat(m[2])]));
  let life=0;for(let t=1;t<=p.T;t++)life+=p.Δu*((1-p.m)/1.03)**t;
  close(p.G/p.c*p.b*(p.s*life-p.h)*p.g,s.editionQalys);
 }
});

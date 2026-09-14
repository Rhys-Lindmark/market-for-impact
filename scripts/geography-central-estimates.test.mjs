import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reportPrice } from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('JTC communication judgments reproduce without lifetime or device double credit',()=>{
 const r=data.reports.find(r=>r.edition==='los-angeles'&&r.slug==='john-tracy-center');
 for(const [id,N,b,g,t,k,w] of [['central',100,.25,.8,.5,.02,[1,.5,.25]],['low',25,.05,.5,.2,.005,[1]],['high',250,.6,.95,.8,.05,[1,1,.75,.5,.25]]]){
  const s=r.model.scenarios.find(s=>s.id===id),q=N*b*t*k*.59*w.reduce((a,v,i)=>a+v/1.03**(i+1),0);
  assert.ok(Math.abs(s.allPopulationQalys-q)<1e-10);
  assert.ok(Math.abs(s.editionQalys-q*g)<1e-10);
 }
 assert.match(r.model.inputs.find(i=>i.name==='k').rationale,/not an estimated psychometric conversion/);
 assert.ok(reportPrice(r)>0);assert.ok(r.priceScope);
});
test('six USA central models retain finite prices, judgment labels and no beta credit',()=>{
 const slugs=['help-america-hear','rx-outreach','remote-area-medical','immunize-org','green-and-healthy-homes-initiative','american-nonsmokers-rights-foundation'];
 for(const slug of slugs){const r=data.reports.find(r=>r.edition==='usa'&&r.slug===slug);assert.ok(Number.isFinite(reportPrice(r)));assert.equal(r.stage,'alpha');assert.ok(r.priceScope);assert.match(r.model.scenarios[0].label,/judgment/);}
});

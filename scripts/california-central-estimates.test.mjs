import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('HRS finite survival integrates once per person and matches published scenarios',()=>{
 const r=data.reports.find(r=>r.slug==='harm-reduction-services');
 for(const s of r.model.scenarios.filter(s=>s.editionQalys>0)){
  const p=JSON.parse(s.assumptions.slice(0,s.assumptions.indexOf('};')+1));
  const n=s.costUSD/1695969*5000*p.d*p.m*p.x,steps=20000,dt=p.T/steps;
  let q=0;
  for(let i=0;i<steps;i++){const t=(i+.5)*dt;q+=p.u*Math.exp(-.03*t)*(Math.exp(-(p.l+p.o)*t+p.l*p.e*Math.min(t,p.tau))-Math.exp(-(p.l+p.o)*t))*dt;}
  assert.ok(Math.abs(n*q*p.g-s.editionQalys)<1e-7);
 }
 assert.equal(r.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
 assert.match(r.priceScope,/only/);
 assert.equal(r.annualExpenses.length,3);
});
test('CIL charges the full gift for explicitly partial repair health',()=>{
 const r=data.reports.find(r=>r.slug==='center-for-independent-living');
 assert.match(r.priceScope,/full gift cost/);
 assert.match(r.priceScope,/other benefits unestimated/);
 for(const s of r.model.scenarios.filter(s=>s.editionQalys>0)){
  const p=JSON.parse(s.assumptions.slice(0,s.assumptions.indexOf('};')+1));
  const k=(p.w*p.b*p.h+p.p)*p.o;
  const n=s.costUSD*p.f/k*p.m*p.s*p.a;
  const q=p.u*Math.exp(-.03*p.L)*(-Math.expm1(-.03*p.days/365))/.03;
  assert.ok(Math.abs(n*q*p.g-s.editionQalys)<1e-10);
 }
});

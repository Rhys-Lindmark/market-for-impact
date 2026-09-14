import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('HRS finite survival integrates once per person and matches published scenarios',()=>{
 const r=data.reports.find(r=>r.slug==='harm-reduction-services');
 for(const s of r.model.scenarios.filter(s=>s.editionQalys>0)){
  const p=JSON.parse(s.assumptions.slice(0,s.assumptions.indexOf('};')+1));
  const n=Math.min(p.C/p.E*p.Y*p.d*p.m*p.x*p.network,p.K),steps=40000,dt=p.T/steps;
  let q=0;
  for(let i=0;i<steps;i++){const t=(i+.5)*dt;if(t<p.delay)continue;const z=t-p.delay,b=Math.min(z,p.tau),h=p.lambda+p.mu;const base=Math.exp(-h*(p.delay+b)-(p.postLambda+p.postMu)*Math.max(0,z-p.tau));q+=p.u*Math.exp(-p.r*t)*base*Math.expm1(p.lambda*p.e*b)*dt;}
  assert.ok(Math.abs((n*(q-p.harmPerProtected)-p.independentHarm)*p.g-s.editionQalys)<1e-6*Math.max(1,Math.abs(s.editionQalys)),s.id);
 }
 assert.equal(r.model.scenarios.find(s=>s.id==='zero_funding').editionQalys,0);
 assert.ok(r.priceScope.length>20);
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

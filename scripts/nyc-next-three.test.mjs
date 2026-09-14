import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('NYC next three preserve finite causal bridges and all twenty scenarios',()=>{
 const slugs=['new-york-lawyers-for-the-public-interest','new-york-city-environmental-justice-alliance','new-jersey-harm-reduction-coalition'];
 let count=0;
 for(const [i,slug] of slugs.entries()){
  const r=data.reports.find(x=>x.edition==='new-york-city'&&x.slug===slug);
  assert.equal(r.acceptance.status,'accepted');assert.ok(r.priceScope);assert.equal(r.summary.what.length,3);assert.equal(r.summary.strengths.length,3);assert.equal(r.summary.reservations.length,3);
  for(const s of r.model.scenarios){
   const x=JSON.parse(s.assumptions);let q;
   if(i===0)q=x.N*x.a*x.b*(x.p*x.u*x.t-x.h)/(1+x.d);
   if(i===1){const v=Math.log1p(x.d)+x.m;const life=x.u*(-Math.expm1(-v*x.L))/v;let A=0;for(let j=0;j<x.T;j++)A+=(1+x.d)**(-x.lag-j);q=x.D*x.r*x.p*x.a*x.b*life*A-x.h;}
   if(i===2){const F=(v,t)=>-Math.expm1(-v*t)/v,d=Math.log1p(x.d),delta=x.e*x.t*x.l;q=x.b*(x.C*x.f/x.k)*x.u*(F(x.m-delta+d,1)-F(x.m+d,1)+(Math.exp(-(x.m-delta))-Math.exp(-x.m))*Math.exp(-d)*F(x.m+d,x.T-1))-x.h;}
   const local=q*x.g;assert.ok(Math.abs(local-s.editionQalys)<1e-8*Math.max(1,Math.abs(local)),slug+':'+s.id);assert.equal(s.costUSD,x.numeratorCostUSD??x.C);count++;
  }
  const session=data.sessions.find(s=>s.id===r.sessionIds[0]);assert.equal(session.model.reasoningEffort,'low');assert.equal((Date.parse(session.endedAt)-Date.parse(session.startedAt))/1000,[266,366,230][i]);
 }
 assert.equal(count,20);
});

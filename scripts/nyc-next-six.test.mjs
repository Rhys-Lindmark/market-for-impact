import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('NYC ranks7–12 preserve all finite causal scenarios',()=>{
 const slugs=["we-act-for-environmental-justice","the-center-for-great-expectations","new-york-legal-assistance-group","st-ann-s-corner-of-harm-reduction","new-jersey-environmental-justice-alliance","parker-family-health-center"];
 const F=(v,t)=>Math.abs(v)<1e-12?t:-Math.expm1(-v*t)/v;
 let count=0;
 for(const [i,slug] of slugs.entries()){
  const r=data.reports.find(r=>r.edition==='new-york-city'&&r.slug===slug);
  assert.equal(r.acceptance.status,'accepted');
  for(const s of r.model.scenarios){
   const x=JSON.parse(s.assumptions),k=Math.log1p(x.d);let q,cost=x.numeratorCostUSD??x.C;
   if(i===0){let A=0;for(let j=0;j<x.T;j++)A+=(1+x.d)**(-x.lag-j);q=x.D*x.r*x.p*x.a*x.b*x.u*F(k+x.m,x.L)*A-x.h;}
   if(i===1||i===2)q=x.N*(x.f??1)*x.a*x.b*(x.p*x.u*F(x.rho+k,x.T)-x.h);
   if(i===3){const B=x.u*(F(x.m-x.delta+k,1)-F(x.m+k,1)+(Math.exp(-(x.m-x.delta))-Math.exp(-x.m))*Math.exp(-k)*F(x.m+k,x.T-1));const M=x.p*x.v*(x.z*F(x.m-x.delta+k,1)+(1-x.z)*F(x.m+k,1));q=x.N*x.f*x.a*x.b*(x.z*B+M)-x.h;}
   if(i===4){const delta=x.m*(1-Math.exp(-x.beta*x.pm))*x.c;q=x.N*x.u*x.p*x.a*x.b*Math.exp(-k*x.lag)*(F(x.m-delta+k,x.T)-F(x.m+k,x.T)+(Math.exp(-(x.m-delta)*x.T)-Math.exp(-x.m*x.T))*Math.exp(-k*x.T)*F(x.m+k,x.L-x.T))-x.h;}
   if(i===5){cost=x.C0+x.M*x.w+x.H*x.s*x.k;q=x.D/x.share*x.f*x.a*x.b*(x.p*x.u*F(x.rho+k,x.T)-x.h);}
   const local=q*x.g;
   assert.ok(Math.abs(local-s.editionQalys)<1e-8*Math.max(1,Math.abs(local)),slug+':'+s.id);
   assert.equal(cost,s.costUSD);
   if(local>0)assert.ok(Math.abs(10*cost/local-s.pricePer10Qalys)<1e-6*Math.max(1,s.pricePer10Qalys));else assert.equal(s.pricePer10Qalys,null);
   count++;
  }
 }
 assert.equal(count,45);
});

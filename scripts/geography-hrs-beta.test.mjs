import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('HRS beta23 scenarios preserve finite survival and added resource costs',()=>{
const r=d.reports.find(r=>r.edition==='california'&&r.slug==='harm-reduction-services');
assert.equal(r.model.scenarios.length,23);
for(const s of r.model.scenarios){
 const p=JSON.parse(s.assumptions.slice(0,s.assumptions.indexOf('}')+1));
 const A=(k,z)=>Math.abs(k)<1e-12?z:-Math.expm1(-k*z)/k;
 const h=p.lambda+p.mu,H=Math.max(0,p.T-p.delay),b=Math.min(p.tau,H),N=Math.min(p.C/p.E*p.Y*p.d*p.m*p.x*p.network,p.K);
 const q=p.u*Math.exp(-(h+p.r)*p.delay)*(A(h-p.lambda*p.e+p.r,b)-A(h+p.r,b)+Math.exp(-h*b)*Math.expm1(p.lambda*p.e*b)*Math.exp(-p.r*b)*A(p.postLambda+p.postMu+p.r,H-b));
 const all=N*(q-p.harmPerProtected)-p.independentHarm;
 assert.ok(Math.abs(all-s.allPopulationQalys)<1e-8*Math.max(1,Math.abs(all)),s.id);
 assert.ok(Math.abs(all*p.g-s.editionQalys)<1e-8*Math.max(1,Math.abs(all)));
 assert.equal(s.costUSD,p.C+p.extraResources);
}
});

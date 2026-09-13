import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const rows=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url))).reports;
const report=slug=>rows.find(r=>r.slug===slug);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9);
test('Cribs for Kids scenarios reproduce without crediting commercial shipments',()=>{
 const r=report('cribs-for-kids');assert.ok(r);
 for(const s of r.model.scenarios.slice(0,3)){
  const p=Object.fromEntries([...s.assumptions.matchAll(/\b(a|c|b|u|r|e|L|g)=([0-9.]+)/g)].map(m=>[m[1],+m[2]]));
  const q=s.costUSD*p.a/p.c*p.b*p.u*p.r*p.e*p.L;
  close(q,s.allPopulationQalys);close(q*p.g,s.editionQalys);
 }
 assert.equal(r.model.scenarios.find(s=>s.id==='zero-additionality').editionQalys,0);
 assert.equal(r.annualExpenses.find(e=>e.year===2025).amount,2633922+9231646+49675);
});
test('Upstream includes adverse burden even when prevention is zero',()=>{
 for(const s of report('upstream-usa').model.scenarios){
  const p=Object.fromEntries([...s.assumptions.matchAll(/\b(c|b|d|T|q|h|g)=(\d+(?:\.\d+)?)/g)].map(m=>[m[1],+m[2]]));
  const D=Array.from({length:p.T},(_,i)=>1.03**(-i-1)).reduce((a,b)=>a+b,0);
  const q=s.costUSD/p.c*p.b*(p.d*D*p.q-p.h);
  close(q,s.allPopulationQalys);close(q*p.g,s.editionQalys);
 }
 assert.ok(report('upstream-usa').model.scenarios.find(s=>s.id==='no-prevention').editionQalys<0);
});
test('Policy thresholds remain requirements, not central predictions',()=>{
 for(const slug of ['coalition-for-clean-air','disability-rights-california']){
  const r=report(slug);assert.equal(r.model.scenarios[0].editionQalys,null);
  assert.equal(r.model.scenarios.find(s=>s.id==='threshold-million').editionQalys,1);
 }
 const h0=.05,h1=h0*Math.exp(-Math.log(1.06)/10),rho=Math.log(1.03),T=10;
 const q=.75*((1-Math.exp(-(h1+rho)*T))/(h1+rho)-(1-Math.exp(-(h0+rho)*T))/(h0+rho));
 close(q,.006532944220465575);
 close(.05*[1,2,3].reduce((a,t)=>a+1.03**-t,0),.14143056774473406);
 assert.equal(report('disability-rights-california').annualExpenses.find(e=>e.year===2025).comparable,false);
});

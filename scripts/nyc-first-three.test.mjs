import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const rows=d.reports.filter(r=>r.edition==='new-york-city');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),a+' != '+b);
test('NYC first three selected alpha reports preserve model and author provenance',()=>{
 assert.equal(rows.length,3);
 for(const r of rows){
  assert.equal(r.stage,'alpha');assert.equal(r.acceptance.status,'accepted');assert.ok(r.priceScope);
  const ids=new Set(r.sources.map(s=>s.id));
  for(const p of r.model.inputs)for(const id of p.sourceIds)assert.ok(ids.has(id));
  for(const id of r.sessionIds){const s=d.sessions.find(s=>s.id===id);assert.ok(s);assert.equal(s.organizationId,r.organizationId);assert.equal(s.model.reasoningEffort,'low');}
  assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 }
});
for(const r of rows)test(r.slug+' independently reproduces every scenario',()=>{
 for(const s of r.model.scenarios){
  const p=JSON.parse(s.assumptions);let q;
  if(r.slug==='transportation-alternatives'){
   let A=0;for(let j=1;j<=p.T;j++)A+=1/1.03**j;
   const rho=Math.log(1.03)+p.m,D=p.u*(1-Math.exp(-rho*p.L))/rho;
   q=(p.N*p.B*p.r*p.t*p.p*p.a*p.b*A*(p.f*D+(1-p.f)*p.s)-p.h)*p.g;
  }else if(r.slug==='onpoint-nyc'){
   const delta=p.E/p.U*p.l*p.a,lambda=p.m-delta,rho=Math.log(1.03);
   assert.ok(lambda>=0);
   // Independent midpoint integration of one-year hazard change and shared later hazard.
   let H=0;const step=.0005;
   for(let t=step/2;t<p.T;t+=step){
    const baseline=Math.exp(-p.m*t),intervention=Math.exp(-lambda*Math.min(t,1)-p.m*Math.max(t-1,0));
    H+=(intervention-baseline)*Math.exp(-rho*t)*step;
   }
   q=(p.b*p.U*p.u*H-p.h)*p.g;
  }else q=p.N*p.a*p.b*(p.c*p.u*p.t-p.h)/(1+p.d)*p.g;
  close(s.editionQalys,q);close(s.allPopulationQalys*p.g,q);
  if(q>0)close(s.pricePer10Qalys,10*s.costUSD/q);
 }
});
test('OnPoint merger-period mean and uncredited TA interruption remain explicit',()=>{
 const op=rows.find(r=>r.slug==='onpoint-nyc'),ta=rows.find(r=>r.slug==='transportation-alternatives');
 assert.equal(op.annualExpenses[0].comparable,false);
 assert.match(op.sections.monitoring,/not independently demonstrated deaths/);
 assert.equal(ta.timeCoverage,'partial');
});

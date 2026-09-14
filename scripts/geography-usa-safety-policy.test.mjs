import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const slug of ['institute-for-safer-trucking','us-alcohol-policy-alliance'])test(`${slug}: all policy scenarios reproduce`,()=>{
 const r=data.reports.find(r=>r.edition==='usa'&&r.slug===slug);
 for(const s of r.model.scenarios){
  const p=JSON.parse(s.assumptions.match(/Parameters (\{.*?\})/)[1]);let A=0,H;
  if(slug==='institute-for-safer-trucking'){
   for(let t=1;t<=p.T;t++)A+=(Math.min(p.cap,p.rate*Math.max(0,t-p.L1+1))-Math.min(p.cap,p.rate*Math.max(0,t-p.L0+1)))/1.03**t;
   H=p.D*p.r*p.q*A;
  }else{
   for(let t=p.L+1;t<=p.L+p.T;t++)A+=1.03**(-t);
   H=p.N*p.d/100000*p.x*p.e*p.k*p.q*A;
  }
  const Q=p.b*(p.p*p.a*H-p.h);
  near(s.costUSD,p.C*p.Y);near(s.allPopulationQalys,Q);near(s.editionQalys,Q*p.g);
 }
 assert.ok(r.priceScope);assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
});

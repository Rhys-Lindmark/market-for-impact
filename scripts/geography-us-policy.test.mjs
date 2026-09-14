import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
for(const slug of ['center-for-science-in-the-public-interest','kids-and-car-safety'])test(`${slug}: finite policy pathway reproduces every scenario`,()=>{
 const report=data.reports.find(r=>r.edition==='usa'&&r.slug===slug);
 for(const s of report.model.scenarios){
  const p=JSON.parse(s.assumptions.match(/\{[^}]+\}/)[0]);
  let H;
  if(slug==='center-for-science-in-the-public-interest'){
   p.Y=5;
   H=1400000*p.dm/565*p.e*p.t/1.03**p.L*(p.f+(1-p.f)*(1-1.03**-p.accel));
  }
  else{
   let A=0;
   for(let t=1;t<=p.T;t++)A+=(Math.min(p.cap,p.rate*Math.max(0,t-p.L1+1))-Math.min(p.cap,p.rate*Math.max(0,t-p.L0+1)))/1.03**t;
   H=p.D*p.d*p.r*p.k*p.q*A;
  }
  const q=s.costUSD/(p.Y*p.C)*p.b*(p.p*p.a*H-p.h);
  assert.ok(Math.abs(q-s.allPopulationQalys)<1e-10,s.id);
  assert.ok(Math.abs(q*p.g-s.editionQalys)<1e-10,s.id);
 }
 assert.ok(report.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(report.model.scenarios.some(s=>s.editionQalys<0));
 assert.match(report.priceScope,/only|partial-health/);
});

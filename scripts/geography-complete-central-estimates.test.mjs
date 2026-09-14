import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice} from '../lib/geography-reports.mjs';
const rows=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url))).reports;
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-6*Math.max(1e-9,Math.abs(b)),a+' != '+b);
test('all 57 published CA USA LA reports have finite positive central judgments',()=>{
 const reports=rows.filter(r=>['california','usa','los-angeles'].includes(r.edition));
 assert.equal(reports.length,57);
 for(const r of reports)assert.ok(Number.isFinite(reportPrice(r))&&reportPrice(r)>0,r.edition+'/'+r.slug);
});
test('three policy models independently integrate finite delayed and durable survival',()=>{
 for(const r of rows.filter(r=>['coalition-for-clean-air','communities-for-a-better-environment'].includes(r.slug))){
  for(const s of r.model.scenarios){
   const p=s.inputs,step=.001,rho=Math.log(1.03),h1=p.h0*Math.exp(-Math.log(p.HR)/10*p.transport*p.pm);
   let q=0;
   for(let t=step/2;t<p.T;t+=step){
    const base=Math.exp(-p.h0*t),durable=Math.exp(-h1*t);
    const delayed=Math.exp(-p.h0*Math.min(t,p.A)-h1*Math.max(0,t-p.A));
    q+=p.u*(p.f*(durable-base)+(1-p.f)*(durable-delayed))*Math.exp(-rho*t)*step;
   }
   q/=1.03**p.L;
   close(s.editionQalys,10000/(p.E*p.Y)*p.b*(p.p*p.N*q-p.harm));
  }
 }
});
test('WCLP coverage effect has two years only and distinct attribution factors',()=>{
 const r=rows.find(r=>r.slug==='western-center-on-law-and-poverty');
 close(r.model.scenarios[0].editionQalys,100000*.1*.2*.2*.25*.02*(1/1.03+.5/1.03**2));
 assert.equal(r.annualExpenses.reduce((s,y)=>s+y.amount,0)/3,7097648);
});
test('USA legal and housing central models preserve finite native health bridges',()=>{
 const lac=rows.find(r=>r.slug==='legal-action-center'),n=rows.find(r=>r.slug==='national-center-for-healthy-housing');
 let L=0;for(let y=1;y<=10;y++)L+=.75*(.95/1.03)**y;
 close(lac.model.scenarios[0].editionQalys,(37*.5*.5*.75*.5*.5+4*.15*100*.4*.5*.5)*.01*L*.98);
 close(n.model.scenarios[0].editionQalys,20*.15*50*.5*.7*(2.1/14)*.5*.75*.1/1.03*.95);
 assert.match(lac.priceScope,/excluding donated/);
});

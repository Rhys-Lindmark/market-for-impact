import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=slug=>data.reports.find(r=>r.edition==='los-angeles'&&r.slug===slug);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('Didi and Sycamores component scenarios reproduce from native clinical units',()=>{
 const d=report('didi-hirsch-mental-health-services');
 for(const [id,s,e,t,b,g] of [['central',.6,.5,.5,.25,.95],['low',.3,.1,.1,.05,.8],['high',.8,.8,1,.75,1]]){
  close(d.model.scenarios.find(s=>s.id===id).editionQalys,5498*s*.32*e*.057*t*b*g/1.03);
 }
 close(expenseAverage(d),(78394883+90068699+80043834)/3);
 const s=report('sycamores');
 for(const [id,u,e,q,t,b,g] of [['central',10000,.5,.022,.5,.25,.9],['low',20000,.2,.002,.1,.05,.7],['high',5000,.8,.044,1,.75,.98],['family',10000,.5,.09,.5,.25,.9]]){
  close(s.model.scenarios.find(s=>s.id===id).editionQalys,40872560*e/u*q*t*b*g/1.03);
 }
 close(expenseAverage(s),66488530);
});
test('Bienestar medicine and therapy pools do not collapse strategy-years into deaths',()=>{
 const r=report('bienestar-human-services');
 for(const id of ['central','low','high']){
  const s=r.model.scenarios.find(s=>s.id===id),p=JSON.parse(s.assumptions.match(/^\{[^}]+\}/)[0]);
  let area=0;for(let y=1;y<=p.T;y++)area+=1.03**(-y);
  const dep=1525370*p.e/p.u*p.q*p.t*p.b/1.03;
  const art=2596696*p.h*p.a/p.ua*p.ea*p.ta*p.b*.02*p.qe/1.03;
  const prep=2596696*p.h*(1-p.a)/p.up*p.ep*p.b*p.i*.86*p.v*area/1.03;
  close(s.allPopulationQalys,dep+art+prep);close(s.editionQalys,(dep+art+prep)*p.g);
 }
 close(expenseAverage(r),(7388764+9460690+11511459)/3);
});
test('all four retain scopes, original expenses and nonpositive uncertainty',()=>{
 for(const slug of ['didi-hirsch-mental-health-services','john-tracy-center','sycamores','bienestar-human-services']){
  const r=report(slug);assert.ok(r);assert.equal(r.annualExpenses.length,3);
  assert.equal(r.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
  assert.ok(r.model.scenarios.find(s=>s.id==='adverse').editionQalys<0);
  if(slug==='john-tracy-center')assert.ok(reportPrice(r)>0);
  else assert.match(r.priceScope,/full recipient/);
 }
});

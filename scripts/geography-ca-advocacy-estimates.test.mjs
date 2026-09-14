import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const get=slug=>data.reports.find(r=>r.edition==='california'&&r.slug===slug);
for(const slug of ['worksafe','disability-rights-california']){
 test(`${slug}: all conditional scenarios reproduce without portfolio claims`,()=>{
  const report=get(slug);
  assert.match(report.priceScope,/only; other impacts unestimated/);
  for(const scenario of report.model.scenarios){
   const p=Object.fromEntries([...scenario.assumptions.matchAll(/\b([A-Za-z]+)=(\d+(?:\.\d+)?)/g)].map(m=>[m[1],+m[2]]));
   let q;
   if(slug==='worksafe'){
    const years=Array.from({length:p.T},(_,i)=>(1+p.r)**(-i-1)).reduce((a,b)=>a+b,0);
    q=scenario.costUSD/p.E*p.Y*p.m*p.p*p.n*p.v*p.B*p.e*p.k*p.L*years*p.g-p.H;
   }else{
    const years=Array.from({length:p.T},(_,i)=>p.s**i/(1+p.r)**(i+1)).reduce((a,b)=>a+b,0);
    q=scenario.costUSD/p.E*p.R*p.d*p.h*p.m*p.a*p.du*years-p.H;
   }
   assert.ok(Math.abs(q-scenario.editionQalys)<1e-12,scenario.id);
   assert.equal(scenario.editionQalys,scenario.allPopulationQalys);
  }
  assert.equal(report.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
  assert.ok(report.model.scenarios.find(s=>s.id==='harm').editionQalys<0);
  assert.ok(reportPrice(report)>60_000_000);
  for(const id of report.sessionIds)assert.ok(data.sessions.find(s=>s.id===id));
 });
}
test('financial reconciliation does not manufacture a comparable DRC mean',()=>{
 assert.equal(expenseAverage(get('worksafe')),1387676.3333333333);
 assert.equal(expenseAverage(get('disability-rights-california')),null);
 assert.equal(46787232+110521-46894183,3570);
 assert.doesNotMatch(get('disability-rights-california').sections.funding,/latest full audit\/return download was blocked/);
});

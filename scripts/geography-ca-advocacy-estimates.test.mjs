import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const get=slug=>data.reports.find(r=>r.edition==='california'&&r.slug===slug);
for(const slug of ['worksafe','disability-rights-california']){
 test(`${slug}: all conditional scenarios reproduce without portfolio claims`,()=>{
  const report=get(slug);
  // Scope wording rewritten on purpose; the remaining portfolio is stated as unknown.
  assert.match(report.priceScope,/only; other impacts unestimated|portfolio unknown/);
  for(const scenario of report.model.scenarios){
   // 2026-10-07 'combined-income-unknown': restates the clinical reference with resources unknown (prose assumptions).
   if(scenario.id==='combined-income-unknown'){assert.equal(scenario.incomeUnknown,true);continue;}
   // Rebuilt 2026-10-07 (4ff1ba7) on a JSON-parameter model; only the preserved original k=v scenarios reproduce here.
   if(scenario.assumptions.startsWith('{'))continue;
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
  assert.ok(report.model.scenarios.some(s=>s.assumptions.startsWith('E=')));
  assert.equal(report.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
  assert.ok(report.model.scenarios.find(s=>s.id==='harm').editionQalys<0);
  // The current price adds signed household resources (4ff1ba7); the health-only diagnostic keeps the original >$60M.
  const diagnostic=report.model.scenarios.find(s=>s.id==='alpha-central-diagnostic');
  assert.ok(10*diagnostic.costUSD/diagnostic.editionQalys>60_000_000);
  assert.ok(reportPrice(report)>0);
  for(const id of report.sessionIds)assert.ok(data.sessions.find(s=>s.id===id));
 });
}
test('financial reconciliation does not manufacture a comparable DRC mean',()=>{
 assert.equal(expenseAverage(get('worksafe')),1387676.3333333333);
 assert.equal(expenseAverage(get('disability-rights-california')),null);
 assert.equal(46787232+110521-46894183,3570);
 assert.doesNotMatch(get('disability-rights-california').sections.funding,/latest full audit\/return download was blocked/);
});

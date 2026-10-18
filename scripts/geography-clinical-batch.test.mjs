import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const reports=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url))).reports;
const params=text=>Object.fromEntries([...text.matchAll(/(?:^|[;,] )([A-Za-zΔ][A-Za-z0-9_Δ]*)=([+-]?(?:\d+\.?\d*|\.\d+))/g)].map(m=>[m[1],Number(m[2])]));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
// HHCLA 'finite survival scenarios' deleted: HHCLA was recalibrated and its original scenarios are reproduced by
// hala-la-historical.test.mjs (data/los-angeles/hala-la-pre-recalibration-model.json); the current model by hala-la-calibrated.test.mjs.
test('three clinical ledgers reproduce central and joint scenarios',()=>{
 // Surgery on Sunday and Dental Lifeline were recalibrated 2026-10-02; their original ledgers are reproduced by
 // surgery-on-sunday-usa-historical.test.mjs and dental-lifeline-network-usa-historical.test.mjs.
 for(const slug of ['the-headstrong-project']){
  const report=reports.find(r=>r.edition==='usa'&&r.slug===slug);assert.ok(report);
  for(const scenario of report.model.scenarios.filter(s=>slug==='dental-lifeline-network'||['central','favorable','pessimistic'].includes(s.id))){
   if(slug==='dental-lifeline-network'){
    const x=JSON.parse(scenario.assumptions.slice(0,scenario.assumptions.indexOf('}')+1)),d=Math.log1p(x.d),k=d+x.m+x.loss+x.catchup;
    const q=x.u*Math.exp(-d*x.L)*(-Math.expm1(-k*x.T))/k,N=x.G/x.c*x.b;
    const all=N*x.r*(x.s*q-x.h*Math.exp(-d*x.L))-N*x.ha;
    near(all,scenario.allPopulationQalys);near(all*x.g,scenario.editionQalys);
    near(x.G+N*(x.r*x.resource+(1-x.r)*x.unfinishedResource+x.patientResource),scenario.costUSD);continue;
   }
   const p=params(scenario.assumptions);let q=0;
   if(slug==='surgery-on-sunday'){
    for(let t=1;t<=p.T;t++)q+=p.Δu*((1-p.m)/1.03)**t;
    q=scenario.costUSD/p.c*p.b*(p.s*q-p.h);
   }else{
    for(let t=1;t<=p.T;t++)q+=p.q1*p.p**(t-1)/1.03**t;
    q=slug==='the-headstrong-project'?scenario.costUSD/(p.c*p.n)*q*p.f*p.b*p.s:scenario.costUSD/p.c*p.b*(p.s*q-p.h);
   }
   near(q,scenario.allPopulationQalys);near(q*p.g,scenario.editionQalys);
  }
 }
});
test('equivalent benefit does not erase additional surgical or dental harms',()=>{
 // Both reports were recalibrated 2026-10-02 (scenario ids renamed; see the *-usa-calibrated tests).
 const surgery=reports.find(r=>r.slug==='surgery-on-sunday');
 const dental=reports.find(r=>r.slug==='dental-lifeline-network');
 assert.ok(surgery.model.scenarios.find(s=>s.id==='equivalent-benefit-elsewhere-harm').editionQalys<0);
 assert.ok(surgery.model.scenarios.find(s=>s.id==='mild-delayed-access-downside').editionQalys<0);
 assert.ok(dental.model.scenarios.find(s=>s.id==='clinicalNull').editionQalys<0);
 near(surgery.model.scenarios.find(s=>s.id==='all-purchased-equivalent-care').editionQalys,0);
 near(dental.model.scenarios.find(s=>s.id==='capacityZero').editionQalys,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const reports=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url))).reports;
const params=text=>Object.fromEntries([...text.matchAll(/(?:^|[;,] )([A-Za-zΔ][A-Za-z0-9_Δ]*)=([+-]?(?:\d+\.?\d*|\.\d+))/g)].map(m=>[m[1],Number(m[2])]));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
test('HHCLA finite survival scenarios reproduce without treating reversals as deaths',()=>{
 const r=reports.find(r=>r.slug==='homeless-health-care-los-angeles');assert.ok(r);
 const inputs=Object.fromEntries(r.model.inputs.map(i=>[i.name,i.value]));
 for(const s of r.model.scenarios.filter(s=>s.id!=='null')){
  const p=JSON.parse(s.assumptions.match(/^\{[^}]+\}/)[0]);
  let life=0;for(let t=1;t<=p.T;t++)life+=p.utility*((1-p.m)/1.03)**t/1.03;
  const q=s.costUSD/inputs.E*inputs.R*p.lambda*p.unique*p.rescue*p.delta*p.funding*life;
  near(q,s.allPopulationQalys);near(q,s.editionQalys);
 }
});
test('three clinical ledgers reproduce central and joint scenarios',()=>{
 for(const slug of ['surgery-on-sunday','the-headstrong-project','dental-lifeline-network']){
  const report=reports.find(r=>r.edition==='usa'&&r.slug===slug);assert.ok(report);
  for(const scenario of report.model.scenarios.filter(s=>['central','favorable','pessimistic'].includes(s.id))){
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
 const surgery=reports.find(r=>r.slug==='surgery-on-sunday');
 const dental=reports.find(r=>r.slug==='dental-lifeline-network');
 near(surgery.model.scenarios.find(s=>s.id==='equivalent-care-harm').editionQalys,-.02);
 assert.ok(surgery.model.scenarios.find(s=>s.id==='pessimistic').editionQalys<0);
 near(dental.model.scenarios.find(s=>s.id==='no-incremental-benefit').editionQalys,-.0025);
 near(surgery.model.scenarios.find(s=>s.id==='zero-additionality').editionQalys,0);
 near(dental.model.scenarios.find(s=>s.id==='zero-capacity').editionQalys,0);
});

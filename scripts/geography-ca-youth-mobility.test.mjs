import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {expenseAverage} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=slug=>data.reports.find(r=>r.edition==='california'&&r.slug===slug);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('Historical Youth ALIVE weights signed five-year effects, not reinjury percentage',()=>{
 const r={...report('youth-alive'),model:JSON.parse(readFileSync(new URL('../data/california/youth-ca-pre-recalibration-model.json',import.meta.url)))};let total=0,weight=0;
 for(const s of r.model.scenarios.filter(s=>!['central','historical-alpha-central'].includes(s.id))){
  const p=JSON.parse(s.assumptions);
  const q=s.costUSD*p.cicAllocation*p.fundingAdditionality*p.serviceRealization/p.donorCostPerAddedClient*.02*p.evidenceTransfer;
  near(q,s.editionQalys);total+=p.weight*q;weight+=p.weight;
 }
 near(weight,1);near(total,r.model.scenarios.find(s=>s.id==='historical-alpha-central').editionQalys);
 assert.equal(r.model.scenarios[0].editionQalys,null);
});
test('Youth ALIVE expense mean uses latest three comparable years and retains older history',()=>{
 const r=report('youth-alive');assert.deepEqual(r.annualExpenses.map(y=>y.year),[2023,2024,2025]);
 assert.ok(Math.abs(expenseAverage(r)-7208761.333333333)<1e-8);
 assert.match(r.sections.funding,/FY2022/);assert.match(r.sections.funding,/5,360,166/);
});
test('Historical Vision To Learn separates courses, use, additionality and geography',()=>{
 const r={...report('vision-to-learn'),model:JSON.parse(readFileSync(new URL('../data/california/vtl-ca-pre-recalibration-model.json',import.meta.url)))};
 for(const id of ['central','favorable','adverse-positive','wear-decay','public-match-diagnostic']){
  const s=r.model.scenarios.find(x=>x.id===id),p=JSON.parse(s.assumptions.slice(0,s.assumptions.indexOf('}')+1));
  const k=Math.log1p(p.r)+p.fade,D=k===0?p.T:-Math.expm1(-k*p.T)/k;
  const benefit=p.a*(p.p*p.w*p.u*D-p.h)*(1+p.r)**(-p.d);
  const financed=p.G*p.f/p.c,additional=p.M/p.c;
  near((financed+additional)*benefit,s.allPopulationQalys);
  near((financed*p.g+additional)*benefit,s.editionQalys);
 }
 const central=r.model.scenarios[0],matched=r.model.scenarios.find(s=>s.id==='public-match-diagnostic');
 near(matched.editionQalys,central.editionQalys*2);
 near(matched.allPopulationQalys,central.allPopulationQalys+central.editionQalys);
});
test('Walk SF stops benefit at counterfactual opening and retains independent harm',()=>{
 const r=report('walk-san-francisco'),base=JSON.parse(r.model.scenarios.find(s=>s.id==='historical-alpha-central').assumptions);
 assert.equal(r.model.scenarios.find(s=>s.id==='central').editionQalys,null);
 for(const s of r.model.scenarios.filter(s=>s.id!=='central')){
  let p=s.assumptions.startsWith('{')?JSON.parse(s.assumptions):{...base};
  if(s.id==='null')p.p=0;if(s.id==='fatal-null')p.eF=0;if(s.id==='harm-stress')p.H_CA=.3;
  let qF=0,qS=0,V=0;
  for(let k=1;k<=p.TF;k++)qF+=p.uF*Math.exp(-p.hazard*(k-.5))/1.03**k;
  for(let k=1;k<=p.TS;k++)qS+=p.uS/1.03**k;
  for(let t=p.start;t<p.start+p.delay;t++)V+=1.03**(-t);
  const gross=p.p*p.b*V*(p.F*p.eF*qF+p.S*p.eS*qS);
  near(gross-p.H_CA,s.allPopulationQalys);near(gross*p.gCA-p.H_CA,s.editionQalys);
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=slug=>data.reports.find(r=>r.edition==='california'&&r.slug===slug);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('Youth ALIVE weights signed five-year effects, not reinjury percentage',()=>{
 const r=report('youth-alive');let total=0,weight=0;
 for(const s of r.model.scenarios.filter(s=>s.id!=='central')){
  const p=JSON.parse(s.assumptions);
  const q=s.costUSD*p.cicAllocation*p.fundingAdditionality*p.serviceRealization/p.donorCostPerAddedClient*.02*p.evidenceTransfer;
  near(q,s.editionQalys);total+=p.weight*q;weight+=p.weight;
 }
 near(weight,1);near(total,r.model.scenarios[0].editionQalys);
});
test('Vision To Learn separates courses, use, additionality and geography',()=>{
 const r=report('vision-to-learn');
 const vectors={central:[.8,225,.5,.6,.6,.02,1,.125,.00005,.4],favorable:[.9,150,.8,.9,.8,.04,2,1/12,.00002,.6],adverse:[.65,400,.2,.3,.3,.005,.5,.25,.00005,.2]};
 for(const [id,[f,c,a,p,w,u,T,d,h,g]] of Object.entries(vectors)){
  const s=r.model.scenarios.find(x=>x.id===id),D=(1-1.03**(-T))/Math.log(1.03);
  const q=s.costUSD*f/c*a*(p*w*u*D-h)*1.03**(-d);
  near(q,s.allPopulationQalys);near(q*g,s.editionQalys);
 }
 const central=r.model.scenarios[0],matched=r.model.scenarios.find(s=>s.id==='public-match-diagnostic');
 near(matched.editionQalys,central.editionQalys*2);
 near(matched.allPopulationQalys,central.allPopulationQalys+central.editionQalys);
});
test('Walk SF stops benefit at counterfactual opening and retains independent harm',()=>{
 const r=report('walk-san-francisco'),base=JSON.parse(r.model.scenarios[0].assumptions);
 for(const s of r.model.scenarios){
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

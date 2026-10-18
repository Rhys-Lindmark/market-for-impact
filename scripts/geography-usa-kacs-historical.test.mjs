import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const frozen=JSON.parse(readFileSync(new URL('../data/usa/kacs-usa-pre-recalibration-model.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)));
test('all twelve finite KACS historical cases reproduce from frozen inputs',()=>{
 assert.equal(frozen.scenarios.length,13);
 for(const s of frozen.scenarios.filter(s=>s.id!=='central')){
  const p=JSON.parse(s.assumptions.match(/Inputs=(\{.*?\})/)[1]);
  let exposure=0;
  for(let t=1;t<=p.T;t++){
   const withWork=Math.min(p.cap,p.rate*Math.max(0,t-p.L1+1));
   const withoutWork=Math.min(p.cap,p.rate*Math.max(0,t-p.L0+1));
   exposure+=(withWork-withoutWork)/1.03**t;
  }
  const health=p.D*p.d*p.r*p.k*p.q*exposure;
  const q=s.costUSD/(p.Y*p.C)*p.b*(p.p*p.a*health-p.h);
  near(q,s.allPopulationQalys);near(q*p.g,s.editionQalys);
 }
 const alpha=frozen.scenarios.find(s=>s.id==='alpha-diagnostic');
 near(10*alpha.costUSD/alpha.editionQalys,919739.6998087636);
});
test('unknown beta center, funding null and signed policy harm stay distinct',()=>{
 assert.equal(frozen.scenarios.find(s=>s.id==='central').editionQalys,null);
 assert.equal(frozen.scenarios.find(s=>s.id==='fully-substituted').editionQalys,0);
 assert.ok(frozen.scenarios.find(s=>s.id==='policy-delay').editionQalys<0);
 assert.ok(frozen.scenarios.find(s=>s.id==='downside').editionQalys<0);
 near(5*256454,1282270);
});

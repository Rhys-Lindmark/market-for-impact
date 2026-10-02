import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const frozen=JSON.parse(readFileSync(new URL('../data/usa/cribs-usa-pre-recalibration-model.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Cribs frozen alpha mechanisms reproduce all six diagnostics without commercial shipment credit',()=>{
 const central={a:.5,c:500,b:.5,u:.2,r:.002,e:.5,L:27,g:.99};
 const cases={
  'alpha-retained-diagnostic':{},
  favorable:{a:.8,c:175,b:.9,u:.6,r:.004,e:.7,L:30,g:1},
  pessimistic:{a:.2,c:1000,b:.2,u:.05,r:.001,e:.2,L:22,g:.95},
  'zero-additionality':{b:0},
  'low-hazard-risk':{r:.0003},
  'undiscounted-life':{L:75}
 };
 assert.equal(frozen.scenarios.length,7);
 for(const[id,o] of Object.entries(cases)){
  const s=frozen.scenarios.find(s=>s.id===id),p={...central,...o};
  const health=s.costUSD*p.a/p.c*p.b*p.u*p.r*p.e*p.L;
  near(health,s.allPopulationQalys);near(health*p.g,s.editionQalys);
 }
 const alpha=frozen.scenarios.find(s=>s.id==='alpha-retained-diagnostic');
 near(10*alpha.costUSD/alpha.editionQalys,3741114.8522259634);
});
test('Cribs historical unknown central remains different from genuine zero additionality',()=>{
 assert.equal(frozen.scenarios.find(s=>s.id==='central').editionQalys,null);
 assert.equal(frozen.scenarios.find(s=>s.id==='zero-additionality').editionQalys,0);
 assert.equal(frozen.inputs.find(i=>i.name==='FY2025 functional expense').value,2633922);
});

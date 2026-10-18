import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const frozen=JSON.parse(fs.readFileSync(new URL('../data/usa/anrf-usa-pre-recalibration-model.json',import.meta.url),'utf8'));
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
function original(p){
 let exposure=0,life=0;
 for(let t=1;t<=p.T;t++)exposure+=(p.retention*p.cohortSurvival)**(t-1)/(1+p.discount)**t;
 for(let t=1;t<=p.lifeYears;t++)life+=p.utility*p.rescuedSurvival**t/(1+p.discount)**t;
 const py=p.G/(p.C*p.annualCostMultiplier)*p.N*p.dp*p.a*p.f*p.e*exposure;
 const health=py*((p.rD*life+p.rM*p.qM)*p.excessRisk*p.exposureRemoval*p.transport-p.h);
 return {health,usa:health*p.g,cost:p.G+py*p.extraResourcePerPersonYear,protectedYears:py};
}
test('ANRF all25 frozen original cases independently reproduce',()=>{
 assert.equal(frozen.model.scenarios.length,25);
 for(const s of frozen.model.scenarios){
  const p=JSON.parse(s.assumptions.slice(0,s.assumptions.indexOf('};')+1)),v=original(p);
  near(s.editionQalys,v.usa);near(s.allPopulationQalys,v.health);near(s.costUSD,v.cost);
 }
 const c=frozen.model.scenarios.find(s=>s.id==='central');near(c.editionQalys,.012203523033331514);
 assert.equal(frozen.model.scenarios.find(s=>s.id==='zero-additionality').editionQalys,0);
 assert.ok(frozen.model.scenarios.find(s=>s.id==='no-clinical-effect').editionQalys<0);
});

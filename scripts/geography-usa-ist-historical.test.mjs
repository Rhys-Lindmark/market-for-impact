import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const f=JSON.parse(readFileSync(new URL('../data/usa/ist-usa-pre-recalibration-model.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const calculate=p=>{let deployment=0;for(let t=1;t<=p.T;t++){const covered=L=>Math.min(p.cap,p.rate*Math.max(0,t-L+1));deployment+=(covered(p.L1)-covered(p.L0))/Math.pow(1.03,t);}const health=p.b*(p.p*p.a*p.D*p.r*p.q*deployment-p.h);return{deployment,health,usa:health*p.g,cost:p.C*p.Y};};
test('IST original finite fleet-acceleration scenarios reproduce, including signed and zero cases',()=>{
 let count=0;for(const s of f.model.scenarios){const match=s.assumptions.match(/Parameters (\{[^}]+\})/);if(!match)continue;const p=JSON.parse(match[1]),z=calculate(p);near(z.cost,s.costUSD);near(z.health,s.allPopulationQalys);near(z.usa,s.editionQalys);count++;}assert.equal(count,13);
});
test('five annual recipient budgets were charged, not one current gift',()=>{
 const alpha=f.model.scenarios.find(s=>s.id==='alpha-reproduced');near(alpha.costUSD,365248*5);near(alpha.editionQalys,11.074696225260762);
 near(alpha.costUSD*10/alpha.editionQalys,1649020.4000670002);
 assert.equal(f.model.scenarios.find(s=>s.id==='central').editionQalys,null);
});
test('finite convergence horizon changes timing; unknown and independent harms cannot be inferred zero',()=>{
 const central={C:365248,Y:5,D:106,r:.5,q:20,b:.5,p:.15,a:.1,g:.99,L1:5,L0:7,rate:.07,cap:1,T:25,h:0};near(calculate(central).deployment,1.4071146973204707);
 assert.equal(calculate({...central,L0:5}).usa,0);assert.ok(calculate({...central,p:0,h:1}).usa<0);
 const short=f.model.scenarios.find(s=>s.id==='poor'),long=f.model.scenarios.find(s=>s.id==='poor-full-convergence');assert.ok(long.editionQalys>short.editionQalys);
 // Old b*harm convention does not prove that independent donor-caused harm disappears at b=0.
 assert.equal(calculate({...central,b:0,h:1}).usa,0);
});

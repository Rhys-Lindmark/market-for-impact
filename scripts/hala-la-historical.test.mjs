import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';
const frozen=JSON.parse(fs.readFileSync(new URL('../data/los-angeles/hala-la-pre-recalibration-model.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} vs ${b}`);
test('all13 HALA historical scenarios preserve finite nutrition exposure and direct harm/unknown',()=>{
 assert.equal(frozen.model.scenarios.length,13);
 for(const row of frozen.model.scenarios){if(row.id==='portfolio-unknown'){assert.equal(row.editionQalys,null);continue;}if(row.id==='adverse'){assert.equal(row.editionQalys,-1);assert.equal(row.pricePer10QalysUSD,null);continue;}const p=row.parameters,all=1224579*p.q/p.u*p.a*p.b/(1+p.d),local=all*p.g;close(row.allPopulationQalys,all);close(row.editionQalys,local);if(local>0)close(row.pricePer10QalysUSD,10*row.costUSD/local);else assert.equal(row.pricePer10QalysUSD,null);}
});
test('historical unit re-expression and cost-only resources create no health',()=>{
 const rows=frozen.model.scenarios,c=rows.find(x=>x.id==='central');close(c.pricePer10QalysUSD,9772603.745817116);
 for(const id of['unit-invariance','volunteer-resources','high-volunteer-resources'])assert.equal(rows.find(x=>x.id===id).editionQalys,c.editionQalys);
});

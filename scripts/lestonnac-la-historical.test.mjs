import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const frozen=JSON.parse(fs.readFileSync(new URL('../data/los-angeles/lestonnac-la-pre-recalibration-model.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} versus ${b}`);
function calculate(p){
  const q=p.branches.reduce((sum,j)=>{const rate=Math.log1p(p.d)+p.m+j.decay;return sum+j.weight*j.utility*(rate===0?j.years:-Math.expm1(-rate*j.years)/rate);},0);
  const delivered=p.N*p.b,effective=delivered*p.e,health=delivered*(p.e*q-p.h),local=p.g*health;
  return {q,delivered,effective,health,local,price:local>0?10*p.E/local:null};
}
test('all 18 historical Lestonnac cases reproduce finite health bridge',()=>{
  assert.equal(frozen.model.scenarios.length,18);
  for(const row of frozen.model.scenarios){const p=JSON.parse(row.assumptions),out=calculate(p);close(out.health,row.allPopulationQalys);close(out.local,row.editionQalys);assert.equal(p.E,row.costUSD);}
});
test('central historical physical pathway is explicit, not observed marginal productivity',()=>{
  const p=JSON.parse(frozen.model.scenarios.find(x=>x.id==='central').assumptions),out=calculate(p);
  assert.equal(out.delivered,3500);close(out.effective,1225);close(out.price,4369540.646507921);close(p.g*out.effective,796.25);
  assert.equal(p.branches.reduce((sum,j)=>sum+j.weight,0),1);
});
test('historical accounting diagnostics leave physical benefit fixed',()=>{
  const rows=frozen.model.scenarios;const central=calculate(JSON.parse(rows[0].assumptions));
  for(const id of ['cash-only','services-half','services-one-half','cost-growth']){
    const out=calculate(JSON.parse(rows.find(x=>x.id===id).assumptions));assert.equal(out.health,central.health);assert.equal(out.delivered,central.delivered);
  }
  assert.equal(calculate(JSON.parse(rows.find(x=>x.id==='zero').assumptions)).price,null);
  assert.equal(calculate(JSON.parse(rows.find(x=>x.id==='harm').assumptions)).price,null);
});

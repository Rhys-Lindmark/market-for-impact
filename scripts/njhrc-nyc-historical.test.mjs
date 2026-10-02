import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const frozen=JSON.parse(readFileSync(new URL('../data/new-york-city/njhrc-nyc-pre-recalibration-model.json',import.meta.url),'utf8'));
const integral=(hazard,years)=>hazard===0?years:-Math.expm1(-hazard*years)/hazard;
test('NJHRC frozen unknown central is not zero or a recovered measured estimate',()=>{
 assert.equal(frozen.organizationId,'ein:85-4099652');
 assert.equal(frozen.model.scenarios.length,7);
 const row=frozen.model.scenarios.find(x=>x.id==='central');
 assert.equal(row.allPopulationQalys,null);
 assert.equal(row.editionQalys,null);
 assert.equal(row.pricePer10Qalys,null);
});
test('NJHRC six historical signed finite survival cases independently reconstruct',()=>{
 for(const row of frozen.model.scenarios.filter(x=>x.id!=='central')){
  const p=JSON.parse(row.assumptions),discount=Math.log1p(p.d);
  const activeHazard=p.m-p.e*p.t*p.l;
  const active=integral(activeHazard+discount,1)-integral(p.m+discount,1);
  const tail=(Math.exp(-activeHazard)-Math.exp(-p.m))*Math.exp(-discount)*integral(p.m+discount,p.T-1);
  const all=p.C*p.f/p.k*p.b*p.u*(active+tail)-p.h,local=all*p.g;
  for(const [actual,expected]of [[row.allPopulationQalys,all],[row.editionQalys,local]])
   assert.ok(Math.abs(actual-expected)<1e-10*Math.max(1,Math.abs(expected)),row.id);
  const price=local>0?10*p.numeratorCostUSD/local:null;
  assert.equal(row.costUSD,p.numeratorCostUSD);
  if(price===null)assert.equal(row.pricePer10Qalys,null);
  else assert.ok(Math.abs(row.pricePer10Qalys-price)<1e-9*price,row.id);
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const frozen=JSON.parse(readFileSync(new URL('../data/new-york-city/bvmi-nyc-pre-recalibration-model.json',import.meta.url),'utf8'));
test('BVMI all fifteen frozen historical scenarios independently reconstruct',()=>{
 assert.equal(frozen.model.scenarios.length,15);
 for(const row of frozen.model.scenarios){
  if(!row.parameters){assert.equal(row.editionQalys,null);continue;}
  const p=row.parameters,effective=p.N*p.a*p.b;
  const all=effective*(p.c*p.u*p.t-p.h)/(1+p.d),local=all*p.g;
  for(const [actual,expected]of [[row.effectivePatients,effective],[row.allPopulationQalys,all],[row.editionQalys,local]])
   assert.ok(Math.abs(actual-expected)<=1e-12*Math.max(1,Math.abs(expected)),row.id);
  const price=local>0?10*row.costUSD/local:null;
  if(price===null)assert.equal(row.pricePer10QalysUSD,null);
  else assert.ok(Math.abs(row.pricePer10QalysUSD-price)<=1e-10*price,row.id);
 }
});

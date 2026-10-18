import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const frozen=JSON.parse(fs.readFileSync(new URL('../data/chicago/cra-pre-recalibration-model.json',import.meta.url)));
const parameters=row=>JSON.parse(row.assumptions.slice(0,row.assumptions.indexOf('};')+1));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} vs ${b}`);
function independent(p){
 let life=0;for(let t=0;t<p.T;t++)life+=p.s**t*p.u/(1+p.d)**(t+.5);
 const deaths=p.N*p.c*p.r*p.h*p.e*p.a*p.b;
 const all=deaths*life+p.H,local=p.g*all,cost=p.C*p.f+p.K;
 return {life,deaths,all,local,cost,price:local>0?10*cost/local:null};
}
test('all16 CRA historical cases reproduce full cost, finite survival and signed portfolio',()=>{
 assert.equal(frozen.model.scenarios.length,16);
 for(const row of frozen.model.scenarios){
  const o=independent(parameters(row));
  close(row.costUSD,o.cost);close(row.allPopulationQalys,o.all);close(row.editionQalys,o.local);
  if(o.price===null)assert.ok(row.assumptions.endsWith('price10=undefined for nonpositive QALYs'));
  else close(Number(row.assumptions.split('price10=')[1]),o.price);
 }
 const c=independent(parameters(frozen.model.scenarios.find(x=>x.id==='central')));
 close(c.price,4080401.517585316);close(c.deaths,4.05);close(c.life,2.489716634743022);
});
test('historical accounting adjustments change cost, not native rescue or health',()=>{
 const rows=frozen.model.scenarios,c=rows.find(x=>x.id==='central');
 for(const id of ['resource-plus25','resource-plus100','settlement-normalized','three-year-mean']){
  const row=rows.find(x=>x.id===id);assert.equal(row.editionQalys,c.editionQalys);
  close(independent(parameters(row)).deaths,4.05);assert.notEqual(row.costUSD,c.costUSD);
 }
 for(const id of ['zero-effect','zero-finance','no-alternative-gap'])assert.equal(rows.find(x=>x.id===id).editionQalys,0);
 assert.ok(rows.find(x=>x.id==='other-net-negative').editionQalys<0);
 assert.ok(rows.find(x=>x.id==='other-net-positive').editionQalys>c.editionQalys);
});

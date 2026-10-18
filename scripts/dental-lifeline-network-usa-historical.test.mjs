import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const frozen=JSON.parse(fs.readFileSync(new URL('../data/usa/dental-lifeline-network-usa-pre-recalibration-model.json',import.meta.url),'utf8'));
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
// Independently reconstruct the frozen clinical engine, not a current calculator.
function original(p){
 const discount=Math.log1p(p.d),hazard=discount+p.m+p.loss+p.catchup;
 const q=p.u*Math.exp(-discount*p.L)*(-Math.expm1(-hazard*p.T))/hazard;
 const candidates=p.G/p.c*p.b,completions=candidates*p.r;
 const health=completions*(p.s*q-p.h*Math.exp(-discount*p.L))-candidates*p.ha;
 const cost=p.G+candidates*(p.r*p.resource+(1-p.r)*p.unfinishedResource+p.patientResource);
 return {all:health,usa:p.g*health,cost};
}
test('Dental Lifeline Network frozen USA clinical model reproduces every historical case',()=>{
 assert.equal(frozen.edition,'usa');assert.equal(frozen.slug,'dental-lifeline-network');
 assert.equal(frozen.model.scenarios.length,18);
 for(const s of frozen.model.scenarios){
  const match=s.assumptions.match(/^(\{.*?\}); /);assert.ok(match,s.id);
  const p=JSON.parse(match[1]),v=original(p);
  close(v.cost,s.costUSD);close(v.all,s.allPopulationQalys);close(v.usa,s.editionQalys);
 }
 const central=frozen.model.scenarios.find(s=>s.id==='central');
 close(central.editionQalys,.12224162318811595);
 close(10*central.costUSD/central.editionQalys,818051.9645596605);
});

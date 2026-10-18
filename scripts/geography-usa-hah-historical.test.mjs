import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const frozen=JSON.parse(readFileSync(new URL('../data/usa/hah-usa-pre-recalibration-model.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)));
test('HAH frozen finite hearing diagnostics reproduce without changing historical inputs',()=>{
 assert.equal(frozen.scenarios.length,8);
 for(const s of frozen.scenarios.filter(s=>s.id!=='central')){
  const p=JSON.parse(s.assumptions.match(/(\{.*?\})/)[1]);
  let duration=0;
  for(let t=1;t<=p.T;t++) duration+=((1-p.m)/1.03)**t;
  const q=s.costUSD/p.c*p.b*(p.s*p.u*p.p*duration-p.h);
  near(q,s.allPopulationQalys);near(q*p.g,s.editionQalys);
 }
 const alpha=frozen.scenarios.find(s=>s.id==='alpha-retained-diagnostic');
 near(10*alpha.costUSD/alpha.editionQalys,689123.7815575873);
});
test('HAH historical unknown, no capacity and negative clinical cases remain distinct',()=>{
 assert.equal(frozen.scenarios.find(s=>s.id==='central').editionQalys,null);
 assert.equal(frozen.scenarios.find(s=>s.id==='zero-capacity').editionQalys,0);
 assert.ok(frozen.scenarios.find(s=>s.id==='utility-null-harm-retained').editionQalys<0);
 assert.ok(frozen.scenarios.find(s=>s.id==='adverse').editionQalys<0);
});

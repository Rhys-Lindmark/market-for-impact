import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate} from '../lib/oa-portfolio-model.mjs';
import {BOUNDS} from '../lib/oa-portfolio-foundation.mjs';
const model=JSON.parse(readFileSync(new URL('../data/california/oa-ca-pre-recalibration-model.json',import.meta.url)));
test('Frozen Operation Access clinical portfolio independently reproduces each historical scenario',()=>{
 const central_inputs={bay_share:0,sf_share:0};
 for(const input of model.inputs)if(Object.hasOwn(BOUNDS,input.name))central_inputs[input.name]=input.value;
 const paths=model.inputs.filter(input=>input.name.startsWith('Pathway ')).map(input=>{
  const match=input.name.match(/^Pathway (\S+) \((\S+)\)$/);assert.ok(match);
  return {id:match[1],name:match[1],category:match[2],...JSON.parse(input.value)};
 });
 assert.equal(paths.length,21);
 for(const scenario of model.scenarios){
  const match=scenario.assumptions.match(/Overrides on beta central vector: (\{.*\})\. California share/);assert.ok(match);
  const result=calculate({foundation:{central_inputs},paths},JSON.parse(match[1]));
  assert.ok(Math.abs(result.total_q-scenario.editionQalys)<1e-10,scenario.id);
  assert.equal(result.whole_gift_usd,scenario.costUSD);
 }
 const c=model.scenarios.find(s=>s.id==='central');
 assert.ok(Math.abs(c.costUSD*10/c.editionQalys-1882705.7037158862)<1e-6);
 assert.equal(model.version,'ca-oa-finite-whole-portfolio-beta-v2');
});
test('Historical no-activity and harm cases stay distinct from missing evidence',()=>{
 assert.equal(model.scenarios.find(s=>s.id==='zero_activity').editionQalys,0);
 assert.equal(model.scenarios.find(s=>s.id==='zero_activity_independent_harm').editionQalys,-1);
 assert.ok(model.scenarios.find(s=>s.id==='no_benefit_harms_retained').editionQalys<0);
});

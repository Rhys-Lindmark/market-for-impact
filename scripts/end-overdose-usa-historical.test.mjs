import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const frozen=JSON.parse(readFileSync(new URL('../data/usa/end-overdose-usa-pre-recalibration-model.json',import.meta.url)));
test('End Overdose frozen USA rescue ledger reproduces every numeric historical case',()=>{
 const cases=frozen.model.scenarios.filter(s=>s.parameters);
 assert.ok(cases.length>=5);
 for(const s of cases){
  const p=s.parameters;let survival=1,life=0;
  for(let y=1;y<=p.T;y++){
   const next=survival*(1-(y===1?p.m1:p.m));
   life+=p.u*(survival+next)/2/1.03**(y-.5+p.delay);survival=next;
  }
  const offered=p.G*p.a/p.c,additional=offered*p.b,delivered=additional*p.q;
  const administrations=delivered*p.e*p.k*p.t*p.d;
  const health=administrations*(p.f*life-p.h);
  assert.ok(Math.abs(health-s.allPopulationQalys)<1e-10,s.id);
  assert.ok(Math.abs(health*p.g-s.editionQalys)<1e-10,s.id);
  assert.equal(s.nativeOutputs.offered,offered);
  assert.equal(s.nativeOutputs.additionalOffers,additional);
  assert.equal(s.nativeOutputs.delivered,delivered);
  assert.equal(s.nativeOutputs.doses,2*delivered);
  const price=health*p.g>0?10*p.G/(health*p.g):null;
  if(price===null)assert.equal(s.nativeOutputs.donorCostPerTenUsaQalys,null);
  else assert.ok(Math.abs(s.nativeOutputs.donorCostPerTenUsaQalys-price)<=Math.max(1e-8,Math.abs(price)*1e-12),s.id);
 }
});
test('End Overdose frozen history preserves unknown portfolio separately from null and harmful rescue cases',()=>{
 const cases=frozen.model.scenarios;
 assert.equal(cases.find(s=>s.id==='no-additionality').editionQalys,0);
 assert.ok(cases.find(s=>s.id==='harm-only').editionQalys<0);
 assert.equal(cases.find(s=>s.id==='unpriced-portfolio').editionQalys,null);
 const central=cases.find(s=>s.id==='central');
 assert.ok(Math.abs(10*central.costUSD/central.editionQalys-1759484.5799377698)<1e-6);
 assert.equal(frozen.edition,'usa');
 assert.match(frozen.model.geographicAttribution,/No California/);
});

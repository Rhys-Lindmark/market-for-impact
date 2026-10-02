import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {central,cases,calculate,componentResourceFlows,historical} from '../lib/njhrc-nyc-calibrated-model.mjs';
import * as archived from '../docs/geography-discovery/njhrc-nyc-recalibration-2026-10-02.calculate.mjs';
import {incomeHealthyYearEquivalent as income} from '../lib/income-health-equivalence.mjs';
test('NJHRC portable candidate preserves21 author cases and shared signed component ledgers',()=>{
 for(const [id,patch]of Object.entries(cases)){
  const p={...central,...patch},r=calculate(p),flows=componentResourceFlows(p);
  assert.deepEqual(r,archived.calculate(p),id);
  for(const [key,field]of [['cash','cashEquivalentLocal'],['pay','earningsEquivalentLocal']]){
   if(r[field]===null){assert.equal(flows[key],null,id+key);continue;}
   assert.notEqual(flows[key],null,id+key);
   const sum=flows[key].reduce((n,f)=>n+income(f),0);
   assert.ok(Math.abs(sum-r[field])<1e-12,id+key);
  }
  if(r.combinedLocal!==null&&r.combinedLocal>0)assert.ok(Math.abs(r.donorPrice10-10*p.gift/r.combinedLocal)<1e-6,id);
 }
});
test('NJHRC historical calculator reproduces6 finite frozen cases; unknown stays historical',()=>{
 const frozen=JSON.parse(readFileSync(new URL('../data/new-york-city/njhrc-nyc-pre-recalibration-model.json',import.meta.url),'utf8'));
 for(const row of frozen.model.scenarios){
  if(row.id==='central'){assert.equal(row.editionQalys,null);continue;}
  const r=historical(JSON.parse(row.assumptions));
  assert.ok(Math.abs(r.local-row.editionQalys)<1e-10);
  if(r.price===null)assert.equal(row.pricePer10Qalys,null);
  else assert.ok(Math.abs(r.price-row.pricePer10Qalys)<1e-9*r.price);
 }
});
test('NJHRC knowledge and overlap guards preserve unknowns, known absence and signed losses',()=>{
 const run=v=>calculate({...central,...v});
 assert.equal(run({earningsKnown:false,recoveryPay:0}).rawPayPV_LocalUSD,null);
 assert.equal(run({healthKnown:false,injury:0}).rawPayPV_LocalUSD,null);
 for(const patch of [{reachKnown:false,workerShare:0},{reachKnown:false,payYears:0}])
  assert.equal(run(patch).earningsEquivalentLocal,0);
 const full=run({positiveIndependent:0,cashKnown:false,healthKnown:false});
 assert.equal(full.earningsEquivalentLocal,0);assert.equal(full.rawPayPV_LocalUSD,null);
 assert.ok(run({positiveIndependent:0,recoveryPay:-400}).earningsEquivalentLocal<0);
 assert.equal(run({reachKnown:false,N:0}).combinedLocal,null);
 assert.equal(run({reachKnown:false,funding:0}).combinedLocal,0);
 assert.equal(run({reachKnown:false,gift:0}).combinedLocal,0);
 assert.throws(()=>run({toString:1}));
 assert.throws(()=>run({buyer:.8,free:.8}));
 assert.throws(()=>run({death:.8,injury:.8}));
 assert.throws(()=>run({gift:25001}));
});

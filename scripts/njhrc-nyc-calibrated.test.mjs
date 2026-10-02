import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {central,cases,calculate,componentResourceFlows,historical} from '../lib/njhrc-nyc-calibrated-model.mjs';
import * as archived from '../docs/geography-discovery/njhrc-nyc-recalibration-2026-10-02.calculate.mjs';
import {incomeHealthyYearEquivalent as income} from '../lib/income-health-equivalence.mjs';
import {reportPrice,researchListPrice,editionResearchEffort} from '../lib/geography-reports.mjs';
test('NJHRC integrated report preserves history, local welfare price and closed model clocks',()=>{
 const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
 const d=read('data/geography-reports.json'),r=d.reports.find(x=>x.edition==='new-york-city'&&x.slug==='new-jersey-harm-reduction-coalition');
 assert.deepEqual(r.historicalModel,read('data/new-york-city/njhrc-nyc-pre-recalibration-model.json').model);
 assert.equal(r.model.scenarios.length,22);
 assert.ok(Math.abs(reportPrice(r)-19752539.732170835)<1e-6);
 assert.equal(reportPrice(r),researchListPrice(r));
 for(const [id,patch]of Object.entries(cases)){
  const p={...central,...patch},v=calculate(p),s=r.model.scenarios.find(x=>x.id===id);
  assert.deepEqual(s.parameters,p);
  assert.deepEqual(s.nativeOutputs,JSON.parse(JSON.stringify(v)));
  assert.equal(s.editionQalys,v.healthLocal);
  assert.equal(s.incomeUnknown,v.resourcesLocal===null);
  if(v.resourcesLocal!==null)assert.ok(Math.abs(s.incomePathways.reduce((n,f)=>n+income(f),0)-v.resourcesLocal)<1e-12);
 }
 assert.equal(new Set(r.sessionIds).size,10);
 const fresh=d.sessions.filter(s=>r.sessionIds.slice(5).includes(s.id));
 assert.equal(fresh.length,5);
 assert.ok(Math.abs(fresh.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0)-528.094)<1e-9);
 assert.ok(fresh.every(s=>s.model.id==='gpt-6.1-sol'&&s.runtimeModel===null));
 const header=editionResearchEffort(d,r).label;
 assert.match(header,/4 min on GPT-6 Astra Light/);assert.match(header,/62 min on GPT-6 Astra Medium/);assert.match(header,/9 min on GPT-6.1 Sol/);
});
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
 for(const patch of [{completion:0,acquisitionShare:0},{buyer:0,event:0,acquisitionShare:0}]){
  const p={...central,...patch,cashKnown:false,healthKnown:false,earningsKnown:false};
  const out=calculate(p),flows=componentResourceFlows(p);
  assert.equal(out.cashEquivalentLocal,0);
  assert.equal(out.rawCashPV_LocalUSD,0);
  assert.equal(out.resourcesLocal,0);
  assert.ok(out.combinedLocal<0,'Known offer harm survives absent cash routes');
  assert.deepEqual(flows,{cash:[],pay:[]});
  assert.equal(calculate({...p,reachKnown:false}).cashEquivalentLocal,0);
 }
 assert.equal(run({cashKnown:false,buyerSaving:0,rescueCash:0,acquisitionCash:0}).cashEquivalentLocal,null,'Unavailable amount placeholders do not establish absent routes');
});

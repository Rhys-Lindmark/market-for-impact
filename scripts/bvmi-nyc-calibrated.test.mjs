import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,editionResearchEffort} from '../lib/geography-reports.mjs';
import {central,calculate,resourceFlows,scenarios} from '../lib/bvmi-nyc-calibrated-model.mjs';
import {calculate as proposal} from '../docs/geography-discovery/bvmi-nyc-recalibration-2026-10-02.calculate.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
test('BVMI integrated report preserves history, signed price and focused sessions',()=>{
 const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
 const d=read('data/geography-reports.json'),r=d.reports.find(r=>r.slug==='bergen-volunteer-medical-initiative'&&r.edition==='new-york-city');
 assert.deepEqual(r.historicalModel,read('data/new-york-city/bvmi-nyc-pre-recalibration-model.json').model);
 assert.equal(r.model.scenarios.length,25);near(reportPrice(r),29386406.728908814);
 for(const [id,o]of Object.entries(scenarios)){
  const row=r.model.scenarios.find(s=>s.id===id),p={...central,...o},v=calculate(p);
  assert.deepEqual(row.parameters,p);assert.deepEqual(row.nativeOutputs,JSON.parse(JSON.stringify(v)));assert.equal(row.editionQalys,v.healthNYC);
  if(v.resourcesNYC!==null)near(row.incomePathways.reduce((sum,f)=>sum+incomeHealthyYearEquivalent(f),0),v.resourcesNYC);
 }
 assert.equal(new Set(r.sessionIds).size,8);
 const fresh=d.sessions.filter(s=>r.sessionIds.slice(4).includes(s.id));assert.equal(fresh.length,4);
 near(fresh.reduce((sum,s)=>sum+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0),628.177);
 assert.ok(fresh.every(s=>s.model.id==='gpt-6.1-sol'));
 assert.match(editionResearchEffort(d,r).label,/10 min on GPT-6.1 Sol/);
});
test('BVMI all24 candidate cases and signed public ledger reproduce',()=>{
 for(const [id,o] of Object.entries(scenarios)){
  const p={...central,...o},v=calculate(p);assert.deepEqual(v,proposal(p),id);
  const flows=resourceFlows(p);
  if(v.resourcesNYC===null)assert.equal(flows,null,id);
  else near(flows.reduce((sum,f)=>sum+incomeHealthyYearEquivalent(f),0),v.resourcesNYC);
 }
 near(calculate(central).donorCombinedPrice10,29386406.728908814);
 const offered=central.gift/central.cashLikeCost*central.patients*central.funding;
 const newCare=offered*central.completion*(1-central.purchasers-central.otherFree);
 const clinical=(newCare*(1-central.mentalPatients/central.patients)*central.physicalResponse*central.physicalUtility*central.physicalYears+newCare*central.mentalPatients/central.patients*central.mentalResponse*central.mentalUtility*central.mentalYears-newCare*central.treatmentHarm-offered*central.offerHarm)/(1+central.discount)**central.clinicalDelay;
 near(calculate(central).healthNYC,clinical);
});
test('BVMI guards separate unknown values, absent work and raw pay from welfare',()=>{
 const run=o=>calculate({...central,...o});
 assert.throws(()=>run({toString:1}));assert.throws(()=>run({purchasers:.8,otherFree:.8}));
 assert.equal(run({reachKnown:false,patients:0,mentalPatients:0}).combinedNYC,null);
 for(const o of [{gift:0},{funding:0}])assert.equal(run({...o,reachKnown:false,healthKnown:false,cashKnown:false,earningsKnown:false}).combinedNYC,0);
 for(const o of [{workerShare:0},{completion:0}])assert.equal(run({...o,healthKnown:false,cashKnown:false,earningsKnown:false}).earningsEquivalentNYC,0);
 assert.equal(run({recoveryPay:0,earningsKnown:false}).earningsEquivalentNYC,null);
 assert.equal(run({recoveryPay:0,earningsKnown:true,healthKnown:false,cashKnown:false}).earningsEquivalentNYC,0);
 assert.equal(run({physicalResponse:0,mentalResponse:0,healthKnown:false}).earningsEquivalentNYC,null);
 const overlap=run({recoveryIndependent:0,healthKnown:false});assert.equal(overlap.earningsEquivalentNYC,0);assert.equal(overlap.householdNetPayPVNYC,null);
 assert.ok(resourceFlows({...central,recoveryIndependent:0,healthKnown:false}).every(f=>f.channel!=='pay'));
 assert.ok(run({recoveryPay:-600,recoveryIndependent:0}).earningsEquivalentNYC<0);
 assert.equal(run({recoveryPay:-600,recoveryIndependent:0,healthKnown:false}).earningsEquivalentNYC,null);
 const unknownCash=run({cashKnown:false});assert.equal(unknownCash.earningsEquivalentNYC,null);assert.ok(unknownCash.householdNetPayPVNYC>0);
 assert.equal(run({healthKnown:false}).healthNYC,null);assert.ok(run({healthKnown:false}).completedPatients>0);
 assert.ok(run(scenarios.failedOnly).combinedNYC<0);assert.equal(run(scenarios.failedOnly).donorCombinedPrice10,null);
 assert.equal(run(scenarios.equivalentAlternativeNoBurden).combinedNYC,0);
});

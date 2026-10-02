import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as current from '../lib/parker-nyc-calibrated-model.mjs';
import * as archived from '../docs/geography-discovery/parker-nyc-recalibration-2026-10-02.calculate.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const run=overrides=>current.calculate({...current.central,...overrides});
function equivalent(a,b){
 if(typeof b==='number'){assert.equal(typeof a,'number');close(a,b);return;}
 if(b===null||typeof b!=='object'){assert.equal(a,b);return;}
 assert.deepEqual(Object.keys(a),Object.keys(b));
 for(const k of Object.keys(b))equivalent(a[k],b[k]);
}

test('all27 Parker cases preserve author outputs and reproduce shared signed component ledgers',()=>{
 assert.equal(Object.keys(current.cases).length,27);
 for(const overrides of Object.values(current.cases)){
  const p={...current.central,...overrides},r=current.calculate(p),flows=current.componentResourceFlows(p);
  equivalent(r,archived.calculate(p));
  for(const[k,q]of[['cash',r.cashEquivalentLocal],['pay',r.earningsEquivalentLocal]]){
   if(q===null)assert.equal(flows[k],null);
   else close(flows[k].reduce((s,f)=>s+incomeHealthyYearEquivalent(f),0),q);
  }
  if(r.combinedLocal!==null)close(r.combinedLocal,r.healthLocal+r.resourcesLocal);
  if(r.donorPrice10!==null)close(r.donorPrice10,10*p.gift/r.combinedLocal);
 }
 const r=run({});
 close(r.healthLocal,.007561214877399654);
 close(r.resourcesLocal,.0022548124953870466);
 close(r.donorPrice10,10187420.654228546);
 close(r.grossPrice10,12962527.478373785);
 close(r.native[0].offered,1.953348107194261);
 close(r.native[1].offered,.26785714285714285);
});

test('structural absence is known; unknown zero monetary placeholders are not',()=>{
 for(const flags of [{cashKnown:false},{reachKnown:false}]){
  const r=run({...flags,acquisitionShare:0,buyer:0,maintenanceShare:0,workerShare:0});
  assert.equal(r.cashEquivalentLocal,0);assert.equal(r.rawCashPV_LocalUSD,0);assert.equal(r.earningsEquivalentLocal,0);
 }
 assert.equal(run({cashKnown:false,medicalSaving:0,dentalSaving:0,medicalAcquisition:0,dentalAcquisition:0,medicalMaintenance:0,dentalMaintenance:0}).cashEquivalentLocal,null);
 assert.equal(run({earningsKnown:false,medicalPay:0,dentalPay:0}).earningsEquivalentLocal,null);
 assert.equal(run({clinicalKnown:false,medicalResponse:0,dentalResponse:0}).healthLocal,null);
 assert.equal(run({reachKnown:false,workerShare:0}).earningsEquivalentLocal,0);
});

test('independent harms and negative pay survive positive overlap exclusions',()=>{
 const neg={medicalPay:-400,dentalPay:-200};
 assert.ok(run(neg).earningsEquivalentLocal<0);
 close(run({...neg,payPositiveIndependent:0}).earningsEquivalentLocal,run(neg).earningsEquivalentLocal);
 assert.ok(run({clinicalKnown:false,medicalUtility:0,dentalUtility:0}).healthLocal<0);
 const r=run({reachKnown:false,clinicalKnown:false,cashKnown:false,earningsKnown:false,healthLocality:0,resourceLocality:0});
 assert.equal(r.combinedLocal,0);assert.equal(r.rawCashPV_LocalUSD,0);assert.equal(r.rawPayPV_LocalUSD,0);assert.equal(r.donorPrice10,null);
 assert.equal(run({cashKnown:false}).earningsEquivalentLocal,null);
 close(run({cashKnown:false}).rawPayPV_LocalUSD,run({}).rawPayPV_LocalUSD);
});

test('strict domain and unchanged physical production across cost boundaries',()=>{
 for(const p of [{unknownKey:1},{gift:Infinity},{buyer:.9,free:.3},{baseline:1000,medicalAcquisition:5000,acquisitionShare:1}])assert.throws(()=>run(p));
 const central=run({}),gross=run({medicalGross:2427658,dentalGross:700000});
 assert.deepEqual(gross.native,central.native);close(gross.combinedLocal,central.combinedLocal);close(gross.donorPrice10,central.donorPrice10);assert.ok(gross.grossPrice10>central.grossPrice10);
 assert.equal(run({funding:0}).donorPrice10,null);
});

test('all five new Parker research intervals are closed and sum to603.808seconds',()=>{
 const p=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/parker-nyc-recalibration-2026-10-02.closed.json',import.meta.url),'utf8'));
 const sessions=[p.closedSource,p.closedModel,p.closedCorrection,p.closedFinalCorrection,p.session];
 assert.equal(new Set(sessions.map(s=>s.id)).size,5);
 let seconds=0;for(const s of sessions){assert.equal(s.model,null);assert.ok(s.endedAt);const t=(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000;assert.ok(t>=0);seconds+=t;}
 close(seconds,603.808);close(p.focusedSeconds.total,seconds);assert.equal(p.assignedModel.name,'GPT-6.1 Sol');assert.equal(p.assignedModel.runtimeId,null);
});

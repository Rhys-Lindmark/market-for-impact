import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {central,calculate,cases,survivalTail,historical,historicalCentral,historicalScenarios} from '../lib/cra-chicago-calibrated-model.mjs';
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} vs ${b}`);
const calc=o=>calculate({...central,...o});
test('CRA current central reproduces native chain and independent resource ledger',()=>{
 const r=calculate(),off=10000/3908692*4500*.35,done=off*.8,unmet=done*.45,event=unmet*.08*.3*.98**.5;
 close(r.native.offeredRiskPersonYears,off);close(r.native.completedCoverage,done);close(r.native.unmetTimelyCoverage,unmet);
 close(r.native.additionalTimelyAdministrations,event);close(r.native.netDeathsAverted,event*.15);
 close(r.healthLocal,.03802896948991011);close(r.resourcesLocal,-.00010722492697397817);close(r.donorPrice10,2637009.4823574596);
 // Direct state-by-state log arithmetic, not the imported crosswalk helper.
 let cash=0,pay=0;
 for(const [share,buyer] of [[.5,false],[.05,true],[.45,false]])for(const [ds,completed] of [[.8,true],[.2,false]])for(const [bs,burden] of [[.2,true],[.8,false]]){
  const n=off*share*ds*bs,loss=burden?-5:0,saving=buyer&&completed?15:0;
  cash+=n*.95*.5*(Math.log1p(loss/25000)+Math.log1p(saving/(25000+loss)));
  pay+=n*.95*.5*Math.log1p((burden?-5:0)/(25000+loss+saving));
 }
 close(r.cashEquivalentLocal,cash);close(r.payEquivalentLocal,pay);
 close(r.combinedLocal,r.healthLocal+cash+pay);assert.equal(r.comprehensiveGrossPrice10,null);assert.equal(r.wholePortfolioCombined,null);
});
test('CRA survival area matches independent midpoint quadrature including 100% mortality',()=>{
 for(const o of [{},{survivalYears:1},{survivalYears:55},{discount:0},{firstYearMortality:1}]){
  const p={...central,...o};let s=1,q=0;const slices=10000;
  for(let y=0;y<p.survivalYears;y++){
   const m=y===0?p.firstYearMortality:y<10?p.year2to10Mortality:y<25?p.year11to25Mortality:p.laterMortality;
   if(m===1){s=0;continue;}
   const hazard=-Math.log(1-m);
   for(let j=0;j<slices;j++){const t=(j+.5)/slices;q+=s*Math.exp(-hazard*t)/(1+p.discount)**(y+t)/slices;}
   s*=1-m;
  }
  const r=survivalTail(p);close(r.healthyYearsPerDeath,q*p.utility,1e-8);close(r.survivalAtCap,s);
 }
});
test('CRA current scenarios preserve signed outcomes, unknowns, units and accounting boundaries',()=>{
 assert.ok(Object.keys(cases).length>=40);
 for(const o of Object.values(cases)){const r=calc(o);if(r.combinedLocal!==null)close(r.combinedLocal,r.healthLocal+r.resourcesLocal);if(r.donorPrice10!==null)close(r.donorPrice10*r.combinedLocal,10*({...central,...o}).gift);}
 const c=calculate();assert.deepEqual(calc(cases.unitReexpression),c);
 for(const id of ['zeroGift','zeroFunding','zeroReach']){const r=calc(cases[id]);assert.equal(r.combinedLocal,0);assert.equal(r.donorPrice10,null);}
 for(const id of ['unknownReachZero','unknownFundingZero','clinicalUnknown','unknownClinicalZero','cashUnknown','payUnknown','unknownZeroRisk','unknownZeroTimeliness'])assert.equal(calc(cases[id]).combinedLocal,null,id);
 for(const id of ['unknownZeroRisk','unknownZeroTimeliness']){const r=calc(cases[id]);assert.equal(r.native.additionalTimelyAdministrations,null);assert.equal(r.healthLocal,null);assert.ok(r.resourcesLocal<0);}
 assert.throws(()=>calc({deathReduction:.5,commonAliveShare:.7}));
 assert.throws(()=>calc({deathReduction:-.5,commonAliveShare:.7}));
 assert.doesNotThrow(()=>calc({deathReduction:.5,commonAliveShare:.5}));
 close(calc(cases.doubleDistinct).native.offeredRiskPersonYears,2*c.native.offeredRiskPersonYears);
 assert.equal(calc(cases.zeroLocalUnknown).combinedLocal,0);assert.equal(calc(cases.knownNoResources).resourcesLocal,0);
 assert.ok(calc(cases.clinicalAdverse).healthLocal<0);assert.ok(calc(cases.negativeEconomic).resourcesLocal<c.resourcesLocal);
 assert.ok(calc(cases.positiveEconomic).resourcesLocal>c.resourcesLocal);
 for(const id of ['buyerOnly','freeOnly']){const r=calc(cases[id]);assert.equal(r.native.netDeathsAverted,0);assert.ok(r.healthLocal<0);}
 assert.equal(calc(cases.clinicalNull).healthLocal,0);
 const gross=calc(cases.grossResource25);close(gross.combinedLocal,c.combinedLocal);close(gross.capturedGrossPrice10,1.25*c.donorPrice10);
 const settled=calc(cases.settlementCostOnly);close(settled.combinedLocal,c.combinedLocal);close(settled.native.offeredRiskPersonYears,c.native.offeredRiskPersonYears);
});
test('CRA strict public input contract rejects nonfinite, incomplete and unsupported inputs',()=>{
 for(const p of [null,[],{},Object.assign(Object.create({}),central),{...central,extra:1},{...central,gift:NaN},{...central,gift:Infinity},{...central,otherwiseFree:.99},{...central,survivalYears:1.5},{...central,baseline:1000,medicalCashUSD:-2000}])assert.throws(()=>calculate(p));
});
test('CRA portable engine retains all 16 original historical cases exactly',()=>{
 const frozen=JSON.parse(fs.readFileSync(new URL('../data/chicago/cra-pre-recalibration-model.json',import.meta.url)));
 assert.equal(Object.keys(historicalScenarios).length,16);
 for(const row of frozen.model.scenarios){const p=JSON.parse(row.assumptions.slice(0,row.assumptions.indexOf('};')+1)),r=historical({...historicalCentral,...historicalScenarios[row.id]});
  assert.deepEqual(p,{...historicalCentral,...historicalScenarios[row.id]});close(r.cost,row.costUSD);close(r.all,row.allPopulationQalys);close(r.local,row.editionQalys);
  if(r.price!==null)close(r.price,Number(row.assumptions.split('price10=')[1]));else assert.ok(row.assumptions.endsWith('price10=undefined for nonpositive QALYs'));
 }
});

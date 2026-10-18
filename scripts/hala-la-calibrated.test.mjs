import test from 'node:test';
import assert from 'node:assert/strict';
import {central,cases,calculate,historicalCase,historicalScenarios} from '../lib/hala-la-calibrated-model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} vs ${b}`);
const run=v=>calculate({...central,...v});
test('HALA accepted conditional central separates clinical and signed resources',()=>{
 const o=run({});
 close(o.native.giftSupportedRedeemedUSD,1032.4572837291182);
 close(o.native.recipientEquivalentYears,4.301905348871326);
 close(o.healthLocal,.0016769328242756606);
 close(o.cashEquivalentLocal,.008479577468463971);
 close(o.payEquivalentLocal,-.00020668850875239352);
 close(o.resourcesLocal,.008272888959711577);
 close(o.combinedLocal,.009949821783987237);
 close(o.donorPrice10,10050431.271134442);
 close(o.healthPrice10,59632680.89954307);
 close(o.grossPrice10,10241596.57798236);
 close(o.rawNetConsumptionAndCashPV_LocalUSD,593.3598491715215);
 close(o.rawActualCashOutlayPV_LocalUSD,-20.770087131459026);
 close(o.rawPayPV_LocalUSD,-10.385043565729513);
 assert.equal(o.wholePortfolioCombined,null);
 assert.equal(o.wholePortfolioHealth,null);
 assert.equal(Object.hasOwn(o,'rawCashPV_LocalUSD'),false);
});
test('all40 current cases have independently reproduced flow welfare and clinical arithmetic',()=>{
 assert.equal(Object.keys(cases).length,40);
 for(const v of Object.values(cases)){
  const p={...central,...v},o=calculate(p);
  for(const [key,flows] of [['cashEquivalentLocal',o.cashFlows],['payEquivalentLocal',o.payFlows]]){
   if(flows===null){assert.equal(o[key],null);continue;}
   const q=flows.reduce((sum,f)=>sum+.5*f.people*Math.log1p(f.annualIncomeGainUSD/f.annualIncomeBeforeUSD)*f.editionShare*f.independentShare/(1+f.discountRate)**f.delayYears,0);
   close(o[key],q);
  }
  if(o.healthAll!==null&&o.native.recipientEquivalentYears!==null){
   let area=0;for(let y=0;y<Math.ceil(p.healthYears);y++)area+=Math.min(1,p.healthYears-y)/(1+p.discount)**(p.clinicalDelay+y);
   close(o.healthAll,o.native.dietExpansionTransferUSD*p.healthPerUnit/p.healthUnit*area-o.native.recipientEquivalentYears*p.attemptHarm);
  }
  if(o.combinedLocal!==null)close(o.combinedLocal,o.healthLocal+o.resourcesLocal);
 }
});
test('known no-exposure yields zero outlay even with unknown resource amounts',()=>{
 for(const v of [{gift:0},{funding:0},{redeemedScale:0}]){
  const o=run({...v,resourceKnown:false});
  assert.equal(o.rawActualCashOutlayPV_LocalUSD,0);
  assert.equal(o.combinedLocal,0);
 }
 for(const v of [cases.unknownReachZero,cases.unknownFundingZero])assert.equal(run({...v,resourceKnown:false}).rawActualCashOutlayPV_LocalUSD,null);
 for(const id of ['unknownHealthZero','unknownRecoveryZero','resourceUnknown','allUnknown'])assert.equal(run(cases[id]).combinedLocal,null);
 assert.equal(run(cases.zeroLocalUnknown).combinedLocal,0);
});
test('health units are invariant but household dispersion is a real resource assumption',()=>{
 const c=run({});
 for(const id of ['doubleHealthUnits','halfHealthUnits']){
  const o=run(cases[id]);close(o.healthLocal,c.healthLocal);close(o.resourcesLocal,c.resourcesLocal);close(o.donorPrice10,c.donorPrice10);assert.deepEqual(o.native,c.native);
 }
 assert.notEqual(run(cases.concentratedIncidence).resourcesLocal,c.resourcesLocal);
 const longer=run(cases.clinicalPersistence);assert.ok(longer.healthLocal>c.healthLocal);close(longer.resourcesLocal,c.resourcesLocal);
});
test('restricted food is not cash; signed losses survive positive overlap exclusion',()=>{
 const o=run(cases.fullPositiveOverlap);
 assert.ok(o.payEquivalentLocal<0);
 assert.ok(o.rawActualCashOutlayPV_LocalUSD<0);
 assert.ok(run(cases.negativeWork).payEquivalentLocal<run({}).payEquivalentLocal);
 const free=run(cases.otherwiseFreeOnly);assert.equal(free.native.dietExpansionTransferUSD,0);assert.ok(free.healthLocal<0);assert.ok(free.resourcesLocal<0);
 assert.ok(run(cases.qualifyingCost).resourcesLocal<run({}).resourcesLocal);
 const gross=run(cases.grossOnlyAccounting),c=run({});assert.deepEqual(gross.native,c.native);assert.equal(gross.donorPrice10,c.donorPrice10);assert.ok(gross.grossPrice10>c.grossPrice10);
});
test('historical price remains historical and all13 historical cases retain signs/unknowns',()=>{
 assert.equal(Object.keys(historicalScenarios).length,13);
 close(historicalCase({}).price,9772603.745817116);
 assert.notEqual(historicalCase({}).price,run({}).donorPrice10);
 assert.equal(historicalCase(historicalScenarios.adverse).local,-1);
 assert.equal(historicalCase(historicalScenarios['portfolio-unknown']).local,null);
});
test('strict domains reject invalid, unknown-key, inherited and over-cap inputs',()=>{
 for(const v of [{gift:25001},{baseline:NaN},{healthYears:4},{substitution:1.1},{supportCost:0},{resourceKnown:0},{extra:1},{travelUSD:-1},{grossResources:100000}])assert.throws(()=>run(v));
 assert.throws(()=>calculate(Object.create(central)));
 assert.throws(()=>calculate(null));
});

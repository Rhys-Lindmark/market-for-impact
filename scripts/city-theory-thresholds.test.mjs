import{test}from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';
import{discountedSurvivalQalys}from'../lib/naloxone-model.mjs';
const read=name=>JSON.parse(fs.readFileSync('data/san-francisco/'+name));
const central=m=>m.scenarios.find(s=>/central/i.test(s.name));
const near=(a,b,tolerance)=>assert.ok(Math.abs(a-b)<tolerance,a+' differs from '+b);
test('city theory PHC one-way thresholds remain aligned with the source model',()=>{
 const c=central(read('phc-glasses-cea-v1.json'));
 near(10000*c.utilityGain*c.effectiveUseYears*c.additionality,140.63,.0051);
 near(10*c.costPerDispensedPair/(100000*c.effectiveUseYears*c.additionality),.02667,.00001);
 near(10*c.costPerDispensedPair/(100000*c.utilityGain*c.additionality),.533,.001);
});
test('city theory SFAF acute-survival threshold is not reported reversals treated as deaths',()=>{
 const m=read('sfaf-naloxone-cea-v1.json'),c=central(m);
 const p=10*c.costPerDose/(100000*(m.reported.reversals/m.reported.doses)*c.marginalYieldRetention*discountedSurvivalQalys(c));
 near(100*p,1.1266,.0001);assert.ok(p<c.additionalSurvivalPerReversal);
});
test('city theory housing and youth ceilings use the ten-QALY denominator',()=>{
 const g=read('glide-rental-assistance-qaly-bridge-audit-v1.json');
 near(g.modeledBridge.modeledDonorCostPerAssistedHouseholdUsd.best/10000,.3077,.000001);
 const c=central(read('united-playaz-cea-v1.json'));
 const needed=10*c.annualPlaceCost/(100000*c.discountedQalysPerDeath);
 near(needed,.05,.000001);assert.ok(needed>c.annualFatalRisk);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,selfTest,cases} from '../lib/ymca-current-calibrated-model.mjs';
test('All 27 finite candidate cases pass after explicit incidence declarations',()=>{
 const result=selfTest();assert.equal(result.caseCount,27);assert.equal(result.assertions,50);
 assert.equal(result.all.central.geography.bayIncludingSF.donorUSDPer10CombinedEquivalentYears,12880638.589393906);
 assert.equal(result.all.central.geography.sf.donorUSDPer10CombinedEquivalentYears,19816367.060606007);
 assert.equal(result.all.central.ordinaryGiftExpectedValue,null);assert.equal(result.all.central.grossResourceUSD,null);
});
test('Same-household cross-route gains/costs cannot be separately logged implicitly',()=>{
 const routes={family:{accessSaving:1000},youth:{fees:1000}};
 assert.throws(()=>calculate({routes}),/Cross-route household/);
 const disjoint=calculate({routes,disjointHouseholdRoutes:['family','youth']});
 assert.equal(disjoint.householdIncidence.status,'explicit unverified disjoint-household hypothesis');
 assert.throws(()=>calculate({routes,disjointHouseholdRoutes:['family']}),/every and only/);
 assert.throws(()=>calculate({routes,disjointHouseholdRoutes:['family','family']}),/Bounded disjoint/);
 assert.throws(()=>calculate({routes,disjointHouseholdRoutes:['family','youth','mental']}),/every and only/);
 const within=calculate({routes:{family:{accessSaving:1000,fees:1000}}});assert.equal(within.routes.family.incomeEquivalentYears,0);
});
test('All negative burdens survive conditional disjoint accounting, including induced failures',()=>{
 const burdens=calculate(cases.participationBurdens);
 assert.equal(burdens.householdIncidence.activeCashRoutes.length,7);
 assert.ok(burdens.geography.bayIncludingSF.incomeEquivalentYears<0);
 for(const r of Object.values(burdens.routes))assert.equal(r.netHouseholdAnnualResourcesUSD,-60);
 assert.throws(()=>calculate({...cases.participationBurdens,disjointHouseholdRoutes:[]}),/Cross-route household/);
 const routes={family:{accessSaving:100,positiveResourceIndependentShare:0,travel:20}};
 assert.equal(calculate({routes}).routes.family.netHouseholdAnnualResourcesUSD,-20);
 assert.throws(()=>calculate({routes,inducedHouseholds:1,inducedNetResources:-100}),/Cross-route household/);
 const explicit=calculate({routes,inducedHouseholds:1,inducedNetResources:-100,disjointHouseholdRoutes:['family','induced']});
 assert.ok(explicit.inducedIncomeEquivalentYears<0);
});
test('Disjoint cash declarations do not invent funding, health, local scope or complete gross cost',()=>{
 const r=calculate(cases.feeReliefNoNewClinicalAccess);assert.equal(r.routes.aquatics.clinicalHealthyYears,0);assert.ok(r.routes.aquatics.incomeEquivalentYears>0);
 assert.equal(r.grossResourceUSD,null);
 assert.throws(()=>calculate({disjointHouseholdRoutes:['family']}),/every and only/);
 assert.throws(()=>calculate({disjointHouseholdRoutes:true}),/Bounded disjoint/);
 assert.throws(()=>calculate({routes:{fitness:{healthYears:2}}}),/integrated/);
});
test('Positive clinical route additions require exact distinct-increment hypotheses',()=>{
 assert.throws(()=>calculate({distinctClinicalRoutes:[]}),/Overlapping positive clinical/);
 assert.throws(()=>calculate({routes:{mental:{healthPerUnit:.02}}}),/every and only active positive/);
 const supported=calculate(cases.therapyConditional);
 assert.equal(supported.clinicalIncidence.status,'explicit unverified distinct clinical-increment hypothesis');
 assert.deepEqual(supported.clinicalIncidence.activePositiveRoutes,['fitness','mental','dpp']);
 for(const declared of [['fitness'],['fitness','dpp','dpp'],['fitness','dpp','unknown']])assert.throws(()=>calculate({distinctClinicalRoutes:declared}));
});
test('Clinical incidence restrictions never attenuate negative utility or independent harms',()=>{
 const r=calculate(cases.negativeClinical);assert.ok(r.routes.mental.clinicalHealthyYears<0);assert.ok(r.routes.family.clinicalHealthyYears<0);
 const independent=calculate(cases.nullWithIndependentHarm);
 assert.equal(independent.geography.sf.clinicalHealthyYears,-.1);
 assert.equal(independent.geography.restBay.clinicalHealthyYears,-.1);
 assert.deepEqual(independent.clinicalIncidence.activePositiveRoutes,[]);
 const negativeOnly=calculate({distinctClinicalRoutes:[],routes:{fitness:{healthPerUnit:-.01},dpp:{healthPerUnit:0}}});
 assert.ok(negativeOnly.geography.bayIncludingSF.clinicalHealthyYears<0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {cases,calculate,selfTest,householdPeriodLedger} from '../lib/newdoor-current-model.mjs';
const base=()=>structuredClone(cases[1]);
test('All13 bounded worlds and positive-row netting retain signed reference harms',()=>{
 assert.equal(selfTest().cases,13);const r=calculate(base());assert.ok(Math.abs(r.bayIncludingSfCombinedHealthyYearEquivalent-(-.06496831924402402))<1e-12);assert.equal(r.bayUsdPer10ConditionalCombinedHealthyYearEquivalent,null);assert.equal(r.ordinaryDonationExpectedValue,null);
});
test('No overlap parameter can shrink negative clinical effects or resource rows',()=>{
 const s=base();s.health.utilityGain=-.0025;s.health.independentShare=0;s.income.independentShare=0;
 const r=calculate(s);assert.ok(r.causedHealthQaly<0);assert.ok(r.causedIncomeHealthyYearEquivalent<0);
 const a=householdPeriodLedger(s.income.periods[0],3,0),b=householdPeriodLedger(s.income.periods[0],3,1);
 for(let i=0;i<a.branches.length;i++)assert.deepEqual(a.branches[i].signedResourceRows.filter(v=>v<0),b.branches[i].signedResourceRows.filter(v=>v<0));
});
test('Same-household equal cash rows cancel once before log at full independence',()=>{
 const p={years:.5,delayYears:0,discountRate:.03,baselineAnnualHouseholdResourcesUsd:24000,branches:[{probability:1,paidHours:100,hourlyWageUsd:1,taxShare:0,benefitDisplacementShare:0,counterfactualTakeHomeUsd:100,uncoveredTravelChildcareUsd:0,otherHouseholdNetChangeUsd:0,incrementalTimeHours:0,timeValueUsd:0}]};
 assert.equal(householdPeriodLedger(p,3,1).healthyYearEquivalentPerOfferedHousehold,0);assert.ok(householdPeriodLedger(p,3,.75).healthyYearEquivalentPerOfferedHousehold<0);
});
test('Donation domain, partial-null nonfinite health and exact harm keys reject',()=>{
 for(const change of [s=>s.budgetUsd=100001,s=>{s.health.utilityGain=null;s.health.effectiveYears=NaN},s=>delete s.independentGiftHarm.restBay,s=>s.independentGiftHarm.extra=0]){const s=base();change(s);assert.throws(()=>calculate(s));}
 const s=base();s.budgetUsd=0;s.independentGiftHarm.sf=.001;assert.equal(calculate(s).sfCombinedHealthyYearEquivalent,0);
});
test('True zero household exposure suppresses only affected income, not independent harms',()=>{
 const s=base();s.income.uniqueHouseholdsPerOfferedPlace=0;s.independentGiftHarm.sf=.001;
 const r=calculate(s);assert.ok(r.causedIncomeHealthyYearEquivalent===0);assert.ok(Math.abs(r.sfCombinedHealthyYearEquivalent-(r.causedHealthQaly*.45-.001))<1e-12);
});
test('Finite half-year flow and three-year tail discount occur once',()=>{
 const p=structuredClone(base().income.periods[0]);p.discountRate=.03;p.delayYears=1;p.branches=[{...p.branches[0],probability:1,paidHours:0,taxShare:0,benefitDisplacementShare:0,counterfactualTakeHomeUsd:0,uncoveredTravelChildcareUsd:0,incrementalTimeHours:0,otherHouseholdNetChangeUsd:100}];
 const expected=.5*3*.5/1.03*Math.log1p(200/24000);assert.ok(Math.abs(householdPeriodLedger(p,3,1).healthyYearEquivalentPerOfferedHousehold-expected)<1e-12);
 p.years=3;p.delayYears=.5;const weight=[.5,1.5,2.5].reduce((a,t)=>a+1.03**(-t),0);const tail=.5*3*weight*Math.log1p((100/3)/24000);assert.ok(Math.abs(householdPeriodLedger(p,3,1).healthyYearEquivalentPerOfferedHousehold-tail)<1e-12);
});
test('Annual budget and benefits scale together, with nested regional signed accounting',()=>{
 const a=calculate(base()),b=calculate(cases.find(s=>s.scope==='annualWork'));assert.equal(b.donorCostUsd,null);assert.equal(b.annualWorkBudgetUsd,6505120);assert.ok(Math.abs(b.causedIncomeHealthyYearEquivalent/a.causedIncomeHealthyYearEquivalent-65.0512)<1e-10);
 const s=base();s.sfResidentShare=.35;s.bayResidentShare=.8;const r=calculate(s);assert.ok(Math.abs(r.sfCombinedHealthyYearEquivalent+r.restBayCombinedHealthyYearEquivalent-r.bayIncludingSfCombinedHealthyYearEquivalent)<1e-12);
});

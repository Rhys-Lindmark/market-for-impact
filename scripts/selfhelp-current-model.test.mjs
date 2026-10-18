import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,cases,calculate} from '../lib/selfhelp-current-model.mjs';
const copy=x=>JSON.parse(JSON.stringify(x));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),a+' vs '+b);
test('Nineteen finite Self-Help hypotheses preserve both exact initial diagnostic boundaries',()=>{
 assert.equal(cases.length,19);assert.equal(new Set(cases.map(s=>s.id)).size,19);
 const results=cases.map(calculate);
 assert.equal(results.find(r=>r.id==='legacyEndpointBridgeDiagnostic').sf.usdPerBetterLife,2400000);
 assert.equal(results.find(r=>r.id==='integratedHealthOnlyDiagnostic').sf.usdPerBetterLife,600000);
 const ref=results[0];near(ref.sf.usdPerBetterLife,643436.4146344183);
 assert.ok(ref.sf.healthQaly>0);assert.ok(ref.sf.incomeEquivalentYears<0);
 for(const r of results){assert.equal(r.ordinaryDonationExpectedValue,null);assert.equal(r.fullSocialResourceCostUsd,null);assert.equal(r.weightedExpectedValue,null);}
});
test('Integrated clinical increment is counted once, with finite midpoint/activation discount only',()=>{
 const r=calculate();near(r.clinicalPerOfferedCourse,.04*.5/(1.03**.25));
 const delayed=calculate(cases.find(s=>s.id==='oneYearActivationDelay'));
 near(delayed.sf.healthQaly,r.sf.healthQaly/1.03);near(delayed.sf.incomeEquivalentYears,r.sf.incomeEquivalentYears/1.03);
});
test('Half-year same-household signed netting annualizes once and preserves negative rows at zero overlap',()=>{
 const r=calculate();near(r.incomeEquivalentPerOfferedCourse,.5*.5*Math.log1p((-96/.5)/40000));
 assert.equal(r.netCashUsdPerOfferedHousehold,-48);assert.equal(r.netOverlapAdjustedResourceUsdPerOfferedHousehold,-96);
 const zeroPositive=calculate(cases.find(s=>s.id==='negativeResourcesNoPositiveIndependence'));
 assert.equal(zeroPositive.sf.incomeEquivalentYears,r.sf.incomeEquivalentYears);
 assert.equal(calculate(cases.find(s=>s.id==='equalGrossCashRows')).sf.incomeEquivalentYears,0);
 assert.ok(calculate(cases.find(s=>s.id==='equalRowsPartialPositiveCredit')).sf.incomeEquivalentYears<0);
 const negative=calculate(cases.find(s=>s.id==='negativeClinicalEffect'));assert.ok(negative.sf.healthQaly<0);assert.equal(negative.sf.usdPerBetterLife,null);
});
test('Independent harms survive no additional course; zero budget cannot cause gift-specific harm',()=>{
 const zero=calculate(cases.find(s=>s.id==='zeroAdditionalServices'));assert.equal(zero.sf.combinedEquivalentYears,0);assert.equal(zero.sf.usdPerBetterLife,null);
 const s=copy(cases.find(s=>s.id==='independentGiftHarm'));assert.equal(calculate(s).sf.combinedEquivalentYears,-.001);s.budgetUsd=0;assert.equal(calculate(s).sf.combinedEquivalentYears,0);
});
test('Annual allocation scales modeled courses coherently while unassessed costs remain counted',()=>{
 const base=calculate(),annual=calculate(cases.find(s=>s.id==='annualWorkTenPercentCourseHypothesis'));
 assert.equal(annual.donorCostUsd,null);assert.equal(annual.annualWorkBudgetUsd,33282597);
 near(annual.sf.combinedEquivalentYears/base.sf.combinedEquivalentYears,33282597*.1/100000);
 near(annual.sf.usdPerBetterLife/base.sf.usdPerBetterLife,10);
 const small=calculate(cases.find(s=>s.id==='smallerTranche'));near(small.sf.combinedEquivalentYears/base.sf.combinedEquivalentYears,.1);near(small.sf.usdPerBetterLife,base.sf.usdPerBetterLife);
 const residence=calculate(cases.find(s=>s.id==='outsideSFResidence'));near(residence.sf.combinedEquivalentYears+residence.restBayCombinedEquivalentYears,residence.bay.combinedEquivalentYears);
});
test('Invalid budgets, log domains, partial harm keys, residence and nonfinite inputs reject',()=>{
 for(const edit of [s=>s.budgetUsd=100001,s=>s.household.annualResourcesUsd=0,s=>s.household.incrementalTravelCareUsd=100000,s=>s.sfResidentShare=1.1,s=>s.bayResidentShare=.1,s=>delete s.independentGiftHarms.restBay,s=>s.integratedTrialQaly=NaN,s=>s.household.netTakeHomeGainUsd=NaN,s=>s.household.years=0,s=>s.serviceAdditionality=2]){const s=copy(defaults);edit(s);assert.throws(()=>calculate(s));}
});

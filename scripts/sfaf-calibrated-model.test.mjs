import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
// Installed scripts/ location uses normal imports. Isolated /tmp execution adapts
// import URLs in memory only, reusing the owner's frozen checkout; no copies.
const installed=new URL('../lib/sfaf-calibrated-model.mjs',import.meta.url);
let module;
if(fs.existsSync(installed))module=await import(installed.href);
else {
 const local=new URL('./sfaf-calibrated-model.mjs',import.meta.url);
 const repo=process.env.SFAF_TEST_REPO||process.cwd();
 const engine=pathToFileURL(path.join(repo,'lib/sfaf-portfolio-model.mjs')).href;
 const data=pathToFileURL(path.join(repo,'data/san-francisco/sfaf-portfolio-model-v1.json')).href;
 const source=fs.readFileSync(local,'utf8').replace("'./sfaf-portfolio-model.mjs'",JSON.stringify(engine)).replace("'../data/san-francisco/sfaf-portfolio-model-v1.json'",JSON.stringify(data));
 module=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
const {calculate,defaultInputs,scenarios,diagnostics}=module;
const near=(a,b,tol=1e-12)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const quad=(h,b,C,H,u,r,d)=>{
 const n=100000,dt=H/n;let q=0;
 for(let j=0;j<n;j++){const t=(j+.5)*dt;q+=u*(Math.exp(-h*t+b*Math.min(t,C))-Math.exp(-h*t))/(1+r)**(t+d)*dt;}
 return q;
};
test('independent quadrature reconstructs finite clinical central',()=>{
 const x=calculate(),od=quad(.07,.005,1,15,.7,.03,.25),prep=quad(.02,.00215,1,20,.08,.03,.25);
 near(x.clinical.od_qaly_per_incremental_person,od,1e-10);
 near(x.clinical.prep_qaly_per_incremental_person,prep,1e-10);
 near(x.healthYears,20*od+(100000*.2/700*.3*.9)*prep,1e-9);
 near(x.bayEquivalentYears,.5189791509372967);
 near(x.sfEquivalentYears,.4954111838561661);
 near(x.bayUsdPerBetterLife,1926859.6786479007);
 near(x.sfUsdPerBetterLife,2018525.2828089814);
 assert.equal(x.incomeEquivalentYears,0);assert.equal(x.recipientBurdenYears,0);
});
test('one resource window at calendar midpoint, before clinical dedup',()=>{
 const x=calculate({prepNetResourceUsd:150}),n=100000*.2/700*.3*.25;
 const i=n*.5*Math.log1p(150/50000)/(1.03)**.75;
 near(x.resourceRecipients,n);near(x.incomeEquivalentYears,i);
 near(i,.0031391056361780387);
 near(calculate({prepNetResourceUsd:150,prep_disjoint_fraction:0}).incomeEquivalentYears,i);
 near(calculate({prepNetResourceUsd:150,prep_horizon_years:5}).incomeEquivalentYears,i);
 near(x.bayUsdPerBetterLife,1915850.844737648);
});
test('independent clinical-null income-only and signed negative resources',()=>{
 const x=calculate({od_rescue_increment:0,prep_extra_coverage_fraction:0,prepNetResourceUsd:150});
 assert.equal(x.healthYears,0);assert.ok(x.incomeEquivalentYears>0);near(x.combinedYears,x.incomeEquivalentYears);
 const y=calculate({od_rescue_increment:0,prep_extra_coverage_fraction:0,prepNetResourceUsd:-100});
 near(y.incomeEquivalentYears,-.002097973302545776);assert.ok(y.combinedYears<0);assert.equal(y.bayUsdPerBetterLife,null);
});
test('literal no-change vs actually induced failed applicant costs',()=>{
 const zero={od_funding_additionality:0,prep_funding_additionality:0};
 const x=calculate(zero);assert.equal(x.combinedYears,0);assert.equal(x.allUsdPerBetterLife,null);
 const y=calculate({...zero,applicantExposureAdditionality:.25});
 near(y.exposedApplicants,100000*.2/700*.25);
 near(y.recipientBurdenYears,(100000*.2/700*.25)*.5*(-Math.log1p(-50/50000))/(1.03)**.25);
 near(y.combinedYears,-.003546907807288389);assert.equal(y.sfUsdPerBetterLife,null);
});
test('portfolio assignment once on all signed effects including clinical harm',()=>{
 const o={prepNetResourceUsd:-100,applicantExposureAdditionality:.25,independent_harm_qaly:.01};
 const a=calculate(o),b=calculate({...o,portfolioAssignment:.4});
 for(const key of ['healthYears','incomeEquivalentYears','recipientBurdenYears','combinedYears','bayEquivalentYears','sfEquivalentYears'])near(b[key],a[key]*.4);
 const z=calculate({...o,portfolioAssignment:0});
 assert.equal(z.combinedYears,0);assert.equal(z.bayUsdPerBetterLife,null);
});
test('independent gift-induced clinical harm survives failed funding',()=>{
 const x=calculate({od_funding_additionality:0,prep_funding_additionality:0,independent_harm_qaly:.01});
 near(x.healthYears,-.01);near(x.bayEquivalentYears,-.0098);near(x.sfEquivalentYears,-.009);assert.equal(x.allUsdPerBetterLife,null);
});
test('fee numerator and outside input payer-shift do not doublecharge',()=>{
 const a=calculate(),b=calculate({feeRate:.03});near(b.healthYears,a.healthYears);near(b.bayUsdPerBetterLife,a.bayUsdPerBetterLife*1.03);assert.equal(b.donorCostUsd,103000);
 const c=calculate({od_cash_per_offer:380,prep_cash_per_offer:1900,od_outside_resources_per_offer:0,prep_outside_resources_per_offer:0});
 assert.equal(c.grossAssociatedResourceUsd,100000);near(c.bayUsdPerBetterLife,2479620.1330082845);
});
test('regional positive overlap uses each regional minimum and preserves cash surplus',()=>{
 const x=calculate({prepNetResourceUsd:150,positiveResourceHealthOverlap:1}),a=calculate();
 near(x.bayEquivalentYears,a.bayEquivalentYears);
 const y=calculate({prepNetResourceUsd:20000,positiveResourceHealthOverlap:1,resourceBayShare:.8,resourceSfShare:.2});
 near(y.bay.overlapYears,Math.min(y.bay.incomeEquivalentYears,y.clinical.prep_net_qaly*.95));
 near(y.sf.overlapYears,Math.min(y.sf.incomeEquivalentYears,y.clinical.prep_net_qaly*.75));
 assert.ok(y.incomeEquivalentYears>y.overlapYears);
 const negative=calculate({prepNetResourceUsd:-100,positiveResourceHealthOverlap:1});
 assert.equal(negative.overlapYears,0);
 const adverseHealth=calculate({prepNetResourceUsd:150,prep_extra_coverage_fraction:-.25,positiveResourceHealthOverlap:1});
 assert.equal(adverseHealth.overlapYears,0);
});
test('separate nested geography and geography nulls',()=>{
 const x=calculate({od_sf_share:0,prep_sf_share:0,harm_sf_share:0,resourceSfShare:0,applicantSfShare:0,prepNetResourceUsd:150});
 assert.equal(x.sfEquivalentYears,0);assert.equal(x.sfUsdPerBetterLife,null);
 assert.ok(x.bayEquivalentYears>0);
 const y=calculate({resourceBayShare:0,resourceSfShare:0,prepNetResourceUsd:150});
 near(y.bayEquivalentYears,calculate().bayEquivalentYears);
});
test('signed OD/PrEP changes and shared harms are retained',()=>{
 const od=calculate({od_rescue_increment:-.1});assert.ok(od.clinical.od_net_qaly<0);assert.ok(od.combinedYears<0);assert.equal(od.allUsdPerBetterLife,null);
 const prep=calculate({prep_extra_coverage_fraction:-.25});assert.ok(prep.clinical.prep_net_qaly<0);
 const x=calculate({prep_disjoint_fraction:0,prep_harm_per_incremental_offer:.01});
 near(x.clinical.prep_net_qaly,-(100000*.2/700*.3)*.01);
});
test('gift0 gives no service effects; explicit independent harm stays independently induced',()=>{
 const x=calculate({gift_usd:0});assert.equal(x.combinedYears,0);assert.equal(x.allUsdPerBetterLife,null);
});
test('strict finite unknown domain cap and coupled validation',()=>{
 for(const o of [{typo:1},{gift_usd:100001},{gift_usd:-1},{discount:NaN},{feeRate:Infinity},{prepNetResourceUsd:-50000},{applicantBurdenUsd:50000},{baselineAnnualResources:0},{resourceSfShare:1,resourceBayShare:.5},{applicantSfShare:1,applicantBayShare:.5},{od_sf_share:1,od_bay_share:.5},{prepResourceIncidence:1.1},{portfolioAssignment:-.1},{od_rescue_increment:.3},{od_allocation:.9,prep_allocation:.2}])assert.throws(()=>calculate(o));
 for(const o of [null,[],42])assert.throws(()=>calculate(o));
 assert.doesNotThrow(()=>calculate({gift_usd:100000}));
 assert.equal(Object.isFrozen(defaultInputs),true);
});
test('diagnostics finite and unweighted; defaults immutable',()=>{
 assert.equal(scenarios().length,15);assert.equal(diagnostics().length,15);
 for(const s of scenarios())assert.ok(Number.isFinite(s.result.combinedYears));
 calculate({prepNetResourceUsd:150});assert.equal(defaultInputs.prepNetResourceUsd,0);
});

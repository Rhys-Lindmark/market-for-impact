import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const installed=new URL('../lib/melp-calibrated-model.mjs',import.meta.url);
const {calculate,defaultInputs,diagnostics,assumptionBasis,modelVersion}=await import(existsSync(installed)?installed:new URL('./melp-calibrated-model.mjs',import.meta.url));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const categories=fn=>defaultInputs.categories.map((c,i)=>fn({...c},i));
test('central independent cost/clinical/resource arithmetic',()=>{
 const r=calculate(),v=10000/(169269/(960/.28))*.75*.8,u=v*.3;
 const H=u*(.45*.4*.8*.03*.125/1.03**.0625+.30*.35*.8*.02*.125/1.03**.0625+.10*.4*.8*.01*.25/1.03**.125+.15*.25*.85*.002*.025/1.03**.0125);
 const L=u*.00015;
 const I=u*.5*(.45*.30*Math.log1p(40/50000)+.30*.35*Math.log1p(25/50000)+.10*.15*Math.log1p(100/50000)+.15*.60*Math.log1p(20/50000))/1.03**.125;
 near(r.exposedEpisodes,v);near(r.additionalEpisodes,u);near(r.healthYears,H-L);near(r.incomeEquivalentYears,I);
 near(r.totalEquivalentYears,H-L+I);near(r.bayEquivalentYears,.02745620599841785);near(r.bayUsdPerBetterLife,3642163.8155600396);near(r.sfUsdPerBetterLife,115335187.4927346);
 assert.equal(r.recipientBurdenYears,0);assert.equal(r.completeSocietalResourcesUsd,null);assert.match(modelVersion,/2026-10-01/);assert.match(assumptionBasis.clinicalBasis,/judgments/);
});
test('separate health-only and income-only ledgers',()=>{
 const h=calculate({categories:categories(c=>({...c,netSavingUsd:0}))});assert.equal(h.incomeEquivalentYears,0);near(h.bayEquivalentYears,.02354972055127745);
 const i=calculate({categories:categories(c=>({...c,utility:0})),deviceHarmYearsPerAdditionalEpisode:0});assert.equal(i.healthYears,0);near(i.bayEquivalentYears,.003906485447140396);
});
test('literal no-change and signed induced applicant failure distinct',()=>{
 const z=calculate({giftAdditionality:0,inducedApplicantExposure:0,applicantBurdenUsd:20});assert.equal(z.totalEquivalentYears,0);assert.equal(z.bayUsdPerBetterLife,null);
 const r=calculate({giftAdditionality:0,inducedApplicantExposure:1,applicantBurdenUsd:20});near(r.recipientBurdenYears,-.02422139987271909);assert.ok(r.totalEquivalentYears<0);assert.equal(r.bayUsdPerBetterLife,null);
 const failed=calculate({planRealization:0,giftAdditionality:0,inducedApplicantExposure:1,applicantBurdenUsd:20});near(failed.recipientBurdenYears,r.recipientBurdenYears);
});
test('clinical null preserves independent device harm; safe use not cash attenuation',()=>{
 const r=calculate({categories:categories(c=>({...c,safeUse:0}))});assert.equal(r.grossHealthYears,0);assert.ok(r.healthYears<0);near(r.incomeEquivalentYears,calculate().incomeEquivalentYears);
 const h=calculate({categories:categories(c=>({...c,utility:0,netSavingUsd:0}))});assert.ok(h.totalEquivalentYears<0);assert.equal(h.bayUsdPerBetterLife,null);
});
test('dedup and assignment zero remove every effect; assignment applied once',()=>{
 const o={inducedApplicantExposure:1,applicantBurdenUsd:20};for(const k of ['uniqueEpisodeFraction','portfolioAssignment'])assert.equal(calculate({...o,[k]:0}).totalEquivalentYears,0);
 const a=calculate(o),b=calculate({...o,portfolioAssignment:.5});for(const k of ['healthYears','incomeEquivalentYears','recipientBurdenYears','totalEquivalentYears'])near(b[k],a[k]*.5);
});
test('pediatric zero, alternative budget and household resource sensitivities',()=>{
 const p=calculate({categories:categories((c,i)=>i===2?{...c,utility:0,netSavingUsd:0}:c)});assert.ok(p.totalEquivalentYears<calculate().totalEquivalentYears);
 near(calculate({plannedWholeOrgExpenseUsd:166269}).bayUsdPerBetterLife,3577612.766952911);
 const low=calculate({householdResourcesUsd:25000}),high=calculate({householdResourcesUsd:100000});assert.ok(low.incomeEquivalentYears>high.incomeEquivalentYears);near(low.healthYears,high.healthYears);
});
test('income schedule differs from clinical duration and delay discounts once',()=>{
 const r=calculate(),short=calculate({categories:categories(c=>({...c,incrementalYears:0}))});near(short.incomeEquivalentYears,r.incomeEquivalentYears);
 near(calculate({receiptDelayYears:0}).incomeEquivalentYears,r.incomeEquivalentYears*1.03**.125);
});
test('independent nested health/income geography leaves donor numerator fixed',()=>{
 const r=calculate({healthBayShare:.8,healthSfShare:.2,incomeBayShare:.6,incomeSfShare:.1});near(r.bayEquivalentYears,r.healthYears*.8+r.incomeEquivalentYears*.6);near(r.sfEquivalentYears,r.healthYears*.2+r.incomeEquivalentYears*.1);
 near(r.bayUsdPerBetterLife,100000/r.bayEquivalentYears);assert.equal(calculate({healthBayShare:0,healthSfShare:0,incomeBayShare:0,incomeSfShare:0}).bayUsdPerBetterLife,null);
});
test('fees are paid from gross donor budget; zero gift finite signedzero',()=>{
 const r=calculate({paymentFeeUsd:100});near(r.totalEquivalentYears,calculate().totalEquivalentYears*.99);near(r.bayUsdPerBetterLife,calculate().bayUsdPerBetterLife/.99);
 const z=calculate({giftUsd:0});assert.equal(z.totalEquivalentYears,0);assert.equal(z.allUsdPerBetterLife,null);
});
test('reject invalid numeric values, unsupported scale and unknown fields',()=>{
 for(const bad of [NaN,Infinity,-1])assert.throws(()=>calculate({householdResourcesUsd:bad}));
 for(const o of [{giftUsd:100001},{maxSupportedGiftUsd:20000},{giftUsd:10001},{paymentFeeUsd:10001},{householdResourcesUsd:0},{incomeWindowYears:0},{applicantBurdenUsd:50000},{giftAdditionality:1.1},{districtShare:0},{healthBayShare:.5,healthSfShare:.6},{incomeBayShare:.5,incomeSfShare:.6},{surprise:1}])assert.throws(()=>calculate(o));
 for(const c of [categories(c=>({...c,netSavingUsd:-1})),categories(c=>({...c,utility:NaN})),categories(c=>({...c,incrementalYears:2})),categories((c,i)=>i===0?{...c,unmetFraction:.9,purchaserFraction:.2}:c),categories(c=>({...c,share:.1}))])assert.throws(()=>calculate({categories:c}));
});
test('diagnostic cases unweighted, reproducible and immutable',()=>{
 const ds=diagnostics();assert.equal(ds.length,13);assert.ok(ds.every(x=>!('weight'in x)));near(ds.find(x=>x.name==='central').bayEquivalentYears,calculate().bayEquivalentYears);
 assert.equal(ds.find(x=>x.name==='literal_no_change').totalEquivalentYears,0);assert.ok(ds.find(x=>x.name==='attempted_access_burden').totalEquivalentYears<0);
 const r=calculate();r.inputs.categories[0].utility=0;assert.equal(defaultInputs.categories[0].utility,.03);
});

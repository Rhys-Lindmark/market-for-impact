import test from 'node:test';import assert from 'node:assert/strict';import {existsSync} from 'node:fs';
const installed=new URL('../lib/code-tenderloin-calibrated-model.mjs',import.meta.url);
const {calculate,defaultInputs,diagnostics,scenarios}=await import(existsSync(installed)?installed:new URL('./code-tenderloin-calibrated-model.mjs',import.meta.url));
const frozenUrl=process.env.CODE_TENDERLOIN_FROZEN_MODEL??new URL('../lib/code-tenderloin-model.mjs',import.meta.url).href;
const {calculate:frozen}=await import(frozenUrl);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
test('independent clinical continuous survival formula and frozen parity',()=>{
 const p=defaultInputs,r=calculate(),h=.07,delta=.0036,d=Math.log1p(.03);
 const F=x=>x===0?1:(1-Math.exp(-x))/x;let sum=0;
 // Closed survival at eachyearstart: firstyear1, laterexp(-h*j+delta).
 for(let j=0;j<10;j++){const s0=Math.exp(-h*j),s1=j===0?1:Math.exp(-h*j+delta),h1=j===0?h-delta:h;sum+=.8*Math.exp(-d*(.25+j))*(s1*F(h1+d)-s0*F(h+d));}
 const U=(100000*.25/60/6)*.5;near(r.healthPerAdditionalPackage,sum);near(r.healthYears,U*(sum-.0005));
 const old=frozen({gift_usd:100000,peer_fraction:.25,staff_wage_usd_per_hour:27,payroll_multiplier:1.35,delivery_nonwage_usd_per_hour:23.55,worker_hours_per_offered_person_year:6,extra_resources_per_offer_usd:25,funding_additionality:.5,baseline_od_hazard:.04,other_death_hazard:.03,addressable_fraction:.1,rescue_effect:.9,utility:.8,horizon_years:10,start_delay_years:.25,discount:.03,shared_harm_q_per_offer:.0005,independent_harm_q:0,bay_share:.98,sf_share:.9});near(r.healthYears,old.all_us_q);near(r.healthYears,.564257250864699);
 assert.equal(r.schedule.length,10);assert.equal(r.schedule[0].calendarStartYears,.25);assert.equal(r.schedule[9].calendarStartYears,9.25);assert.equal(p.healthHorizonYears,10);
});
test('independent workerincome, identical additionalhours and central price',()=>{
 const r=calculate(),W=100000*.25/60,Wa=W*.5,n=Wa/1000,g=27*.8-10*.8-3-2,I=n*.5*Math.log1p(1000*g/25000)/1.03**.75;
 near(r.fundedWorkerHours,W);near(r.additionalWorkerHours,Wa);near(r.additionalPackages*6,Wa);near(r.workerEquivalents*1000,Wa);
 near(r.netHourlyIncome,8.6);near(r.attributedNetWorkerDollars,1791.666666666667);near(r.incomeEquivalentYears,I);near(r.incomeEquivalentYears,.030121672852722978);
 near(r.combinedYears,.594378923717422);near(r.bayUsdPerBetterLife,1716763.7050172826);near(r.sfUsdPerBetterLife,1869364.923241041);assert.equal(r.completeSocietalResourcesUsd,null);
});
test('one,half,quarteryear jobs preserve totalhours without repeating income',()=>{
 for(const t of [1,.5,.25]){const r=calculate({jobYears:t});near(r.workerEquivalents*1000*t,208.33333333333334);near(r.incomeMidpointYears,.25+t/2);near(r.incomeEquivalentYears,208.33333333333334/1000*.5*Math.log1p(8600/25000)/1.03**(.25+t/2));near(r.healthYears,calculate().healthYears);}
 near(calculate({jobYears:.25}).sfUsdPerBetterLife,1868309.584622937);
});
test('clinical horizon and lag do not extend wagewindow or doublediscount',()=>{
 near(calculate({healthHorizonYears:1}).incomeEquivalentYears,calculate().incomeEquivalentYears);
 const delayed=calculate({startDelayYears:1.25}),base=calculate();near(delayed.incomeEquivalentYears,base.incomeEquivalentYears/1.03);near(delayed.grossHealthYears,base.grossHealthYears/1.03);
});
test('netincome zero and negative preserved independently from clinicalhealth',()=>{
 const z=calculate({counterfactualWageUsdPerHour:20.75});assert.equal(z.incomeEquivalentYears,0);near(z.healthYears,calculate().healthYears);
 near(calculate({benefitOffsetUsdPerHour:13.6,workCostUsdPerHour:0}).incomeEquivalentYears,0);
 const n=calculate({counterfactualWageUsdPerHour:30,addressableFraction:0,sharedHarmYearsPerAdditionalPackage:0});assert.ok(n.incomeEquivalentYears<0);assert.ok(n.combinedYears<0);assert.equal(n.sfUsdPerBetterLife,null);
});
test('literal nochange versus newly induced failedapplicant costs',()=>{
 const z=calculate({fundingAdditionality:0,applicantBurdenUsd:200});assert.equal(z.combinedYears,0);assert.equal(z.sfUsdPerBetterLife,null);
 const n=calculate({fundingAdditionality:0,inducedApplicantExposure:1,applicantBurdenUsd:200});near(n.recipientBurdenYears,-.00166104898405565);assert.equal(n.additionalWorkerHours,0);assert.equal(n.healthYears,0);assert.equal(n.incomeEquivalentYears,0);assert.equal(n.sfUsdPerBetterLife,null);
 near(n.recipientBurdenYears,-(416.6666666666667/1000)*.5*(-Math.log1p(-200/25000))/1.03**.25);
});
test('clinical/rescue null does not eliminate signed sharedharm or workerpay',()=>{
 const n=calculate({addressableFraction:0,workerIncidence:0});near(n.healthYears,-.017361111111111112);assert.equal(n.sfUsdPerBetterLife,null);
 const a=calculate({rescueEffect:0}),b=calculate({healthUtility:0});near(a.incomeEquivalentYears,calculate().incomeEquivalentYears);near(b.incomeEquivalentYears,a.incomeEquivalentYears);assert.ok(a.healthYears<0);
 const i=calculate({addressableFraction:0,sharedHarmYearsPerAdditionalPackage:0});assert.equal(i.healthYears,0);assert.ok(i.incomeEquivalentYears>0);
});
test('assignment exactlyonce including independent burden and zero knobs',()=>{
 const p={inducedApplicantExposure:1,applicantBurdenUsd:200},a=calculate(p),b=calculate({...p,portfolioAssignment:.5});for(const key of ['healthYears','incomeEquivalentYears','recipientBurdenYears','combinedYears'])near(b[key],a[key]*.5);
 assert.equal(calculate({...p,portfolioAssignment:0}).combinedYears,0);assert.equal(calculate({peerFraction:0}).combinedYears,0);assert.equal(calculate({giftUsd:0}).combinedYears,0);
});
test('independent nested attribution and whole donorpaid fees',()=>{
 const r=calculate({healthBayShare:.8,healthSfShare:.2,incomeBayShare:.6,incomeSfShare:.1,inducedApplicantExposure:1,applicantBurdenUsd:200});near(r.bayEquivalentYears,r.healthYears*.8+(r.incomeEquivalentYears+r.recipientBurdenYears)*.6);near(r.sfEquivalentYears,r.healthYears*.2+(r.incomeEquivalentYears+r.recipientBurdenYears)*.1);near(r.sfUsdPerBetterLife,1000000/r.sfEquivalentYears);
 const fee=calculate({paymentFeeUsd:1000});near(fee.combinedYears,calculate().combinedYears*.99);near(fee.sfUsdPerBetterLife,calculate().sfUsdPerBetterLife/.99);assert.equal(fee.inputs.giftUsd,100000);
 const z=calculate({healthBayShare:0,healthSfShare:0,incomeBayShare:0,incomeSfShare:0});assert.equal(z.sfUsdPerBetterLife,null);
});
test('strict finite/domain/scalevalidation and signed logarithmicdomain',()=>{
 for(const bad of [NaN,Infinity,-1])assert.throws(()=>calculate({giftUsd:bad}));
 for(const p of [{giftUsd:100001},{paymentFeeUsd:100001},{peerFraction:1.1},{fundingAdditionality:-.1},{portfolioAssignment:2},{wageUsdPerHour:0},{hoursPerOfferedPackage:0},{paidHoursPerWorkerYear:0},{jobYears:0},{jobYears:2},{householdResourcesUsd:0},{healthHorizonYears:1.5},{healthHorizonYears:121},{healthSfShare:1,healthBayShare:.5},{incomeSfShare:1,incomeBayShare:.5},{applicantBurdenUsd:25000},{counterfactualWageUsdPerHour:100},{unexpected:1}])assert.throws(()=>calculate(p));
});
test('unweighted reproducible diagnostics and unchanged defaultinputs',()=>{
 assert.equal(scenarios.length,17);const ds=diagnostics();assert.ok(ds.every(s=>!('weight'in s)));near(ds.find(s=>s.name==='central').sfUsdPerBetterLife,calculate().sfUsdPerBetterLife);assert.ok(ds.find(s=>s.name==='failed_induced_applicants').combinedYears<0);
 const x=calculate();x.inputs.wageUsdPerHour=100;assert.equal(defaultInputs.wageUsdPerHour,27);
});
test('independent gift-induced health harm survives noadditionalservice and assignment once',()=>{
 const n=calculate({fundingAdditionality:0,independentGiftHealthHarmYears:.05});near(n.healthYears,-.05);assert.equal(n.sfUsdPerBetterLife,null);
 const half=calculate({fundingAdditionality:0,independentGiftHealthHarmYears:.05,portfolioAssignment:.5});near(half.healthYears,-.025);
 assert.equal(calculate({independentGiftHealthHarmYears:.05,portfolioAssignment:0}).combinedYears,0);
});

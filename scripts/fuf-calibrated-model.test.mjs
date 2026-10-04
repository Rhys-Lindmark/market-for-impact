import assert from 'node:assert/strict';
// Works isolated in /private/tmp and, unchanged, in scripts/ after root imports
// the companion model into lib/. No checkout modification or dependencies.
const {calculate,scenarios,diagnostics,central}=await import(new URL(import.meta.url.includes('/scripts/')?'../lib/fuf-calibrated-model.mjs':'./fuf-calibrated-model.mjs',import.meta.url));
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-12*Math.max(1,Math.abs(b)),`${a} != ${b}`);
function independent(o={}){
 const x={...central,...o},g=x.donorBudgetUSD/x.wholeExpenseUSD;
 let h=0;for(let age=1;age<=x.healthHorizonYears;age++)h+=(age<=5?x.portlandRateYoung:age<=10?x.portlandRateMiddle:x.portlandRateOld)*x.meanPortlandTractPopulation/1e5*x.causalRetention*x.localHealthTransfer*x.remainingQualityAdjustedYearsPerDeath*Math.pow(1+x.discountRate,-age+.5);
 const health=x.annualStreetPlantings*g*x.portfolioShare*x.treeAdditionality*(x.netNewExposureShare*h-x.healthHarmPerImplementedTree);
 const duration=x.paidWeeks/52,w=x.hourlyWageUSD*x.weeklyHours*x.paidWeeks*(1-x.counterfactualEarningsShare)*x.netResourceRetention;
 let eq=0;if(duration>0)for(let j=0;j<6;j++)eq+=(x.referenceIncomeUSD/x.healthyYearValueCG)*duration/6*Math.log(1+w/duration/x.baselineHouseholdResourcesUSD)*Math.pow(1+x.discountRate,-duration*(j+.5)/6);
 const income=x.annualGreenCrewParticipants*g*x.portfolioShare*(x.jobAdditionality*eq+x.burdenExposureShare*(x.referenceIncomeUSD/x.healthyYearValueCG)*Math.log(1-x.recipientBurdenUSD/x.baselineHouseholdResourcesUSD)*Math.pow(1+x.discountRate,-x.burdenReceiptDelayYears));
 return{health,income,total:health+income};
}
for(const [key,x]of Object.entries(scenarios)){const a=calculate(x),b=independent(x);near(a.healthYears,b.health);near(a.incomeEquivalentYears,b.income);near(a.combinedYears,b.total);assert.equal(a.costPerBetterLifeUSD===null,b.total<=0);}
const c=calculate();near(c.healthYears,.14748279238566356);near(c.incomeEquivalentYears,.004084708908121619);near(c.costPerBetterLifeUSD,6597720.431253185);
near(c.healthYearsPerPlantedTree,.03049056831579404);assert.equal(c.grossProgramWagesUSD,16623.36);assert.equal(c.netIncrementalResourcesUSD,6233.76);
assert.equal(c.healthSchedule.length,15);assert.deepEqual(c.healthSchedule.map(x=>x.rateAssociationPer100K),[...Array(5).fill(.154),...Array(5).fill(.262),...Array(5).fill(.306)]);
assert.equal(c.incomeSchedule.length,6);near(c.incomeSchedule.reduce((s,x)=>s+x.exposureYears,0),.5);assert.ok(c.incomeSchedule.every(x=>x.receiptDelayYears>0&&x.receiptDelayYears<.5));
const d=diagnostics();assert.equal(d.noFunding.status,'null');assert.equal(d.healthNull.status,'harm');assert.equal(d.adverse.status,'harm');near(d.favorable.costPerBetterLifeUSD,279165.49108394136);
near(d.zeroIncome.costPerBetterLifeUSD,6780452.036635072);near(d.cashOnly.costPerBetterLifeUSD,244815486.85432684);assert.equal(d.cautious.costPerBetterLifeUSD,null);
const b=calculate({recipientBurdenUSD:500}),failed=calculate({recipientBurdenUSD:500,jobAdditionality:0,treeAdditionality:0});near(b.recipientBurdenEquivalentYears,failed.recipientBurdenEquivalentYears);near(failed.incomeEquivalentYears,-.0009220115930543576);assert.equal(failed.status,'harm');
near(calculate({recipientBurdenUSD:500,causalRetention:0,localHealthTransfer:0,netNewExposureShare:0}).recipientBurdenEquivalentYears,b.recipientBurdenEquivalentYears);
near(calculate({netNewExposureShare:0}).healthHarmYears,c.healthHarmYears);
assert.equal(calculate({paidWeeks:0}).wageIncomeEquivalentYears,0);assert.equal(calculate({paidWeeks:0,recipientBurdenUSD:500}).status,'positive');
const half=calculate({portfolioShare:.5});near(half.healthYears,c.healthYears/2);near(half.incomeEquivalentYears,c.incomeEquivalentYears/2);near(half.costPerBetterLifeUSD,c.costPerBetterLifeUSD*2);
assert.equal(calculate({portfolioShare:0}).combinedYears,0);assert.equal(calculate({portfolioShare:0}).costPerBetterLifeUSD,null);
const geo=calculate({healthSFShare:.4,healthBayShare:.8,incomeSFShare:.5,incomeBayShare:.9});near(geo.sf.combinedYears,c.healthYears*.4+c.incomeEquivalentYears*.5);near(geo.bay.combinedYears,c.healthYears*.8+c.incomeEquivalentYears*.9);near(geo.sf.costPerBetterLifeUSD,1e6/geo.sf.combinedYears);
const zeroGeo=calculate({healthSFShare:0,healthBayShare:0,incomeSFShare:0,incomeBayShare:0});assert.equal(zeroGeo.bay.costPerBetterLifeUSD,null);
for(const x of [{treeAdditionality:1.1},{jobAdditionality:-.1},{causalRetention:NaN},{netResourceRetention:Infinity},{portfolioShare:2},{healthSFShare:1,healthBayShare:.5},{incomeSFShare:.8,incomeBayShare:.2},{baselineHouseholdResourcesUSD:0},{wholeExpenseUSD:0},{donorBudgetUSD:-1},{recipientBurdenUSD:50000},{recipientBurdenUSD:-1},{paidWeeks:27},{paidWeeks:Infinity},{weeklyHours:169},{healthHorizonYears:16},{healthHorizonYears:1.5},{discountRate:-.01},{burdenAnnualResourceWindowYears:.5}])assert.throws(()=>calculate(x),RangeError);
for(const x of [null,[],2])assert.throws(()=>calculate(x),TypeError);assert.throws(()=>calculate({establishmentSurvival:.75}),TypeError);assert.throws(()=>calculate({probabilityWeight:.3}),TypeError);
console.log('PASS: FUF independent finite age-band health, six-month net resources, annual signed burden, source/judgment boundaries, nested geography, null/harm and validation.');

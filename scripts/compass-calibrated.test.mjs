import assert from 'node:assert/strict';
import {calculate,central,diagnostics} from '../lib/compass-first-health-income-model.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const d=diagnostics(),r=d.central;
const cost=2008658/207,transfer=1095985/207;
const ranking=researchCostRanking.filter(row=>row.slug==='compass-family-services');
assert.equal(ranking.length,1); // Frozen first calibration is not today's ranking.
const cash=.5*Math.log1p(.8*transfer/50000)/1.03**.25;
close(r.cashPerCase,.0403587505191333);close(r.cashPerCase,cash);
close(r.residualPerCase,.072-cash);close(r.combinedYears,100000/cost*.072);
close(r.costPerBetterLifeUSD,1347730.8105206655);
close(d.halfOverlap.costPerBetterLifeUSD,1052693.382703);
close(d.noOverlap.costPerBetterLifeUSD,863632.052770);
close(d.cashOnly.costPerBetterLifeUSD,2404351.401104);
close(d.cautious.costPerBetterLifeUSD,14432630.835595);
close(d.favorable.costPerBetterLifeUSD,506269.326585);
close(d.loadedCost.costPerBetterLifeUSD,1592829.0774053868);
close(d.halfFunding.costPerBetterLifeUSD,2*r.costPerBetterLifeUSD);
for(const id of ['noFunding','noCompletion','noPortfolio','allNull']){
 assert.equal(d[id].combinedYears,0,id);assert.equal(d[id].costPerBetterLifeUSD,null,id);
 assert.equal(d[id].inputs.donorBudgetUSD,100000,'Costs retained');
}
assert.ok(d.replacementHarm.combinedYears<0);assert.equal(d.replacementHarm.costPerBetterLifeUSD,null);
const largeCash=calculate({baselineHouseholdResourcesUSD:25000});
assert.ok(largeCash.cashPerCase>.072);assert.equal(largeCash.residualPerCase,0);
close(largeCash.combinedYears,largeCash.cases*largeCash.cashPerCase);
const noHealth=calculate({transportedWelfareYears:0});close(noHealth.cashPerCase,cash);
const delayed=calculate({receiptDelayYears:1.25,overlapShare:0});close(delayed.cashPerCase,cash/1.03);
close(delayed.residualPerCase,.072); // VA years never discounted twice.
const exposed=calculate({completionShare:0,recipientBurdenUSD:100});assert.ok(exposed.combinedYears<0);
const harmNoOverlap=calculate({fundingAdditionality:0,recipientBurdenUSD:250,overlapShare:0});close(harmNoOverlap.recipientBurdenYears,d.replacementHarm.recipientBurdenYears);
const scaled=calculate({donorBudgetUSD:200000});close(scaled.combinedYears,2*r.combinedYears);close(scaled.costPerBetterLifeUSD,r.costPerBetterLifeUSD);
const regional=calculate({sfShare:.25,bayShare:.5});close(regional.sf.costPerBetterLifeUSD,4*r.costPerBetterLifeUSD);close(regional.bay.costPerBetterLifeUSD,2*r.costPerBetterLifeUSD);
const absent=calculate({sfShare:0,bayShare:0});assert.equal(absent.sf.costPerBetterLifeUSD,null);assert.equal(absent.bay.costPerBetterLifeUSD,null);
for(const overrides of [{donorBudgetUSD:0},{costPerCaseUSD:-1},{baselineHouseholdResourcesUSD:0},{recipientBurdenUSD:50000},{overlapShare:1.1},{completionShare:-.1},{portfolioShare:NaN},{sfShare:1,bayShare:.5},{receiptDelayYears:-1},{discountRate:Infinity},{transportedWelfareYears:-.01},{netTenantShare:-.2}])assert.throws(()=>calculate(overrides),RangeError);
console.log('PASS: Compass independent signed cash/noncash allocation, full-overlap surplus, cost/receipt timing, capacity/portfolio/geography nulls and harms.');

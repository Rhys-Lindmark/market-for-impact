import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,cases,defaults} from '../lib/vtl-ca-calibrated-model.mjs';
import {reportPrice,scenarioIncomeEquivalent,expenseAverage} from '../lib/geography-reports.mjs';
const registry=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=registry.reports.find(r=>r.edition==='california'&&r.slug==='vision-to-learn');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),a+' != '+b);
test('Independent clinical integral, household receipt and geography reproduce current central',()=>{
 const x=defaults,N=x.gift/x.cost*x.additionality,L=(1+x.discount)**(-x.delay);
 let integral=0;const steps=100000,dt=x.years/steps;
 for(let i=0;i<steps;i++)integral+=Math.exp(-Math.log1p(x.discount)*(i+.5)*dt)*dt;
 const health=N*(x.unmet*x.wear*x.utility*L*integral-x.harm*L);
 const income=.5*N*x.households*x.purchasers*Math.log1p(x.saving/x.baseline)*L;
 const c=calculate();near(c.healthYearsAll,health);near(c.incomeEquivalentYearsAll,income);
 near(c.healthYearsCA,.2322944218698827);near(c.incomeEquivalentYearsCA,.0013277521908684907);
 near(c.caUsdPerBetterLife,4280415.60703891);near(c.combinedYearsCA,(health+income)*x.ca);
 near(c.additionalCourses,166.66666666666666);
});
test('Published scenarios, income ledger, current headline and historical denominator agree',()=>{
 for(const [id,o]of Object.entries(cases)){
  const v=calculate(o),s=report.model.scenarios.find(s=>s.id===id);
  assert.ok(s,id);near(s.editionQalys,v.healthYearsCA);near(s.allPopulationQalys,v.healthYearsAll);
  near(scenarioIncomeEquivalent(s),v.incomeEquivalentYearsCA+v.inducedBurdenYearsAll*v.inputs.ca);
  const total=s.editionQalys+scenarioIncomeEquivalent(s);
  if(v.caUsdPerBetterLife===null)assert.ok(total<=0);else near(10*s.costUSD/total,v.caUsdPerBetterLife);
 }
 near(reportPrice(report),calculate().caUsdPerBetterLife);
 const old=report.model.scenarios.find(s=>s.id==='historical-prior-health-central');
 near(10*old.costUSD/old.editionQalys,2003590.9323512588);
 near(expenseAverage(report),23073076.333333332);
 assert.match(report.sections.cost,/4.28/);assert.doesNotMatch(report.sections.cost,/retains the alpha central/);
});
test('Signed resources, zero delivery, timing and external resources are independent of clinical wear',()=>{
 const c=calculate(),noWear=calculate({wear:0});
 near(noWear.incomeEquivalentYearsCA,c.incomeEquivalentYearsCA);
 assert.ok(calculate({saving:-50}).incomeEquivalentYearsCA<0);
 const failed=calculate(cases.inducedFailedAccess);
 assert.equal(failed.healthYearsCA,0);assert.ok(failed.combinedYearsCA<0);assert.equal(failed.caUsdPerBetterLife,null);
 assert.equal(calculate(cases.noFunding).combinedYearsCA,0);
 assert.equal(calculate(cases.noAssignment).combinedYearsCA,0);
 assert.equal(calculate(cases.noCA).combinedYearsCA,0);
 assert.ok(calculate(cases.adverseClinical).healthYearsCA<0);
 const gross=calculate({externalPerCourse:40});near(gross.grossResourceUSD,113333.33333333333);
 near(gross.caUsdPerBetterLife,c.caUsdPerBetterLife);assert.ok(gross.grossResourceCaUsdPerBetterLife>c.caUsdPerBetterLife);
 near(calculate({fee:.1}).caUsdPerBetterLife,c.caUsdPerBetterLife*1.1);
 assert.ok(calculate({educationShare:.05,educationGain:500}).educationIncomeYearsAll>0);
 assert.ok(calculate({educationShare:.05,educationGain:-500,educationDelay:0}).educationIncomeYearsAll<0);
});
test('Domain rejects unknown inherited keys, unbounded horizons, overlapping positive future cash and overflow',()=>{
 for(const o of [null,[],1,new Date(),{toString:1},{constructor:1},{bad:1},{gift:0},{gift:100001},{cost:0},{ca:2},{utility:2},{years:3},{educationYears:6},{educationDelay:31},{discount:2},{saving:-50000},{unmet:.99,purchasers:.05},{externalPerCourse:-1},{educationShare:.1,educationGain:500,educationDelay:0},{cost:1e-320},{ca:1e-320},{saving:Infinity}])assert.throws(()=>calculate(o),JSON.stringify(o));
});
test('Actual closed intervals imported once with source evidence and unchanged cohort sizes',()=>{
 for(const id of ['8de80fc5-2ad4-402d-aa23-9fff9065c85c','c9bc6207-33bd-4a62-a613-7fc1d25386bd']){
  const sessions=registry.sessions.filter(s=>s.id===id);assert.equal(sessions.length,1);const s=sessions[0];
  assert.ok(report.sessionIds.includes(id));assert.equal(s.organizationId,report.organizationId);assert.equal(s.model.id,'gpt-6.1-sol');
  assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));
 }
 assert.equal(registry.reports.filter(r=>r.edition==='california').length,25);
 assert.equal(registry.reports.filter(r=>r.edition==='california'&&r.stage==='beta').length,10);
});

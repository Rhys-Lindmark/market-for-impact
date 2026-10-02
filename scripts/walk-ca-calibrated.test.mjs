import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate, defaultInputs, cases} from '../lib/walk-ca-calibrated-model.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
import {readFileSync} from 'node:fs';
import {reportPrice, scenarioIncomeEquivalent, expenseAverage} from '../lib/geography-reports.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)), `${a} != ${b}`);
const midpoint=(fn,t,n=30000)=>{let sum=0;for(let i=0;i<n;i++)sum+=fn((i+.5)*t/n)*t/n;return sum;};

test('Finite clinical trajectories independently reproduce the current conditional central',()=>{
 const v=calculate(),x=defaultInputs,r=Math.log1p(x.discount),df=(1+x.discount)**-v.eventDelay;
 near(v.fatalHealth,v.fatalitiesAvoided*x.survivalUtility*midpoint(t=>Math.exp(-(r+x.hazard)*t),x.survivalYears)*df);
 near(v.injuryHealth,v.severeAvoided*(1-x.clinicalOverlapShare)*x.injuryUtility*midpoint(t=>Math.exp(-r*t),x.injuryYears)*df);
 near(v.editionQalys,(v.fatalHealth+v.injuryHealth)*x.healthCA);
 assert.ok(v.price>0);
});

test('All signed resource cases agree with the shared income crosswalk exactly once',()=>{
 for(const o of Object.values(cases)){
  const v=calculate(o),x=v.inputs;
  const convert=(people,gain,delay,geo,assignment)=>people>0?incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD:x.baseline,annualIncomeGainUSD:gain,years:1,causalShare:1,editionShare:geo,independentShare:assignment,delayYears:delay,discountRate:x.discount}):0;
  const gain=v.severeAvoided<0?-x.netReceipt:x.netReceipt;
  near(v.incomeEquivalentYears,convert(v.resourceHouseholds,gain,v.eventDelay,x.incomeCA,x.assignment));
  near(v.recipientBurdenYears,convert(x.inducedHouseholds,-x.inducedLoss,x.openingDelay,x.burdenCA,1));
  near(v.totalCA,v.editionQalys+v.incomeEquivalentYears+v.recipientBurdenYears);
  assert.equal(v.price===null,v.totalCA<=0||v.donorUSD===0);
 }
});

test('Changing income sign cannot silently change the clinical cohort',()=>{
 const central=calculate(),zero=calculate(cases.zeroIncome),loss=calculate(cases.resourceLoss);
 near(central.editionQalys,zero.editionQalys);near(central.editionQalys,loss.editionQalys);
 assert.ok(central.price<zero.price);assert.ok(loss.price>zero.price);
 const coexist=calculate(cases.physicalCashCoexistence);
 near(coexist.incomeEquivalentYears,central.incomeEquivalentYears);
 assert.ok(coexist.editionQalys>central.editionQalys);
 assert.ok(calculate(cases.injuryHarm).injuryHealth<0);
});

test('Only acceleration exposure counts, while already-avoided injuries retain finite later benefit',()=>{
 const v=calculate();near(calculate({acceleration:0}).totalCA,0);
 near(calculate({openingDelay:2.5}).totalCA,v.totalCA/1.03);
 assert.ok(calculate({survivalYears:10}).fatalHealth<v.fatalHealth);
 near(calculate({survivalYears:10}).severeAvoided,v.severeAvoided);
 near(v.riskYears,v.scale*defaultInputs.influence*defaultInputs.riskShare*defaultInputs.acceleration);
});

test('Independent induced harms survive funding or assignment nulls and geography is separate',()=>{
 for(const o of [cases.noFunding,cases.noInfluence,cases.noAssignment])near(calculate(o).totalCA,0);
 assert.ok(calculate(cases.failedInduced).totalCA<0);
 assert.ok(calculate(cases.assignmentInduced).totalCA<0);
 near(calculate({healthCA:0}).totalCA,calculate().incomeEquivalentYears);
 near(calculate({incomeCA:0}).totalCA,calculate().editionQalys);
 near(calculate(cases.noCA).totalCA,0);
});

test('Domain and resource-cost guards keep malformed or unbounded scenarios out',()=>{
 for(const o of [null,[],{unknown:1},{gift:Infinity},{gift:100001},{expense:0},{riskShare:1.1},{clinicalOverlapShare:-.1},{netReceipt:-50000},{inducedLoss:50000},{survivalYears:31},{acceleration:4},{fatalReduction:2},{hazard:2},{expense:1}])assert.throws(()=>calculate(o));
 assert.throws(()=>calculate(Object.create({gift:1})));
 const v=calculate(),fee=calculate({fee:.1});near(fee.price,v.price*1.1);
 const resource=calculate({capital:2000000});near(resource.price,v.price);assert.ok(resource.grossAssociatedResourceUSD>v.grossAssociatedResourceUSD);
});

test('Every registry scenario matches health and income once and preserves historical evidence and honest timing',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const report=d.reports.find(r=>r.edition==='california'&&r.slug==='walk-san-francisco');
 for(const[id,o]of Object.entries(cases)){
  const v=calculate(o),s=report.model.scenarios.find(s=>s.id===id);assert.ok(s,id);
  near(s.editionQalys,v.editionQalys);near(scenarioIncomeEquivalent(s),v.incomeEquivalentYears+v.recipientBurdenYears);
  near(s.costUSD,v.donorUSD);
 }
 near(reportPrice(report),878400104.7525074);near(expenseAverage(report),947639.3333333334);
 const old=report.model.scenarios.find(s=>s.id==='historical-prior-health-central');near(old.editionQalys,.22533298087679837);
 assert.match(report.sections.cost,/878\.4M/);assert.match(report.sections.cost,/0\.0000787 fatal/);
 assert.doesNotMatch(report.sections.cost,/0\.000157 fatal/);
 const sessions=d.sessions.filter(s=>s.id==='907f65d1-ca2f-4b4c-b552-c144b5f76f67');assert.equal(sessions.length,1);
 near((Date.parse(sessions[0].endedAt)-Date.parse(sessions[0].startedAt))/1000,153.797);
 assert.equal(sessions[0].phase,'modeling');assert.ok(report.sessionIds.includes(sessions[0].id));
 assert.equal(d.sessions.some(s=>s.id==='974e3291-b12f-4716-8726-fe7b6c887677'),false);
 assert.equal(d.reports.filter(r=>r.edition==='california').length,25);
 assert.equal(d.reports.filter(r=>r.edition==='california'&&r.stage==='beta').length,10);
});

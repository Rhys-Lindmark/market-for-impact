import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,cases,historicalExact} from '../lib/cil-ca-calibrated-model.mjs';
import {reportPrice,scenarioIncomeEquivalent,expenseAverage,validateEditionReports} from '../lib/geography-reports.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=data.reports.find(r=>r.edition==='california'&&r.slug==='center-for-independent-living');
test('Every CIL scenario preserves health and separately encoded finite resource benefits',()=>{
 for(const [id,input] of Object.entries(cases)){
  const v=calculate(input),s=report.model.scenarios.find(s=>s.id===id);assert.ok(s,id);
  near(s.editionQalys,v.editionQalys);near(s.allPopulationQalys,v.healthAll);
  near(scenarioIncomeEquivalent(s),v.incomeEquivalentYears+v.recipientBurdenYears);
  near(s.costUSD,v.donorUSD);near(v.totalCA,s.editionQalys+scenarioIncomeEquivalent(s));
  assert.equal(v.price===null,v.totalCA<=0||v.donorUSD===0);
 }
 near(reportPrice(report),146437882.11596626);near(expenseAverage(report),3673179);
 near(historicalExact().price,59187952.33043336);
});
test('Disjoint purchasers do not receive additional access health, and resource signs keep the same cohort',()=>{
 const v=calculate(),noCash=calculate(cases.zeroCash),noPurchasers=calculate(cases.purchaserZero);
 near(v.editionQalys,noCash.editionQalys);near(v.editionQalys,noPurchasers.editionQalys);
 near(v.completed,8.881136842106458);near(v.purchaserHouseholds,.8881136842106457);
 assert.ok(v.price<noCash.price);
 const pos=calculate(cases.workPositive),zero=calculate(cases.workZeroFixedCohort),neg=calculate(cases.workNegative);
 near(pos.editionQalys,zero.editionQalys);near(pos.editionQalys,neg.editionQalys);
 assert.ok(pos.work>0&&neg.work<0);assert.ok(calculate(cases.healthHarm).repairHealth<0);
});
test('Finite function-days independent reconstruction includes the within-window annual discount',()=>{
 const v=calculate(),x=v.inputs,n=20000,t=x.functionDays/365;let integral=0;
 for(let i=0;i<n;i++)integral+=Math.exp(-Math.log1p(x.discount)*(i+.5)*t/n)*t/n;
 near(v.repairHealth,v.unmetEpisodes*x.utility*integral/1.03**x.delay);
 const work=calculate(cases.workPositive);
 near(work.work,.5*work.workerHouseholds*integral*Math.log1p(3000/25000)/1.03**x.delay);
 near(calculate({functionDays:0}).repairHealth,0);
});
test('Independent induced burdens and health harm survive funding or assignment nulls',()=>{
 for(const id of ['noFunding','noAssignment','noCA','noCompletion','fullReplacement'])near(calculate(cases[id]).totalCA,0);
 assert.ok(calculate(cases.failedInduced).totalCA<0);assert.ok(calculate(cases.assignmentInduced).totalCA<0);
 assert.ok(calculate(cases.independentHarm).totalCA<0);assert.equal(calculate(cases.allHarm).price,null);
 near(calculate(cases.externalResources).price,calculate().price);
 assert.ok(calculate(cases.externalResources).grossAssociatedResourceUSD>calculate().donorUSD);
});
test('Same-gift home allocation and strict domain guards cannot create unbounded additional benefits',()=>{
 assert.ok(calculate(cases.outsideBerkeleyModifications).homeHealth>0);
 near(calculate(cases.homeNull).homeHealth,0);assert.ok(calculate(cases.homeHarm).homeHealth<0);
 for(const x of [null,[],{unknown:1},{gift:100001},{baseline:0},{netCash:-25000},{inducedLoss:25000},{utility:1.1},{functionDays:366},{homeYears:6},{repairAllocation:.9,homeAllocation:.2},{unmetShare:.9,purchaserShare:.2},{supportLoad:.9}])assert.throws(()=>calculate(x));
});
test('CIL provenance, report disclosures and geographic counts remain honest',()=>{
 validateEditionReports(data,JSON.parse(readFileSync(new URL('../docs/geography-progress.json',import.meta.url))));
 for(const id of ['d5189fe9-22b4-42b5-9f5d-4277e288f0bf','cil-root-source-check-20261002']){
  const s=data.sessions.find(s=>s.id===id);assert.ok(s&&report.sessionIds.includes(id));assert.equal(s.model.id,'gpt-6.1-sol');
 }
 const author=data.sessions.find(s=>s.id==='d5189fe9-22b4-42b5-9f5d-4277e288f0bf');near((Date.parse(author.endedAt)-Date.parse(author.startedAt))/1000,723.713);
 assert.match(report.sections.cost,/146\.4 million/);assert.match(report.sections.cost,/59,187,952/);
 assert.match(report.sections.cost,/not observed invoices/);assert.match(report.summary.reservations[2],/audit remained inaccessible/);
 assert.equal(data.reports.filter(r=>r.edition==='california').length,25);
 assert.equal(data.reports.filter(r=>r.edition==='california'&&r.stage==='beta').length,10);
});

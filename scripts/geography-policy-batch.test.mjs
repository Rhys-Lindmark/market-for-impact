import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const reports=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url))).reports;
test('policy thresholds are not reported as central cost effectiveness',()=>{
 for(const slug of ['western-center-on-law-and-poverty']){
  const r=reports.find(r=>r.slug===slug&&r.edition==='california');assert.ok(r);
  assert.ok(reportPrice(r)>0);assert.ok(r.model.missingInputs.length);
  assert.equal(r.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
  assert.ok(r.model.scenarios.find(s=>s.id==='adverse').editionQalys<0);
 }
 assert.ok(Math.abs(20.6*.05/1.03-1)<1e-12);
 let annuity=0;for(let t=1;t<=4;t++)annuity+=1/1.03**t;
 assert.ok(Math.abs(3.43*.094*.1*annuity-.11984668670341198)<1e-12);
 assert.ok(Math.abs(8.343993709853061*3.43*.094*.1*annuity-1)<1e-12);
});
test('policy accounts retain consistent recipient-specific means',()=>{
 assert.equal(expenseAverage(reports.find(r=>r.slug==='western-center-on-law-and-poverty')),7097648);
 assert.equal(expenseAverage(reports.find(r=>r.slug==='worksafe')),1387676.3333333333);
});

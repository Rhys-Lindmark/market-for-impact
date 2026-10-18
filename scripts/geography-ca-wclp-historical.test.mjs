import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const model=JSON.parse(readFileSync(new URL('../data/california/wclp-ca-pre-recalibration-model.json',import.meta.url)));
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=data.reports.find(r=>r.edition==='california'&&r.slug==='western-center-on-law-and-poverty');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Frozen WCLP coverage illustration independently reproduces its two-year health envelope',()=>{
 const central=model.scenarios.find(s=>s.id==='historical-alpha-central');
 const first=100000*.1*.2*.2*.25*.02/1.03;
 const second=100000*.1*.2*.2*.25*.02*.5/1.03**2;
 near(central.editionQalys,first+second);
 near(central.costUSD,7409717*3);
 near(10*central.costUSD/central.editionQalys,77068321.22843137);
});
test('Historical withdrawal, nulls and harm remain separate from any new conditional central',()=>{
 assert.equal(reportPrice({...report,model}),null);
 assert.equal(model.scenarios.find(s=>s.id==='central').editionQalys,null);
 assert.ok(model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(model.scenarios.some(s=>s.editionQalys<0));
 assert.equal(model.version,'ca-wclp-coverage-judgment-v2');
});
test('WCLP finance uses one operating entity and consistent gross expense, without foundation double count',()=>{
 assert.deepEqual(report.annualExpenses.map(y=>y.amount),[6805266,7077961,7409717]);
 near(expenseAverage(report),7097648);near(7230364+179353,7409717);
 assert.equal(report.summary.what.length,3);assert.equal(report.summary.strengths.length,3);assert.equal(report.summary.reservations.length,3);
});

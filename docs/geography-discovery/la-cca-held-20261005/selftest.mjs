import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,gainLedger,lossLedger} from './model.mjs';
const report=JSON.parse(fs.readFileSync(new URL('./report.json',import.meta.url)));
for(const s of report.model.scenarios){const r=calculate(s.inputs,s.resourceLedger,s.inducedLedger,s.incomeUnknown);assert.ok(Math.abs(r.editionQalys-s.editionQalys)<1e-12);assert.equal(r.costPer10Qalys,s.costPer10Qalys);assert.equal(r.incomeEquivalentYears,s.incomeEquivalentYears);}
const c=calculate(),x=c.inputs,n=100000,h1=x.h0*Math.exp(-Math.log(x.HR)/10*x.transport*x.pm);let d=0,t=0;
for(let i=0;i<n;i++){const y=(i+.5)*x.T/n,early=Math.exp(-h1*y),base=Math.exp(-x.h0*y),late=Math.exp(-x.h0*Math.min(y,x.A)-h1*Math.max(0,y-x.A));d+=(early-base)*x.u*1.03**(-y)*x.T/n;t+=(early-late)*x.u*1.03**(-y)*x.T/n;}
assert.ok(Math.abs(d-c.qDurable)<1e-12);assert.ok(Math.abs(t-c.qTiming)<1e-12);
const positive=calculate({},gainLedger),nullClinical=calculate({transport:0},gainLedger);assert.equal(nullClinical.editionQalys,0);assert.equal(nullClinical.incomeEquivalentYears,positive.incomeEquivalentYears);assert.ok(nullClinical.costPer10Qalys>0);
assert.equal(calculate({},lossLedger).editionQalys,c.editionQalys);assert.ok(calculate({},lossLedger).incomeEquivalentYears<0);
assert.equal(positive.incomePathways[0].annualIncomeGainUSD,30);assert.equal(positive.incomePathways[2].annualIncomeGainUSD,-10);
assert.equal(calculate({},[],[],true).costPer10Qalys,null);assert.equal(calculate({p:0}).combinedEquivalentYears,0);
const failed=calculate({p:0,b:0},[],[{people:1,baselineUSD:50000,netUSD:-50}]);assert.ok(failed.combinedEquivalentYears<0);assert.equal(failed.costPer10Qalys,null);
assert.ok(calculate({pm:-.2},lossLedger).editionQalys<0);assert.throws(()=>calculate({Nall:1500000}));assert.throws(()=>calculate({E:1,Y:1,p:1,b:1}));
assert.deepEqual(report.annualExpenses.map(e=>e.amount),[1472176,2162329,2494912]);assert.equal(report.acceptance.status,'pending');
console.log('PASS:23 serialized scenarios; independent finite-survival integration; signed/overlap/null/failed-policy ledgers; geographic and probability guards; full costs.');

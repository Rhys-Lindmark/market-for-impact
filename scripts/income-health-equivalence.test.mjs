import test from 'node:test';
import assert from 'node:assert/strict';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';

test('Coefficient-style income comparison reproduces the published 1%-for-200 benchmark',()=>{
 const result=incomeHealthyYearEquivalent({people:200,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:1});
 assert.ok(Math.abs(result-0.9950330853168092)<1e-12);
 assert.ok(Math.abs(incomeHealthyYearEquivalent({people:2000,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:1})-9.950330853168092)<1e-11);
});
test('local attribution, causal discount and health-overlap adjustment are explicit',()=>{
 const base={people:200,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:1};
 assert.ok(Math.abs(incomeHealthyYearEquivalent({...base,causalShare:0.5,editionShare:0.5,independentShare:0.5})-incomeHealthyYearEquivalent(base)/8)<1e-12);
 assert.equal(incomeHealthyYearEquivalent({...base,annualIncomeGainUSD:0}),0);
 assert.ok(incomeHealthyYearEquivalent({...base,annualIncomeGainUSD:-500})<0);
});
test('invalid baselines and attribution shares do not generate prices',()=>{
 const base={people:200,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:1};
 assert.throws(()=>incomeHealthyYearEquivalent({...base,annualIncomeBeforeUSD:0}));
 assert.throws(()=>incomeHealthyYearEquivalent({...base,annualIncomeGainUSD:-50000}));
 assert.throws(()=>incomeHealthyYearEquivalent({...base,causalShare:1.1}));
});
test('recurring flows discount each year and retain negative economic effects',()=>{
 const p={people:200,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:500,years:2,delayYears:5,discountRate:.03};
 const one=.5*200*Math.log1p(.01);
 assert.ok(Math.abs(incomeHealthyYearEquivalent(p)-one*(1/1.03**5+1/1.03**6))<1e-12);
 assert.ok(incomeHealthyYearEquivalent({...p,annualIncomeGainUSD:-500})<0);
 assert.throws(()=>incomeHealthyYearEquivalent({...p,delayYears:-1}));
});

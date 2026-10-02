import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,cases,results,tests} from '../lib/ist-usa-calibrated-model.mjs';

test('IST guarded signed health and resource calculator passes its assertions',()=>{
  assert.equal(tests(),'25 assertions passed');
  for(const scenario of Object.values(cases)) assert.doesNotThrow(()=>calculate(scenario));
});

test('annual-expense diagnostic uses exact three-year mean, not rounded display',()=>{
  const r=results(),mean=988148/3;
  assert.equal(r.meanExpense,mean);
  assert.equal(cases.meanAnnualWholeRecipientCost.gift,mean);
  assert.equal(cases.meanAnnualWholeRecipientCost.packetCost,mean);
  const expected=r.scenarios.central.price10*mean/100000;
  assert.ok(Math.abs(calculate(cases.meanAnnualWholeRecipientCost).price10-expected)<expected*1e-12);
});

test('central partial forecast matches independently reconstructed health and resources',()=>{
  const c=calculate();
  assert.ok(Math.abs(c.healthYears-.5700128002529878)<1e-12);
  assert.ok(Math.abs(c.incomeYears-.0032528652913561364)<1e-12);
  assert.ok(Math.abs(c.price10-1744391.9287411897)<1e-6);
  assert.equal(c.completePortfolioPrice10,null);
  assert.equal(c.identifiedDonorPrice10,null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,inputs,moneyPriors,positiveOnlyNet,resourceEquivalent,selfTest} from '../lib/changent-legacy-recalibration.mjs';

test('candidate retains signed effects and explicit knowledge boundaries',()=>{
  assert.equal(selfTest().passed,26);
  const r=calculate();
  assert.equal(r.inputs.fy2024Surplus,-2489261);
  assert.equal(r.currentLifetimePriorDiagnostic.inputs.fy2024Surplus,-2489261);
  assert.equal(r.ordinaryWholeGiftExpectedValue,null);
  assert.equal(r.weighted.conditionalDonorCostPer10Equivalent,inputs.gift*10/r.weighted.totalEquivalent);
  assert.equal(r.geography.totalBay,null);
  assert.equal(r.geography.totalSf,null);
  assert.ok(r.worlds.find(x=>x.name==='null').incomeEquivalent<0);
  assert.ok(r.worlds.find(x=>x.name==='harm').clinicalQaly<0);
});

test('positive-only overlap preserves all participation and adverse income',()=>{
  assert.equal(positiveOnlyNet({pay:100,fees:-40,travel:-20},0),-60);
  assert.equal(positiveOnlyNet({pay:-100,fees:-40},0),-140);
  assert.equal(positiveOnlyNet({pay:100,fees:-40},.5),10);
  assert.ok(resourceEquivalent(1,{fees:-40},0,1,0).equivalent<0);
  const priors=structuredClone(moneyPriors);
  for(const p of Object.values(priors))p.positiveIndependentShare=0;
  const r=calculate(inputs,undefined,priors);
  assert.ok(r.worlds.every(x=>x.incomeEquivalent<=0));
});

test('old follow-up and lifetime diagnostics remain distinct and unmodified',()=>{
  const r=calculate();
  assert.notEqual(r.historicalDiagnostics.followup.weighted.giftQaly,r.historicalDiagnostics.publishedLifetimePrior.weighted.giftQaly);
  assert.equal(r.historicalDiagnostics.followup.inputs.fy2024Surplus,11827766);
  assert.equal(r.financialYear,2025);
  assert.equal(r.serviceCountYear,2025);
});

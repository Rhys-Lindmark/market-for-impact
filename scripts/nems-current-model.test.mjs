import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,diagnostics,creditCashRows} from '../lib/nems-current-model.mjs';
import {calculate as historical} from '../lib/nems-v2-model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('conditional health preserves historical calibration; unknown income is not zero',()=>{
  const x=calculate();
  close(x.bay.partialHealthUsdPerTen,historical().central.costPerTenQalys);
  assert.equal(x.cashEquivalentYears,null);
  assert.equal(x.combinedEquivalentYears,null);
  assert.equal(x.bay.combinedUsdPerTen,null);
  assert.equal(x.ordinaryFoundationGift.usdPerTen,null);
  assert.equal(x.weightedExpectation,null);
  assert.equal(x.sf.healthYears,null);
  assert.equal(x.annualAdditionalMonitoringPeople,125);
  assert.equal(x.additionalMonitoringPersonYears,2500);
  close(x.nativeUSDPerDiscountedAdditionalMonitoringPersonYear,1085.9353446583652);
});
test('signed net resource scenarios are finite and severe harm has no positive price',()=>{
  const d=diagnostics();
  assert.equal(Object.keys(d).length,19);
  assert.equal(d.explicitZeroCash.cashEquivalentYears,0);
  close(d.explicitZeroCash.bay.combinedUsdPerTen,calculate().bay.partialHealthUsdPerTen);
  assert.equal(d.positiveCash.netCashPerMonitoringPersonYearUSD,20);
  assert.ok(d.positiveCash.cashEquivalentYears>0);
  assert.ok(d.adverseCash.cashEquivalentYears<0);
  assert.ok(d.adverseCash.bay.combinedUsdPerTen>calculate().bay.partialHealthUsdPerTen);
  assert.ok(d.severeCashHarm.combinedEquivalentYears<0);
  assert.equal(d.severeCashHarm.bay.combinedUsdPerTen,null);
  assert.equal(d.allNull.combinedEquivalentYears,0);
  assert.equal(d.allNull.bay.combinedUsdPerTen,null);
  assert.ok(d.replacementHarm.healthYears<0);
});
test('positive overlap cannot suppress negative health or cash burdens',()=>{
  for(const independence of [0,.5,1]){
    const rows=creditCashRows([{mechanism:'burden',netResourceChangeUSD:-250,positiveIndependentShare:independence}]);
    assert.equal(rows[0].creditedResourceChangeUSD,-250);
    const x=calculate({healthIndependentShare:independence,causalTransfer:0,harmQalysPerPerson:.01,cashRows:rows});
    assert.equal(x.healthYears,-25);
    close(x.cashEquivalentYears,diagnostics().adverseCash.cashEquivalentYears);
  }
});
test('geography, cost and delay retain coherent numerator and unknown guards',()=>{
  const x=calculate(),d=diagnostics();
  assert.equal(d.halfBay.donorCostUSD,x.donorCostUSD);
  close(d.halfBay.bay.partialHealthUsdPerTen,2*x.bay.partialHealthUsdPerTen);
  assert.equal(d.unknownGeography.bay.healthYears,null);
  assert.equal(d.unknownGeography.bay.partialHealthUsdPerTen,null);
  close(d.costStress.bay.partialHealthUsdPerTen,2*x.bay.partialHealthUsdPerTen);
  close(d.delayFive.bay.partialHealthUsdPerTen,x.bay.partialHealthUsdPerTen*1.03**5);
  assert.equal(d.noFundedYears.donorCostUSD,0);
  assert.equal(d.noFundedYears.bay.partialHealthUsdPerTen,null);
});
test('malformed inputs and impossible resource domains are rejected',()=>{
  for(const overrides of [null,[],{bayShare:2},{sfShare:1,bayShare:.5},{delayYears:-1},{baselineHouseholdResourcesUSD:0},{cashRows:[{mechanism:'burden',netResourceChangeUSD:-50000,positiveIndependentShare:1}]}]) assert.throws(()=>calculate(overrides));
  assert.throws(()=>creditCashRows({}));
  assert.throws(()=>creditCashRows([{mechanism:'',netResourceChangeUSD:1,positiveIndependentShare:1}]));
});

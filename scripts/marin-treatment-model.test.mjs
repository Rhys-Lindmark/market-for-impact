import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculate, finiteSurvivalQalys} from '../lib/marin-treatment-model.mjs';

const close = (a, b) => assert.ok(Math.abs(a-b) <= 1e-9*Math.max(1, Math.abs(a), Math.abs(b)));

test('Marin model keeps ordinary gifts, retrospective accounting and verified offers distinct', () => {
  const r = calculate();
  assert.equal(r.inputs.gift, 100000);
  assert.equal(r.inputs.matchedFy2024Expense, 3191947);
  assert.equal(r.inputs.observedCountyContractOtpClients, 257);
  close(r.scenarios.reduce((sum, s) => sum+s.weight, 0), 1);
  for (const s of r.scenarios) {
    close(s.giftQaly, s.accountingAttributedQaly*s.fundingAdditionality);
    assert.equal(s.verifiedMarginalGiftCostPer10Qaly, null);
    assert.equal(s.marginalGrossResources, null);
    assert.equal(s.sfQaly, null);
    assert.ok(s.bayQaly >= 0 && s.bayQaly <= s.giftQaly);
    if (s.giftQaly > 0) {
      close(s.modeledOrdinaryGiftCostPer10Qaly, 10*r.inputs.gift/s.giftQaly);
      close(s.retrospectiveGrossCostPer10Qaly, 10*r.inputs.matchedFy2024Expense/s.annualOrganizationAttributedQaly);
    }
  }
  const nullCase = r.scenarios.find(s => s.name === 'null');
  assert.equal(nullCase.giftQaly, 0);
  assert.equal(nullCase.modeledOrdinaryGiftCostPer10Qaly, null);
  close(r.weighted.giftQaly, r.scenarios.reduce((sum, s) => sum+s.weight*s.giftQaly, 0));
});

test('Finite survival uses a bounded health tail rather than repeated lifetime credits', () => {
  const s = calculate().scenarios.find(s => s.name === 'central');
  const ratio = s.annualSubsequentSurvival/(1+s.healthDiscountRate);
  const first = s.healthUtility*Math.sqrt(s.annualSubsequentSurvival)/(1+s.healthDiscountRate)**(0.5+s.eventDelayYears);
  close(finiteSurvivalQalys(s), first*(1-ratio**s.survivalHorizonYears)/(1-ratio));
  assert.ok(finiteSurvivalQalys(s) <= s.healthUtility*s.survivalHorizonYears);
  assert.equal(finiteSurvivalQalys({...s, survivalHorizonYears: 0}), 0);
  assert.equal(finiteSurvivalQalys({...s, healthUtility: 0}), 0);
  assert.ok(finiteSurvivalQalys({...s, healthDiscountRate: 0.1}) < finiteSurvivalQalys(s));
  assert.ok(finiteSurvivalQalys({...s, annualSubsequentSurvival: 0.8}) < finiteSurvivalQalys(s));
});

test('Gift scaling is an explicit proportional-capacity assumption, not an observed quote', () => {
  const r = calculate();
  const doubled = calculate({...r.inputs, gift: 200000}, r.scenarios);
  close(doubled.weighted.giftQaly, 2*r.weighted.giftQaly);
  const zeroFunding = calculate(r.inputs, r.scenarios.map(s => ({...s, fundingAdditionality: 0})));
  assert.equal(zeroFunding.weighted.giftQaly, 0);
  assert.equal(zeroFunding.weighted.modeledOrdinaryGiftCostPer10Qaly, null);
});

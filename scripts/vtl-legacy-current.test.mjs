import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,defaults,selfTest} from '../lib/vtl-legacy-calibrated-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11*Math.max(1,Math.abs(b)),a+' != '+b);
test('All author regression controls still pass after cohort corrections',()=>{
 assert.deepEqual(selfTest(),{passed:118,cases:42});
 const c=calculate();
 near(c.geography.us.donorPer10Combined,1718504.1423220795);
 near(c.geography.bay.donorPer10Combined,21481301.77902599);
 near(c.geography.sf.donorPer10Combined,114566942.82147196);
 assert.equal(c.grossResourceUSD,null);assert.equal(c.ordinaryWholeGiftExpectedValue,null);
});
test('Same household equal gain and loss exactly cancel before logarithm',()=>{
 const x=calculate({unmet:0,purchasers:1,purchaseSaving:1000,participationLoss:1000});
 assert.equal(x.base.incomeEquivalent,0);
 near(calculate({participationLoss:10}).base.incomeEquivalent,-.009928691119011141);
});
test('Independent three-cohort signed formula preserves full costs and positive-only overlap',()=>{
 const o={unmet:.5,purchasers:.2,caregiverShare:.2,purchaseSaving:2000,purchaseFees:500,purchaseTravel:200,purchaseCare:100,caregiverNetPay:1000,caregiverFees:100,participationLoss:400,positiveIndependentShare:.5};
 const x={...defaults,...o},n=x.gift/x.cost*x.additionality,hh=n*x.households,L=(1+x.discount)**(-x.delay);
 const p=2000*.5-500-200-100-400,c=1000*.5-100-400;
 const independent=.5*hh*L*(.2*Math.log1p(p/x.baseline)+.2*Math.log1p(c/x.baseline)+.6*Math.log1p(-400/x.baseline));
 near(calculate(o).base.incomeEquivalent,independent);
 assert.ok(independent<0);
});
test('Future household count is unique; harmful mixed net survives without unsupported overlap',()=>{
 const mixed=calculate({educationShare:.05,educationNetPay:1,educationFees:10,educationDelay:0});
 assert.equal(mixed.netResourceRows.educationNet,-9);assert.ok(mixed.base.education<0);
 near(mixed.base.educationHouseholds,mixed.base.distinctHouseholds*.6*.05);
 for(const educationNetPay of [-500,1,500])assert.throws(()=>calculate({participationLoss:10,educationShare:.05,educationNetPay,educationFees:educationNetPay===1?10:0,educationDelay:.5,years:.25}),/Overlapping education/);
 assert.doesNotThrow(()=>calculate({participationLoss:10,educationShare:.05,educationNetPay:-500,educationDelay:10}));
});
test('Combined cohort post-change resources cannot become nonpositive',()=>{
 assert.throws(()=>calculate({purchaseSaving:-40000,participationLoss:10000}),/Nonpositive cohort/);
 assert.ok(calculate({additionality:0,inducedHouseholds:20,inducedLoss:10}).geography.us.incomeEquivalentYears<0);
});

import assert from 'node:assert/strict';
import {calculate,cases} from '../denver-hrac-beta-20261006/model.mjs';
let checks=0; const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
for(const[id,o]of cases){
 const s=calculate(o),p=s.inputs;
 const independentIncome=s.incomePathways.reduce((sum,x)=>{let years=0;for(let y=0;y<Math.ceil(x.years);y++)years+=Math.min(1,x.years-y)/(1+x.discountRate)**(x.delayYears+y);return sum+.5*x.people*x.editionShare*years*Math.log((x.annualIncomeBeforeUSD+x.annualIncomeGainUSD)/x.annualIncomeBeforeUSD);},0);
 near(s.incomeEquivalent,independentIncome);
 if(s.editionQalys!==null&&!s.incomeUnknown){near(s.totalEquivalent,s.editionQalys+independentIncome);if(s.costUSD!==null&&s.totalEquivalent>0)near(s.price10,10*s.costUSD/s.totalEquivalent);else{assert.equal(s.price10,null);checks++;}}
}
const c=calculate();near(c.deathsAverted,6);near(c.editionQalys,(6*10-.4)*.95);near(c.discountedHealthyYears,10);
near(c.actualCash,87517*.1*.75);assert(c.incomeEquivalent<0);checks++;
near(calculate({delay:1}).editionQalys,c.editionQalys/1.03);
near(calculate({cashRecipientShare:0}).actualCash,0);
near(calculate({workGain:-100,cashFraction:0,overlap:0}).incomeEquivalent,calculate({workGain:-100,cashFraction:0,overlap:1}).incomeEquivalent);
assert(calculate({netReduction:0}).incomeEquivalent<0);checks++;
assert(calculate({healthyYears:0,harm:0,cashFraction:1,cost:0}).incomeEquivalent>0);checks++;
near(calculate({N:0,C:0}).totalEquivalent,0);assert.equal(calculate({N:0,C:0}).price10,null);checks++;
assert(calculate({payerLossFraction:1}).incomeEquivalent<c.incomeEquivalent);checks++;
console.log(JSON.stringify({checks,scenarios:cases.length,central:c.price10,health:c.editionQalys,income:c.incomeEquivalent}));

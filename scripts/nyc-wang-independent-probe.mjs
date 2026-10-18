import assert from 'node:assert/strict';
import {central,calculate,definitions} from '../docs/geography-discovery/nyc-wang-held-batch-20261005/wang-model.mjs';
let checks=0;
const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
const exposure=(duration,delay,discount)=>Array.from({length:Math.ceil(duration)},(_,i)=>Math.min(1,duration-i)*Math.pow(1+discount,-delay-i)).reduce((a,b)=>a+b,0);
for(const [, ,o] of definitions){
 const p={...central,...o},r=calculate(o);
 const recipients=p.N*p.a*p.b,alive=recipients*(1-p.deathRate),h=p.N*p.resourceShare*p.b*(1-p.deathRate)*p.householdsPerPatient;
 const e=exposure(p.t,p.delay,p.discount);
 const health=p.g*(alive*(p.u+p.residualUtility)*e+recipients*p.deathRate*p.survivalUtility*exposure(p.survivalYears,p.delay,p.discount)-recipients*p.harmUtility*e);
 const c=p.medicalCost+p.transportCost+p.lostDisposablePay,gain=p.medicalSavings+p.netDisposablePayGain;
 const factor=.5*h*exposure(p.incomeYears,p.delay,p.discount)*p.g;
 const negative=factor*Math.log((p.Y-c)/p.Y),positive=factor*p.positiveIndependentShare*Math.log((p.Y-c+gain)/(p.Y-c));
 near(r.additionalEffectivePatientEquivalents,recipients);near(r.householdEquivalents,h);near(r.editionHealthQalys,health);near(r.negativeIncomeHealthyYears,negative);near(r.positiveIncomeHealthyYears,positive);
 if(p.incomeKnown){near(r.editionIncomeHealthyYears,negative+positive);near(r.editionHealthyYearEquivalents,health+negative+positive);if(health+negative+positive>0)near(r.price10USD,10*p.C*p.f/(health+negative+positive));else{assert.equal(r.price10USD,null);checks++;}}
 else{assert.equal(r.editionIncomeHealthyYears,null);assert.equal(r.editionHealthyYearEquivalents,null);assert.equal(r.price10USD,null);checks+=3;}
}
const down=calculate({medicalCost:200,transportCost:100,lostDisposablePay:200});assert.ok(down.editionIncomeHealthyYears<0);checks++;
const gain=calculate({medicalSavings:400,medicalCost:100,positiveIndependentShare:1});near(gain.editionIncomeHealthyYears,.5*2100*.5*.95*Math.log(25300/25000));
near(calculate({b:0}).editionHealthyYearEquivalents,0);
console.log(JSON.stringify({status:'PASS',cases:definitions.length,checks,referencePrice:calculate().price10USD}));

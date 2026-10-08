import assert from 'node:assert/strict';
import {calculate,cases} from './model.mjs';
let checks=0;
const near=(a,b)=>{assert(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
for(const [id,o] of cases){
 const c=calculate(o),p=c.inputs;let years=0;
 for(let i=0;i<Math.ceil(p.T);i++)years+=Math.min(1,p.T-i)/(1+p.r)**(p.delay+i);
 let sy=0;for(let i=0;i<Math.ceil(p.schoolYears);i++)sy+=Math.min(1,p.schoolYears-i)/(1+p.r)**(p.delay+i);
 const exposed=p.N*p.unique,received=exposed*p.b*p.success,school=p.schoolN*p.schoolAttribution*p.schoolAdditional*p.schoolImplementation;
 const health=(received*p.eligible*p.completion*p.response*p.q*years+school*p.schoolQ*sy-(exposed*p.harm+p.schoolEngaged*p.schoolHarm)/(1+p.r)**p.delay)*p.g;
 if(!p.clinicalUnknown)near(c.editionQalys,health);
 let income=0;for(const x of c.incomePathways){let y=0;for(let i=0;i<Math.ceil(x.years);i++)y+=Math.min(1,x.years-i)/(1+x.discountRate)**(x.delayYears+i);income+=.5*x.people*y*x.editionShare*Math.log((x.annualIncomeBeforeUSD+x.annualIncomeGainUSD)/x.annualIncomeBeforeUSD);}
 near(c.incomeEquivalent,income);
 near(c.payerLoss,(received*p.payerLoss+exposed*p.externalCost+school*p.schoolPayerLoss)*(p.localTransferOnly?p.g:1));
 if(!p.clinicalUnknown&&!p.incomeUnknown){near(c.totalEquivalent,health+income);if(!p.costUnknown&&health+income>0)near(c.price10,10*p.C/(health+income));else assert.equal(c.price10,null);}
}
assert(calculate().inputs.localTransferOnly);assert.equal(calculate().inputs.payerShare,1);
assert(calculate({success:0}).editionQalys<0);assert(calculate({success:0}).incomeEquivalent<0);
assert(calculate({q:0}).incomeEquivalent>0);assert(calculate({foodGain:-500,overlap:0}).incomeEquivalent===calculate({foodGain:-500,overlap:1}).incomeEquivalent);
assert(calculate({g:.45,localTransferOnly:false}).totalEquivalent<0);assert(calculate({g:1}).totalEquivalent>0);
console.log(JSON.stringify({checks,scenarios:cases.length,central:calculate().price10,health:calculate().editionQalys,resources:calculate().incomeEquivalent}));

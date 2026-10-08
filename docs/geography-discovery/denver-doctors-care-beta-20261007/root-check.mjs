import assert from 'node:assert/strict';import {calculate,cases} from './model.mjs';
let checks=0;const near=(a,b)=>{assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)));checks++;};
for(const[,o]of cases){const c=calculate(o),p=c.inputs,n=p.N*p.unique,changed=n*p.b*p.eligible*p.completion*p.success,working=changed*(p.workGain>0?p.response*p.workEligible:1),keep=x=>x>0?x*p.overlap:x;
 let duration=0;for(let i=0;i<Math.ceil(p.T);i++)duration+=Math.min(1,p.T-i)/(1+p.r)**(p.delay+i);
 const health=(p.N*p.b*p.eligible*p.completion*p.response*p.q*duration-p.N*p.harm/(1+p.r)**p.delay)*p.g;
 const gainBoth=keep(p.medicalGain)+keep(p.workGain)-p.cost,gainMedical=keep(p.medicalGain)-p.cost;
 let income=.5*p.g*(working*Math.log(1+gainBoth/p.baseline)+(changed-working)*Math.log(1+gainMedical/p.baseline)+(n-changed)*Math.log(1-p.cost/p.baseline))/(1+p.r)**p.delay;
 if(n&&(p.payerLoss||p.externalCost))income+=.5*p.payerPeople*Math.log(1-p.g*(changed*p.payerLoss+n*p.externalCost)/(p.payerPeople*p.payerBaseline))/(1+p.r)**p.delay;
 near(c.incomeEquivalent,income);if(!p.clinicalUnknown)near(c.editionQalys,health);if(!p.clinicalUnknown&&!p.incomeUnknown){near(c.totalEquivalent,health+income);if(health+income>0&&!p.costUnknown)near(c.price10,10*p.C/(health+income));else{assert.equal(c.price10,null);checks++;}}
}
const c=calculate();near(c.clinicalExposed,2569);near(c.exposed,2569*.8);assert(c.incomeEquivalent<0);checks++;assert.equal(calculate({response:0}).incomeEquivalent,c.incomeEquivalent);checks++;assert(calculate({completion:0}).incomeEquivalent<0);checks++;assert(calculate({completion:0}).editionQalys<0);checks++;assert.equal(calculate({workGain:1500,response:0}).incomeEquivalent,c.incomeEquivalent);checks++;
console.log(JSON.stringify({checks,cases:cases.length,central:c.price10,clinicalYears:c.editionQalys,signedResources:c.incomeEquivalent,noMedical:calculate({medicalGain:0}).price10,clinicalNull:calculate({q:0}).totalEquivalent}));

import fs from 'node:fs';import assert from 'node:assert/strict';import {defaults,cases,calculate} from './model.mjs';
let checks=0;const near=(a,b)=>{assert(Number.isFinite(a)&&Number.isFinite(b));assert(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(a),Math.abs(b)));checks++;};
function independent(o){const p={...defaults,...o};let d=0;for(let i=0;i<Math.ceil(p.T);i++)d+=Math.min(1,p.T-i)/(1+p.r)**(p.delay+i);const q=p.qOverride??p.illnessRisk*p.episodeQ;
 const health=(p.N*p.b*p.eligible*p.completion*p.response*q*d-p.N*p.harm/(1+p.r)**p.delay)*p.g;
 let income=0,changedTotal=0;const positive=v=>v>0?v*p.overlap:v;
 const log=(n,gain,base,share)=>.5*n*share*Math.log((base+gain)/base)/(1+p.r)**p.delay;
 for(const [share,mult,unknown]of [[p.childShare,p.caregiverWorkMultiplier,false],[p.adultShare,p.adultWorkMultiplier,false],[1-p.childShare-p.adultShare,0,true]]){
 const n=p.N*p.unique*share,z=unknown?0:n*p.b*p.eligible*p.completion*p.illnessRisk*p.response;changedTotal+=z;
 income+=log(z,positive(p.workGain*mult)+positive(p.medicalGain)-p.cost,p.baseline,p.g)+log(n-z,-p.cost,p.baseline,p.g);
 }
 if(p.N&&(p.payerLoss||p.externalCost))income+=log(p.payerPeople,-p.g*(changedTotal*p.payerLoss+p.N*p.externalCost)/p.payerPeople,p.payerBaseline,1);
 return {health,income,total:health+income,price:health+income>0?10*p.C/(health+income):null};
}
for(const[id,o]of cases){const a=calculate(o),b=independent(o);near(a.incomeEquivalent,b.income);if(!o.clinicalUnknown)near(a.editionQalys,b.health);if(!o.clinicalUnknown&&!o.incomeUnknown){near(a.totalEquivalent,b.total);if(!o.costUnknown){if(b.price===null){assert.equal(a.price10,null);checks++;}else near(a.price10,b.price);}}}
assert.equal(calculate({response:0,cost:0,harm:0}).incomeEquivalent,0);checks++;
assert(calculate({response:0}).incomeEquivalent<0);checks++;
near(calculate({unique:0,externalCost:100}).editionQalys,calculate().editionQalys);
assert(calculate({unique:0,externalCost:100}).incomeEquivalent<0);checks++;
near(calculate({unique:0}).editionQalys,calculate().editionQalys);
near(calculate({workGain:-100,medicalGain:-30,overlap:0}).incomeEquivalent,calculate({workGain:-100,medicalGain:-30,overlap:1}).incomeEquivalent);
console.log(JSON.stringify({passed:checks,scenarios:cases.length,central:calculate().price10}));

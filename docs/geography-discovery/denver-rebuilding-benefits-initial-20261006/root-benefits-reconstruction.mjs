import assert from 'node:assert/strict';
import {defaults,cases,calculate} from './benefits-model.mjs';
let checks=0;const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b)),a+' versus '+b);checks++;};
for(const [id,o] of cases){const p={...defaults,...o};let years=0;for(let i=0;i<Math.ceil(p.T);i++)years+=Math.min(1,p.T-i)/Math.pow(1+p.r,p.delay+i);
const exposed=p.N*p.unique,added=exposed*p.b,responders=added*p.eligible*p.completion*p.response;
const h=p.clinicalUnknown?null:p.g*(responders*p.q*years-exposed*p.harm/Math.pow(1+p.r,p.delay));
const n=added*p.success,net=(p.workGain>0?p.workGain*p.overlap:p.workGain)+(p.medicalGain>0?p.medicalGain*p.overlap:p.medicalGain)-p.cost;
const log=(count,base,gain,share)=>count?.5*count*share*Math.log((base+gain)/base)/Math.pow(1+p.r,p.delay):0;
let income=log(n,p.baseline,net,p.g)+log(exposed-n,p.baseline,-p.cost,p.g);
if(exposed&&(p.payerLoss||p.externalCost))income+=log(p.payerPeople,p.payerBaseline,-p.g*(n*p.payerLoss+exposed*p.externalCost)/p.payerPeople,1);
const total=h===null||p.incomeUnknown?null:h+income,c=p.costUnknown?null:p.C,price=c!==null&&total>0?10*c/total:null;
const actual=calculate(o);near(actual.editionQalys,h);near(actual.incomeEquivalent,income);near(actual.totalEquivalent,total);near(actual.price10,price);
}
near(defaults.C,4368504);near(defaults.N,16000);near(calculate({g:0}).totalEquivalent,0);
assert.ok(calculate({b:0}).incomeEquivalent<0);checks++;
console.log(JSON.stringify({organization:'Benefits in Action',checks,cases:cases.length,price:calculate().price10}));

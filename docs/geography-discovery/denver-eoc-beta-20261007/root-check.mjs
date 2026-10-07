import assert from 'node:assert/strict';
import { calculate, cases } from './model.mjs';
let checks=0;
function near(a,b){assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)));checks++;}
for(const [,o] of cases){
 const a=calculate(o),p=a.inputs;
 const n=p.N*p.channel*p.unique,changed=n*p.b*p.success;
 let duration=0;for(let i=0;i<Math.ceil(p.T);i++)duration+=Math.min(1,p.T-i)/(1+p.r)**(p.delay+i);
 const h=(changed*p.response*p.q*duration-n*p.harm/(1+p.r)**p.delay)*p.g;
 const positive=x=>x>0?x*p.overlap:x;
 const net=positive(p.workGain)+positive(p.billGain)-p.cost;
 let resources=.5*p.g*(changed*Math.log((p.baseline+net)/p.baseline)+(n-changed)*Math.log((p.baseline-p.cost)/p.baseline))/(1+p.r)**p.delay;
 if(n&&(p.payerLoss||p.externalCost))resources+=.5*p.payerPeople*Math.log(1-p.g*(changed*p.payerLoss+n*p.externalCost)/(p.payerPeople*p.payerBaseline))/(1+p.r)**p.delay;
 near(a.incomeEquivalent,resources);
 if(!p.clinicalUnknown)near(a.editionQalys,h);
 if(!p.clinicalUnknown&&!p.incomeUnknown){near(a.totalEquivalent,h+resources);if(h+resources>0&&!p.costUnknown)near(a.price10,10*p.C/(h+resources));else {assert.equal(a.price10,null);checks++;}}
}
const c=calculate();near(c.costUSD,21873982+21873982*(76988385-72968156)/72968156);
assert.ok(c.price10<calculate({C:76988385}).price10);checks++;
assert.ok(c.incomeEquivalent>0);checks++;
assert.ok(c.editionQalys>0);checks++;
assert.ok(calculate({billGain:0}).totalEquivalent<0);checks++;
assert.ok(calculate({q:0}).price10>c.price10);checks++;
console.log(JSON.stringify({checks,scenarios:cases.length,centralPrice:c.price10,clinicalNullPrice:calculate({q:0}).price10,payerStressPrice:calculate({payerLoss:150}).price10,otherwisePaidBillsNull:calculate({billGain:0}).totalEquivalent}));

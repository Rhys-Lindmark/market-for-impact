import assert from 'node:assert/strict';
import {calculate,cases,defaults} from '../docs/geography-discovery/chicago-zcenter-initial-20261005/model.mjs';
let checks=0;const near=(a,b)=>{checks++;assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));};
for(const[id,o]of cases){const p={...defaults,...o},x=calculate(o),n=p.N*p.b,d=(1+p.discount)**p.delay,pos=(v,k)=>v>0?v*k:v;
const h=p.g*(pos(n*p.completion*p.q*p.T,p.clinicalOverlap)-n*p.harm)/d;
let income=.5*p.g*(n*p.success*Math.log1p((pos(p.gain,p.positiveOverlap)-p.cost)/p.baseline)+n*(1-p.success)*Math.log1p(-p.cost/p.baseline))/d;
if(n&&(p.payerLoss||p.externalCost))income+=.5*p.g*p.payerPeople*Math.log1p(-n*(p.success*p.payerLoss+p.externalCost)/p.payerPeople/p.payerBaseline)/d;
near(x.union,n);near(x.treated,n*p.completion);near(x.incomeEquivalent,income);
if(p.clinicalUnknown)assert.equal(x.editionQalys,null);else near(x.editionQalys,h);
const total=p.clinicalUnknown||p.incomeUnknown?null:h+income;
if(total===null){assert.equal(x.totalEquivalent,null);assert.equal(x.price10,null);}else{near(x.totalEquivalent,total);if(total>0)near(x.price10,10*p.C/total);else assert.equal(x.price10,null);}
}
near(calculate({gain:-1500,positiveOverlap:0}).incomeEquivalent,calculate({gain:-1500,positiveOverlap:1}).incomeEquivalent);
assert.equal(calculate({b:0}).totalEquivalent,0);assert.ok(calculate({q:0}).incomeEquivalent>0);
for(const o of[{C:0},{discount:-.1},{baseline:0},{cost:30000,gain:0},{success:1.1},{harm:-.1}])assert.throws(()=>calculate(o));
console.log(JSON.stringify({status:'PASS',cases:cases.length,independentChecks:checks,central:calculate().price10}));


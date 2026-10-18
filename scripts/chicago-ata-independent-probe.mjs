import assert from 'node:assert/strict';
import {calculate,cases,defaults} from '../docs/geography-discovery/chicago-ata-initial-20261005/model.mjs';
let checks=0;const near=(a,b)=>{checks++;assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));};
for(const[id,o]of cases){const p={...defaults,...o},got=calculate(o);
 const changed=p.N*p.implementation*p.credit*p.b,exposed=p.resourcePopulation*p.b,financial=exposed*p.resourceSuccess;
 const union=changed+exposed-Math.min(changed,exposed)*p.clinicalResourceOverlap;
 const overlap=x=>x>0?x*p.clinicalOverlap:x;let h=0;
 for(let y=0;y<p.T;y++)h+=changed*(overlap(p.exercise)+overlap(p.safety))/(1+p.discount)**(p.delay+y);
 h-=union*p.harm/(1+p.discount)**p.delay;h*=p.g;
 const net=(p.gain>0?p.gain*p.positiveOverlap:p.gain)-p.cost;
 let income=.5*p.g*(financial*Math.log1p(net/p.baseline)+(exposed-financial)*Math.log1p(-p.cost/p.baseline))/(1+p.discount)**p.delay;
 if(exposed&&(p.payerShare||p.externalCost))income+=.5*p.g*p.payerPeople*Math.log1p((-financial*p.gain*p.payerShare-exposed*p.externalCost)/p.payerPeople/p.payerBaseline)/(1+p.discount)**p.delay;
 near(got.union,union);near(got.incomeEquivalent,income);
 if(p.clinicalUnknown)assert.equal(got.editionQalys,null);else near(got.editionQalys,h);
 const total=p.clinicalUnknown||p.incomeUnknown?null:h+income;
 if(total===null){assert.equal(got.totalEquivalent,null);assert.equal(got.price10,null);}else{near(got.totalEquivalent,total);if(total>0)near(got.price10,10*p.C/total);else assert.equal(got.price10,null);}
}
assert.equal(calculate({b:0}).totalEquivalent,0);assert.ok(calculate({exercise:0,safety:0}).incomeEquivalent>0);
near(calculate({gain:-300,positiveOverlap:0}).incomeEquivalent,calculate({gain:-300,positiveOverlap:1}).incomeEquivalent);
near(calculate({exercise:-.005,safety:0,clinicalOverlap:0}).editionQalys,calculate({exercise:-.005,safety:0,clinicalOverlap:1}).editionQalys);
assert.ok(calculate({harm:.01,clinicalResourceOverlap:0}).editionQalys<calculate({harm:.01}).editionQalys);
for(const o of[{C:0},{discount:-.1},{baseline:0},{gain:-40000},{clinicalResourceOverlap:1.1},{harm:-.1}])assert.throws(()=>calculate(o));
console.log(JSON.stringify({status:'PASS',cases:cases.length,independentChecks:checks,central:calculate().price10}));

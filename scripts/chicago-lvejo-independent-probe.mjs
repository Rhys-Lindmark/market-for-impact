import assert from 'node:assert/strict';
import {calculate,cases,defaults} from '../docs/geography-discovery/chicago-lvejo-initial-20261005/model.mjs';
let checks=0;
const near=(a,b)=>{checks++;assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));};
for(const[id,o]of cases){
 const p={...defaults,...o},got=calculate(o);
 const policy=p.N*p.implementation*p.credit*p.b;
 const food=(p.delivery+p.garden-Math.min(p.delivery,p.garden)*p.foodOverlap)*p.b;
 const joint=Math.min(food,policy*p.foodPolicyOverlap);
 const net=(p.gain>0?p.gain*p.positiveOverlap:p.gain)-p.cost;
 let health=0;for(let y=0;y<p.T;y++)health+=policy*p.q/(1+p.discount)**(p.delay+y);
 health-=(food+policy-joint)*p.harm/(1+p.discount);health*=p.g;
 const log=(n,base,value,delay)=>.5*n*Math.log1p(value/base)*p.g/(1+p.discount)**delay;
 let income=log(food-joint,p.baseline,net,1)+log(policy-joint,p.policyBaseline,-p.policyBurden,p.delay);
 income+=p.delay===1?log(joint,p.baseline,net-p.policyBurden,1):log(joint,p.baseline,net,1)+log(joint,p.baseline,-p.policyBurden,p.delay);
 if(p.payerShare&&food)income+=log(p.payerPeople,p.payerBaseline,-food*p.gain*p.payerShare/p.payerPeople,1);
 near(got.food,food);near(got.policy,policy);near(got.incomeEquivalent,income);
 if(p.clinicalUnknown)assert.equal(got.editionQalys,null);else near(got.editionQalys,health);
 const total=p.clinicalUnknown||p.incomeUnknown?null:health+income;
 if(total===null){assert.equal(got.totalEquivalent,null);assert.equal(got.price10,null);}else{near(got.totalEquivalent,total);if(total>0)near(got.price10,10*p.C/total);else assert.equal(got.price10,null);}
}
assert.equal(calculate({b:0}).totalEquivalent,0);
assert.ok(calculate({q:0}).incomeEquivalent>0);
assert.ok(calculate({gain:-300}).incomeEquivalent<0);
near(calculate({gain:-300,positiveOverlap:0}).incomeEquivalent,calculate({gain:-300,positiveOverlap:1}).incomeEquivalent);
for(const o of[{C:0},{discount:-.1},{baseline:0},{gain:-20000},{foodOverlap:1.1},{harm:-.1}])assert.throws(()=>calculate(o));
console.log(JSON.stringify({status:'PASS',cases:cases.length,independentChecks:checks,central:calculate().price10}));

import assert from 'node:assert/strict';
import {calculate,cases,defaults} from '../docs/geography-discovery/chicago-cred-initial-20261005/model.mjs';
let checks=0;const near=(a,b)=>{checks++;assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));};
for(const[id,o]of cases){const p={...defaults,...o},got=calculate(o),exposed=p.N*p.b,treated=exposed*p.uptake,events=treated*p.risk*p.reduction,trauma=Math.max(0,treated-events),changed=exposed*p.resourceSuccess;
const pos=(v,k)=>v>0?v*k:v,discount=(1+p.discount)**p.delay;
const h=(pos(events*p.injuryQ/discount,p.clinicalOverlap)+pos(trauma*p.traumaQ*p.traumaYears/discount,p.clinicalOverlap)-exposed*p.harm/discount)*p.g;
const winner=pos(p.jobGain,p.positiveOverlap)+pos(p.stipendNet,p.positiveOverlap)-p.cost,other=pos(p.stipendNet,p.positiveOverlap)-p.cost;
let income=.5*p.g*(changed*Math.log1p(winner/p.baseline)+(exposed-changed)*Math.log1p(other/p.baseline))/discount;
if(exposed&&(p.payerShare||p.externalCost))income+=.5*p.g*p.payerPeople*Math.log1p((-exposed*p.stipendNet*p.payerShare-exposed*p.externalCost)/p.payerPeople/p.payerBaseline)/discount;
near(got.events,events);near(got.traumaPeople,trauma);near(got.incomeEquivalent,income);
if(p.clinicalUnknown)assert.equal(got.editionQalys,null);else near(got.editionQalys,h);
const total=p.clinicalUnknown||p.incomeUnknown?null:h+income;
if(total===null){assert.equal(got.totalEquivalent,null);assert.equal(got.price10,null);}else{near(got.totalEquivalent,total);if(total>0)near(got.price10,10*p.C/total);else assert.equal(got.price10,null);}
}
assert.equal(calculate({jobGain:-100,stipendNet:300}).incomePathways[0].annualIncomeGainUSD,-250);
near(calculate({jobGain:-1500,stipendNet:0,positiveOverlap:0}).incomeEquivalent,calculate({jobGain:-1500,stipendNet:0,positiveOverlap:1}).incomeEquivalent);
assert.equal(calculate({b:0}).totalEquivalent,0);assert.ok(calculate({reduction:0,traumaQ:0}).incomeEquivalent>0);
for(const o of[{C:0},{discount:-.1},{baseline:0},{cost:15000,stipendNet:0},{resourceSuccess:1.1},{harm:-.1}])assert.throws(()=>calculate(o));
console.log(JSON.stringify({status:'PASS',cases:cases.length,independentChecks:checks,central:calculate().price10}));


import assert from 'node:assert/strict';
import {calculate,cases,defaults} from '../docs/geography-discovery/chicago-volunteer-doulas-initial-20261005/model.mjs';
let checks=0;const near=(a,b)=>{checks++;assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));};
const pos=(v,k)=>v>0?v*k:v;
for(const[id,o]of cases){const p={...defaults,...o},x=calculate(o),n=p.N*p.b,t=n*p.uptake,v=p.providerN*p.b,d=(1+p.discount)**p.delay,e=t*p.cesareanRisk*(1-p.rr)*p.transport;
const h=p.g*(pos(e*p.cesareanQ,p.clinicalOverlap)+pos(t*p.experienceQ,p.clinicalOverlap)+pos(t*p.infantQ,p.clinicalOverlap)-(n+v)*p.harm)/d;
let income=.5*p.g*(n*p.resourceSuccess*Math.log1p((pos(p.careGain,p.positiveOverlap)-p.cost)/p.baseline)+n*(1-p.resourceSuccess)*Math.log1p(-p.cost/p.baseline)+v*Math.log1p((pos(p.providerGain,p.positiveOverlap)-p.providerCost)/p.providerBaseline))/d;
if(n&&(p.payerLoss||p.externalCost))income+=.5*p.g*p.payerPeople*Math.log1p(-n*(p.resourceSuccess*p.payerLoss+p.externalCost)/p.payerPeople/p.payerBaseline)/d;
near(x.union,n+v);near(x.treated,t);near(x.avoidedCesareans,e);near(x.incomeEquivalent,income);
if(p.clinicalUnknown)assert.equal(x.editionQalys,null);else near(x.editionQalys,h);
const total=p.clinicalUnknown||p.incomeUnknown?null:h+income;if(total===null){assert.equal(x.totalEquivalent,null);assert.equal(x.price10,null);}else{near(x.totalEquivalent,total);if(total>0)near(x.price10,10*p.C/total);else assert.equal(x.price10,null);}}
assert.ok(calculate({rr:1,experienceQ:0}).incomeEquivalent<0);assert.equal(calculate({b:0}).totalEquivalent,0);
console.log(JSON.stringify({status:'PASS',cases:cases.length,independentChecks:checks,central:calculate().price10}));

import assert from 'node:assert/strict';import fs from 'node:fs';
import {calculate,cases,defaults} from '../docs/geography-discovery/chicago-dupage-deep-20261005/model.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
const r=JSON.parse(fs.readFileSync('docs/geography-discovery/chicago-dupage-deep-20261005/report.json'));
let checks=0;const near=(a,b)=>{checks++;assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));};
const signed=(v,k)=>v>0?v*k:v;
for(const[id,o]of cases){const p={...defaults,...o},x=calculate(o),s=r.model.scenarios.find(s=>s.id===id),n=p.N*p.enrollmentFraction*p.b,other=p.otherHouseholds*p.b,df=(1+p.discount)**p.delay;let yf=0;for(let y=0;y<Math.ceil(p.T);y++)yf+=Math.min(1,p.T-y)/(1+p.discount)**(p.delay+y);
 const h=p.g*(n*p.k*p.a*p.u*yf-(n+other)*p.harm/df);
 const net=signed(p.medicalGain,p.positiveOverlap)+signed(p.workGain,p.positiveOverlap)-p.cost/p.householdsPerEnrollee;
 let inc=.5*p.g*n*p.householdsPerEnrollee*(p.resourceSuccess*Math.log1p(net/p.baseline)+(1-p.resourceSuccess)*Math.log1p(-p.cost/p.householdsPerEnrollee/p.baseline))/df;
 inc+=.5*p.g*other*Math.log1p((signed(p.otherGain,p.positiveOverlap)-p.otherCost)/p.baseline)/df;
 if((n+other)&&(p.payerLoss||p.externalCost))inc+=.5*p.payerPeople*Math.log1p(-(n*p.householdsPerEnrollee*p.resourceSuccess*p.payerLoss+(n+other)*p.externalCost)/p.payerPeople/p.payerBaseline)/df;
 near(x.union,n+other);near(s.union,n+other);near(x.clinicalPeople,n*p.k*p.a);near(s.incomeEquivalent,inc);near(s.incomePathways.reduce((sum,p)=>sum+incomeHealthyYearEquivalent(p),0),inc);
 if(p.partnerUnknown)assert.equal(s.costUSD,null);else near(s.costUSD,p.C+p.partnerCost);
 if(p.clinicalUnknown)assert.equal(s.editionQalys,null);else near(s.editionQalys,h);
 const total=p.clinicalUnknown||p.incomeUnknown?null:h+inc;
 if(total===null){assert.equal(s.totalEquivalent,null);assert.equal(s.price10,null);}else{near(s.totalEquivalent,total);if(total>0&&!p.partnerUnknown)near(s.price10,10*(p.C+p.partnerCost)/total);else assert.equal(s.price10,null);}
}
assert.ok(calculate().incomeEquivalent<0);assert.equal(calculate({b:0}).totalEquivalent,0);assert.equal(calculate({medicalGain:-300,positiveOverlap:0}).incomeEquivalent,calculate({medicalGain:-300,positiveOverlap:1}).incomeEquivalent);
assert.equal(calculate({medicalGain:-100,workGain:300}).incomePathways[0].annualIncomeGainUSD,-50);assert.equal(calculate({u:0}).price10,null);assert.equal(calculate({u:0,medicalGain:0,cost:0}).totalEquivalent,0);
console.log(JSON.stringify({status:'PASS',cases:cases.length,independentChecks:checks,price:calculate().price10}));

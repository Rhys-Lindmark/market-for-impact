import assert from 'node:assert/strict';import fs from 'node:fs';
import {calculate,cases,defaults} from '../docs/geography-discovery/chicago-fhpc-deep-20261005/model.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
const r=JSON.parse(fs.readFileSync('docs/geography-discovery/chicago-fhpc-deep-20261005/report.json'));
let checks=0;const near=(a,b)=>{checks++;assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));};
const signed=(v,k)=>v>0?v*k:v;
for(const[id,o]of cases){const p={...defaults,...o},x=calculate(o),s=r.model.scenarios.find(s=>s.id===id),n=p.N*p.b,hh=n*p.householdsPerPatient,cp=n*p.treatedFraction*p.a,df=(1+p.discount)**p.delay;const area=T=>Array.from({length:Math.ceil(T)},(_,y)=>Math.min(1,T-y)/(1+p.discount)**(p.delay+y)).reduce((a,b)=>a+b,0);
 const h=p.g*(cp*(p.eventMode?p.eventAnnualDifference*p.eventTransfer*p.eventQ*area(p.eventYears):p.u*area(p.T))-n*p.harm/df);
 const net=signed(p.medicalGain,p.positiveOverlap)+signed(p.workGain,p.positiveOverlap)-p.cost/p.householdsPerPatient;
 let inc=.5*p.g*hh*(p.resourceSuccess*Math.log1p(net/p.baseline)+(1-p.resourceSuccess)*Math.log1p(-p.cost/p.householdsPerPatient/p.baseline))/df;
 if(n&&(p.payerLoss||p.externalCost))inc+=.5*p.payerPeople*Math.log1p(-(hh*p.resourceSuccess*p.payerLoss+n*p.externalCost)/p.payerPeople/p.payerBaseline)/df;
 near(x.union,n);near(s.union,n);near(x.clinicalPeople,cp);near(s.incomeEquivalent,inc);near(s.incomePathways.reduce((sum,p)=>sum+incomeHealthyYearEquivalent(p),0),inc);
 if(p.costUnknown)assert.equal(s.costUSD,null);else near(s.costUSD,p.C+p.volunteerBudget);
 if(p.clinicalUnknown)assert.equal(s.editionQalys,null);else near(s.editionQalys,h);
 const total=p.clinicalUnknown||p.incomeUnknown?null:h+inc;
 if(total===null){assert.equal(s.totalEquivalent,null);assert.equal(s.price10,null);}else{near(s.totalEquivalent,total);if(total>0&&!p.costUnknown)near(s.price10,10*(p.C+p.volunteerBudget)/total);else assert.equal(s.price10,null);}
}
assert.ok(calculate().incomeEquivalent<0);assert.equal(calculate({b:0}).totalEquivalent,0);assert.equal(calculate({medicalGain:-300,positiveOverlap:0}).incomeEquivalent,calculate({medicalGain:-300,positiveOverlap:1}).incomeEquivalent);
assert.equal(calculate({medicalGain:-100,workGain:300}).incomePathways[0].annualIncomeGainUSD,-50);assert.equal(calculate({u:0}).price10,null);assert.equal(calculate({u:0,medicalGain:0,cost:0}).totalEquivalent,0);
console.log(JSON.stringify({status:'PASS',cases:cases.length,independentChecks:checks,price:calculate().price10}));

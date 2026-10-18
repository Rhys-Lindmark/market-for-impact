import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaults,scenarios} from '../docs/geography-discovery/nyc-onpoint-held-batch-20261005/model.mjs';
import {reportPrice} from '../lib/geography-reports.mjs';
let checks=0;
const near=(a,b)=>{assert.ok(Math.abs(a-b)<=1e-9*Math.max(1e-9,Math.abs(b)),`${a} != ${b}`);checks++;};
function integrate(f,a,b){if(a===b)return 0;const n=4000,step=(b-a)/n;let total=f(a)+f(b);for(let i=1;i<n;i++)total+=f(a+i*step)*(i%2?4:2);return total*step/3;}
function directHealth(o){const p={...defaults,...o},delta=p.E/p.U*p.l*p.a;
 const f=t=>(Math.exp(-p.m*t+delta*Math.min(t,1))-Math.exp(-p.m*t))*Math.exp(-Math.log(1+p.r)*t);
 return (p.U*p.u*(integrate(f,0,1)+integrate(f,1,p.T))*p.b/(1+p.r)**p.delay-p.h)*p.g;
}
function directIncome(p){let years=0;for(let i=0;i<Math.ceil(p.years);i++)years+=Math.min(1,p.years-i)*Math.pow(1+p.discountRate,-p.delayYears-i);
 return .5*p.people*years*Math.log((p.annualIncomeBeforeUSD+p.annualIncomeGainUSD)/p.annualIncomeBeforeUSD)*p.causalShare*p.editionShare*p.independentShare;
}
const report=JSON.parse(readFileSync(new URL('../docs/geography-discovery/nyc-onpoint-held-batch-20261005/report.json',import.meta.url)));
for(const s of scenarios()){
 const p=JSON.parse(s.assumptions.split('; ')[0]),h=directHealth(p);near(s.editionQalys,h);
 const income=s.incomeUnknown?null:s.incomePathways.reduce((a,p)=>a+directIncome(p),0);
 if(income===null){assert.equal(s.totalWelfareEquivalentHealthyYears,null);assert.equal(s.pricePer10WelfareEquivalent,null);checks+=2;}
 else{near(s.incomeEquivalentHealthyYears,income);near(s.totalWelfareEquivalentHealthyYears,h+income);if(h+income>0)near(s.pricePer10WelfareEquivalent,10*s.costUSD/(h+income));else{assert.equal(s.pricePer10WelfareEquivalent,null);checks++;}}
 for(const p of s.incomePathways)if(p.annualIncomeGainUSD<0){assert.equal(p.causalShare,1);assert.equal(p.independentShare,1);checks+=2;}
}
const initial=JSON.parse(readFileSync(new URL('../docs/geography-discovery/nyc-onpoint-held-batch-20261005/initial-diagnostic.json',import.meta.url)));
for(const s of initial.report.model.scenarios){near(directHealth(JSON.parse(s.assumptions)),s.editionQalys);near(directHealth({...JSON.parse(s.assumptions),g:1}),s.allPopulationQalys);}
const central=scenarios().find(s=>s.id==='central');near(reportPrice(report),central.pricePer10WelfareEquivalent);
console.log(JSON.stringify({status:'PASS',currentCases:scenarios().length,historicalCases:initial.report.model.scenarios.length,checks,referencePrice:central.pricePer10WelfareEquivalent}));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {reportPrice} from '../lib/geography-reports.mjs';
const dir=process.argv[2];if(!dir)throw Error('Provide absolute MFJ packet directory');
const r=JSON.parse(fs.readFileSync(path.join(dir,'report.json'))),a=JSON.parse(fs.readFileSync(path.join(dir,'initial-diagnostic.json')));
const engine=await import(pathToFileURL(path.join(dir,'model.mjs')));
let checks=0;const close=(a,b)=>{assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
function independentHealth(p){
 const outcomes=p.N*p.z*p.l*p.b*p.e*p.r*p.a;
 let q=0;
 for(let year=1;year<=Math.ceil(p.T);year++){
  const duration=Math.max(0,Math.min(year,p.T)-(year-1));
  q+=outcomes*p.u*duration*Math.exp(-p.m*year)*Math.pow(1+p.d,-year-p.delay);
 }
 return p.g*(q-p.h);
}
function independentIncome(p){
 // Net same-household flow before log; no use of shared/author calculator.
 const ratio=(p.annualIncomeBeforeUSD+p.annualIncomeGainUSD)/p.annualIncomeBeforeUSD;
 let total=0;
 for(let year=0;year<Math.ceil(p.years);year++)total+=Math.min(1,p.years-year)*Math.pow(1+p.discountRate,-year-p.delayYears);
 return Math.log(ratio)*total*p.people*.5*p.causalShare*p.editionShare*p.independentShare;
}
assert.deepEqual(r.model.historicalAlphaModel,a.report.model);checks++;
assert.deepEqual(r.historical.report,a.report);checks++;
assert.deepEqual(r.historical.sessions,a.sessions);checks++;
for(const historical of a.report.model.scenarios){
 const p={delay:0,...JSON.parse(historical.assumptions)};close(historical.editionQalys,independentHealth(p));
 if(historical.pricePer10Qalys!==null)close(historical.pricePer10Qalys,10*p.C/historical.editionQalys);
}
for(const s of r.model.scenarios){
 const p=JSON.parse(s.assumptions).health;close(s.editionQalys,independentHealth(p));
 const computed=engine.evaluate(s.id,s.label,s.parameterOverrides,s.incomeParameters,s.incomeUnknown);close(computed.editionQalys,s.editionQalys);
 if(s.incomeUnknown){assert.equal(s.incomeEquivalentHealthyYears,null);assert.equal(s.totalWelfareEquivalentHealthyYears,null);checks+=2;continue;}
 const ledger=s.incomePathways;close(ledger.reduce((sum,l)=>sum+l.people,0),s.additionalServiceExposures);
 const income=ledger.reduce((sum,l)=>sum+independentIncome(l),0);close(income,s.incomeEquivalentHealthyYears);close(s.editionQalys+income,s.totalWelfareEquivalentHealthyYears);
 for(const l of ledger)if(l.annualIncomeGainUSD<0){assert.equal(l.causalShare,1);assert.equal(l.independentShare,1);checks+=2;}
 const price=s.totalWelfareEquivalentHealthyYears>0?10*s.costUSD/s.totalWelfareEquivalentHealthyYears:null;
 if(price===null){assert.equal(s.pricePer10Qalys,null);checks++;}else close(price,s.pricePer10Qalys);
}
const center=r.model.scenarios.find(s=>s.id==='central');close(reportPrice(r),center.pricePer10Qalys);
const clinical=r.model.scenarios.find(s=>s.id==='clinical-null');assert.deepEqual(clinical.incomePathways,center.incomePathways);checks++;
console.log(JSON.stringify({passed:true,checks,currentCases:r.model.scenarios.length,historicalCases:a.report.model.scenarios.length,health:center.editionQalys,income:center.incomeEquivalentHealthyYears,price:reportPrice(r)}));

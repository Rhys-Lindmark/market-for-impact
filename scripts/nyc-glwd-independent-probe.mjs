import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {reportPrice,scenarioIncomeEquivalent} from '../lib/geography-reports.mjs';
const dir=process.argv[2];if(!dir)throw Error('Provide packet directory');
const r=JSON.parse(fs.readFileSync(path.join(dir,'report.json')));
const old=JSON.parse(fs.readFileSync(path.join(dir,'initial-diagnostic.json')));
let checks=0;const close=(a,b,label)=>{assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),label);checks++;};
assert.deepEqual(r.historical.report,old.report);assert.deepEqual(r.model.historicalAlphaModel,old.report.model);assert.deepEqual(r.historical.sessions,old.sessions);checks+=3;
for(const s of r.model.scenarios){
 const {health:p,resources:q}=JSON.parse(s.assumptions);
 const C=(p.F+p.E+p.I+p.L+p.V)*p.f+p.X;
 const delivered=Math.min(p.M/p.D,p.N)*p.r*p.t;
 const all=delivered*p.c*p.b*p.a*p.u/((1+p.d)**p.delay)-p.h;
 close(s.costUSD,C,s.id+' full cost');close(s.allPopulationQalys,all,s.id+' health');close(s.editionQalys,all*p.g,s.id+' boundary');
 if(s.incomeUnknown){assert.equal(s.pricePer10Qalys,null);checks++;continue;}
 let I=0;
 for(const x of s.incomePathways){
  let exposure=0;for(let k=0;k<Math.ceil(x.years);k++)exposure+=Math.min(1,x.years-k)/(1+x.discountRate)**(x.delayYears+k);
  I+=.5*x.people*exposure*Math.log((x.annualIncomeBeforeUSD+x.annualIncomeGainUSD)/x.annualIncomeBeforeUSD)*x.causalShare*x.editionShare*x.independentShare;
 }
 close(s.incomeEquivalentHealthyYears,I,s.id+' signed logarithmic resources');close(scenarioIncomeEquivalent(s),I,s.id+' production income');
 const W=all*p.g+I;close(s.totalWelfareEquivalentHealthyYears,W,s.id+' combined');
 if(W>0)close(s.pricePer10Qalys,10*C/W,s.id+' price');else{assert.equal(s.pricePer10Qalys,null);checks++;}
}
const central=r.model.scenarios.find(s=>s.id==='central');
const nullClinical=r.model.scenarios.find(s=>s.id==='clinical-null');
assert.deepEqual(nullClinical.incomePathways,central.incomePathways);checks++;
assert.ok(r.model.scenarios.find(s=>s.id==='negative').incomeEquivalentHealthyYears<0);checks++;
close(reportPrice(r),central.pricePer10Qalys,'production central headline');
console.log(JSON.stringify({checks,currentScenarios:r.model.scenarios.length,oldScenarios:old.report.model.scenarios.length,cost:central.costUSD,health:central.editionQalys,income:central.incomeEquivalentHealthyYears,price:reportPrice(r)}));

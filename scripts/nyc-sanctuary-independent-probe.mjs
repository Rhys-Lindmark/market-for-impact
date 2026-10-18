import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {C,parameters,specs,calculate,selftest} from '../docs/geography-discovery/nyc-sanctuary-held-batch-20261005/model.mjs';
const read=f=>JSON.parse(readFileSync(new URL('../docs/geography-discovery/nyc-sanctuary-held-batch-20261005/'+f,import.meta.url)));
let checks=0;
const near=(a,b)=>{assert.ok(Math.abs(a-b)<=1e-10*Math.max(1e-14,Math.abs(b)),`${a} != ${b}`);checks++;};
for(const spec of specs){
 const p={...parameters,...spec.o},r=calculate(spec);
 if(p.unknown){assert.equal(r.pricePer10Qalys,null);checks++;continue;}
 const scale=p.D/(p.C??C)*p.b,k=Math.log((1+p.d)/(1-p.clinicalMortality));
 const duration=k===0?p.clinicalT:(Math.exp(-k*p.clinicalLag)-Math.exp(-k*(p.clinicalLag+p.clinicalT)))/k;
 const health=scale*p.clinicalN*(p.clinicalR*p.clinicalU*duration-(p.healthHarm??0))*p.g;
 near(r.editionQalys,health);
 let income=0;
 if(!p.neutralIncome)for(const [N,Y,gain,years,delay,causal] of [[p.workforceNetGain<0?450:p.workforceN,p.workforceConsumption,p.workforceNetGain,p.workforceYears,p.workforceDelay,p.workforceCausal],[p.legalN,p.legalConsumption,p.legalNetGain,p.legalYears,p.legalDelay,p.legalCausal]]){
  let exposure=0;for(let i=0;i<Math.ceil(years);i++)exposure+=Math.min(1,years-i)*((1-p.financialMortality)/(1+p.d))**(delay+i);
  income+=.5*scale*N*Math.log((Y+gain)/Y)*exposure*p.g*(gain<0?1:causal)*(gain<0?1:p.independentShare);
 }
 if(p.incomeUnknown){assert.equal(r.incomeEquivalentYears,null);assert.equal(r.pricePer10Qalys,null);checks+=2;}
 else{near(r.incomeEquivalentYears,income);if(health+income>0)near(r.pricePer10Qalys,10*p.D/(health+income));else{assert.equal(r.pricePer10Qalys,null);checks++;}}
 if(p.workforceNetGain<0){assert.equal(r.incomePathways[0].causalShare,1);assert.equal(r.incomePathways[0].independentShare,1);checks+=2;}
}
const history=selftest(read('report.json'),read('initial-diagnostic.json'));
console.log(JSON.stringify({status:'PASS',cases:specs.length,checks,history,referencePrice:calculate(specs.find(s=>s.id==='central')).pricePer10Qalys}));

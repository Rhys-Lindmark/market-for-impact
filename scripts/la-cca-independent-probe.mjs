import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=process.argv[2];if(!dir)throw Error('Provide packet directory');
const r=JSON.parse(fs.readFileSync(path.join(dir,'report.json'))),old=JSON.parse(fs.readFileSync(path.join(dir,'initial-diagnostic.json')));
let checks=0;const close=(a,b,label)=>{assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),label);checks++;};
assert.equal(r.historical.initialReport,'initial-diagnostic.json');
assert.equal(r.historical.initialPricePerBetterLife,old.model.scenarios.find(s=>s.id==='central').costPer10Qalys);
assert.ok(JSON.stringify(r.model.historicalAlphaModel)===JSON.stringify(old.model),'Exact initial model retained');checks+=2;
function integral(f,T){let sum=f(0)+f(T);const n=4000,dt=T/n;for(let i=1;i<n;i++)sum+=(i%2===0?2:4)*f(i*dt);return sum*dt/3;}
for(const s of r.model.scenarios){
 const x=s.inputs;if(!x)throw Error('Scenario lacks explicit input ledger');
 const h1=x.h0*Math.exp(-Math.log(x.HR)*x.transport*x.pm/10),a=Math.min(x.A,x.T),r=Math.log1p(.03);
 const durable=integral(t=>x.u*(Math.exp(-h1*t)-Math.exp(-x.h0*t))*Math.exp(-r*t),x.T);
 const timingIntegrand=t=>x.u*(Math.exp(-h1*t)-Math.exp(-x.h0*Math.min(t,a)-h1*Math.max(0,t-a)))*Math.exp(-r*t);
 const accelerated=integral(timingIntegrand,a)+(x.T>a?integral(t=>timingIntegrand(a+t),x.T-a):0);
 const q=(x.f*durable+(1-x.f)*accelerated)/1.03**x.L;
 const health=x.gift/(x.E*x.Y)*x.b*(x.p*x.N*q-x.harm);
 close(s.editionQalys,health,s.id+' competing survival');
 if(s.incomeUnknown){assert.equal(s.costPer10Qalys,null);checks++;continue;}
 let I=0;for(const p of s.incomePathways){let years=0;for(let k=0;k<Math.ceil(p.years);k++)years+=Math.min(1,p.years-k)/(1+p.discountRate)**(p.delayYears+k);I+=.5*p.people*years*Math.log((p.annualIncomeBeforeUSD+p.annualIncomeGainUSD)/p.annualIncomeBeforeUSD)*p.causalShare*p.editionShare*p.independentShare;}
 close(s.incomeEquivalentYears,I,s.id+' household log');close(s.combinedEquivalentYears,health+I,s.id+' combined');if(health+I>0)close(s.costPer10Qalys,10*x.gift/(health+I),s.id+' price');else {assert.equal(s.costPer10Qalys,null);checks++;}
}
console.log(JSON.stringify({checks,cases:r.model.scenarios.length,central:r.model.scenarios.find(s=>s.id==='central').costPer10Qalys}));

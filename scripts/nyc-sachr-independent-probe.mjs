import assert from 'node:assert/strict';
import {calculate,definitions} from '../docs/geography-discovery/nyc-deep-batch-20261005/sachr-model.mjs';
const integrate=(fn,lo,hi,n=100000)=>{let s=0;for(let i=0;i<n;i++)s+=fn(lo+(i+.5)*(hi-lo)/n);return s*(hi-lo)/n;};
let checks=0;
for(const [id,_,o] of definitions){
 const v=calculate(o),x=v.x,k=Math.log1p(x.r),E=x.G*x.b*x.N*x.f/x.C;
 const deltaSurvival=t=>t<=1?Math.exp(-(x.mHigh-x.delta)*t)-Math.exp(-x.mHigh*t):(Math.exp(-(x.mHigh-x.delta))-Math.exp(-x.mHigh))*Math.exp(-x.mHigh*(t-1));
 const clinical=E*x.a*x.z*x.u*Math.exp(-(x.mHigh+k)*x.L)*(integrate(t=>deltaSurvival(t)*Math.exp(-k*t),0,1)+integrate(t=>deltaSurvival(t)*Math.exp(-k*t),1,x.T));
 assert.ok(Math.abs(clinical-v.mortality)<1e-10,id+' survival');checks++;
 const common=t=>x.z*Math.exp(-x.mHigh*t)+(1-x.z)*Math.exp(-x.mLow*t);
 const utility=E*x.a*x.p*x.v*integrate(t=>common(x.L+t)*Math.exp(-k*(x.L+t)),0,1);
 assert.ok(Math.abs(utility-v.morbidity)<1e-11,id+' common-alive morbidity');checks++;
 let income=0;
 for(const p of v.incomePathways){
  assert.equal(p.years,1);
  assert.ok(p.annualIncomeBeforeUSD+p.annualIncomeGainUSD>0);
  const q=.5*p.people*Math.log((p.annualIncomeBeforeUSD+p.annualIncomeGainUSD)/p.annualIncomeBeforeUSD)*p.causalShare*p.editionShare*p.independentShare/(1+p.discountRate)**p.delayYears;
  income+=q;checks++;
  if(p.annualIncomeGainUSD<0){assert.equal(p.independentShare,1);checks++;}
 }
 assert.ok(Math.abs(income-v.income)<1e-12,id+' resource log');checks++;
 assert.ok(Math.abs(v.total-(x.g*(clinical+utility-v.harm)+income))<1e-10,id+' combined');checks++;
}
const v=calculate();
assert.throws(()=>calculate({Y:10}));checks++;
assert.throws(()=>calculate({buyer:.8,unmet:.8}));checks++;
assert.equal(calculate({b:0}).total,0);checks++;
assert.ok(calculate({positiveIndependent:0}).income<0);checks++;
console.log(JSON.stringify({status:'PASS',cases:definitions.length,checks,price:v.price,health:v.editionQalys,income:v.income,combined:v.total}));


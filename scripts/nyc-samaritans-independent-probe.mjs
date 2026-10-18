import assert from 'node:assert/strict';
import {base,calculate,definitions} from '../docs/geography-discovery/nyc-deep-batch-20261005/samaritans-model.mjs';
const integrate=(f,hi,n=100000)=>{let a=0;for(let i=0;i<n;i++)a+=f((i+.5)*hi/n);return a*hi/n;};
let checks=0;
const close=(a,b)=>{assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)));checks++;};
for(const [, ,overrides] of definitions){
 const x={...base,...overrides},v=calculate(overrides);
 const episodes=x.G*x.b*x.N*x.f/x.C*x.episode;
 const alive=Math.exp(-x.m*x.L),discount=t=>(1+x.r)**(-t);
 const mortality=episodes*x.a*x.s*x.R*x.e*alive*discount(x.L)*x.u*integrate(t=>Math.exp(-x.m*t)*discount(t),x.T);
 const morbidity=episodes*x.a*(1-x.s*x.R)*alive*x.p*x.v*discount(x.L)*integrate(t=>Math.exp(-x.m*t)*discount(t),x.days/365);
 const harm=episodes*x.h*alive*discount(x.L);
 close(v.E,episodes);close(v.mortality,mortality);close(v.morbidity,morbidity);close(v.harm,harm);
 const receipt=x.L+x.days/365,commonAlive=(1-x.s*x.R)*Math.exp(-x.m*receipt),h=episodes*x.households;
 const cash=(people,gain,Y)=>people*.5*Math.log1p(gain/Y)*commonAlive*x.g*discount(receipt)*(gain>0?x.positiveIndependent:1);
 let income=cash(h,-x.phone,x.Y);
 for(const [share,care]of[[x.careShare,x.careCost],[1-x.careShare,0]]){
  income+=cash(h*share,-care,x.Y-x.phone);
  income+=cash(h*share*x.workShare,x.netPay,x.Y-x.phone-care);
 }
 close(v.income,income);close(v.editionQalys,x.g*(mortality+morbidity-harm));
 const total=x.g*(mortality+morbidity-harm)+income;close(v.total,total);
 const cost=x.G+episodes*x.external;close(v.cost,cost);
 if(total>0)close(v.price,10*cost/total);else{assert.equal(v.price,null);checks++;}
 if(episodes===0){assert.equal(v.total,0);checks++;}
}
console.log(JSON.stringify({status:'PASS',cases:definitions.length,checks,central:calculate().price}));



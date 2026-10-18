import fs from 'node:fs';import assert from 'node:assert/strict';
let checks=0,cases=0;
const near=(a,b,label)=>{if(a===null||b===null)assert.equal(a,b,label);else assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)),label);checks++;};
const price=(C,H,I)=>H!==null&&I!==null&&H+I>0?10*C/(H+I):null;
function tep(p){let d=0;for(let i=0;i<Math.ceil(p.T);i++)d+=Math.min(1,p.T-i)/(1+p.r)**(p.delay+i);
const H=p.clinicalUnknown?null:(p.N*p.b*p.eligible*p.completion*p.response*p.q*d-p.N*p.harm/(1+p.r)**p.delay)*p.g;
const hh=p.N*p.unique,changed=hh*p.b*p.eligible*p.completion*p.response*p.success,pos=x=>x>0?x*p.overlap:x;
const W=(n,base,gain,share=p.g)=>.5*n*share*Math.log((base+gain)/base)/(1+p.r)**p.delay;
let I=W(changed,p.baseline,pos(p.workGain)+pos(p.medicalGain)-p.cost)+W(hh-changed,p.baseline,-p.cost);
if(hh&&(p.payerLoss||p.externalCost))I+=W(p.payerPeople,p.payerBaseline,-p.g*(changed*p.payerLoss+hh*p.eligible*p.completion*p.externalCost)/p.payerPeople,1);
return {H,I,P:p.costUnknown?null:price(p.C,H,p.incomeUnknown?null:I)};
}
function dln(p){if(!p.fundingKnown&&p.G!==0)return{H:null,I:null,P:null};
const n=Math.min(p.G/p.c*p.b,p.capacity),c=n*p.r,buy=c*p.purchaseShare,free=c*(1-p.purchaseShare)*(1-p.s),a=c*(1-p.purchaseShare)*p.s,z=Math.log1p(p.d),k=z+p.m+p.loss+p.catchup;
const H=n===0?0:p.healthKnown?p.g*(a*(p.u*Math.exp(-z*p.L)*(k===0?p.T:(1-Math.exp(-k*p.T))/k)-p.h*Math.exp(-z*p.L))-n*p.ha):null;
const W=(num,delta,base,time,ind=1)=>.5*num*Math.log((base+delta)/base)/(1+p.d)**time*ind;
let cash=W(n,-p.applicationCash,p.baseline,p.applicationTime)+W(buy,p.purchaseCash-p.purchaserTravel,p.baseline,p.L)+W(free,-p.freeAlternativeTravel,p.baseline,p.L)+W(a,-p.newCareTravel-p.newCareLostPay,p.baseline,p.L)+W(c,-p.volunteerCash,p.volunteerBaseline,p.volunteerTime),earn=0;
for(let i=0;i<Math.ceil(p.maintenanceYears);i++)cash+=W(a*Math.exp(-p.m*(i+1)),-p.maintenanceCash*Math.min(1,p.maintenanceYears-i),p.baseline,p.L+1+i);
for(let i=0;i<Math.ceil(p.earningsYears);i++)earn+=W(a*p.workerShare*Math.exp(-(p.m+p.loss+p.catchup)*Math.max(0,p.earningsDelay+i-p.L)),p.annualNetPayGain*Math.min(1,p.earningsYears-i),p.baseline-(i===0?p.newCareTravel+p.newCareLostPay:p.maintenanceCash),p.earningsDelay+i,p.annualNetPayGain>0?p.incomeIndependent:1);
const cashKnown=n===0||p.cashKnown,earnKnown=n===0||a*p.workerShare===0||p.annualNetPayGain===0||p.earningsYears===0||(p.earningsKnown&&p.healthKnown&&p.cashKnown),I=cashKnown&&earnKnown?p.g*(cash+earn):null;
return{H,I,P:price(p.G,H,I)};
}
for(const [name,reconstruct]of [['tepeyac',tep],['dln',dln]]){const m=await import('./'+name+'-model.mjs');const r=JSON.parse(fs.readFileSync(new URL('./'+name+'-report.json',import.meta.url)));for(const[id,o]of m.cases){const p={...m.defaults,...o},x=reconstruct(p),actual=m.calculate(o),s=r.model.scenarios.find(x=>x.id===id);assert.ok(s,id);for(const[k,v]of Object.entries({editionQalys:x.H,incomeEquivalent:x.I,price10:x.P})){near(actual[k],v,name+':'+id+':model:'+k);near(s[k],v,name+':'+id+':serialized:'+k);}cases++;}}
console.log(JSON.stringify({passed:true,independentChecks:checks,scenarios:cases}));

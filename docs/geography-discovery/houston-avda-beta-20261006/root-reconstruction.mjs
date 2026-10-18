import assert from 'node:assert/strict';
import {calculate,defaults,scenarios} from './model.mjs';
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`)};
function reconstruct(o={}){
 const p={...defaults,...o};let healthDuration=0;for(let y=0;y<p.T;y++)healthDuration+=Math.min(1,p.T-y)*(1+p.discount)**(-p.delay-y);
 const exposure=p.N*p.unique,changed=exposure*p.b*p.success;
 const health=(p.clinicalN*p.unique*p.b*p.clinicalResponse*p.q*healthDuration-exposure*p.harm*(1+p.discount)**(-p.delay))*p.g;
 const gains=[p.workGain,p.medicalGain,p.transferGain].reduce((n,x)=>n+(x>0?x*p.overlap:x),0)*p.resourceYears-p.cost;
 const discount=(1+p.discount)**(-p.delay);
 const recipient=.5*p.g*discount*(changed*Math.log1p(gains/p.baseline)+(exposure-changed)*Math.log1p(-p.cost/p.baseline));
 const payerLoss=p.g*(changed*p.payerLoss*p.resourceYears+exposure*p.externalCost);
 const payer=(payerLoss!==0||p.payerLoss||p.externalCost)&&exposure>0?.5*p.payerPeople*discount*Math.log1p(-payerLoss/(p.payerPeople*p.payerBaseline)):0;
 const income=recipient+payer,total=p.clinicalUnknown||p.incomeUnknown?null:health+income,price=p.costUnknown||!(total>0)?null:10*p.C/total;
 return {health:p.clinicalUnknown?null:health,income,total,price};
}
let n=0;for(const s of scenarios()){const r=reconstruct(s.overrides);for(const [a,b]of [[s.editionQalys,r.health],[s.incomeEquivalent,r.income],[s.totalEquivalent,r.total],[s.price10,r.price]]){near(a,b);n++}}
assert(calculate({b:0}).totalEquivalent<0,'All-client burdens survive causal-benefit failure');
assert.equal(calculate({N:0,clinicalN:0}).totalEquivalent,0);
assert.equal(calculate({b:0}).price10,null);
assert(calculate({g:0}).totalEquivalent===0,'Geographic attribution applied once to recipient and associated payer loss');
assert(calculate({q:0}).incomeEquivalent===calculate().incomeEquivalent,'Financial effects independent of clinical efficacy');
assert(calculate({workGain:-100,overlap:0,medicalGain:0,transferGain:0}).incomeEquivalent===calculate({workGain:-100,overlap:1,medicalGain:0,transferGain:0}).incomeEquivalent,'Overlap cannot erase losses');
console.log(JSON.stringify({checks:n+6,cases:scenarios().length,central:reconstruct(),initialPrice:3105274.584968738}));

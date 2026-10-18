import assert from 'node:assert/strict';
import {calculate,defaults,scenarios} from './model.mjs';
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`)};
function reconstruct(o={}){
 const p={...defaults,...o};if(p.legacyResource)for(const k of ['resourceN','transferN','intersectionN','intensiveN'])p[k]=p.N;
 let duration=0;for(let y=0;y<p.T;y++)duration+=Math.min(1,p.T-y)*(1+p.discount)**(-p.delay-y);
 const exposure=p.N*p.unique*(p.legacyExposure?p.b:1),df=(1+p.discount)**(-p.delay);
 const health=(p.clinicalN*p.unique*p.b*p.clinicalResponse*p.q*duration-exposure*p.harm*df)*p.g;
 const scale=p.unique*p.b*p.success,both=p.intersectionN*scale,work=(p.resourceN-p.intersectionN)*scale,transfer=(p.transferN-p.intersectionN)*scale;
 const intensive=p.legacyExposure?exposure:p.intensiveN*p.unique,changed=both+work+transfer;
 const gain=(w,t)=>[p.medicalGain,w,t].reduce((a,x)=>a+(x>0?x*p.overlap:x),0)*p.resourceYears-p.cost;
 const cohorts=[[both,gain(p.workGain,p.transferGain)],[work,gain(p.workGain,0)],[transfer,gain(0,p.transferGain)],[intensive-changed,-p.cost],[exposure-intensive,-p.otherCost]];
 near(cohorts.reduce((a,[n])=>a+n,0),exposure);assert(cohorts.every(([n])=>n>=0));
 const recipient=.5*p.g*df*cohorts.reduce((a,[n,d])=>a+n*Math.log1p(d/p.baseline),0);
 const loss=p.g*((both+transfer)*p.payerLoss*p.resourceYears+exposure*p.externalCost);
 const payer=exposure>0&&(p.payerLoss||p.externalCost)? .5*p.payerPeople*df*Math.log1p(-loss/(p.payerPeople*p.payerBaseline)):0;
 const income=recipient+payer,total=p.clinicalUnknown||p.incomeUnknown?null:health+income,price=p.costUnknown||!(total>0)?null:10*p.C/total;
 return {health:p.clinicalUnknown?null:health,income,total,price};
}
let n=0;for(const s of scenarios()){const r=reconstruct(s.overrides);for(const [a,b]of [[s.editionQalys,r.health],[s.incomeEquivalent,r.income],[s.totalEquivalent,r.total],[s.price10,r.price]]){near(a,b);n++}}
assert(calculate({b:0}).totalEquivalent<0);assert.equal(calculate({N:0,clinicalN:0,resourceN:0,transferN:0,intersectionN:0,intensiveN:0}).totalEquivalent,0);assert.equal(calculate({b:0}).price10,null);assert.equal(calculate({g:0}).totalEquivalent,0);
assert.equal(calculate({q:0}).incomeEquivalent,calculate().incomeEquivalent);
assert.equal(calculate({medicalGain:-100,workGain:0,transferGain:0,overlap:0}).incomeEquivalent,calculate({medicalGain:-100,workGain:0,transferGain:0,overlap:1}).incomeEquivalent);
console.log(JSON.stringify({checks:n+6,cases:scenarios().length,central:reconstruct()}));

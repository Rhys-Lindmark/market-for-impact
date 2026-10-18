import assert from 'node:assert/strict';
import {calculate,defaults,cases} from './cchi-model.mjs';
let checks=0;
const near=(a,b,label)=>{assert.equal(a===null,b===null,label);if(a!==null)assert.ok(Math.abs(a-b)<=Math.max(1e-9,Math.abs(b)*1e-10),`${label}: ${a} != ${b}`);checks++;};
function independent(x){
 const p={...defaults,...x};let years=0;for(let year=0;year<Math.ceil(p.T);year++)years+=Math.min(1,p.T-year)*Math.pow(1+p.r,-p.delay-year);
 const exposed=p.N*p.unique,additional=exposed*p.b,helped=additional*p.success;
 const health=p.clinicalUnknown?null:p.g*(additional*p.eligible*p.completion*p.response*p.q*years-exposed*p.harm*Math.pow(1+p.r,-p.delay));
 const net=(p.workGain>0?p.workGain*p.overlap:p.workGain)+(p.medicalGain>0?p.medicalGain*p.overlap:p.medicalGain)-p.cost;
 const log=(people,base,delta,share)=>people===0?0:.5*people*Math.log((base+delta)/base)*share*Math.pow(1+p.r,-p.delay);
 const income=log(helped,p.baseline,net,p.g)+log(exposed-helped,p.baseline,-p.cost,p.g)+(exposed&&(p.payerLoss||p.externalCost)?log(p.payerPeople,p.payerBaseline,-p.g*(helped*p.payerLoss+exposed*p.externalCost)/p.payerPeople,1):0);
 const total=health===null||p.incomeUnknown?null:health+income,cost=p.costUnknown?null:p.C;
 return {editionQalys:health,incomeEquivalent:income,totalEquivalent:total,price10:cost!==null&&total>0?cost*10/total:null};
}
for(const[id,overrides]of cases){const got=calculate(overrides),want=independent(overrides);for(const field of Object.keys(want))near(got[field],want[field],`${id}/${field}`);}
near((1801425+1536690+1548673)/3,1628929.3333333333,'three full years');
assert.ok(calculate({q:0,harm:0}).incomeEquivalent<0,'financial-only retains full distinct payer incidence');checks++;
assert.equal(calculate({N:0}).price10,null,'no beneficiaries does not fabricate price');checks++;
console.log(JSON.stringify({checks,scenarios:cases.length,central:independent({})}));

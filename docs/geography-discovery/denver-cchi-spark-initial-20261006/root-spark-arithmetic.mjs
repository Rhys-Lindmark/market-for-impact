import assert from 'node:assert/strict';
import {calculate,defaults,cases} from './spark-model.mjs';
let checks=0;
const near=(a,b,label)=>{assert.equal(a===null,b===null,label);if(a!==null)assert.ok(Math.abs(a-b)<=Math.max(1e-9,Math.abs(b)*1e-10),label);checks++;};
function independent(o){
 const p={...defaults,...o};let duration=0;for(let y=0;y<Math.ceil(p.T);y++)duration+=Math.min(1,p.T-y)*Math.pow(1+p.r,-p.delay-y);
 const exposed=p.N*p.unique,additional=exposed*p.b,changed=additional*p.eligible*p.completion*p.success;
 const health=p.clinicalUnknown?null:p.g*(additional*p.eligible*p.completion*p.response*p.q*duration-exposed*p.harm*Math.pow(1+p.r,-p.delay));
 const delta=(p.workGain>0?p.workGain*p.overlap:p.workGain)+(p.medicalGain>0?p.medicalGain*p.overlap:p.medicalGain)-p.cost;
 const log=(n,base,gain,share)=>n===0?0:.5*n*Math.log((base+gain)/base)*share*Math.pow(1+p.r,-p.delay);
 const income=log(changed,p.baseline,delta,p.g)+log(exposed-changed,p.baseline,-p.cost,p.g)+(exposed&&(p.payerLoss||p.externalCost)?log(p.payerPeople,p.payerBaseline,-p.g*(changed*p.payerLoss+exposed*p.completion*p.externalCost)/p.payerPeople,1):0);
 const total=health===null||p.incomeUnknown?null:health+income,cost=p.costUnknown?null:p.C;
 return {editionQalys:health,incomeEquivalent:income,totalEquivalent:total,price10:cost!==null&&total>0?10*cost/total:null};
}
for(const[id,o]of cases){const got=calculate(o),want=independent(o);for(const key of Object.keys(want))near(got[key],want[key],id+'/'+key);}
near((2111453+2250016+2195617)/3,2185695.3333333335,'three-year mean');
for(const o of [{eligible:0},{completion:0}]){assert.ok(!calculate(o).incomePathways.some(p=>p.id==='changed-households'));checks++;}
assert.ok(calculate({b:0}).incomeEquivalent<0);checks++;
assert.equal(calculate({N:0}).price10,null);checks++;
console.log(JSON.stringify({checks,scenarios:cases.length,central:independent({})}));

import assert from 'node:assert/strict';
let checks=0;
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)),a+' vs '+b);checks++;};
for(const name of ['dcac','blue']){
const {calculate,defaults,cases}=await import('./'+name+'-model.mjs');
for(const [id,o] of cases){
const p={...defaults,...o};let years=0;for(let i=0;i<Math.ceil(p.T);i++)years+=Math.min(1,p.T-i)*Math.pow(1+p.r,-p.delay-i);
const n=p.N*p.unique,changed=n*p.b*p.eligible*p.completion*p.success;
const health=(n*p.b*p.eligible*p.completion*p.response*p.q*years-n*p.harm*Math.pow(1+p.r,-p.delay))*p.g;
const gain=(p.workGain>0?p.workGain*p.overlap:p.workGain)+(p.medicalGain>0?p.medicalGain*p.overlap:p.medicalGain)-p.cost;
const discount=Math.pow(1+p.r,-p.delay);
let income=.5*p.g*discount*(changed*Math.log((p.baseline+gain)/p.baseline)+(n-changed)*Math.log((p.baseline-p.cost)/p.baseline));
if(n&&(p.payerLoss||p.externalCost))income+=.5*p.payerPeople*discount*Math.log((p.payerBaseline-p.g*(changed*p.payerLoss+n*p.completion*p.externalCost)/p.payerPeople)/p.payerBaseline);
const total=p.clinicalUnknown||p.incomeUnknown?null:health+income,cost=p.costUnknown?null:p.C;
const x=calculate(o);near(x.editionQalys,p.clinicalUnknown?null:health);near(x.incomeEquivalent,income);near(x.totalEquivalent,total);near(x.costUSD,cost);near(x.price10,cost!==null&&total>0?10*cost/total:null);
}
const c=calculate();assert.ok(c.editionQalys>0&&c.incomeEquivalent<0);checks++;
assert.equal(calculate({eligible:0,workGain:9999}).incomeEquivalent,calculate({eligible:0}).incomeEquivalent);checks++;
assert.equal(calculate({completion:0,workGain:9999}).incomeEquivalent,calculate({completion:0}).incomeEquivalent);checks++;
}
console.log(JSON.stringify({passed:true,independentChecks:checks,scenarios:80}));

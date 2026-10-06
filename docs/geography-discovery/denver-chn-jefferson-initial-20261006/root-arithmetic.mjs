import assert from 'node:assert/strict';
let checks=0,scenarioCount=0;
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)));checks++;};
for(const name of ['chn','jefferson']){
 const mod=await import('./'+name+'-model.mjs');
 for(const[id,o]of mod.cases){
  const p={...mod.defaults,...o},d=Math.pow(1+p.r,-p.delay),households=p.N*p.unique;
  let duration=0;for(let i=0;i<Math.ceil(p.T);i++)duration+=Math.min(1,p.T-i)*Math.pow(1+p.r,-p.delay-i);
  const health=(p.N*p.b*p.eligible*p.completion*p.response*p.q*duration-p.N*p.harm*d)*p.g;
  const changed=households*p.b*p.eligible*p.completion*p.success*(name==='chn'?p.response:1),positive=x=>x>0?x*p.overlap:x;
  const gain=positive(p.workGain)+positive(p.medicalGain)-p.cost;
  let income=.5*p.g*d*(changed*Math.log((p.baseline+gain)/p.baseline)+(households-changed)*Math.log((p.baseline-p.cost)/p.baseline));
  if(households&&(p.payerLoss||p.externalCost))income+=.5*p.payerPeople*d*Math.log((p.payerBaseline-p.g*(changed*p.payerLoss+households*p.eligible*p.completion*p.externalCost)/p.payerPeople)/p.payerBaseline);
  const cost=p.costUnknown?null:p.C,total=p.clinicalUnknown||p.incomeUnknown?null:health+income,x=mod.calculate(o);
  near(x.editionQalys,p.clinicalUnknown?null:health);near(x.incomeEquivalent,income);near(x.totalEquivalent,total);near(x.costUSD,cost);near(x.price10,cost!==null&&total>0?10*cost/total:null);scenarioCount++;
 }
 near(mod.calculate({unique:.5}).editionQalys,mod.calculate().editionQalys);
 near(mod.calculate({b:0,workGain:0}).incomeEquivalent,mod.calculate({b:0,workGain:1000}).incomeEquivalent);
 if(name==='chn')near(mod.calculate({response:0,workGain:0}).incomeEquivalent,mod.calculate({response:0,workGain:1000}).incomeEquivalent);
}
console.log(JSON.stringify({passed:true,independentChecks:checks,scenarios:scenarioCount}));

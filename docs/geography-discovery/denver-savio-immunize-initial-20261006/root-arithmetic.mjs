import assert from 'node:assert/strict';
let checks=0,cases=0;
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)),a+' vs '+b);checks++;};
for(const name of ['savio','immunize']){
 const mod=await import('./'+name+'-model.mjs');
 for(const [id,o] of mod.cases){
  const p={...mod.defaults,...o}; let years=0;for(let i=0;i<Math.ceil(p.T);i++)years+=Math.min(1,p.T-i)*Math.pow(1+p.r,-p.delay-i);
  const discount=Math.pow(1+p.r,-p.delay), households=p.N*p.unique;
  const health=(p.N*p.b*p.eligible*p.completion*p.response*p.q*years-p.N*p.harm*discount)*p.g;
  const pos=v=>v>0?v*p.overlap:v;
  let income=0,changed=0;
  const groups=name==='immunize'?[[p.childShare,p.caregiverWorkMultiplier,true],[p.adultShare,p.adultWorkMultiplier,true],[1-p.childShare-p.adultShare,0,false]]:[[1,1,true]];
  for(const [share,mult,benefit] of groups){
   const n=households*share,z=benefit?n*p.b*p.eligible*p.completion*p.success:0;changed+=z;
   const gain=pos(p.workGain*mult)+pos(p.medicalGain)-p.cost;
   income+=.5*p.g*discount*(z*Math.log((p.baseline+gain)/p.baseline)+(n-z)*Math.log((p.baseline-p.cost)/p.baseline));
  }
  if(households&&(p.payerLoss||p.externalCost))income+=.5*p.payerPeople*discount*Math.log((p.payerBaseline-p.g*(changed*p.payerLoss+households*p.completion*p.externalCost)/p.payerPeople)/p.payerBaseline);
  const total=p.clinicalUnknown||p.incomeUnknown?null:health+income,cost=p.costUnknown?null:p.C,x=mod.calculate(o);
  near(x.editionQalys,p.clinicalUnknown?null:health);near(x.incomeEquivalent,income);near(x.totalEquivalent,total);near(x.costUSD,cost);near(x.price10,cost!==null&&total>0?10*cost/total:null);cases++;
 }
 const base=mod.calculate();
 near(base.editionQalys,mod.calculate({unique:.5}).editionQalys);
 assert.ok(base.editionQalys>0&&base.incomeEquivalent<0);checks++;
 near(mod.calculate({b:0}).incomeEquivalent,mod.calculate({b:0,workGain:9999}).incomeEquivalent);
 near(mod.calculate({completion:0}).incomeEquivalent,mod.calculate({completion:0,workGain:9999}).incomeEquivalent);
 near(mod.calculate({eligible:0}).incomeEquivalent,mod.calculate({eligible:0,workGain:9999}).incomeEquivalent);
 if(name==='immunize'){near(mod.defaults.childShare,388/440);near(mod.defaults.adultShare,49/440);near(base.incomePathways.reduce((s,p)=>s+p.people,0),440*.8);}
}
console.log(JSON.stringify({passed:true,independentChecks:checks,scenarios:cases}));

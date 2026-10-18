import assert from 'node:assert/strict';
for(const prefix of ['secondwind','droste']){
 const m=await import('./'+prefix+'-model.mjs');let checks=0;
 for(const [id,o] of m.cases){
  const p={...m.defaults,...o},v=m.calculate(o),n=p.N*p.unique,changed=n*p.b*p.success,d=(1+p.r)**(-p.delay);
  let duration=0;for(let y=0;y<Math.ceil(p.T);y++)duration+=Math.min(1,p.T-y)/(1+p.r)**(p.delay+y);
  const health=p.clinicalUnknown?null:(n*p.b*p.response*p.q*duration-n*p.harm*d)*p.g;
  const pos=x=>x>0?x*p.overlap:x,net=pos(p.workGain)+pos(p.medicalGain)-p.cost;
  const log=(people,baseline,gain,share)=>people?.5*people*share*d*Math.log((baseline+gain)/baseline):0;
  let income=log(changed,p.baseline,net,p.g)+log(n-changed,p.baseline,-p.cost,p.g);
  if(n&&(p.payerLoss||p.externalCost))income+=log(p.payerPeople,p.payerBaseline,-p.g*(changed*p.payerLoss+n*p.externalCost)/p.payerPeople,1);
  const total=health===null||p.incomeUnknown?null:health+income,price=p.costUnknown||!(total>0)?null:10*p.C/total;
  for(const [key,expected] of [['editionQalys',health],['incomeEquivalent',income],['totalEquivalent',total],['price10',price]]){if(expected===null)assert.equal(v[key],null,id);else assert.ok(Math.abs(v[key]-expected)<1e-10*Math.max(1,Math.abs(expected)),id+' '+key);checks++;}
 }
 assert.ok(m.calculate({b:0}).incomeEquivalent<0);checks++;
 assert.equal(m.calculate({N:0}).incomeEquivalent,0);checks++;
 assert.equal(m.calculate({g:0}).incomeEquivalent,0);checks++;
 assert.equal(m.calculate({workGain:-500,overlap:0}).incomeEquivalent,m.calculate({workGain:-500,overlap:1}).incomeEquivalent);checks++;
 console.log(JSON.stringify({prefix,cases:m.cases.length,checks,central:m.calculate().price10}));
}

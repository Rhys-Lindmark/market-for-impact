import assert from 'node:assert/strict';
const duration=(years,delay,r)=>{let d=0;for(let i=0;i<Math.ceil(years);i++)d+=Math.min(1,years-i)/(1+r)**(delay+i);return d};
const log=(people,base,gain,share,years,delay,r)=>people&&years>0?.5*people*share*duration(years,delay,r)*Math.log((base+gain)/base):0;
let checks=0,scenarios=0;
for(const pre of ['energy','cultivando']){
 const m=await import('./'+pre+'-model.mjs');
 for(const [id,o] of m.cases){
  const p={...m.defaults,...o},v=m.calculate(o),positive=x=>x>0?x*p.overlap:x;
  let h,inc=0;
  if(pre==='energy'){
   const exposed=p.N*p.channel*p.unique,union=exposed*p.b,changed=union*p.success;
   h=(union*p.response*p.q*duration(p.T,p.delay,p.r)-exposed*p.harm/(1+p.r)**p.delay)*p.g;
   inc=log(changed,p.baseline,positive(p.workGain)+positive(p.medicalGain)-p.cost,p.g,1,p.delay,p.r)+log(exposed-changed,p.baseline,-p.cost,p.g,1,p.delay,p.r);
   if(exposed)inc+=log(p.payerPeople,p.payerBaseline,-p.g*(union*p.payerLoss+exposed*p.externalCost)/p.payerPeople,1,1,p.delay,p.r);
  }else{
   const b=p.implementation*p.attribution,changed=p.N*p.householdShare*b;
   h=(p.N*b*p.q*duration(p.T,p.delay,p.r)-p.engaged*p.harm)*p.g;
   if(p.delay===0){
    const ce=Math.min(p.engaged,p.N*p.householdShare)*b;
    inc+=log(ce,p.baseline,positive(p.resourceGain)*Math.min(1,p.T)-p.cost,p.g,1,0,p.r);
    inc+=log(changed-ce,p.baseline,positive(p.resourceGain)*Math.min(1,p.T),p.g,1,0,p.r);
    inc+=log(p.engaged-ce,p.baseline,-p.cost,p.g,1,0,p.r);
    inc+=log(changed,p.baseline,positive(p.resourceGain),p.g,Math.max(0,p.T-1),1,p.r);
   }else{
    inc+=log(changed,p.baseline,positive(p.resourceGain),p.g,p.T,p.delay,p.r);
    inc+=log(p.engaged,p.baseline,-p.cost,p.g,1,0,p.r);
   }
   inc+=log(p.payerPeople,p.payerBaseline,-p.g*b*p.externalCost/p.payerPeople,1,1,p.delay,p.r);
   inc+=log(p.displacedPeople*b,p.baseline,positive(p.displacedGain),p.g,1,p.delay,p.r);
  }
  if(p.clinicalUnknown)h=null;
  const total=h===null||p.incomeUnknown?null:h+inc,price=p.costUnknown||!(total>0)?null:10*p.C/total;
  for(const [k,e]of [['editionQalys',h],['incomeEquivalent',inc],['totalEquivalent',total],['price10',price]]){
   if(e===null)assert.equal(v[k],null,id+' '+k);else assert.ok(Math.abs(v[k]-e)<1e-9*Math.max(1,Math.abs(e)),id+' '+k);checks++;
  }scenarios++;
 }
}
console.log(JSON.stringify({status:'pass',checks,scenarios}));

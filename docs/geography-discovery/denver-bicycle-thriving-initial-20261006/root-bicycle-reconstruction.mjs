import assert from 'node:assert/strict';
const duration=(years,delay,r)=>{let d=0;for(let i=0;i<Math.ceil(years);i++)d+=Math.min(1,years-i)/(1+r)**(delay+i);return d};
const log=(people,base,gain,share,years,delay,r)=>people&&years>0?.5*people*share*duration(years,delay,r)*Math.log((base+gain)/base):0;
const m=await import('./bicycle-model.mjs');let checks=0;
for(const[id,o]of m.cases){
 const p={...m.defaults,...o},v=m.calculate(o),b=p.implementation*p.attribution,changed=p.N*p.householdShare*b,pos=x=>x>0?x*p.overlap:x;
 const h=p.clinicalUnknown?null:(p.N*b*p.q*duration(p.T,p.delay,p.r)-p.engaged*p.harm)*p.g;
 let inc=0;
 if(p.delay===0){const ce=Math.min(p.engaged,p.N*p.householdShare)*b;inc=log(ce,p.baseline,pos(p.resourceGain)*Math.min(1,p.T)-p.cost,p.g,1,0,p.r)+log(changed-ce,p.baseline,pos(p.resourceGain)*Math.min(1,p.T),p.g,1,0,p.r)+log(p.engaged-ce,p.baseline,-p.cost,p.g,1,0,p.r)+log(changed,p.baseline,pos(p.resourceGain),p.g,Math.max(0,p.T-1),1,p.r);}
 else inc=log(changed,p.baseline,pos(p.resourceGain),p.g,p.T,p.delay,p.r)+log(p.engaged,p.baseline,-p.cost,p.g,1,0,p.r);
 inc+=log(p.payerPeople,p.payerBaseline,-p.g*b*p.externalCost/p.payerPeople,1,1,p.delay,p.r)+log(p.displacedPeople*b,p.baseline,pos(p.displacedGain),p.g,1,p.delay,p.r);
 const total=h===null||p.incomeUnknown?null:h+inc,price=p.costUnknown||!(total>0)?null:10*p.C/total;
 for(const[k,e]of [['editionQalys',h],['incomeEquivalent',inc],['totalEquivalent',total],['price10',price]]){if(e===null)assert.equal(v[k],null,id+' '+k);else assert.ok(Math.abs(v[k]-e)<1e-9*Math.max(1,Math.abs(e)),id+' '+k);checks++;}
}
assert.ok(m.calculate({implementation:0}).incomeEquivalent<0);checks++;
assert.equal(m.calculate({g:0}).incomeEquivalent,0);checks++;
assert.equal(m.calculate({resourceGain:-100,overlap:0}).incomeEquivalent,m.calculate({resourceGain:-100,overlap:1}).incomeEquivalent);checks++;
console.log(JSON.stringify({status:'pass',prefix:'bicycle',checks,scenarios:m.cases.length}));

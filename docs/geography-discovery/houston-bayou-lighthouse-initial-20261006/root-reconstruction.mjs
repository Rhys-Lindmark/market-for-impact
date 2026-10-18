import assert from 'node:assert/strict';
for(const prefix of ['bayou','lighthouse']) {
 const m=await import('./'+prefix+'-model.mjs');let checks=0;
 for(const {id,overrides:o} of m.scenarios()){const p={...m.defaults,...o},v=m.calculate(o),n=p.N*p.unique*p.b,d=(1+p.discount)**(-p.delay);let t=0;for(let i=0;i<Math.ceil(p.T);i++)t+=Math.min(1,p.T-i)/(1+p.discount)**(p.delay+i);
 const q=p.clinicalUnknown?null:(p.clinicalN*p.unique*p.b*p.clinicalResponse*p.q*t-n*p.harm*d)*p.g;
 const pos=x=>x>0?x*p.overlap:x,net=(pos(p.medicalGain)+pos(p.workGain)+pos(p.transferGain))*p.resourceYears-p.cost;
 const log=(n,b,g)=>n?.5*n*p.g*d*Math.log((b+g)/b):0;
 let r=log(n*p.success,p.baseline,net)+log(n*(1-p.success),p.baseline,-p.cost);
 if(n&&(p.payerLoss||p.externalCost))r+=log(p.payerPeople,p.payerBaseline,-n*(p.success*p.payerLoss*p.resourceYears+p.externalCost)/p.payerPeople);
 const total=q===null||p.incomeUnknown?null:q+r,price=p.costUnknown||!(total>0)?null:10*p.C/total;
 for(const [k,w]of [['editionQalys',q],['incomeEquivalent',r],['totalEquivalent',total],['price10',price]]){if(w===null)assert.equal(v[k],null,id);else assert.ok(Math.abs(v[k]-w)<1e-10*Math.max(1,Math.abs(w)),id+' '+k);checks++;}
 }
 console.log(JSON.stringify({prefix,checks,cases:m.scenarios().length,price:m.calculate().price10}));
}

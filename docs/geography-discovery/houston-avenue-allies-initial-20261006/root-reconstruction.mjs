import assert from 'node:assert/strict';
const prefix=process.argv[2];
const m=await import('./'+prefix+'-model.mjs');let checks=0;
for(const [id,overrides] of m.cases){
 const p={...m.defaults,...overrides},out=m.calculate(overrides),n=p.N*p.unique*p.b,d=(1+p.discount)**(-p.delay);
 let duration=0;for(let t=0;t<Math.ceil(p.T);t++)duration+=Math.min(1,p.T-t)/(1+p.discount)**(p.delay+t);
 const clinical=p.clinicalUnknown?null:(n*p.completion*p.q*duration-n*p.harm*d)*p.g;
 const positive=x=>x>0?x*p.overlap:x;
 const net=(positive(p.medicalGain)+positive(p.workGain)+positive(p.transferGain))*p.resourceYears-p.cost;
 const value=(people,base,gain)=>people?.5*people*p.g*d*Math.log((base+gain)/base):0;
 let resources=value(n*p.success,p.baseline,net)+value(n*(1-p.success),p.baseline,-p.cost);
 if(n&&(p.payerLoss||p.externalCost))resources+=value(p.payerPeople,p.payerBaseline,-n*(p.success*p.payerLoss*p.resourceYears+p.externalCost)/p.payerPeople);
 const combined=clinical===null||p.incomeUnknown?null:clinical+resources;
 const price=p.costUnknown||!(combined>0)?null:10*p.C/combined;
 for(const [field,want] of [['editionQalys',clinical],['incomeEquivalent',resources],['totalEquivalent',combined],['price10',price]]){
  if(want===null)assert.equal(out[field],null,id+' '+field);else assert.ok(Math.abs(out[field]-want)<=1e-10*Math.max(1,Math.abs(want)),id+' '+field);checks++;
 }
}
console.log(JSON.stringify({organization:prefix,independentChecks:checks,cases:m.cases.length,central:m.calculate().price10}));

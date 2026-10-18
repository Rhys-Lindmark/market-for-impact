import assert from 'node:assert/strict';
const {calculate,defaults,scenarios}=await import(process.argv[2]??'./model.mjs');
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`)};
function reconstruct(o={}){
 const p={...defaults,...o};let duration=0;for(let y=0;y<p.T;y++)duration+=Math.min(1,p.T-y)*(1+p.discount)**(-p.delay-y);
 const union=p.N*p.unique*p.b,exposure=p.legacyExposure?union:p.N*p.unique,changed=union*p.success,clinical=p.clinicalN*p.unique*p.b*p.clinicalResponse,df=(1+p.discount)**(-p.delay);
 const health=(clinical*p.q*duration-exposure*p.harm*df)*p.g;
 const gain=[p.workGain,p.medicalGain,p.transferGain].reduce((n,x)=>n+(x>0?x*p.overlap:x),0)*p.resourceYears-p.cost;
 const recipient=.5*p.g*df*(changed*Math.log1p(gain/p.baseline)+(exposure-changed)*Math.log1p(-p.cost/p.baseline));
 const loss=p.g*(changed*p.payerLoss*p.resourceYears+exposure*p.externalCost+clinical*p.treatmentCost);
 const payer=loss!==0? .5*p.payerPeople*df*Math.log1p(-loss/(p.payerPeople*p.payerBaseline)):0;
 const income=recipient+payer,total=p.clinicalUnknown||p.incomeUnknown?null:health+income,price=p.costUnknown||!(total>0)?null:10*p.C/total;
 return {health:p.clinicalUnknown?null:health,income,total,price};
}
let n=0;for(const s of scenarios()){const r=reconstruct(s.overrides);for(const [a,b]of [[s.editionQalys,r.health],[s.incomeEquivalent,r.income],[s.totalEquivalent,r.total],[s.price10,r.price]]){near(a,b);n++}}
assert(calculate({b:0}).totalEquivalent<0);assert.equal(calculate({N:0,clinicalN:0}).totalEquivalent,0);assert.equal(calculate({b:0}).price10,null);assert.equal(calculate({g:0}).totalEquivalent,0);
assert.equal(calculate({q:0}).incomeEquivalent,calculate().incomeEquivalent);
assert.equal(calculate({medicalGain:-100,overlap:0,workGain:0,transferGain:0}).incomeEquivalent,calculate({medicalGain:-100,overlap:1,workGain:0,transferGain:0}).incomeEquivalent);
console.log(JSON.stringify({checks:n+6,cases:scenarios().length,central:reconstruct(),initial:reconstruct({legacyExposure:true,clinicalN:187}).price}));

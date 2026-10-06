import assert from 'node:assert/strict';
const {calculate,defaults,scenarios}=await import(process.argv[2]??'./model.mjs');
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`)};
function reconstruct(o={}){
 const p={...defaults,...o};let duration=0;for(let y=0;y<p.T;y++)duration+=Math.min(1,p.T-y)*(1+p.discount)**(-p.delay-y);
 const envelope=p.N*p.unique,union=envelope*p.b,engaged=p.legacyExposure?union:p.burdenN*p.unique,changed=union*p.success,df=(1+p.discount)**(-p.delay);
 const health=(p.clinicalN*p.unique*p.b*p.clinicalResponse*p.q*duration-engaged*p.harm*df)*p.g;
 const gain=[p.workGain,p.medicalGain,p.transferGain].reduce((n,x)=>n+(x>0?x*p.overlap:x),0)*p.resourceYears;
 const fraction=envelope?engaged/envelope:0;
 const resource=p.legacyExposure?changed*Math.log1p((gain-p.cost)/p.baseline)+(union-changed)*Math.log1p(-p.cost/p.baseline):changed*fraction*Math.log1p((gain-p.cost)/p.baseline)+changed*(1-fraction)*Math.log1p(gain/p.baseline)+(envelope-changed)*fraction*Math.log1p(-p.cost/p.baseline);
 const worker=p.displacedPeople*p.b*Math.log1p(p.displacedGain/p.baseline);
 const loss=p.g*(changed*p.payerLoss*p.resourceYears+engaged*p.externalCost);
 const payer=envelope&&(p.payerLoss||p.externalCost)? .5*p.payerPeople*df*Math.log1p(-loss/(p.payerPeople*p.payerBaseline)):0;
 const income=.5*p.g*df*(resource+worker)+payer,total=p.clinicalUnknown||p.incomeUnknown?null:health+income,price=p.costUnknown||!(total>0)?null:10*p.C/total;
 return {health:p.clinicalUnknown?null:health,income,total,price};
}
let n=0;for(const s of scenarios()){const r=reconstruct(s.overrides);for(const [a,b]of [[s.editionQalys,r.health],[s.incomeEquivalent,r.income],[s.totalEquivalent,r.total],[s.price10,r.price]]){near(a,b);n++}}
assert(calculate({b:0}).totalEquivalent<0);assert.equal(calculate({N:0,clinicalN:0,burdenN:0}).totalEquivalent,0);assert.equal(calculate({b:0}).price10,null);assert.equal(calculate({g:0}).totalEquivalent,0);
assert.equal(calculate({q:0}).incomeEquivalent,calculate().incomeEquivalent);
assert.equal(calculate({medicalGain:-100,overlap:0,workGain:0,transferGain:0}).incomeEquivalent,calculate({medicalGain:-100,overlap:1,workGain:0,transferGain:0}).incomeEquivalent);
assert.equal(calculate({b:0,displacedPeople:50,displacedGain:-1000}).incomeEquivalent,calculate({b:0}).incomeEquivalent);
console.log(JSON.stringify({checks:n+7,cases:scenarios().length,central:reconstruct(),initial:reconstruct({legacyExposure:true}).price}));

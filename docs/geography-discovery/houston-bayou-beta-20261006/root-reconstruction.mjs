import assert from 'node:assert/strict';
const {defaults,calculate,scenarios}=await import(process.argv[2]);
const near=(a,b)=>a===null||b===null?assert.equal(a,b):assert(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
function independent(o={}){
 const p={...defaults,...o},envelope=p.N*p.unique,beneficiaries=envelope*p.b,burden=p.legacyExposure?beneficiaries:p.burdenN,changed=beneficiaries*p.success;
 let years=0;for(let j=0;j<p.T;j++)years+=Math.min(1,p.T-j)/(1+p.discount)**(p.delay+j);
 const health=p.clinicalUnknown?null:p.g*(p.clinicalN*p.unique*p.b*p.clinicalResponse*p.q*years-burden*p.harm/(1+p.discount)**p.burdenDelay);
 const gain=[p.medicalGain,p.workGain,p.transferGain].reduce((n,x)=>n+(x>0?x*p.overlap:x),0)*p.resourceYears;
 const df=(d)=>(1+p.discount)**(-d),log=(n,x,base)=>n*Math.log1p(x/base);
 const intersect=p.legacyExposure?changed:changed*(envelope?burden/envelope:0);
 const hh=p.delay===p.burdenDelay?df(p.delay)*(log(intersect,gain-p.cost,p.baseline)+log(changed-intersect,gain,p.baseline)+log(burden-intersect,-p.cost,p.baseline)):df(p.delay)*log(changed,gain,p.baseline)+df(p.burdenDelay)*log(burden,-p.cost,p.baseline);
 const transfer=p.g*changed*p.payerLoss*p.resourceYears,effort=p.g*burden*p.externalCost;
 const payer=p.delay===p.burdenDelay?df(p.delay)*log(p.payerPeople,-(transfer+effort)/p.payerPeople,p.payerBaseline):df(p.delay)*log(p.payerPeople,-transfer/p.payerPeople,p.payerBaseline)+df(p.burdenDelay)*log(p.payerPeople,-effort/p.payerPeople,p.payerBaseline);
 const income=.5*(p.g*hh+payer),total=p.clinicalUnknown||p.incomeUnknown?null:health+income,price=p.costUnknown||!(total>0)?null:10*p.C/total;
 return {health,income,total,price};
}
let n=0;for(const s of scenarios()){const x=independent(s.overrides);for(const[a,b]of [[s.editionQalys,x.health],[s.incomeEquivalent,x.income],[s.totalEquivalent,x.total],[s.price10,x.price]]){near(a,b);n++;}}
for(const o of [{payerLoss:1000,externalCost:100,burdenDelay:2},{payerLoss:1000,externalCost:100},{b:0},{g:0},{burdenN:0},{delay:0,burdenDelay:0}]){const x=independent(o),r=calculate(o);near(r.incomeEquivalent,x.income);n++;}
assert(calculate({b:0}).totalEquivalent<0);assert.equal(calculate({q:0}).incomeEquivalent,calculate().incomeEquivalent);assert.equal(calculate({N:0,clinicalN:0,burdenN:0}).totalEquivalent,0);n+=3;
console.log(JSON.stringify({checks:n,cases:scenarios().length,central:independent(),initial:independent({legacyExposure:true,burdenDelay:2})}));

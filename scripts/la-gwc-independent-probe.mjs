import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=process.argv[2];if(!dir)throw Error('Provide packet directory');
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
const report=read('report.json'),initial=read('initial-diagnostic.json');
assert.ok(JSON.stringify(report.model.historicalAlphaModel)===JSON.stringify((initial.report??initial).model));
let checks=1;
const close=(a,b)=>{assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));checks++;};
for(const s of report.model.scenarios){
 const x=s.inputs,effort=x.gift/x.C*x.b;
 assert.ok(x.people<=x.claimantUnits&&x.claimantUnits<=194);checks++;
 const health=effort*x.g*(x.people*x.clinicalPerPerson*x.clinicalAttribution-x.clinicalHarm)/1.03**x.delay;
 close(s.editionQalys,health);
 if(s.incomeUnknown){assert.equal(s.combinedEquivalentYears,null);assert.equal(s.costPer10Qalys,null);checks+=2;continue;}
 let years=0;for(let k=0;k<Math.ceil(x.years);k++)years+=Math.min(1,x.years-k)/1.03**(x.delay+k);
 const paidLog=Math.log1p((x.R/x.people*x.retention*x.positiveShare-x.workerCost)/x.years/x.baseline);
 const costLog=Math.log1p(-x.workerCost/x.years/x.baseline);
 const payerLog=Math.log1p(-x.R/x.payerPeople/x.years/x.payerBaseline);
 const workers=x.g*(x.people*x.a*paidLog+(x.people*(1-x.a)+x.claimantUnits-x.people)*costLog);
 const payers=x.payerLocalShare*x.payerPeople*x.a*payerLog;
 const independent=.5*x.inducedPeople*x.g*Math.log1p(-x.inducedCost/x.baseline);
 const income=.5*years*effort*(workers+payers)+independent;
 close(s.incomeEquivalentYears,income);close(s.combinedEquivalentYears,income+health);
 if(income+health>0)close(s.costPer10Qalys,10*x.gift/(income+health));else{assert.equal(s.costPer10Qalys,null);checks++;}
}
const cases=Object.fromEntries(report.model.scenarios.map(s=>[s.id,s]));
assert.ok(cases['concentrated-awards'].incomeEquivalentYears<cases.central.incomeEquivalentYears);
assert.ok(cases['claimant-household-overlap'].incomeEquivalentYears>cases.central.incomeEquivalentYears);
assert.ok(cases['no-additional-wages'].incomeEquivalentYears<0);
assert.ok(cases['failed-access-harm'].incomeEquivalentYears<0);checks+=4;
console.log(JSON.stringify({checks,cases:report.model.scenarios.length,central:cases.central.costPer10Qalys}));

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=process.argv[2];if(!dir)throw Error('Provide packet directory');
const report=JSON.parse(fs.readFileSync(path.join(dir,'report.json'),'utf8'));
let checks=0;
const close=(a,b)=>{assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
const annuity=(n,delay)=>{let a=0;for(let t=0;t<Math.ceil(n);t++)a+=Math.min(1,n-t)/1.03**(delay+t);return a;};
for(const s of report.model.scenarios){
 if(!s.inputs)continue;
 const x=s.inputs,e=x.gift/x.C,P=x.U*x.f,cp=e*x.p*x.a*x.b,cr=e*x.z;
 const health=cp*P*x.h*x.H*x.u/365*annuity(x.Tpolicy,x.delay)*x.effectiveCooling+cr*x.R*x.hr*x.Hr*x.ur/365*annuity(x.Troof,x.delay)*x.effectiveCooling-e*x.clinicalHarm;
 close(s.editionQalys,health);
 if(s.incomeUnknown){assert.equal(s.combinedEquivalentYears,null);checks++;continue;}
 let income=0;
 for(const p of s.incomePathways){
  assert.ok(p.annualIncomeBeforeUSD+p.annualIncomeGainUSD>0);checks++;
  let years=0;for(let t=0;t<Math.ceil(p.years);t++)years+=Math.min(1,p.years-t)/(1+(p.discountRate??0))**((p.delayYears??0)+t);
  income+=.5*p.people*years*Math.log((p.annualIncomeBeforeUSD+p.annualIncomeGainUSD)/p.annualIncomeBeforeUSD)*p.causalShare*p.editionShare*p.independentShare;
 }
 let landlord=0;
 for(let t=0;t<Math.ceil(x.Tpolicy);t++){
  const net=(x.policyRentCost-x.landlordAnnualCapitalCost-x.landlordMaintenance-(t===0?(x.landlordUpfrontCost??0):0))*x.unitsPerLandlord;
  landlord+=Math.min(1,x.Tpolicy-t)/1.03**(x.delay+t)*P/x.unitsPerLandlord*Math.log1p(net/x.landlordBaseline);
 }
 if(x.landlordCatchupRelief>0)landlord+=P/x.unitsPerLandlord*Math.log1p(x.landlordCatchupRelief*x.unitsPerLandlord/x.landlordBaseline)/1.03**x.landlordReliefDelay;
 const tenant=annuity(x.Tpolicy,x.delay)*P*Math.log1p((x.policyWorkGain*x.positiveShare-x.policyEnergyCost-x.policyRentCost-x.policyUserCost)/x.policyBaseline);
 const roof=annuity(x.Troof,x.delay)*(x.R*Math.log1p((x.roofSavings*x.positiveShare-x.roofUserCost)/x.roofBaseline)+x.utilityLocalShare*x.utilityPeople*Math.log1p(-x.R*x.utilityLossPerRoof/x.utilityPeople/x.utilityBaseline));
 const induced=.5*x.inducedPeople*Math.log1p(-x.inducedCost/x.policyBaseline);
 close(income,.5*(cp*(tenant+landlord)+cr*roof)+induced);
 close(s.incomeEquivalentYears,income);close(s.combinedEquivalentYears,health+income);
 if(health+income>0)close(s.costPer10Qalys,10*x.gift/(health+income));else{assert.equal(s.costPer10Qalys,null);checks++;}
}
const by=Object.fromEntries(report.model.scenarios.map(x=>[x.id,x]));
const x=by.central.inputs,e=x.gift/x.C,P=x.U*x.f,cp=e*x.p*x.a*x.b,cr=e*x.z;
const policyTenant=P*Math.log1p((x.policyWorkGain*x.positiveShare-x.policyEnergyCost-x.policyRentCost-x.policyUserCost)/x.policyBaseline);
const landlord=P/x.unitsPerLandlord*Math.log1p((x.policyRentCost-x.landlordAnnualCapitalCost-x.landlordMaintenance)*x.unitsPerLandlord/x.landlordBaseline);
const roof=x.R*Math.log1p((x.roofSavings*x.positiveShare-x.roofUserCost)/x.roofBaseline);
const payer=x.utilityLocalShare*x.utilityPeople*Math.log1p(-x.R*x.utilityLossPerRoof/x.utilityPeople/x.utilityBaseline);
const centralIncome=.5*(annuity(x.Tpolicy,x.delay)*cp*(policyTenant+landlord)+annuity(x.Troof,x.delay)*cr*(roof+payer));
close(by.central.incomeEquivalentYears,centralIncome);
assert.ok(by['clinical-null'].incomeEquivalentYears<0);assert.equal(by['clinical-null'].costPer10Qalys,null);checks+=2;
assert.ok(by['failed-expansion-induced-loss'].incomeEquivalentYears<0);checks++;
console.log(JSON.stringify({checks,scenarios:report.model.scenarios.length,central:by.central.costPer10Qalys}));

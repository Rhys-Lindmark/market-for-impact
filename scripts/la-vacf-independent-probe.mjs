import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=process.argv[2];
if(!dir)throw Error('Provide isolated or durable packet directory');
const {calculate,cases}=await import(pathToFileURL(path.resolve(dir,'model.mjs')));
let checks=0;
const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);checks++;};
const annuity=(n,delay,r)=>{let v=0;for(let t=0;t<Math.ceil(n);t++)v+=Math.min(1,n-t)/(1+r)**(delay+t);return v;};
for(const [id,overrides] of cases){
 const s=calculate(overrides),x=s.inputs;
 const served=x.activities*x.hbvShare*x.uniqueShare*x.capacityShare;
 near(s.servicePeople,served);
 const health=(served*x.appropriateShare*x.additionalCare*x.clinicalTransfer*x.qRef-served*x.clinicalHarmPerService)*x.localShare/(1+x.discount)**x.delay;
 if(x.clinicalUnknown){assert.equal(s.editionQalys,null);checks++;}else near(s.editionQalys,health);
 const care=x.additionalCare*x.resourceCareShare,alarm=x.falseAlarmShare;
 // One screened participant's household per native service unit. Resources are
 // household flows; welfare persons are explicitly separate from household count.
 const branches=[['resource-care',care,x.resourceGain*x.positiveOverlap-x.disruption-x.commonCost],['false-alarm',alarm,-x.falseAlarmCost-x.commonCost],['other-service-users',1-care-alarm,-x.commonCost]];
 let independent=0;
 for(const [key,share,net] of branches){
  if(!(share>0&&served>0))continue;
  const p=s.incomePathways.find(v=>v.id===key);assert.ok(p);checks++;
  near(p.annualIncomeGainUSD,net);near(p.households,served*share);near(p.people,p.households*p.membersPerHousehold);
  assert.ok(p.annualIncomeBeforeUSD+net>0);checks++;
  independent+=.5*p.people*annuity(x.resourceYears,x.delay,x.discount)*Math.log1p(net/x.baseline)*x.localShare;
 }
 if(served>0&&x.providerMargin!==0)independent+=.5*x.providerUnits*annuity(x.resourceYears,x.delay,x.discount)*Math.log1p(served*x.providerMargin/x.providerUnits/60000)*x.localShare;
 if(served>0&&x.payerCostPerOffer!==0)independent+=.5*x.payerPeople/(1+x.discount)**x.delay*Math.log1p(-served*x.appropriateShare*x.additionalCare*x.clinicalTransfer*x.payerCostPerOffer/x.payerPeople/50000)*x.localShare;
 near(s.incomeEquivalent,independent);
 if(x.clinicalUnknown||x.incomeUnknown){assert.equal(s.totalEquivalent,null);assert.equal(s.price10,null);checks+=2;}
 else{near(s.totalEquivalent,health+independent);if(health+independent>0)near(s.price10,10*x.costUSD/(health+independent));else{assert.equal(s.price10,null);checks++;}}
}
const zero=calculate({capacityShare:0});near(zero.editionQalys,0);near(zero.incomeEquivalent,0);
assert.ok(calculate({clinicalTransfer:0}).incomeEquivalent<0);checks++;
assert.equal(calculate({clinicalTransfer:0}).price10,null);checks++;
assert.ok(calculate({additionalCare:0}).incomeEquivalent<0);checks++;
const rp=path.join(dir,'report.json');
if(fs.existsSync(rp)){
 const report=JSON.parse(fs.readFileSync(rp,'utf8'));
 for(const s of report.model.scenarios){
  const expected=calculate(s.inputs);
  if(expected.editionQalys===null){assert.equal(s.editionQalys,null);checks++;}else near(s.editionQalys,expected.editionQalys);
  if(!expected.incomeUnknown)near(s.incomeEquivalent??s.incomeEquivalentYears,expected.incomeEquivalent);
  if(expected.totalEquivalent===null){assert.equal(s.totalEquivalent??s.combinedEquivalentYears??null,null);checks++;}else near(s.totalEquivalent??s.combinedEquivalentYears,expected.totalEquivalent);
  const price=s.price10??s.costPer10Qalys??null;if(expected.price10===null){assert.equal(price,null);checks++;}else near(price,expected.price10);
 }
}
console.log(JSON.stringify({checks,cases:cases.length,central:calculate().price10}));

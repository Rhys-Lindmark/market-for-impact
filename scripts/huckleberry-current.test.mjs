import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,cases,calculate} from '../lib/huckleberry-current-model.mjs';
const clone=v=>JSON.parse(JSON.stringify(v));
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Reference independently reconstructed from integrated health and household-net consumption',()=>{
 const health=.026*.5*.5/(1.03**(16/52));
 const income=.5*.5*3*(32/52)*Math.log1p(-30/(30000*32/52));
 const r=calculate();near(r.bay.healthQaly,health);near(r.bay.incomeEquivalentYears,income);near(r.bay.usdPerBetterLife,24000/(health+income));
 assert.equal(r.ordinaryGiftExpectedValue,null);assert.equal(r.fullSocialCost,null);assert.equal(r.verifiedFundingRoom,null);
});
test('Every scenario independently reconstructed without the shared income helper',()=>{
 for(const s of cases){let income=0;
  for(const h of s.households){const net=h.rows.reduce((sum,row)=>sum+(row.amountUsd>0?row.amountUsd*row.positiveIndependentCredit:row.amountUsd),0);
   let years=0;for(let y=0;y<Math.ceil(h.years);y++)years+=Math.min(1,h.years-y)/(1+s.discountRate)**(s.delayYears+h.delayYears+y);
   income+=.5*h.members*years*Math.log1p(net/(h.annualResourcesUsd*h.years));}
  const exposure=s.budgetUsd/s.courseCostUsd*s.serviceAdditionality;
  const health=exposure*s.integratedTrialQaly*(s.integratedTrialQaly>0?s.positiveClinicalTransfer:1)/(1+s.discountRate)**(s.delayYears+s.clinicalMidpointYears);
  const harms=s.budgetUsd===0?{sf:0,restBay:0,outsideBay:0}:s.independentGiftHarms;
  const r=calculate(s);for(const key of ['sf','bay']){const share=key==='sf'?s.sfResidentShare:s.bayResidentShare;const harm=key==='sf'?harms.sf:harms.sf+harms.restBay;
   near(r[key].healthQaly,health*share);near(r[key].independentHarmEquivalentYears,harm);near(r[key].incomeEquivalentYears,exposure*income*share);const combined=(health+exposure*income)*share-harm;
   near(r[key].combinedEquivalentYears,combined);combined>0?near(r[key].usdPerBetterLife,10*s.budgetUsd/combined):assert.equal(r[key].usdPerBetterLife,null);}
 }
});
test('Causal exposure removes absent course effects but not independent gift harms',()=>{
 const s=clone(defaults);s.serviceAdditionality=0;assert.equal(calculate(s).bay.combinedEquivalentYears,0);
 s.independentGiftHarms.sf=.001;assert.equal(calculate(s).sf.combinedEquivalentYears,-.001);
 s.budgetUsd=0;assert.equal(calculate(s).sf.combinedEquivalentYears,0);
});
test('Positive-only credit never shrinks negative clinical or cash effects per caused course',()=>{
 const s=clone(defaults);s.positiveClinicalTransfer=0;s.integratedTrialQaly=-.01;s.households[0].rows[0].positiveIndependentCredit=0;
 const r=calculate(s);near(r.bay.healthQaly,-.005/1.03**(16/52));near(r.bay.incomeEquivalentYears,calculate().bay.incomeEquivalentYears);
});
test('Net same-household cash before logarithm and count household members only once',()=>{
 const s=clone(defaults);s.households[0].rows=[{id:'pay',amountUsd:100,positiveIndependentCredit:1},{id:'burden',amountUsd:-100,positiveIndependentCredit:0}];
 assert.equal(calculate(s).incomePerCausedCourse,0);s.households[0].rows[0].positiveIndependentCredit=.5;assert.ok(calculate(s).incomePerCausedCourse<0);
});
test('Bound invalid domains, unique identities and geographic nesting',()=>{
 const invalid=[s=>s.sfResidentShare=1.1,s=>{s.bayResidentShare=.5;},s=>s.households.push(clone(s.households[0])),
  s=>s.households[0].rows.push(clone(s.households[0].rows[0])),s=>s.households[0].years=Infinity,
  s=>s.households[0].years=100,s=>s.households[0].rows[0].amountUsd=-20000,s=>s.courseCostUsd=0,
  s=>s.households[0].rows[0].amountUsd=-30000*32/52,s=>s.clinicalMidpointYears=1,
  s=>s.households[0].rows[0].positiveIndependentCredit=-1,s=>s.households=null,s=>s.independentGiftHarms={sf:0}];
 for(const mutate of invalid){const s=clone(defaults);mutate(s);assert.throws(()=>calculate(s));}
});
test('Health-only undiscouted diagnostic preserves original central price',()=>{
 const s=cases.find(s=>s.id==='healthOnlyUndiscountedDiagnostic');near(calculate(s).bay.usdPerBetterLife,3692307.6923076925);
});

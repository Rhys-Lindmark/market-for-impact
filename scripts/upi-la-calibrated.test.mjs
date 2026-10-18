import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import{central,cases,calculate,componentResourceFlows}from'../lib/upi-la-calibrated-model.mjs';
import{reportPrice,editionResearchEffort}from'../lib/geography-reports.mjs';
import{incomeHealthyYearEquivalent}from'../lib/income-health-equivalence.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} vs ${b}`);
test('UPI integrated 36 current cases and full22 history preserve exact price and five clocks',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url))),r=data.reports.find(x=>x.edition==='los-angeles'&&x.slug==='urban-peace-institute'),old=JSON.parse(fs.readFileSync(new URL('../data/los-angeles/upi-la-pre-recalibration-model.json',import.meta.url)));
 assert.deepEqual(r.historicalModel,old.model);assert.equal(r.model.scenarios.length,37);
 for(const[id,v]of Object.entries(cases)){const p={...central,...v},s=r.model.scenarios.find(x=>x.id===id),o=calculate(p);assert.deepEqual(s.parameters,p);assert.deepEqual(s.nativeOutputs,o);if(o.resourcesLocal===null)assert.equal(s.incomeUnknown,true);else close(s.incomePathways.reduce((sum,f)=>sum+incomeHealthyYearEquivalent(f),0),o.resourcesLocal);}
 close(reportPrice(r),61194667.388702735);assert.equal(r.sessionIds.length,5);assert.equal(new Set(r.sessionIds).size,5);const label=editionResearchEffort(data,r).label;for(const text of ['10 min on GPT-6 Astra Light','16 min on GPT-6 Astra Medium','11 min on GPT-6.1 Sol'])assert.ok(label.includes(text));
 const registry=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url)));assert.deepEqual(registry.organizations[r.organizationId].sessions,r.sessionIds.map(id=>data.sessions.find(s=>s.id===id)));
});
test('signed income flow ledger independently reproduces, not saved-life wages',()=>{
 const o=calculate();close(o.resourcesLocal,-.00005204997204610233);assert.ok(o.processEquivalent<0&&o.medicalEquivalent>0&&o.payEquivalent>0);close(o.native.fatalEvents+o.native.nonfatalEvents,o.native.netAvoidedVictimizations);
 for(const[k,flows]of Object.entries(componentResourceFlows())){let q=0;for(const f of flows){let d=0;for(let y=0;y<f.years;y++)d+=1/(1+f.discountRate)**(f.delayYears+y);q+=.5*f.people*Math.log1p(f.annualIncomeGainUSD/f.annualIncomeBeforeUSD)*d*f.independentShare*f.editionShare;}close(q,o[k==='process'?'processEquivalent':k==='medical'?'medicalEquivalent':'payEquivalent']);}
 assert.equal(calculate({...central,fatalShare:1}).payEquivalent,0);assert.ok(calculate({...central,recoveryPayUSD:-3000,positivePayIndependent:0}).payEquivalent<0);
});
test('known zeros and unknown numeric placeholders remain distinct',()=>{
 for(const id of ['zeroGift','zeroFunding','zeroCapacity'])assert.equal(calculate({...central,...cases[id]}).combinedLocal,0);
 for(const id of ['unknownReach','unknownFundingZero','unknownEffectZero','unknownPayZero'])assert.equal(calculate({...central,...cases[id]}).combinedLocal,null);
 assert.equal(calculate({...central,...cases.allLocalZeroUnknown}).combinedLocal,0);assert.ok(calculate({...central,effect:0}).combinedLocal<0);
});
test('accounting-only resource changes do not create participants or physical benefit',()=>{
 const a=calculate(),b=calculate({...central,...cases.extraGrossResources});assert.deepEqual(a.native,b.native);assert.equal(a.combinedLocal,b.combinedLocal);assert.equal(a.donorPrice10,b.donorPrice10);assert.ok(b.grossPrice10>a.grossPrice10);
});
test('strict domains reject invalid cash/survival/sign/unknown inputs',()=>{
 for(const v of [{gift:25001},{participants:NaN},{mortality:1.1},{survivalYears:3.2},{baseline:1000,recoveryPayUSD:-10000},{extra:1},{effectKnown:0}])assert.throws(()=>calculate({...central,...v}));assert.throws(()=>calculate(Object.create(central)));
});

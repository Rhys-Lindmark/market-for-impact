import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,scenarioIncomeEquivalent,editionResearchEffort} from '../lib/geography-reports.mjs';
import {central,cases,calculate,selfTest} from '../lib/dental-lifeline-network-usa-calibrated-model.mjs';
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
test('Integrated DLN report preserves history, every corrected case and unique focused clocks',()=>{
 const d=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url))),r=d.reports.find(r=>r.edition==='usa'&&r.slug==='dental-lifeline-network');
 const frozen=JSON.parse(fs.readFileSync(new URL('../data/usa/dental-lifeline-network-usa-pre-recalibration-model.json',import.meta.url)));
 assert.deepEqual(r.historicalModel,frozen.model);assert.equal(r.model.scenarios.length,26);
 for(const [id,over] of Object.entries(cases)){
  const s=r.model.scenarios.find(s=>s.id===id),out=calculate({...central,...over});
  assert.deepEqual(s.parameters,{...central,...over});
  assert.deepEqual(s.nativeOutputs,JSON.parse(JSON.stringify({...out,combinedDonationPricePer10USD:out.donorCombinedPrice?.value??null})));
  if(out.resourcesUSA!==null)close(scenarioIncomeEquivalent(s),out.resourcesUSA);
  else assert.equal(s.incomeUnknown,true);
 }
 close(reportPrice(r),1348057.7090743855);assert.equal(new Set(r.sessionIds).size,10);
 const added=d.sessions.filter(s=>r.sessionIds.includes(s.id)&&s.model.id==='gpt-6.1-sol');
 assert.equal(added.length,8);assert.equal(added.reduce((sum,s)=>sum+s.seconds,0),549);
 const b=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url))).organizations[r.organizationId];
 assert.deepEqual(b.sessions.map(s=>s.id).sort(),[...r.sessionIds].sort());
 assert.match(editionResearchEffort(d,r).label,/12 min on GPT-6 Astra Light.*12 min on GPT-6 Astra Medium.*9 min on GPT-6.1 Sol/);
 assert.match(r.sections.cost,/negative wage effects and direct cash burdens are fully charged/);
 assert.match(r.sections.cost,/persistent \*\*net incremental cash obligation\*\*/);
 assert.match(r.model.uncertainty,/clinical valuation window/);
});
function independent(p){
 const n=Math.min(p.G*p.b/p.c,p.capacity),c=n*p.r,buy=c*p.purchaseShare,free=(c-buy)*(1-p.s),added=(c-buy)*p.s;
 const z=Math.log1p(p.d),step=p.T/20000;
 let clinical=0;
 for(let i=0;i<20000;i++)clinical+=p.u*Math.exp(-(z+p.m+p.loss+p.catchup)*(i+.5)*step)*step;
 const health=p.g*(added*(Math.exp(-z*p.L)*clinical-p.h*Math.exp(-z*p.L))-n*p.ha);
 const flow=(people,amount,base,time,weight=1)=>.5*people*Math.log1p(amount/base)*Math.exp(-z*time)*weight;
 let cash=flow(n,-p.applicationCash,p.baseline,p.applicationTime)+flow(buy,p.purchaseCash-p.purchaserTravel,p.baseline,p.L)+flow(free,-p.freeAlternativeTravel,p.baseline,p.L)+flow(added,-p.newCareTravel-p.newCareLostPay,p.baseline,p.L)+flow(c,-p.volunteerCash,p.volunteerBaseline,p.volunteerTime);
 for(let year=0;year<Math.ceil(p.maintenanceYears);year++)cash+=flow(added*Math.exp(-p.m*(year+1)),-p.maintenanceCash*Math.min(1,p.maintenanceYears-year),p.baseline,p.L+year+1);
 let wages=0;
 for(let year=0;year<Math.ceil(p.earningsYears);year++){
  const workers=added*p.workerShare*Math.exp(-(p.m+p.loss+p.catchup)*(p.earningsDelay+year-p.L));
  wages+=flow(workers,p.annualNetPayGain*Math.min(1,p.earningsYears-year),p.baseline-(year===0?p.newCareTravel+p.newCareLostPay:p.maintenanceCash),p.earningsDelay+year,p.annualNetPayGain>0?p.incomeIndependent:1);
 }
 return {health,cash:p.g*cash,wages:p.g*wages};
}
test('Every complete DLN case independently reconstructs clinical and signed household benefits',()=>{
 const result=selfTest();assert.equal(result.historicalVerified,18);assert.equal(Object.keys(cases).length,25);
 for(const override of Object.values(cases)){
  const p={...central,...override},v=calculate(p),i=independent(p);
  if(v.healthUSA!==null&&v.healthUSA!==undefined)close(v.healthUSA,i.health,1e-8);
  if(v.directResourceEquivalentUSA!==null&&v.directResourceEquivalentUSA!==undefined)close(v.directResourceEquivalentUSA,i.cash);
  if(v.earningsEquivalentUSA!==null&&v.earningsEquivalentUSA!==undefined)close(v.earningsEquivalentUSA,i.wages);
  if(v.combinedUSA!==null)close(v.combinedUSA,i.health+i.cash+i.wages,1e-8);
 }
 const v=calculate(central);close(v.healthUSA,.0810294138082641);close(v.resourcesUSA,-.006848613292933911);close(v.donorCombinedPrice.value,1348057.7090743855);
});
test('Fixed comparison limits reject overflow and earnings before clinical relief',()=>{
 for(const p of [{maxGift:1e308,G:1e308},{capacity:1e308},{c:1e-300},{u:2},{d:1e308},{applicationTime:61},{baseline:1e308},{completedOpportunity:1e308},{annualNetPayGain:1e308},{earningsDelay:.5}])assert.throws(()=>calculate({...central,...p}));
 for(const p of [null,[],42,'',Object.assign(Object.create(null),central),{...central,extra:1}])assert.throws(()=>calculate(p));
 close(calculate({...central,d:0,m:0,loss:0,catchup:0}).grossClinicalBenefitPerAdditionalCompletion,.075);
});
test('Unknown, structurally zero, signed loss and equivalent purchaser care remain distinct',()=>{
 assert.equal(calculate({...central,cashKnown:false}).earningsEquivalentUSA,null);
 assert.equal(calculate({...central,cashKnown:false,annualNetPayGain:0}).earningsEquivalentUSA,0);
 assert.equal(calculate({...central,healthKnown:false}).combinedUSA,null);
 const zero=calculate({...central,G:0,healthKnown:false,cashKnown:false,earningsKnown:false,fundingKnown:false});assert.equal(zero.combinedUSA,0);assert.equal(zero.donorCombinedPrice.value,null);
 const buyer=calculate({...central,purchaseShare:1});close(buyer.healthUSA,-buyer.candidates*central.ha);assert.ok(buyer.resourcesUSA>0);assert.equal(buyer.earningsEquivalentUSA,0);
 const failed=calculate({...central,r:0});assert.ok(failed.healthUSA<0&&failed.resourcesUSA<0);assert.equal(failed.donorCombinedPrice.value,null);
 assert.ok(calculate({...central,annualNetPayGain:-1000}).earningsEquivalentUSA<0);
 close(calculate({...central,annualNetPayGain:-1000,incomeIndependent:0}).earningsEquivalentUSA,calculate({...central,annualNetPayGain:-1000,incomeIndependent:1}).earningsEquivalentUSA);
 assert.equal(calculate({...central,grossKnown:false}).grossInstitutionalUSD,null);
});

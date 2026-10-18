import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,scenarioIncomeEquivalent,editionResearchEffort} from '../lib/geography-reports.mjs';
import {central,calculate,scenarios} from '../lib/surgery-on-sunday-usa-calibrated-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1e-12,Math.abs(b)*1e-11),`${a} != ${b}`);
test('integrated Surgery on Sunday report preserves history and matches every current scenario and clock',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const r=data.reports.find(r=>r.edition==='usa'&&r.slug==='surgery-on-sunday');
 const frozen=JSON.parse(readFileSync(new URL('../data/usa/surgery-on-sunday-usa-pre-recalibration-model.json',import.meta.url)));
 assert.deepEqual(r.historicalModel,frozen.model);assert.equal(r.model.scenarios.length,39);
 for(const p of scenarios){
  const s=r.model.scenarios.find(s=>s.id===(p.id==='central-judgment'?'central':p.id)),x=calculate(p);
  assert.deepEqual({...s.nativeOutputs,parameters:p},JSON.parse(JSON.stringify(x)));
  if(x.resourceEquivalentUSA!==null)near(scenarioIncomeEquivalent(s),x.resourceEquivalentUSA);
  else assert.equal(s.incomeUnknown,true);
 }
 near(reportPrice(r),1235136.175867155);
 assert.equal(r.sessionIds.length,8);
 const added=data.sessions.filter(s=>r.sessionIds.includes(s.id)&&s.model.id==='gpt-6.1-sol');
 assert.equal(added.length,5);assert.equal(added.reduce((n,s)=>n+s.seconds,0),378);
 assert.match(editionResearchEffort(data,r).label,/5 min on GPT-6 Astra Light.*14 min on GPT-6 Astra Medium.*6 min on GPT-6.1 Sol/);
});
test('every Surgery on Sunday scenario independently reconstructs health and signed household/resource cohorts',()=>{
 for(const p of scenarios){
  const r=calculate(p);
  if(p.activityStatus==='unknown'){assert.equal(r.combinedEquivalentUSA,null);continue;}
  const N=Math.min(p.G/p.cashCase*p.funding,p.capacity),buyers=N*p.purchaseShare,nonbuyers=N-buyers;
  near(r.additionalPatientEquivalents,N);
  if(p.healthStatus!=='unknown'){
   let gross=0;for(let y=1;y<=p.T;y++)gross+=p.du*((1-p.mortality)/(1+p.discount))**y/(1+p.discount)**p.delay;
   const health=p.g*(nonbuyers*(p.clinicalAdditionality*gross-p.h/(1+p.discount)**p.delay)-p.donorHarm);
   near(r.healthQalysUSA,health);
  }else assert.equal(r.healthQalysUSA,null);
  if(p.resourceStatus==='unknown'||p.healthStatus==='unknown'){assert.equal(r.resourceEquivalentUSA,null);assert.equal(r.combinedEquivalentUSA,null);continue;}
  const burden=p.nonbuyerTravel+p.nonbuyerLostPay+p.nonbuyerMedication;
  let cash=.5*p.g*(buyers*Math.log1p((p.purchaseCash-p.buyerIncrementalBurden)/p.recipientIncome)+nonbuyers*Math.log1p(-burden/p.recipientIncome))/(1+p.discount)**p.delay;
  const recovered=nonbuyers*p.recoveryShare*p.clinicalAdditionality;
  let rawWage=0;for(let y=1;y<=p.incomeYears;y++)rawWage+=p.g*recovered*(1-p.mortality)**y*p.earningsGain;
  near(r.functionalRecoveryGrossCashUSA,rawWage);
  let wage=0;
  if(p.incomeYears>0)wage+=.5*recovered*(1-p.mortality)*p.g*Math.log1p(p.earningsGain/(p.recipientIncome-burden))/(1+p.discount)**(p.delay+1);
  for(let y=2;y<=p.incomeYears;y++)wage+=.5*recovered*(1-p.mortality)**y*p.g*Math.log1p(p.earningsGain/p.recipientIncome)/(1+p.discount)**(p.delay+y);
  wage*=p.incomeIndependent;
  const volunteer=.5*N*p.volunteersPerCase*p.g*p.volunteerIndependent*Math.log1p(-p.volunteerCash/p.volunteerIncome)/(1+p.discount)**p.delay;
  near(r.resourceEquivalentUSA,cash+wage+volunteer);
  near(r.combinedEquivalentUSA,r.healthQalysUSA+cash+wage+volunteer);
  if(r.combinedEquivalentUSA>0)near(r.combinedDonationPricePer10USD,10*p.G/r.combinedEquivalentUSA);
  else assert.equal(r.combinedDonationPricePer10USD,null);
  if(p.institutionalStatus!=='unknown')near(r.grossInstitutionalEnvelopeUSD,p.G+N*(p.donatedResourcePerAddedCase+p.complicationResourcePerAddedCase));
  else assert.equal(r.grossInstitutionalEnvelopeUSD,null);
 }
 near(calculate(central).combinedDonationPricePer10USD,1235136.175867155);
});
test('capacity, purchased care, genuine zero, unknown and independent harm remain distinct',()=>{
 assert.equal(calculate({...central,purchaseShare:1}).healthQalysUSA,0);
 assert.equal(calculate({...central,funding:0}).combinedEquivalentUSA,0);
 assert.equal(calculate({...central,capacity:0}).combinedEquivalentUSA,0);
 const harm=calculate({...central,funding:0,donorHarm:.01});assert.ok(harm.combinedEquivalentUSA<0);assert.equal(harm.combinedDonationPricePer10USD,null);
 assert.ok(calculate({...central,G:25000,capacity:.1}).capacityBinding);
});
test('required statuses and numeric domains reject invented or silently defaulted inputs',()=>{
 const missing={...central};delete missing.resourceStatus;
 for(const p of [null,[],{},missing,{...central,extra:1},{...central,G:25001},{...central,G:Infinity},{...central,purchaseShare:1.1},{...central,T:1.5},{...central,recipientIncome:100}])assert.throws(()=>calculate(p));
});

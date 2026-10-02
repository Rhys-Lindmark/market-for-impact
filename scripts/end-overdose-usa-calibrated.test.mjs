import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice} from '../lib/geography-reports.mjs';
import {central,calculate,scenarios,originalUSA} from '../lib/end-overdose-usa-calibrated-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1e-12,Math.abs(b)*1e-11),`${a} != ${b}`);
test('published USA registry matches every current scenario, frozen history and dedicated clock',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const report=data.reports.find(r=>r.edition==='usa'&&r.slug==='end-overdose');
 const frozen=JSON.parse(readFileSync(new URL('../data/usa/end-overdose-usa-pre-recalibration-model.json',import.meta.url)));
 assert.deepEqual(report.historicalModel,frozen.model);
 for(const p of scenarios){
  const id=p.id==='central-judgment'?'central':p.id,s=report.model.scenarios.find(s=>s.id===id),x=calculate(p);
  assert.ok(s,id);near(s.editionQalys,x.healthQalysUSA);
  assert.deepEqual(s.nativeOutputs,x);
 }
 near(reportPrice(report),2712178.1357609867);
 const added=data.sessions.filter(s=>report.sessionIds.includes(s.id)&&s.model.id==='gpt-6.1-sol');
 assert.equal(added.length,6);assert.equal(added.reduce((n,s)=>n+s.seconds,0),297);
 assert.equal(new Set(data.sessions.map(s=>s.id)).size,data.sessions.length);
 const effort=JSON.parse(readFileSync(new URL('../data/research-effort.json',import.meta.url))).organizations['End Overdose'];
 assert.equal(effort.sessions.length,11);
 assert.equal(effort.sessions.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0),3879);
});
test('every candidate independently reconstructs finite clinical survival and signed cohort cash',()=>{
 for(const p of scenarios){
  const r=calculate(p),D=p.G*p.a/p.c*p.b*p.q;
  let survival=1,L=0;
  for(let y=1;y<=p.T;y++){const next=survival*(1-(y===1?p.m1:p.m));L+=p.u*(survival+next)/2/(1+p.discount)**(y-.5+p.delay);survival=next;}
  const R=D*(1-p.purchaseShare)*p.e*p.k*p.t*p.d;
  const H=p.g*(R*(p.f*L-p.h)-p.donorHarm);
  let I=0;
  for(const [buy,bs] of [[true,p.purchaseShare],[false,1-p.purchaseShare]])for(const [mail,ms] of [[true,p.shippingShare],[false,1-p.shippingShare]]){
   const gain=(buy?p.purchaseCash:0)-(mail?p.incrementalShippingCash:0);
   I+=.5*D*bs*ms*p.g*p.incomeIndependent*Math.log1p(gain/p.incomeBefore)/(1+p.discount)**p.delay;
  }
  I+=.5*R*p.commonAliveShare*p.g*p.commonAliveIndependent*Math.log1p(p.commonAliveIncomeDelta/p.commonAliveIncomeBefore)/(1+p.discount)**p.delay;
  near(r.healthQalysUSA,H);near(r.resourceEquivalentUSA,I);near(r.combinedEquivalentUSA,H+I);
  if(H+I>0)near(r.combinedDonationPricePer10USD,10*p.G/(H+I));else assert.equal(r.combinedDonationPricePer10USD,null);
 }
 near(originalUSA().donorPricePer10USD,1759484.5799377698);
 near(calculate(central).combinedDonationPricePer10USD,2712178.1357609867);
});
test('purchase alternative, independent harm, genuine zero and unknown remain different',()=>{
 const purchaser=calculate({...central,purchaseShare:1});assert.equal(purchaser.healthQalysUSA,0);
 const zero=calculate({...central,b:0});assert.equal(zero.combinedEquivalentUSA,0);
 const harm=calculate({...central,b:0,donorHarm:.01});assert.ok(harm.combinedEquivalentUSA<0);assert.equal(harm.combinedDonationPricePer10USD,null);
 for(const flags of [{income:true},{health:true},{response:true}]){
  const r=calculate(central,flags);assert.equal(r.combinedEquivalentUSA,null);assert.equal(r.combinedDonationPricePer10USD,null);
 }
 const unknown=calculate(central,{response:true});assert.equal(unknown.additionalDeliveredKits,null);assert.equal(unknown.resourceEquivalentUSA,null);
});
test('candidate rejects missing, invalid, nonfinite and extrapolated inputs',()=>{
 for(const p of [null,[],{},{...central,G:Infinity},{...central,G:100001},{...central,purchaseShare:1.01},{...central,T:1.5},{...central,unexpected:1},{...central,incomeBefore:6}])assert.throws(()=>calculate(p));
 assert.throws(()=>calculate(central,{income:'unknown'}));assert.throws(()=>calculate(central,{other:true}));
 assert.throws(()=>calculate({...central,commonAliveShare:.9}),/must not overlap/);
 const missing={...central};delete missing.b;assert.throws(()=>calculate(missing),/Missing/);
});

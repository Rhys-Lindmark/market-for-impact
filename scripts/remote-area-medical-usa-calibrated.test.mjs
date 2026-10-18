import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import{inputs,calculate,scenarios}from'../lib/remote-area-medical-usa-calibrated-model.mjs';
import{calculate as proposal}from'../docs/geography-discovery/ram-usa-recalibration-2026-10-02.calculate.mjs';
import{reportPrice,scenarioIncomeEquivalent,editionResearchEffort}from'../lib/geography-reports.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const d=read('data/geography-reports.json'),r=d.reports.find(r=>r.edition==='usa'&&r.slug==='remote-area-medical');
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
test('RAM all reviewed cases, public ledger/history and focused provenance agree',()=>{
 assert.deepEqual(r.historicalModel,read('data/usa/remote-area-medical-usa-pre-recalibration-model.json').model);
 assert.equal(r.model.scenarios.length,26);
 for(const[id,o]of Object.entries(scenarios)){
  const p=inputs(o),x=calculate(p),s=r.model.scenarios.find(s=>s.id===id);assert.deepEqual(s.parameters,p);
  const {incomeFlows,...rest}=x;assert.deepEqual(rest,proposal(p));
  assert.deepEqual(s.nativeOutputs,{...x,combinedDonationPricePer10USD:x.donorCombinedPrice?.value??null});
  assert.equal(s.editionQalys,x.healthUSA);assert.equal(s.incomeUnknown,x.resourcesUSA===null);
  if(x.resourcesUSA!==null)close(scenarioIncomeEquivalent(s),x.resourcesUSA);
 }
 close(reportPrice(r),5255153.51704092);
 assert.equal(new Set(r.sessionIds).size,13);assert.equal(r.sessionIds.length,13);
 const fresh=d.sessions.filter(s=>r.sessionIds.includes(s.id)&&s.startedAt.startsWith('2026-10-02'));
 assert.equal(fresh.length,7);assert.equal(fresh.reduce((n,s)=>n+s.seconds,0),471);
 assert.equal(editionResearchEffort(d,r).label,'Research time: ~10 min on GPT-6 Astra Light + ~25 min on GPT-6 Astra Medium + ~8 min on GPT-6.1 Sol');
 assert.deepEqual(read('data/research-effort.json').organizations[r.organizationId].sessions,r.sessionIds.map(id=>d.sessions.find(s=>s.id===id)));
 assert.match(r.sections.cost,/persistent net incremental cash obligation/i);assert.match(r.sections.cost,/negative wages and direct cash losses are fully charged/i);
});
test('RAM clinical totals independently reproduce by midpoint integration',()=>{
 for(const over of Object.values(scenarios)){
  const p=inputs(over),x=calculate(p);if(x.healthUSA===null)continue;
  let H=-(x.attendance+x.failedAttempts)*p.attemptHarm;
  for(const name of ['vision','dental','medical']){
   const a=p[name],base=x.uniquePeople*a.share,overlay=name==='medical'?x.uniquePeople*(p.vision.share+p.dental.share)*p.medicalOverlay:0;
   const delay=p.clinicDelay+(name==='vision'?p.visionAdaptation:0),n=20000;let area=0;
   for(let i=0;i<n;i++){const t=a.T*(i+.5)/n;area+=Math.exp(-(Math.log1p(p.d)+p.m+a.loss+a.catchup)*t)*a.T/n;}
   const gross=a.u*(1+p.d)**(-delay)*area;
   H+=(base+overlay*p.medicalOverlapIndependent)*a.f*a.completion*(1-a.purchase)*a.s*gross-(base+overlay)*a.f*a.completion*(1-a.purchase)*a.s*a.h*(1+p.d)**(-delay);
  }
  assert.ok(Math.abs(H*p.g-x.healthUSA)<1e-9);
 }
});
test('RAM zero, unknown and unsupported overlay boundaries are explicit',()=>{
 assert.equal(calculate(inputs({capacity:0,fundingKnown:false,cashKnown:false,vision:{known:false}})).combinedUSA,0);
 assert.equal(calculate(inputs({G:0,fundingKnown:false,cashKnown:false})).combinedUSA,0);
 assert.equal(calculate(inputs({b:0,fundingKnown:false})).combinedUSA,null);
 const unknown=calculate(inputs({vision:{known:false}}));assert.equal(unknown.healthParts.vision,null);assert.equal(unknown.native.vision.completedMeaningful,null);assert.equal(unknown.resourcesUSA,null);
 assert.equal(calculate(inputs({cashKnown:false})).earningsResourcesUSA,null);
 const loss=calculate(inputs({vision:{gain:-1000},dental:{gain:-200},incomeIndependent:0}));
 close(loss.earningsResourcesUSA,calculate(inputs({vision:{gain:-1000},dental:{gain:-200},incomeIndependent:1})).earningsResourcesUSA);
 assert.ok(loss.earningsResourcesUSA<0);
 for(const o of [{medical:{worker:.1}},{medical:{upkeep:1}},{baseline:10},{G:25001},{d:Infinity}])assert.throws(()=>calculate(inputs(o)));
 const p=inputs();delete p.b;assert.throws(()=>calculate(p));assert.throws(()=>calculate(null));
 const buyer=calculate(inputs(scenarios.equivalentPurchasedCare));assert.ok(buyer.healthUSA<0);assert.equal(buyer.native.vision.additionalCompletions,0);assert.equal(buyer.earningsResourcesUSA,0);
 assert.equal(calculate(inputs(scenarios.noClinicalAndNoCash)).combinedUSA,0);
});

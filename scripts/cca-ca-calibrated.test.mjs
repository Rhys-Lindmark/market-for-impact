import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,diagnostics} from '../lib/cca-ca-calibrated-model.mjs';
import {reportPrice,scenarioIncomeEquivalent,expenseAverage,validateEditionReports} from '../lib/geography-reports.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const saved=JSON.parse(readFileSync(new URL('../docs/geography-discovery/cca-ca-recalibration-2026-10-02.calculations.json',import.meta.url)));
test('CCA reproducible candidate agrees with all independently reviewed saved cases',()=>{
 const current=diagnostics(); assert.equal(Object.keys(current).length,29);
 for(const [id,value] of Object.entries(current))assert.deepEqual(value,saved.cases[id],id);
 near(current.central.caUsdPerBetterLife,10211794.843329143);
 near(current.central.caHealthYears,.009792597827729082);
 assert.equal(current.central.caIncomeEquivalentYears,0);
});
test('CCA post-event survival and fractional future event windows independently integrate',()=>{
 const v=calculate(),x=v.inputs,n=40000;let q=0;
 for(let k=0;k<n;k++)q+=x.utility*Math.exp(-(x.hazard+Math.log1p(x.discount))*(k+.5)*x.tailYears/n)*x.tailYears/n;
 near(v.qDeath,q);
 const f=calculate({activeYears:2.5});
 const exposure=1/1.03**.75+1/1.03**1.75+.5/1.03**2.5;
 near(f.exposureDiscount,exposure);
 near(f.healthYears,f.policyWeight*x.annualDeaths*q*exposure);
 near(calculate({discount:0,hazard:0}).qDeath,7.5);
 near(calculate({tailYears:0}).healthYears,0);
});
test('Absolute policy-probability change must remain physically possible, not clamped',()=>{
 assert.throws(()=>calculate({annualExpense:1}),/probability/i);
 near(calculate({annualExpense:100}).incrementalProbability,1);
 assert.throws(()=>calculate({annualExpense:99}),/probability/i);
 for(const input of [null,[],{unknown:1},{gift:100001},{response:1.1},{baseline:0},{annualNet:-50000},{utility:1.01},{annualAdmissions:-1},{activeYears:11}])assert.throws(()=>calculate(input));
});
test('Income is independently signed and does not change the mortality cohort',()=>{
 const base=calculate(),positive=calculate({resourceIncidence:.25}),negative=calculate({resourceIncidence:.25,admissionNet:-100,edNet:-25});
 near(base.caHealthYears,positive.caHealthYears);near(base.caHealthYears,negative.caHealthYears);
 assert.ok(positive.caIncomeEquivalentYears>0&&negative.caIncomeEquivalentYears<0);
 near(positive.caIncomeEquivalentYears,positive.policyWeight*.5*.25*(6*Math.log1p(100/50000)+(116/12)*Math.log1p(25/50000))*positive.exposureDiscount);
 assert.ok(calculate({annualHouseholds:1000,annualNet:50}).caIncomeEquivalentYears>0);
 assert.ok(calculate({annualHouseholds:1000000,annualNet:-.1}).caIncomeEquivalentYears<0);
 assert.ok(calculate({utility:0,resourceIncidence:.25}).caUsdPerBetterLife>0);
});
test('Nulls preserve spent donor money; signed policy harms and induced losses stay negative',()=>{
 for(const input of [{funding:0},{response:0},{realization:0},{assignment:0},{healthCA:0}]){
  const v=calculate(input);near(v.caCombinedYears,0);assert.equal(v.caUsdPerBetterLife,null);assert.equal(v.donorCost,10000);
 }
 const mortality=calculate({annualDeaths:-230/12});assert.ok(mortality.caHealthYears<0);assert.equal(mortality.caUsdPerBetterLife,null);
 const loss=calculate({funding:0,assignment:0,inducedHouseholds:1,inducedExposure:1,inducedNet:-50});
 assert.ok(loss.caIncomeEquivalentYears<0);assert.equal(loss.caUsdPerBetterLife,null);
 near(calculate({healthCA:.5,resourceCA:.5}).caUsdPerBetterLife,calculate().caUsdPerBetterLife*2);
});
test('CCA clock anomaly remains explicit and cannot be imported as full research time',()=>{
 const timing=JSON.parse(readFileSync(new URL('../docs/geography-discovery/cca-ca-recalibration-2026-10-02.closed.json',import.meta.url)));
 const a=timing.timingAudit;
 near((Date.parse(a.lastVerifiedConsistentCheckpoint)-Date.parse(timing.session.startedAt))/1000,538.4);
 near(a.claimableDedicatedSeconds,538.4);
 near(a.rawEnvelopeSeconds-a.excludedUnknownInterval.seconds,a.claimableDedicatedSeconds);
 assert.ok(a.excludedUnknownInterval.seconds>2200);
});
test('CCA live registry encodes every health and income scenario without changing the cohort counts',()=>{
 const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
 const progress=JSON.parse(readFileSync(new URL('../docs/geography-progress.json',import.meta.url)));
 validateEditionReports(data,progress);
 const r=data.reports.find(r=>r.edition==='california'&&r.slug==='coalition-for-clean-air');
 for(const [id,v] of Object.entries(diagnostics())){
  const s=r.model.scenarios.find(s=>s.id===id);assert.ok(s,id);
  near(s.editionQalys,v.caHealthYears);near(s.allPopulationQalys,v.healthYears);
  near(scenarioIncomeEquivalent(s),v.caIncomeEquivalentYears);near(s.costUSD,v.donorCost);
 }
 near(reportPrice(r),10211794.843329143);near(expenseAverage(r),2043139);
 assert.match(r.sections.cost,/\$10\.2 million/);assert.match(r.sections.cost,/\$3\.34 million/);
 assert.equal(data.reports.filter(r=>r.edition==='california').length,25);
 assert.equal(data.reports.filter(r=>r.edition==='california'&&r.stage==='beta').length,10);
 const sessions=r.sessionIds.map(id=>data.sessions.find(s=>s.id===id));
 const author=sessions.find(s=>s.startedAt==='2026-10-02T07:41:05.600Z');
 assert.ok(author);assert.equal(author.endedAt,'2026-10-02T07:50:04.000Z');assert.equal(author.model.id,'gpt-6.1-sol');
 assert.ok(!sessions.some(s=>s.endedAt==='2026-10-02T08:26:47.482Z'));
 const root=sessions.find(s=>s.startedAt==='2026-10-02T07:42:45.000Z');assert.ok(root);
 near((Date.parse(root.endedAt)-Date.parse(root.startedAt))/1000,30);
});

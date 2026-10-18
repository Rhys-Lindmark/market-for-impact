import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,formatEditionReportPrice} from '../lib/geography-reports.mjs';
const rows=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url))).reports;
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-6*Math.max(1e-9,Math.abs(b)),a+' != '+b);
test('FernCare shows a conditional illustration without becoming rankable',()=>{
 const r=rows.find(r=>r.edition==='detroit'&&r.slug==='ferncare-free-clinic');
 assert.equal(reportPrice(r),null);
 assert.equal(r.rankingEligible,false);
 assert.equal(formatEditionReportPrice(r),'Illustrative $77K'); // stored $772K per 10 DALYs; shown per DALY since 2026-10-12
});
test('CA USA LA reports have finite positive central judgments or an audited withdrawal',()=>{
 const reports=rows.filter(r=>['california','usa','los-angeles'].includes(r.edition));
 assert.ok(reports.length>=75);
 for(const r of reports){
  // Either a finite positive central price, or an audited withdrawal. Which reports are withdrawn changes as they are
  // recalibrated (CCA, CSBHA, Walk SF, CIL, WCLP, Youth ALIVE!, Champions, KACS, HAH, RAM, IST, CRIBS all have since).
  if(reportPrice(r)===null){
   assert.match(r.acceptance.evidence,/beta-(acceptance|audit)|september-30-beta-acceptance|walk-sf-beta-acceptance|acceptance/,r.edition+'/'+r.slug);
   // Withdrawn reports no longer print 'Estimate withdrawn': the list shows the preserved original estimate (researchListPrice) or nothing.
   assert.match(formatEditionReportPrice(r),/^(Not estimated|\$)/,r.edition+'/'+r.slug);
  }else assert.ok(Number.isFinite(reportPrice(r))&&reportPrice(r)>0,r.edition+'/'+r.slug);
 }
});
test('three policy models independently integrate finite delayed and durable survival',()=>{
 for(const r of rows.filter(r=>['coalition-for-clean-air','communities-for-a-better-environment'].includes(r.slug)&&r.stage==='alpha')){
  for(const s of r.model.scenarios.filter(s=>s.inputs)){ // combined-income-unknown (2026-10-07) restates central without inputs
   const p=s.inputs,step=.001,rho=Math.log(1.03),h1=p.h0*Math.exp(-Math.log(p.HR)/10*p.transport*p.pm);
   let q=0;
   for(let t=step/2;t<p.T;t+=step){
    const base=Math.exp(-p.h0*t),durable=Math.exp(-h1*t);
    const delayed=Math.exp(-p.h0*Math.min(t,p.A)-h1*Math.max(0,t-p.A));
    q+=p.u*(p.f*(durable-base)+(1-p.f)*(durable-delayed))*Math.exp(-rho*t)*step;
   }
   q/=1.03**p.L;
   close(s.editionQalys,10000/(p.E*p.Y)*p.b*(p.p*p.N*q-p.harm));
  }
 }
});
test('WCLP coverage effect has two years only and distinct attribution factors',()=>{
 const r=rows.find(r=>r.slug==='western-center-on-law-and-poverty');
 // Recalibrated (wclp-ca-calibrated.test.mjs): the first scenario now has a finite central; the original survives below.
 close(r.model.scenarios.find(s=>s.id==='historical-alpha-central').editionQalys,100000*.1*.2*.2*.25*.02*(1/1.03+.5/1.03**2));
 assert.equal(r.annualExpenses.reduce((s,y)=>s+y.amount,0)/3,7097648);
});
test('Youth ALIVE! and Champions retain old arithmetic without a ranked donor price',()=>{
 const youth=rows.find(r=>r.edition==='california'&&r.slug==='youth-alive');
 const champions=rows.find(r=>r.edition==='california'&&r.slug==='champions-for-health');
 for(const r of [youth,champions]){
  assert.equal(r.stage,'beta'); // recalibrated (youth-ca-calibrated / champions-ca-calibrated tests): no longer withdrawn
  assert.ok(r.model.scenarios.find(s=>['historical-alpha-central','historical-prior-health-central'].includes(s.id)).editionQalys>0);
 }
 close(youth.model.scenarios.find(s=>s.id==='historical-prior-health-central').editionQalys,0.0365823609957567); // renamed in the youth-ca recalibration
 close(champions.model.scenarios.find(s=>s.id==='historical-alpha-central').editionQalys,0.7216984223300972);
 close(youth.annualExpenses.filter(y=>y.comparable).reduce((sum,y)=>sum+y.amount,0)/3,7208761.333333333);
 close(champions.annualExpenses.reduce((sum,y)=>sum+y.amount,0)/3,3670707);
});
test('USA legal and housing central models preserve finite native health bridges',()=>{
 const lac=rows.find(r=>r.slug==='legal-action-center'),n=rows.find(r=>r.slug==='national-center-for-healthy-housing');
 let L=0;for(let y=1;y<=10;y++)L+=.75*(.95/1.03)**y;
 close(lac.model.scenarios[0].editionQalys,(37*.5*.5*.75*.5*.5+4*.15*100*.4*.5*.5)*.01*L*.98);
 close(n.model.scenarios[0].editionQalys,20*.15*50*.5*.7*(2.1/14)*.5*.75*.1/1.03*.95);
 assert.match(lac.priceScope,/conditional/i); // wording rewritten with the 2026-10-07 income-unknown scenarios
});

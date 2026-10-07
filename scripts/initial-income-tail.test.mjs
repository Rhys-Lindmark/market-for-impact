import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,scenarioIncomeEquivalent} from '../lib/geography-reports.mjs';
import * as hh from '../docs/geography-discovery/ca-hhcla-alpha-income-20261007/model.mjs';
import * as dh from '../docs/geography-discovery/ca-didihirsch-alpha-income-20261007/model.mjs';
import * as br from '../docs/geography-discovery/ca-breathe-alpha-income-20261007/model.mjs';
import * as cp from '../docs/geography-discovery/ca-childrens-partnership-alpha-income-20261007/model.mjs';
import * as nc from '../docs/geography-discovery/ca-nourish-alpha-income-20261007/model.mjs';
import * as cwc from '../docs/geography-discovery/ca-cwc-alpha-income-20261007/model.mjs';
import * as cda from '../docs/geography-discovery/ca-cda-alpha-income-20261007/model.mjs';
import * as essential from '../docs/geography-discovery/ca-essential-alpha-income-20261007/model.mjs';
import * as yimby from '../docs/geography-discovery/ca-yimby-alpha-income-20261007/model.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
for(const [edition,slug,dir] of [
 ['california','california-pan-ethnic-health-network','ca-cpehn-alpha-income-20261007'],
 ['usa','national-health-law-program','usa-nhelp-alpha-income-20261007'],
 ['usa','us-alcohol-policy-alliance','usa-usapa-alpha-income-20261007'],
 ['usa','rx-outreach','usa-rxo-alpha-income-20261007'],
 ['usa','upstream-usa','usa-upstream-alpha-income-20261007'],
 ['usa','national-center-for-healthy-housing','usa-nchh-alpha-income-20261007'],
 ['usa','legal-action-center','usa-lac-alpha-income-20261007'],
 ['usa','green-and-healthy-homes-initiative','usa-ghhi-alpha-income-20261007'],
 ['usa','the-headstrong-project','usa-headstrong-alpha-income-20261007'],
 ['usa','immunize-org','usa-immunize-alpha-income-20261007']
])test(slug+' preserves original clinical reference and explicit unknown income',()=>{
 const r=data.reports.find(r=>r.edition===edition&&r.slug===slug);
 const original=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/'+dir+'/original-report.json',import.meta.url)));
 for(const s of original.model.scenarios)assert.deepEqual(r.model.scenarios.find(x=>x.id===s.id),s);
 assert.equal(reportPrice(r),reportPrice(original));
 assert.equal(r.model.incomeAssessment.status,'assessed-unknown');
 assert.equal(r.model.incomeAssessment.evidence,r.acceptance.evidence);
 assert.equal(scenarioIncomeEquivalent(r.model.scenarios.find(s=>s.id==='combined-income-unknown')),null);
 assert.equal(r.stage,'alpha');
});
test('NHeLP optional payment sensitivity is independent of clinical benefit and zero without capacity',async()=>{
 const model=await import('../docs/geography-discovery/usa-nhelp-alpha-income-20261007/model.mjs');
 const r=data.reports.find(r=>r.edition==='usa'&&r.slug==='national-health-law-program');
 for(const [id,o] of [['oregon-payment-transfer-diagnostic',{}],['oregon-payment-clinical-null',{q:0}],['oregon-payment-no-capacity',{b:0}]]){
  const z=model.financialDiagnostic(o),s=r.model.scenarios.find(s=>s.id===id);
  assert(Math.abs(scenarioIncomeEquivalent(s)-z.income)<1e-10);
  assert.equal(s.editionQalys,z.editionQalys);
 }
 assert.equal(model.financialDiagnostic({q:0}).income,model.financialDiagnostic().income);
 assert.equal(model.financialDiagnostic({b:0}).income,0);
 assert.equal(r.model.scenarios.find(s=>s.id==='central').incomePathways,undefined);
});
test('USAPA source-based payment threshold is not credited as household income or welfare',async()=>{
 const m=await import('../docs/geography-discovery/usa-usapa-alpha-income-20261007/model.mjs');m.tests();
 const r=data.reports.find(r=>r.edition==='usa'&&r.slug==='us-alcohol-policy-alliance');
 const d=r.model.paymentThresholdDiagnostic;
 assert(Math.abs(d.paymentChange-32.15)<1e-10);
 assert(Math.abs(m.paymentDiagnostic(d.breakEvenQuantityReduction).paymentChange)<1e-10);
 assert.equal(d.income,null);assert.equal(d.welfare,null);
 assert.equal(r.model.scenarios.find(s=>s.id==='central').incomePathways,undefined);
 assert.equal(m.calculate({e:0}).income,null);
});
test('Rx Outreach dose-specific payment example is not an average patient income or clinical credit',async()=>{
 const m=await import('../docs/geography-discovery/usa-rxo-alpha-income-20261007/model.mjs');m.tests();
 const r=data.reports.find(r=>r.edition==='usa'&&r.slug==='rx-outreach');
 const d=r.model.paymentCostDiagnostic;
 assert.equal(d.days,360);assert.equal(d.payment,88);
 assert.equal(m.paymentDiagnostic(0).outlayChange,88);
 assert.equal(m.paymentDiagnostic(88).outlayChange,0);
 assert.equal(d.income,null);assert.equal(d.welfare,null);
 assert.equal(r.model.scenarios.find(s=>s.id==='central').incomePathways,undefined);
 assert.equal(m.calculate({t:0}).income,null);
});
for(const [slug,model] of [['essential-access-health',essential],['california-yimby-education-fund',yimby]])test(slug+' independent signed-resource worlds reproduce',()=>{
 const report=data.reports.find(r=>r.edition==='california'&&r.slug===slug);model.tests();
 for(const [id,x,h] of model.scenarios){const z=model.calculate(x,h),s=report.model.scenarios.find(s=>s.id===id);assert(s,id);assert.equal(s.editionQalys,z.editionQalys);if(id==='income-unknown'){assert.equal(scenarioIncomeEquivalent(s),null);continue;}assert(Math.abs(scenarioIncomeEquivalent(s)-z.income)<1e-10);}
 assert(Math.abs(reportPrice(report)-model.calculate().price10)<1e-6);assert.equal(report.stage,'alpha');
});
for(const [slug,model,dir] of [['homeless-health-care-los-angeles',hh,'ca-hhcla-alpha-income-20261007'],['didi-hirsch-mental-health-services',dh,'ca-didihirsch-alpha-income-20261007'],['breathe-southern-california',br,'ca-breathe-alpha-income-20261007'],['childrens-partnership',cp,'ca-childrens-partnership-alpha-income-20261007'],['nourish-california',nc,'ca-nourish-alpha-income-20261007'],['community-water-center',cwc,'ca-cwc-alpha-income-20261007']])test(slug+' signed initial ledger reproduces without dropping access costs',()=>{
 const report=data.reports.find(r=>r.edition==='california'&&r.slug===slug);
 const ledger=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/'+dir+'/ledger.json',import.meta.url)));
 model.tests();
 for(const [id,parameters,clinical] of model.scenarios){const z=model.calculate(parameters,clinical),s=report.model.scenarios.find(s=>s.id===id);assert(s,id);assert.equal(s.editionQalys,z.editionQalys);if(id==='income-unknown'){assert.equal(scenarioIncomeEquivalent(s),null);continue;}assert(Math.abs(scenarioIncomeEquivalent(s)-z.income)<1e-12);assert(ledger.some(row=>row.id===id));}
 assert(Math.abs(reportPrice(report)-model.calculate().price10)<1e-6);
 if(model===cp){assert(model.calculate({},false).income>0);assert.equal(model.calculate({u:0,medicalSaving:100}).income,model.calculate({u:0}).income);assert.equal(model.calculate({medicalSaving:100}).groups[0].people,3.125);}
 else if(model===nc){assert(model.calculate({},false).income>0);assert(model.calculate({convertedShare:0}).income<0);}
 else assert(model.calculate({},false).income<0);
 assert(model.calculate({positiveShare:0}).income<0);
 assert.equal(report.stage,'alpha');
 if(model===cwc){assert.equal(model.calculate({n:0}).income,model.calculate().income);assert.equal(model.calculate({u:0}).income,model.calculate().income);}
});

test('CDA full participation burdens survive clinical and alternative-care nulls',()=>{
 const report=data.reports.find(r=>r.edition==='california'&&r.slug==='california-dental-association-foundation');
 cda.tests();
 for(const [id,x,h] of cda.scenarios){const z=cda.calculate(x,h),s=report.model.scenarios.find(s=>s.id===id);assert(s,id);assert.equal(s.editionQalys,z.editionQalys);if(id==='income-unknown'){assert.equal(scenarioIncomeEquivalent(s),null);continue;}assert(Math.abs(scenarioIncomeEquivalent(s)-z.income)<1e-12);}
 assert(Math.abs(reportPrice(report)-cda.calculate().price10)<1e-6);
 assert.equal(cda.calculate({a:0}).income,cda.calculate().income);
 assert.equal(cda.calculate({s:0}).income,cda.calculate().income);
 assert.equal(cda.calculate({b:0}).income,0);
 assert.equal(cda.calculate({positiveShare:0,savings:200}).income,cda.calculate().income);
 assert.equal(report.stage,'alpha');
});

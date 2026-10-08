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
test('DWC conditional paid work preserves original worlds and signed access costs',async()=>{
 const m=await import('../docs/geography-discovery/la-dwc-alpha-income-20261008/model.mjs');
 const r=data.reports.find(r=>r.edition==='los-angeles'&&r.slug==='downtown-women-s-center');
 const o=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/la-dwc-alpha-income-20261008/original-report.json',import.meta.url)));
 for(const s of o.model.scenarios){const v=r.model.scenarios.find(x=>x.id===(s.id==='central'?'initial-central-diagnostic':s.id));assert.deepEqual(s.id==='central'?{...v,id:s.id,label:s.label}:v,s);}
 for(const[id,x]of m.worlds){const z=m.calculate(x),s=r.model.scenarios.find(s=>s.id===id);assert(Math.abs(scenarioIncomeEquivalent(s)-z.income)<1e-10);assert.equal(s.editionQalys,z.editionQalys);}
 assert(Math.abs(reportPrice(r)-m.calculate().price)<1e-7);
 assert(m.calculate({q:0}).income>0);assert(m.calculate({cashAdditionality:0}).income<0);assert(m.calculate({positiveShare:0}).income<0);assert.equal(m.calculate({b:0}).total,0);
 assert.equal(scenarioIncomeEquivalent(r.model.scenarios.find(s=>s.id==='income-unknown')),null);
});
test('ICLC source-linked conditional resources preserve diagnostics and signed nulls',async()=>{
 const m=await import('../docs/geography-discovery/la-iclc-alpha-income-20261008/model.mjs');
 const r=data.reports.find(r=>r.edition==='los-angeles'&&r.slug==='inner-city-law-center');
 const o=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/la-iclc-alpha-income-20261008/original-report.json',import.meta.url)));
 for(const s of o.model.scenarios){const v=r.model.scenarios.find(x=>x.id===(s.id==='central'?'initial-central-diagnostic':s.id));assert.deepEqual(s.id==='central'?{...v,id:s.id,label:s.label}:v,s);}
 for(const[id,x]of m.worlds){const z=m.calculate(x),s=r.model.scenarios.find(s=>s.id===id);assert(Math.abs(scenarioIncomeEquivalent(s)-z.income)<1e-10);}
 assert(Math.abs(reportPrice(r)-m.calculate().price)<1e-7);assert(m.calculate({q:0}).income>0);assert(m.calculate({a:0}).income<0);assert.equal(m.calculate({b:0}).total,0);
});
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
 ['usa','immunize-org','usa-immunize-alpha-income-20261007'],
 ['usa','shatterproof','usa-shatterproof-alpha-income-20261007'],
 ['usa','farmworker-justice','usa-farmworker-justice-alpha-income-20261007'],
 ['usa','center-for-environmental-health','usa-ceh-alpha-income-20261007'],
 ['usa','toxic-free-future','usa-tff-alpha-income-20261007'],
 ['usa','earthjustice','usa-earthjustice-alpha-income-20261007'],
 ['new-york-city','transportation-alternatives','nyc-ta-alpha-income-20261007'],
 ['new-york-city','new-york-lawyers-for-the-public-interest','nyc-nylpi-alpha-income-20261007'],
 ['new-york-city','new-york-city-environmental-justice-alliance','nyc-nycej-alpha-income-20261007'],
 ['new-york-city','we-act-for-environmental-justice','nyc-weact-alpha-income-20261007'],
 ['new-york-city','the-center-for-great-expectations','nyc-cge-alpha-income-20261007'],
 ['new-york-city','new-york-legal-assistance-group','nyc-nylag-alpha-income-20261007'],
 ['new-york-city','new-jersey-environmental-justice-alliance','nyc-njeja-alpha-income-20261007'],
 ['new-york-city','northern-manhattan-perinatal-partnership','nyc-nmpp-alpha-income-20261007'],
 ['new-york-city','common-justice','nyc-commonjustice-alpha-income-20261007'],
 ['new-york-city','newark-community-street-team','nyc-ncst-alpha-income-20261008'],
 ['new-york-city','center-for-independence-of-the-disabled-new-york','nyc-cidny-alpha-income-20261008'],
 ['new-york-city','health-and-welfare-council-of-long-island','nyc-hwcli-alpha-income-20261008'],
 ['new-york-city','kings-against-violence-initiative','nyc-kavi-alpha-income-20261008'],
 ['new-york-city','citizens-housing-and-planning-council','nyc-chpc-alpha-income-20261008'],
 ['los-angeles','neighborhood-legal-services-los-angeles-county','la-nlsla-alpha-income-20261008'],
 ['los-angeles','east-yard-communities-for-environmental-justice','la-eastyard-alpha-income-20261008'],
 ['los-angeles','housing-rights-center','la-hrc-alpha-income-20261008'],
 ['los-angeles','illumination-foundation','la-illumination-alpha-income-20261008'],
 ['los-angeles','dayle-mcintosh-center','la-dayle-alpha-income-20261008'],
 ['los-angeles','communities-for-a-better-environment','la-cbe-alpha-income-20261008'],
 ['los-angeles','didi-hirsch-mental-health-services','la-didihirsch-alpha-income-20261008'],
 ['los-angeles','john-tracy-center','la-jtc-alpha-income-20261008'],
 ['los-angeles','streets-are-for-everyone','la-safe-alpha-income-20261008']
])test(slug+' preserves original clinical reference and explicit unknown income',()=>{
 const r=data.reports.find(r=>r.edition===edition&&r.slug===slug);
 const original=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/'+dir+'/original-report.json',import.meta.url)));
 for(const s of original.model.scenarios)assert.deepEqual(r.model.scenarios.find(x=>x.id===s.id),s);
 assert.equal(reportPrice(r),reportPrice(original));
 assert.equal(r.model.incomeAssessment.status,'assessed-unknown');
 assert.equal(r.model.incomeAssessment.evidence,r.acceptance.evidence);
 const unknown=r.model.scenarios.find(s=>s.id==='combined-income-unknown')??r.model.scenarios.find(s=>s.id==='central');
 assert.equal(scenarioIncomeEquivalent(unknown),null);
 if(slug==='transportation-alternatives')assert.equal(unknown.editionQalys,null);
 assert.equal(r.stage,'alpha');
});
test('Didi LA interrupted root timer is retained as evidence, not measured provenance',()=>{
 const r=data.reports.find(r=>r.edition==='los-angeles'&&r.slug==='didi-hirsch-mental-health-services');
 assert(!r.sessionIds.includes('c5e45f98-301a-404a-84d2-1b2a825bb500'));
 assert(!data.sessions.some(s=>s.id==='c5e45f98-301a-404a-84d2-1b2a825bb500'));
 const raw=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/la-didihirsch-alpha-income-20261008/root-closed.json',import.meta.url)));
 assert.equal(raw.excludedFromMeasured,true);
 assert.equal(raw.conservativeAllocationSeconds,175.108);
 assert.equal(Date.parse(raw.session.endedAt)-Date.parse(raw.session.startedAt),175108);
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

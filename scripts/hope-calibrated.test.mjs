import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,diagnostics,deliveryWorlds} from '../lib/hope-calibrated-model.mjs';
import {calculate as prior} from '../lib/hope-v2-model.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
let n=0;const check=f=>{f();n++;};const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
const r=calculate(),c=r.centralScenario,d=diagnostics(),old=prior();
check(()=>close(c.usdPerBetterLife,554659.5517271358));
check(()=>close(c.healthYears,old.centralScenario.bayQ));
check(()=>assert.equal(c.incomeYears,0));
check(()=>close(r.weighted.usdPerBetterLife,763247.8074233638));
check(()=>assert.deepEqual(r.historicalHealthOnly,old));
const p=d.incomeCases.counterfactualPurchase;
check(()=>close(p.healthYears,c.healthYears*.9));
check(()=>close(p.incomeYears,incomeHealthyYearEquivalent({people:3.125*.1,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:19,years:1,editionShare:.95})));
check(()=>close(p.usdPerBetterLife,10000/(c.healthYears*.9+3.125*.95*.1*.5*Math.log1p(19/50000))));
check(()=>close(d.incomeCases.adversePickup.usdPerBetterLife,10000/(c.healthYears+3.125*.95*.5*Math.log1p(-5/50000))));
check(()=>assert.ok(d.incomeCases.jointAdverse.totalYears<0));
check(()=>assert.equal(d.incomeCases.jointAdverse.usdPerBetterLife,null));
check(()=>assert.equal(d.incomeCases.nullHealthPositiveIncome.healthYears,0));
check(()=>assert.ok(d.incomeCases.nullHealthPositiveIncome.incomeYears>0));
check(()=>close(calculate({income:{purchaseShare:.1,netSavingsUSD:0,baselineUSD:50000}}).centralScenario.healthYears,c.healthYears*.9));
check(()=>assert.deepEqual(calculate({income:{purchaseShare:.1,netSavingsUSD:19,baselineUSD:50000}}).income,{purchaseShare:.1,netSavingsUSD:19,baselineUSD:50000}));
const annual=d.annual.centralScenario;
check(()=>assert.equal(annual.additionalPeople,200));
check(()=>close(annual.healthYears,c.healthYears*80));
check(()=>close(annual.usdPerBetterLife,277329.7758635679));
check(()=>close(annual.grossQ-annual.harmQ,annual.healthAllYears));
check(()=>close(annual.allQ*.95,annual.bayQ));
for(const scope of ['annual','marginal'])for(const income of [{purchaseShare:0,netSavingsUSD:0,baselineUSD:50000},{purchaseShare:.1,netSavingsUSD:19,baselineUSD:50000},{purchaseShare:0,netSavingsUSD:-5,baselineUSD:50000}]){
 const out=calculate({scope,income});
 for(const row of out.rows){check(()=>close(row.totalYears,row.healthYears+row.incomeYears));check(()=>close(row.allQ*row.inputs.bay,row.bayQ));check(()=>close(row.grossQ-row.harmQ,row.healthAllYears));}
 check(()=>close(out.allQ,out.rows.reduce((v,x)=>v+x.weight*x.allQ,0)));
}
for(const options of [{gift:0},{worlds:deliveryWorlds.map(w=>({...w,bay:0}))},{worlds:deliveryWorlds.map(w=>({...w,funding:0}))}]){
 const out=calculate({...options,income:{purchaseShare:.1,netSavingsUSD:19,baselineUSD:50000}});
 check(()=>assert.equal(out.bayQ,0));check(()=>assert.equal(out.bayCostPer10,null));
}
check(()=>assert.ok(d.horizonCases[1].usdPerBetterLife>d.horizonCases[5].usdPerBetterLife));
check(()=>assert.ok(d.horizonCases[5].usdPerBetterLife>d.horizonCases[20].usdPerBetterLife));
check(()=>close(d.analyticInfiniteHorizon.usdPerBetterLife,338987.6225611742));
check(()=>close(d.fundingCases[.25].usdPerBetterLife,c.usdPerBetterLife*2));
for(const input of [{scope:'x'},{gift:Infinity},{worlds:deliveryWorlds.map(w=>({...w,horizon:Infinity}))},{income:{purchaseShare:2,netSavingsUSD:0,baselineUSD:50000}},{income:{purchaseShare:0,netSavingsUSD:-50000,baselineUSD:50000}}])check(()=>assert.throws(()=>calculate(input)));
const report=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/hope-v2-report.json',import.meta.url)));
check(()=>close(report.model.calibration.usdPerBetterLife,c.usdPerBetterLife));
check(()=>assert.equal(report.longForm.markdown,fs.readFileSync(new URL('../docs/reports/hope-v2.md',import.meta.url),'utf8')));
check(()=>assert.ok(report.longForm.sections[4].markdown.includes('Income-equivalent years')));
check(()=>assert.ok(fs.readFileSync(new URL('../lib/local-rescue-research.ts',import.meta.url),'utf8').includes('hope-calibrated-model.mjs')));
console.log(n+'/'+n+' HOPE health/income, signed, scope, provenance and wiring checks passed.');

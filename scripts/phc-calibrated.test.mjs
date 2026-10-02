import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,inputs,resources,diagnostics} from '../lib/phc-calibrated-model.mjs';
import {researchRankBySlug} from '../lib/research-cost-ranking.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)));
const c=calculate(),change=f=>({...inputs,paths:inputs.paths.map(x=>f({...x}))});
close(c.donor_bay_per_10q,1502592.5677180092);close(c.healthBay,.6181902634196448);close(c.incomeBay,.047326139019841694);
close(c.healthBay+c.incomeBay,c.bay_q);close(c.resource_bay_per_10q,2103629.5948052127);
close(researchRankBySlug.get('project-homeless-connect').bayUsdPerTenQalys,c.donor_bay_per_10q);
const packet=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/phc-original-anchor-calculations-2026-10-01.json',import.meta.url)));
const p=packet.inputs,j=packet.resources;
close(calculate(p,j).bayPrice,packet.cases.central.bayPrice);
for(const row of diagnostics().scenarios){close(row.healthBay+row.incomeBay,row.bay_q);if(row.bay_q>0)close(row.donor_bay_per_10q*row.bay_q,10*row.gift_usd);else assert.equal(row.donor_bay_per_10q,null);}
const noFunding=change(x=>({...x,funding:0}));assert.equal(calculate(noFunding).bay_q,0);
assert.ok(calculate(noFunding,{...resources,B:6,inducedExposure:20}).bay_q<0);
assert.equal(calculate({...inputs,k:0,independentHarm:1}).healthUS,-1);
assert.equal(calculate({...inputs,k:0,independentHarm:1}).incomeUS,0);
assert.equal(calculate(change(x=>({...x,use:0}))).incomeBay,c.incomeBay);
assert.equal(calculate(inputs,{...resources,incomeHorizon:.25}).healthBay,c.healthBay);
for(const j of [{...resources,incomeHorizon:0},{...resources,netAnnualGainUSD:0},{...resources,netAnnualGainUSD:-1000}]){
 const a=calculate(inputs,j),b=calculate(inputs,{...j,reserveWorkerClinical:false});close(a.healthBay,b.healthBay);
}
const adverse=calculate(change(x=>({...x,utility:-.02})));assert.equal(adverse.excludedPositiveClinicalUS,0);assert.equal(adverse.bayPrice,null);
const ordered=calculate({...inputs,paths:[...inputs.paths].reverse()});close(ordered.bayPrice,c.bayPrice);
for(const bad of [null,[],42,{...inputs,gift:100001},{...inputs,unknown:1},{...inputs,discount:Infinity},{...inputs,bay:.5,sf:.6},{...inputs,paths:[]},change(x=>({...x,cost:0})),change(x=>({...x,horizon:2})),change(x=>({...x,funding:2}))])assert.throws(()=>calculate(bad),RangeError);
for(const bad of [null,[],{...resources,unknown:1},{...resources,Y:0},{...resources,B:25000},{...resources,netAnnualGainUSD:-25000},{...resources,p:.31},{...resources,incomeHorizon:2},{...resources,reserveWorkerClinical:1}])assert.throws(()=>calculate(inputs,bad),RangeError);
assert.throws(()=>calculate({...inputs,sf:1e-310}),RangeError);
const report=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/phc-v2-report.json',import.meta.url)));
close(report.calibration.usdPerBetterLife,c.bayPrice);
assert.equal(report.fullMarkdown,fs.readFileSync(new URL('../docs/reports/phc-v2.md',import.meta.url),'utf8'));
assert.ok(report.fullMarkdown.includes('Historical model and exact results'));
console.log('PASS: independent PHC central, resources/overlap, signed harms, timing, domains, ranking and report parity');

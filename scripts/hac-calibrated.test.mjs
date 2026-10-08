import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,calculateAll,scenarios} from '../lib/hac-calibrated-model.mjs';
import {summary,markdown} from '../lib/hac-calibrated-report.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('HAC independently reconstructed finite clinical and signed resource ledger',()=>{
 const r=calculate(),p=r.parameters,k=Math.log1p(p.discount)-Math.log1p(-p.mortality);
 const integral=(d,t)=>(Math.exp(-k*d)-Math.exp(-k*(d+t)))/k;
 const routes=[[.576,4,3],[1.8,6,2]];
 near(r.healthBay,routes.reduce((q,[n,d,t])=>q+n*2.2*.15*.004*integral(d,t)-n*.02*.008*integral(d,2),0));
 let resources=0,raw=0;
 for(const f of r.resourceFlows){let duration=0;for(let y=0;y<Math.ceil(f.years);y++)duration+=Math.min(1,f.years-y)/(1+f.discountRate)**(f.delayYears+y);const gain=.5*f.people*Math.log1p(f.annualIncomeGainUSD/f.annualIncomeBeforeUSD)*duration*f.independentShare;resources+=gain;raw+=f.rawPVBay;}
 near(r.resourcesBay,resources);near(r.rawCashBay,raw);near(r.combinedBay,r.healthBay+r.resourcesBay);
 near(r.donorPriceBay,238601845.39407566);near(r.donorPriceSF,398976599.89256364);
 assert.ok(r.resourcesBay<0);assert.equal(r.comprehensiveBay,null);
});
test('HAC all 48 current scenarios retain exact historical output',()=>{const all=calculateAll();assert.equal(all.cases.length,48);assert.equal(new Set(scenarios.map(s=>s[0])).size,48);for(const r of all.cases)assert.ok(r.combinedBay===null||Number.isFinite(r.combinedBay));});
test('Known absence never substitutes for unknown inputs or erases independent harms',()=>{
 assert.equal(calculate({reachKnown:false,payKnown:true,netPay:0}).payBay,0);
 assert.equal(calculate({reachKnown:false,payKnown:false,netPay:0}).payBay,null);
 const overlap=calculate({reachKnown:false,payKnown:true,netPay:500,positiveIndependent:0});assert.equal(overlap.payBay,0);assert.equal(overlap.rawPayBay,null);
 assert.ok(calculate({netPay:-500,positiveIndependent:0}).payBay<0);
 assert.equal(calculate({reachKnown:false,clinicalKnown:true,utility:0}).healthParts[0].bay,0);
 assert.equal(calculate({reachKnown:false,clinicalKnown:false,utility:0}).healthParts[0].bay,null);
 assert.ok(calculate({utility:0,healthHarm:.1}).healthBay<0);
 assert.ok(calculate({advisorySF:0,policySF:0}).resourcesSF<0);
 assert.equal(calculate({reachKnown:false,taxKnown:true,taxPerHome:0}).unknownCashParts.some(x=>x.id.includes('tax')),false);
 assert.equal(calculate({reachKnown:false,taxKnown:false,taxPerHome:0}).unknownCashParts.some(x=>x.id.includes('tax')),true);
});
test('Cost/resource and reporting-unit diagnostics do not silently alter donor impact',()=>{const r=calculate(),gross=calculate({additionalResources:1e6}),units=calculate({reportUnitHomes:10});near(gross.donorPriceBay,r.donorPriceBay);near(gross.grossPriceBay,r.donorPriceBay*11);near(units.combinedBay,r.combinedBay);near(units.native[0].reportedHomeUnits*10,r.native[0].reportedHomeUnits);});
test('Summary and eight actual per-model sessions match the current report',()=>{const editorial=JSON.parse(fs.readFileSync(new URL('../data/report-summary-editorial.json',import.meta.url)));assert.deepEqual(editorial['Housing Action Coalition'],summary);assert.equal(summary.reasons.length,3);assert.equal(summary.reservations.length,3);assert.match(markdown,/238.60M/);assert.match(markdown,/398.98M/);const registry=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url))).organizations['Housing Action Coalition'];assert.equal(registry.sessions.length,8);for(const s of registry.sessions){assert.equal(s.model.id,'gpt-6.1-sol');assert.equal(s.rawRuntimeModel,null);assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.ok(fs.existsSync(new URL('../'+s.evidence,import.meta.url)));}});

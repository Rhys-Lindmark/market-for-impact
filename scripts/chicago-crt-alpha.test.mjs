import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
const registry=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=registry.reports.find(r=>r.edition==='chicago'&&r.slug==='childrens-research-triangle');
test('CRT conditional alpha reconciles expenses and all signed scenarios',()=>{
 assert.ok(report);
 assert.equal(report.stage,'alpha');
 assert.match(report.priceScope,/conditional/i);
 assert.match(report.priceScope,/HOLD/);
 assert.deepEqual(report.annualExpenses.map(y=>y.amount),[3035824,3440344,3523321]);
 assert.equal(expenseAverage(report),(3035824+3440344+3523321)/3);
 // CRT was recalibrated on 2026-09-30 (c4a09b6): 37 scenarios now; the original alpha arithmetic survives as
 // historical-alpha-central, the only scenario still carrying the JSON parameter block this test reproduces.
 assert.ok(report.model.scenarios.length>=17);
 const historical=report.model.scenarios.filter(s=>s.assumptions.startsWith('{'));
 assert.ok(historical.some(s=>s.id==='historical-alpha-central'));
 for(const scenario of historical){
  const p=JSON.parse(scenario.assumptions.slice(0,scenario.assumptions.indexOf('}')+1));
  const all=p.b*(p.N*p.s*p.q*p.t*p.a+p.H),local=p.g*all;
  assert.ok(Math.abs(all-scenario.allPopulationQalys)<1e-12,scenario.id);
  assert.ok(Math.abs(local-scenario.editionQalys)<1e-12,scenario.id);
  assert.equal(p.C+p.K,scenario.costUSD,scenario.id);
 }
 assert.ok(report.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(report.model.scenarios.some(s=>s.editionQalys<0));
 const h=historical.find(s=>s.id==='historical-alpha-central');
 assert.ok(Math.abs(10*h.costUSD/h.editionQalys-913206265.8955792)<1e-5);
});

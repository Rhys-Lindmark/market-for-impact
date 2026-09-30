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
 assert.equal(report.model.scenarios.length,17);
 for(const scenario of report.model.scenarios){
  const p=JSON.parse(scenario.assumptions.slice(0,scenario.assumptions.indexOf('}')+1));
  const all=p.b*(p.N*p.s*p.q*p.t*p.a+p.H),local=p.g*all;
  assert.ok(Math.abs(all-scenario.allPopulationQalys)<1e-12,scenario.id);
  assert.ok(Math.abs(local-scenario.editionQalys)<1e-12,scenario.id);
  assert.equal(p.C+p.K,scenario.costUSD,scenario.id);
 }
 assert.equal(report.model.scenarios.filter(s=>s.editionQalys===0).length,4);
 assert.equal(report.model.scenarios.filter(s=>s.editionQalys<0).length,2);
 assert.ok(Math.abs(reportPrice(report)-913206265.8955792)<1e-5);
});

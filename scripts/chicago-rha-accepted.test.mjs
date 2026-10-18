import test from 'node:test';
import assert from 'node:assert/strict';
import registry from '../data/geography-reports.json' with {type:'json'};
import effort from '../data/research-effort.json' with {type:'json'};
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
import {calculate} from '../docs/geography-discovery/chicago-rha-initial-20261005/model.mjs';
test('RHA initial preserves gross costs, signed welfare and measured partial clocks',()=>{
 const r=registry.reports.find(r=>r.edition==='chicago'&&r.slug==='respiratory-health-association');
 assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');
 assert.match(r.priceScope,/Conditional/);
 assert.deepEqual(r.annualExpenses.map(y=>y.amount),[3808696,3963740,3998221]);
 assert.equal(expenseAverage(r),(3808696+3963740+3998221)/3);
 assert.ok(Math.abs(reportPrice(r)-388075967.9643353)<1e-5);
 assert.ok(calculate({q:0}).incomeEquivalent>0);
 assert.ok(calculate({gain:-400}).incomeEquivalent<0);
 assert.equal(calculate({b:0}).totalEquivalent,0);
 assert.equal(r.model.scenarios.length,23);
 for(const s of r.model.scenarios){assert.equal(s.costPer10Qalys,s.price10);assert.equal(s.combinedEquivalentYears,s.totalEquivalent);}
 const sessions=effort.organizations['Respiratory Health Association'].sessions;
 assert.equal(sessions.length,3);assert.equal(r.timeCoverage,'partial');
 assert.ok(Math.abs(sessions.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0)-393.474)<1e-7);
});

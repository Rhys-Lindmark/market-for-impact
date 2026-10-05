import test from 'node:test';
import assert from 'node:assert/strict';
import registry from '../data/geography-reports.json' with {type:'json'};
import effort from '../data/research-effort.json' with {type:'json'};
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
import {calculate} from '../docs/geography-discovery/chicago-lvejo-initial-20261005/model.mjs';
test('LVEJO accepted initial retains finite conditional scope and signed net food resources',()=>{
 const r=registry.reports.find(r=>r.edition==='chicago'&&r.slug==='lvejo');
 assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');
 assert.match(r.priceScope,/Conditional/);assert.equal(calculate().food,40);
 assert.deepEqual(r.annualExpenses.map(y=>y.amount),[3195698,4090659,4269375]);
 assert.equal(expenseAverage(r),(3195698+4090659+4269375)/3);
 assert.ok(Math.abs(reportPrice(r)-325475980.8764003)<.001);
 assert.ok(calculate({q:0}).incomeEquivalent>0);
 assert.ok(calculate({gain:-300}).incomeEquivalent<0);
 assert.equal(calculate({b:0}).totalEquivalent,0);
 for(const s of r.model.scenarios){assert.equal(s.costPer10Qalys,s.price10);assert.equal(s.combinedEquivalentYears,s.totalEquivalent);}
 const sessions=effort.organizations[r.organization].sessions;
 assert.equal(sessions.length,2);assert.equal(r.timeCoverage,'partial');
 assert.ok(Math.abs(sessions.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0)-262.441)<1e-7);
});

import test from 'node:test';import assert from 'node:assert/strict';
import registry from '../data/geography-reports.json' with {type:'json'};
import effort from '../data/research-effort.json' with {type:'json'};
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
import {calculate} from '../docs/geography-discovery/chicago-ata-initial-20261005/model.mjs';
test('ATA initial excludes short transition year and retains full signed harms',()=>{
 const r=registry.reports.find(r=>r.edition==='chicago'&&r.slug==='active-transportation-alliance');
 assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');
 assert.deepEqual(r.annualExpenses.map(y=>y.amount),[2743142,2969440,2580481]);
 assert.equal(expenseAverage(r),(2743142+2969440+2580481)/3);
 assert.ok(Math.abs(reportPrice(r)-63711770.07001986)<.001);
 assert.equal(calculate().union,100);
 assert.ok(calculate({exercise:0,safety:0}).incomeEquivalent>0);
 assert.ok(calculate({gain:-300}).incomeEquivalent<0);
 assert.equal(calculate({b:0}).totalEquivalent,0);
 for(const s of r.model.scenarios){assert.equal(s.costPer10Qalys,s.price10);assert.equal(s.combinedEquivalentYears,s.totalEquivalent);}
 const sessions=effort.organizations[r.organization].sessions;
 assert.equal(sessions.length,4);assert.equal(r.timeCoverage,'partial');
 assert.ok(Math.abs(sessions.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0)-338.138)<1e-7);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import registry from '../data/geography-reports.json' with {type:'json'};
import effort from '../data/research-effort.json' with {type:'json'};
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
import {calculate} from '../docs/geography-discovery/chicago-equip-initial-20261005/model.mjs';
test('Equip accepted initial retains explicit hypothetical scope, gross recognized costs and real clocks',()=>{
 const report=registry.reports.find(r=>r.edition==='chicago'&&r.slug==='equip-for-equality');
 assert.equal(report.stage,'alpha');assert.equal(report.acceptance.status,'accepted');
 assert.match(report.priceScope,/conditional/i);
 assert.ok(Math.abs(reportPrice(report)-49563667.37194033)<1e-5);
 assert.equal(expenseAverage(report),(8102494+9358418+9770963)/3);
 assert.equal(report.model.scenarios.length,23);
 assert.ok(calculate({q:0}).incomeEquivalent>0);
 assert.ok(calculate({gain:-1500}).incomeEquivalent<0);
 const sessions=effort.organizations['Equip for Equality'].sessions;
 assert.equal(sessions.length,5);
 assert.ok(Math.abs(sessions.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0)-298.062)<1e-7);
 assert.ok(!report.sessionIds.includes('66042421-81bd-4ea2-92a4-ba41f9f1278d'));
 const raw=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/chicago-equip-initial-20261005/report.json',import.meta.url)));
 assert.equal(raw.acceptance.status,'pending-root');
 for(const [i,s]of report.model.scenarios.entries()){
  assert.equal(s.price10,raw.model.scenarios[i].price10);
  assert.equal(s.costPer10Qalys,s.price10);
 }
});

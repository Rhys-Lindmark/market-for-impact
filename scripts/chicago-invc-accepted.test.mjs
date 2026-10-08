import test from 'node:test';import assert from 'node:assert/strict';
import registry from '../data/geography-reports.json' with {type:'json'};
import effort from '../data/research-effort.json' with {type:'json'};
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
import {calculate} from '../docs/geography-discovery/chicago-invc-initial-20261005/model.mjs';
test('INVC initial preserves mixed-sign resources, original expense and partial clocks',()=>{
const r=registry.reports.find(r=>r.edition==='chicago'&&r.slug==='institute-nonviolence');
assert.ok(r);assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');
assert.equal(expenseAverage(r),(10268003+12274566+15749475)/3);
assert.ok(Math.abs(reportPrice(r)-71276231.55619113)<.001);
assert.equal(calculate({jobGain:-100,stipendNet:300}).incomePathways[0].annualIncomeGainUSD,-250);
assert.ok(calculate({reduction:0,traumaQ:0}).incomeEquivalent>0);
assert.equal(calculate({b:0}).totalEquivalent,0);
const ss=effort.organizations[r.organization].sessions;assert.equal(ss.length,3);
assert.ok(Math.abs(ss.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0)-516.261)<1e-7);
assert.equal(r.timeCoverage,'partial');
});

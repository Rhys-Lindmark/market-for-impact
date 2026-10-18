import test from 'node:test';import assert from 'node:assert/strict';
import registry from '../data/geography-reports.json' with {type:'json'};
import effort from '../data/research-effort.json' with {type:'json'};
import {reportPrice,expenseAverage} from '../lib/geography-reports.mjs';
import {calculate} from '../docs/geography-discovery/chicago-zcenter-initial-20261005/model.mjs';
test('ZCenter initial retains adult evidence limits, exact gross basis and signed resources',()=>{
const r=registry.reports.find(r=>r.edition==='chicago'&&r.slug==='zacharias-sexual-abuse-center');
assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');
assert.equal(expenseAverage(r),(1894276+2151058+2515510)/3);
assert.ok(Math.abs(reportPrice(r)-17225231.773563232)<.001);
assert.equal(calculate({b:0}).totalEquivalent,0);
const ss=effort.organizations[r.organization].sessions;assert.equal(ss.length,3);
assert.ok(Math.abs(ss.reduce((n,s)=>n+(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000,0)-194.909)<1e-7);
assert.equal(r.timeCoverage,'partial');
});

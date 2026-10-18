import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import registry from '../data/geography-reports.json' with {type:'json'};
import effort from '../data/research-effort.json' with {type:'json'};
import {reportPrice} from '../lib/geography-reports.mjs';
import {calculate,cases} from '../docs/geography-discovery/la-public-law-center-beta-20261005/model.mjs';
test('PLC preserves initial history, current audited cost, signed resources and closed provenance',()=>{
 const report=registry.reports.find(r=>r.edition==='los-angeles'&&r.slug==='public-law-center');
 const initial=JSON.parse(fs.readFileSync(report.historical.initialReport,'utf8'));
 assert.deepEqual(initial.report.model,report.model.historicalAlphaModel);
 assert.deepEqual(initial.sessions,report.historical.originalSessions);
 assert.equal(report.stage,'beta');assert.equal(report.acceptance.status,'accepted');
 assert.equal(report.model.scenarios.length,cases.length);
 assert.ok(Math.abs(reportPrice(report)-calculate().price10)<1e-5);
 assert.equal(report.annualExpenses.at(-1).year,2025);
 assert.equal(report.annualExpenses.at(-1).amount,22224507);
 assert.ok(calculate({q:0}).incomeEquivalent<0);
 const sessions=effort.organizations['Public Law Center'].sessions;
 assert.equal(sessions.length,6);for(const s of sessions){assert.ok(s.endedAt);assert.ok(report.sessionIds.includes(s.id));assert.ok(s.model.evidence.includes('model assignment'));assert.ok(!/\/tmp\/|\/Users\//.test(s.evidence));}
 const newIds=new Set(sessions.map(s=>s.id));assert.equal(registry.sessions.filter(s=>newIds.has(s.id)).length,6);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice} from '../lib/geography-reports.mjs';
const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('Denver accepted initial pair preserves full diagnostic, signed arithmetic and provenance',()=>{
 for(const [prefix,id] of [['bicycle','ein:84-1201078'],['thriving','ein:84-1993572']]){
  const original=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/denver-bicycle-thriving-initial-20261006/'+prefix+'-initial-diagnostic.json',import.meta.url)));
  const current=registry.reports.find(r=>r.edition==='denver'&&r.organizationId===id);
  assert.equal(current.acceptance.status,'accepted');assert.equal(current.stage,'alpha');
  assert.deepEqual(current.model.scenarios,original.model.scenarios);assert.deepEqual(current.annualExpenses,original.annualExpenses);
  const c=current.model.scenarios.find(s=>s.id==='central');assert.ok(Math.abs(reportPrice(current)-10*c.costUSD/(c.editionQalys+c.incomeEquivalent))<1e-6);
  for(const sid of current.sessionIds)assert.ok(registry.sessions.some(s=>s.id===sid&&s.organizationId===id&&s.endedAt&&s.model.id==='gpt-6.1-sol'));
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice} from '../lib/geography-reports.mjs';
const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
// Reports promoted to beta were rebuilt (see denver-*-beta-20261007 and their tests), so the frozen initial
// scenarios only constrain reports still at alpha; the initial-diagnostic.json files stay as the audit trail.
test('Denver accepted initial pair preserves full diagnostic, signed arithmetic and provenance',()=>{
 for(const [prefix,id] of [['rebuilding','org:rebuilding-together'],['benefits','org:benefits-in-action']]){
  const original=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/denver-rebuilding-benefits-initial-20261006/'+prefix+'-initial-diagnostic.json',import.meta.url)));
  const current=registry.reports.find(r=>r.edition==='denver'&&r.organizationId===id);
  assert.equal(current.acceptance.status,'accepted');assert.ok(['alpha','beta'].includes(current.stage));
  if(current.stage!=='alpha'){}else if(prefix==='rebuilding'){
   assert.equal(current.model.scenarios.length,original.model.scenarios.length);
   current.model.scenarios.forEach((s,i)=>{for(const k of ['overrides','costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])assert.deepEqual(s[k],original.model.scenarios[i][k]);});
   assert.ok(current.model.scenarios.every(s=>!s.assumptions.includes('therapy-access')));
  }else assert.deepEqual(current.model.scenarios,original.model.scenarios);
  if(current.stage==='alpha')assert.deepEqual(current.annualExpenses,original.annualExpenses);
  const c=current.model.scenarios.find(s=>s.id==='central');assert.ok(Math.abs(reportPrice(current)-10*c.costUSD/(c.editionQalys+c.incomeEquivalent))<1e-6);
  for(const sid of current.sessionIds)assert.ok(registry.sessions.some(s=>s.id===sid&&s.organizationId===id&&s.endedAt&&s.model.id==='gpt-6.1-sol'));
 }
});

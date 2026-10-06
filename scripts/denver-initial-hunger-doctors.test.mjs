import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice} from '../lib/geography-reports.mjs';
const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
test('Denver Hunger and Doctors preserve frozen arithmetic, current metadata and closed provenance',()=>{
 for(const [pre,id] of [['hunger','org:hunger-free-colorado'],['doctors','org:doctors-care']]){
 const original=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/denver-hunger-doctors-initial-20261006/'+pre+'-initial-diagnostic.json',import.meta.url)));
 const r=registry.reports.find(r=>r.edition==='denver'&&r.organizationId===id);assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');assert.deepEqual(r.annualExpenses,original.annualExpenses);
 assert.equal(r.model.scenarios.length,original.model.scenarios.length);r.model.scenarios.forEach((s,i)=>{for(const k of ['overrides','costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])assert.deepEqual(s[k],original.model.scenarios[i][k]);});
 for(const n of ['C','N']){const p=r.model.inputs.find(x=>x.name===n);assert.equal(p.basis,'observed');assert.deepEqual(p.sourceIds,['finance']);}
 const c=r.model.scenarios.find(s=>s.id==='central');assert.ok(Math.abs(reportPrice(r)-10*c.costUSD/(c.editionQalys+c.incomeEquivalent))<1e-6);
 assert.ok(pre==='hunger'?c.incomeEquivalent>0:c.incomeEquivalent<0);for(const sid of r.sessionIds)assert.ok(registry.sessions.some(s=>s.id===sid&&s.organizationId===id&&s.endedAt&&s.model.id==='gpt-6.1-sol'));
 }
});

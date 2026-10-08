import test from 'node:test';
import assert from 'node:assert/strict';
import progress from '../docs/geography-progress.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import selection from '../data/edition-featured.json' with {type:'json'};
import images from '../data/edition-highlights.json' with {type:'json'};
import {featuredReports} from '../lib/edition-featured.mjs';
import {reportPrice,incomeAdjustedReportPrice} from '../lib/geography-reports.mjs';
test('Accepted feature membership matches progress, current prices and assessed income',()=>{
 for(const [edition,entry] of Object.entries(selection.editions)){
  const picks=featuredReports(reports.reports,edition),ledger=progress.editions.find(e=>e.id===edition);
  assert.equal(picks.length,4);assert.equal(ledger.topPicksPublished,4);
  assert.deepEqual(picks.map(r=>r.organizationId),ledger.topPickIds);
  assert.deepEqual(picks.map(r=>r.slug),entry.slugs);
  for(const r of picks){assert.equal(r.stage,'beta');assert.ok(r.model.scenarios.find(s=>s.id==='central').incomePathways!==undefined);assert.ok(incomeAdjustedReportPrice(r));assert.ok(images[edition+'/'+r.slug]);}
  assert.ok(entry.rationale.length>100,'Comparative selection requires an explicit rationale, not automatic price sorting');
  assert.ok(entry.evidence,'Comparative acceptance evidence is required');
  assert.ok(picks.every(r=>reportPrice(r)>0));
 }
 assert.equal(featuredReports(reports.reports,'new-york-city').length,4);
});
test('Reject missing, alpha-only, historical-only and unaccepted replacements',()=>{
 for(const edition of Object.keys(selection.editions)){
  const id=selection.editions[edition].slugs[0],fixture=structuredClone(reports.reports);
  const r=fixture.find(r=>r.edition===edition&&r.slug===id);
  for(const mutation of [()=>r.stage='alpha',()=>r.acceptance.status='held',()=>r.model.scenarios.find(s=>s.id==='central').incomeUnknown=true]){
   const original=structuredClone(r);mutation();assert.throws(()=>featuredReports(fixture,edition));Object.assign(r,original);
  }
  assert.throws(()=>featuredReports(fixture.filter(r=>!(r.edition===edition&&r.slug===id)),edition));
 }
});

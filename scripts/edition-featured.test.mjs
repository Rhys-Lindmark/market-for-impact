import test from 'node:test';
import assert from 'node:assert/strict';
import progress from '../docs/geography-progress.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import selection from '../data/edition-featured.json' with {type:'json'};
import {featuredReports} from '../lib/edition-featured.mjs';
import {reportPrice,researchListPrice,reportsForEdition} from '../lib/geography-reports.mjs';
import {nativeUnitForReport} from '../lib/featured-unit-costs.mjs';

test('featured four match the first four positive full-list prices, including initial and historical estimates',()=>{
 for(const edition of Object.keys(selection.editions)){
  const full=reportsForEdition(reports,edition).filter(r=>researchListPrice(r)>0);
  const picks=featuredReports([...reports.reports].reverse(),edition);
  assert.deepEqual(picks.map(r=>r.slug),full.slice(0,4).map(r=>r.slug));
  assert.equal(picks.length,4);
  for(const r of picks){assert.equal(r.acceptance.status,'accepted');assert.ok(researchListPrice(r)>0);assert.doesNotThrow(()=>nativeUnitForReport(r));}
 }
 assert.ok(featuredReports(reports.reports,'california').some(r=>r.stage==='alpha'));
 assert.ok(featuredReports(reports.reports,'usa').some(r=>reportPrice(r)===null));
});

test('previous independently accepted slates remain historical research evidence',()=>{
 for(const [edition,entry] of Object.entries(selection.editions)){
  const ledger=progress.editions.find(e=>e.id===edition);
  const accepted=entry.slugs.map(slug=>reports.reports.find(r=>r.edition===edition&&r.slug===slug));
  assert.deepEqual(accepted.map(r=>r.organizationId),ledger.topPickIds);
  for(const r of accepted){assert.equal(r.stage,'beta');assert.equal(r.acceptance.status,'accepted');assert.ok(reportPrice(r)>0);}
 }
 assert.match(selection.displayPolicy,/no longer determine display/);
});

test('unpriced and held reports cannot occupy featured places; undeveloped editions remain unfeatured',()=>{
 const fixture=structuredClone(reports.reports),first=featuredReports(fixture,'california')[0];
 first.model.scenarios=[];
 assert.ok(!featuredReports(fixture,'california').some(r=>r.slug===first.slug));
 const held=featuredReports(fixture,'california')[0];held.acceptance.status='held';
 assert.ok(!featuredReports(fixture,'california').some(r=>r.slug===held.slug));
 assert.deepEqual(featuredReports(fixture,'unpublished'),[]);
 assert.deepEqual(featuredReports([], 'california'),[]);
});

test('new ranked reports without reviewed native-unit denominators retain a DALY-only display',()=>{
 const report=featuredReports(reports.reports,'usa').find(r=>r.slug==='kids-and-car-safety');
 assert.ok(report);
 const native=nativeUnitForReport(report);
 assert.equal(native.priceUSD,null);assert.equal(native.costUSD,null);assert.equal(native.units,null);
 assert.match(native.scope,/not established/);
});

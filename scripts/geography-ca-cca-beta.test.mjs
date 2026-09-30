import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {expenseAverage,reportPrice} from '../lib/geography-reports.mjs';

const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const progress=JSON.parse(fs.readFileSync(new URL('../docs/geography-progress.json',import.meta.url)));
const report=registry.reports.find(item=>item.edition==='california'&&item.slug==='coalition-for-clean-air');

test('Coalition for Clean Air beta withdraws its rankable central without erasing alpha diagnostics',()=>{
 assert.ok(report);
 assert.equal(report.stage,'beta');
 assert.equal(reportPrice(report),null);
 assert.match(report.priceScope,/HOLD/);
 assert.match(report.priceScope,/diagnostic/);
 assert.ok(report.model.scenarios.some(item=>item.editionQalys===0));
 assert.ok(report.model.scenarios.some(item=>item.editionQalys<0));
 assert.match(report.acceptance.evidence,/ca-cca-beta-acceptance/);
 assert.equal(report.sessionIds.length,4);
});

test('Coalition for Clean Air three-year full-resource costs and edition counts reconcile',()=>{
 assert.deepEqual(report.annualExpenses.map(item=>item.amount),[1472176,2162329,2494912]);
 assert.equal(expenseAverage(report),2043139);
 assert.equal(report.summary.what.length,3);
 assert.equal(report.summary.strengths.length,3);
 assert.equal(report.summary.reservations.length,3);
 const edition=progress.editions.find(item=>item.id==='california');
 assert.equal(edition.alphaPublished,25);
 assert.equal(edition.betaAcceptedPublished,10);
 assert.equal(edition.topPicksPublished,0);
});

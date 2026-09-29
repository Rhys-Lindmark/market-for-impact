import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {expenseAverage,reportPrice} from '../lib/geography-reports.mjs';

const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const progress=JSON.parse(fs.readFileSync(new URL('../docs/geography-progress.json',import.meta.url)));
const report=registry.reports.find(item=>item.edition==='atlanta'&&item.slug==='georgia-lions-lighthouse-foundation');

test('Lions Lighthouse models examinations, not automatic glasses or surgery outcomes',()=>{
 assert.ok(report);
 assert.equal(report.stage,'alpha');
 const get=name=>report.model.inputs.find(item=>item.name.startsWith(name))?.value;
 const q=get('N:')*get('p:')*get('w:')*get('a:')*get('f:')*get('u:')*get('T:')*get('g:');
 const central=report.model.scenarios.find(item=>item.id==='central');
 assert.equal(get('N:'),1114);
 assert.equal(get('p:'),0.5);
 assert.ok(Math.abs(q-0.348125)<1e-12);
 assert.ok(Math.abs(central.editionQalys-q)<1e-12);
 assert.equal(central.costUSD,3700076);
 assert.ok(Math.abs(reportPrice(report)-106285845.60143627)<1e-6);
 assert.match(report.summary.strengths.join(' '),/examination recipients/i);
 assert.ok(report.model.scenarios.some(item=>item.editionQalys===0));
 assert.ok(report.model.scenarios.some(item=>item.editionQalys<0));
});

test('Lions Lighthouse has matched three-year full-resource costs and no recommendation',()=>{
 assert.equal(report.summary.what.length,3);
 assert.equal(report.summary.strengths.length,3);
 assert.equal(report.summary.reservations.length,3);
 assert.deepEqual(report.annualExpenses.map(item=>item.amount),[3484633,3238244,3700076]);
 assert.ok(Math.abs(expenseAverage(report)-3474317.6666666665)<1e-6);
 assert.match(report.priceScope,/conditional/i);
 assert.match(report.priceScope,/HOLD/i);
 assert.equal(report.sessionIds.length,3);
 const edition=progress.editions.find(item=>item.id==='atlanta');
 assert.equal(edition.alphaPublished,1);
 assert.equal(edition.betaAcceptedPublished,0);
});

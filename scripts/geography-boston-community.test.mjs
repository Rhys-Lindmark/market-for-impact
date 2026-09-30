import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice} from '../lib/geography-reports.mjs';

const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const progress=JSON.parse(fs.readFileSync(new URL('../docs/geography-progress.json',import.meta.url)));
const report=registry.reports.find(item=>item.edition==='boston'&&item.slug==='community-servings');

test('Community Servings keeps whole-recipient cost and a finite, narrow trial-duration bridge',()=>{
 assert.ok(report);
 assert.equal(report.stage,'alpha');
 assert.equal(report.annualExpenses.find(item=>item.year===2025).amount,22289498);
 const central=report.model.scenarios.find(item=>item.id==='central');
 assert.equal(central.costUSD,22289498);
 const courses=Math.min(1221750*0.5*0.15/(10*12),7973*0.15)*0.8;
 assert.ok(Math.abs(courses-610.875)<1e-9);
 const allQalys=0.5*courses*(3.94/30)*0.2*(12*7/365.25)*0.5;
 const metroQalys=allQalys*(6139/7973);
 assert.ok(Math.abs(central.allPopulationQalys-allQalys)<1e-10);
 assert.ok(Math.abs(central.editionQalys-metroQalys)<1e-10);
 assert.ok(Math.abs(reportPrice(report)-313789229.8495234)<1e-3);
 assert.match(report.priceScope,/partial|conditional|illustrative/i);
});

test('Community Servings report preserves alternatives, provenance and donor hold',()=>{
 assert.equal(report.summary.what.length,3);
 assert.equal(report.summary.strengths.length,3);
 assert.equal(report.summary.reservations.length,3);
 assert.ok(report.model.scenarios.some(item=>item.editionQalys===0));
 assert.ok(report.model.scenarios.some(item=>item.editionQalys<0));
 assert.match(report.summary.reservations.join(' '),/HOLD|gift|partial-pathway/i);
 assert.equal(report.sessionIds.length,3);
 assert.equal(progress.editions.find(item=>item.id==='boston').alphaPublished,1);
 assert.equal(progress.editions.find(item=>item.id==='boston').betaAcceptedPublished,0);
});

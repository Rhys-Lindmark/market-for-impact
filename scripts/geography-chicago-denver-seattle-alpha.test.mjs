import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {formatEditionSensitivity,formatEditionReportPrice,expenseAverage,reportPrice} from '../lib/geography-reports.mjs';

const registry=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=(edition,slug)=>registry.reports.find(r=>r.edition===edition&&r.slug===slug);

test('Denver KIND keeps the matched-year sealant illustration out of donor ranking',()=>{
 const r=report('denver','kids-in-need-dentistry');
 assert.ok(r);
 const example=r.model.scenarios.find(s=>s.id==='illustrative-average');
 const expected=9337/4*.00159*.75*.75*.9;
 assert.ok(Math.abs(example.editionQalys-expected)<1e-10);
 assert.equal(example.costUSD,1536905);
 assert.equal(reportPrice(r),null);
 assert.equal(r.rankingEligible,false);
 assert.equal(formatEditionReportPrice(r),'Illustrative $8.2M');
 assert.equal(expenseAverage(r),1658785);
 assert.equal(r.model.scenarios.find(s=>s.id==='zero').editionQalys,0);
 assert.ok(r.model.scenarios.find(s=>s.id==='adverse').editionQalys<0);
});

test('Denver HRAC uses audited project cost once and keeps the scenario conditional',()=>{
 const r=report('denver','harm-reduction-action-center');
 assert.ok(r);
 assert.equal(r.stage,'alpha');
 assert.equal(r.model.scenarios.find(s=>s.id==='central').costUSD,2017429);
 assert.ok(Math.abs(reportPrice(r)-884837.2807017545)<1e-6);
 assert.match(r.priceScope,/illustrative|scenario/i);
 assert.match(r.summary.reservations.join(' '),/HOLD/);
 assert.equal(r.summary.what.length,3);
});

test('ChicagoCAC keeps therapy reach distinct from completion and whole-recipient cost',()=>{
 const r=report('chicago','chicago-childrens-advocacy-center');
 assert.ok(r);
 assert.equal(r.stage,'alpha');
 assert.equal(r.model.scenarios.find(s=>s.id==='central').costUSD,11750254);
 assert.ok(Math.abs(reportPrice(r)-131155643.3299702)<1e-3);
 assert.match(r.summary.reservations.join(' '),/not the number completing/i);
 assert.equal(r.summary.what.length,3);
});

test('Youth Guidance retains the whole national cost against conditional local WOW health',()=>{
 const r=report('chicago','youth-guidance');
 assert.ok(r);
 assert.equal(r.stage,'alpha');
 assert.equal(r.model.scenarios.find(s=>s.id==='central').costUSD,54857607);
 assert.ok(Math.abs(reportPrice(r)-31938659.94)<1);
 assert.match(r.priceScope,/whole-recipient|whole recipient/i);
 assert.match(r.summary.reservations.join(' '),/funding response|unfunded/i);
 assert.equal(r.summary.what.length,3);
});

test('Seattle PHRA preserves reported gross cost, adverse and null worlds, and donor hold',()=>{
 const r=report('seattle','peoples-harm-reduction-alliance');
 assert.ok(r);
 assert.equal(r.stage,'alpha');
 assert.equal(r.model.scenarios.find(s=>s.id==='central').costUSD,2727457);
 assert.ok(Math.abs(reportPrice(r)-2030657)<1);
 assert.equal(r.model.scenarios.find(s=>s.id==='null').editionQalys,0);
 assert.ok(r.model.scenarios.find(s=>s.id==='adverse').editionQalys<0);
 assert.equal(r.ordinaryGiftPricePer10,null);
 assert.equal(r.donorDecision,'HOLD');
 assert.equal(r.summary.what.length,3);
 assert.ok(r.model.sensitivity.every(note=>typeof note==='string'));
});

test('Houston TOMAGWA pairs same-year surgery reach and whole-recipient cost',()=>{
 const r=report('houston','tomagwa-healthcare-ministries');
 assert.ok(r);
 assert.equal(r.stage,'alpha');
 const central=r.model.scenarios.find(s=>s.id==='central');
 assert.equal(central.costUSD,2471560);
 assert.ok(Math.abs(central.editionQalys-0.564696)<1e-9);
 assert.ok(Math.abs(reportPrice(r)-43767974.27288311)<1e-3);
 assert.ok(r.model.scenarios.some(s=>s.editionQalys===0));
 assert.ok(r.model.scenarios.some(s=>s.editionQalys<0));
 assert.match(r.summary.reservations.join(' '),/unverified|unknown/i);
});

test('structured legacy sensitivity scenarios render as text, not React objects',()=>{
 const r=report('new-york-city','center-for-independence-of-the-disabled-new-york');
 assert.ok(r);
 assert.equal(typeof r.model.sensitivity[0],'object');
 const rendered=formatEditionSensitivity(r.model.sensitivity[0]);
 assert.match(rendered,/capacity-low/i);
 assert.match(rendered,/per better life/i);
});

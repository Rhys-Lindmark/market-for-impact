import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{reportPrice,scenarioIncomeEquivalent,validateEditionReports}from'../lib/geography-reports.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
test('Human Options preserves exact initial history, signed housing resources and closed provenance',()=>{
 const d=read('data/geography-reports.json'),p=read('docs/geography-progress.json');
 const r=d.reports.find(x=>x.edition==='los-angeles'&&x.slug==='human-options');
 const packet=read('docs/geography-discovery/la-human-options-accepted-packet-20261005.json');
 assert.deepEqual(r,packet.acceptedReports[0]);assert.deepEqual(r.model.historicalAlphaModel,read(r.historical.initialReport).report.model);
 assert.ok(Math.abs(reportPrice(r)-75383444.41188532)<1e-6);
 const by=Object.fromEntries(r.model.scenarios.map(s=>[s.id,s]));assert.ok(Math.abs(by.central.editionQalys-1.701027429540956)<1e-12);
 assert.ok(scenarioIncomeEquivalent(by.central)<0);assert.ok(scenarioIncomeEquivalent(by['clinical-null'])<0);
 assert.equal(by['clinical-null'].editionQalys,0);assert.equal(by['clinical-null'].costPer10Qalys,null);
 assert.equal(by['zero-expansion'].editionQalys,0);assert.equal(scenarioIncomeEquivalent(by['zero-expansion']),0);
 assert.equal(scenarioIncomeEquivalent(by['negative-housing-change']),scenarioIncomeEquivalent(by['negative-housing-no-overlap']));
 assert.ok(scenarioIncomeEquivalent(by['positive-net-housing'])>0);
 assert.ok(by.central.incomePathways.some(x=>x.id==='joint-community-housing'&&x.annualIncomeGainUSD===-100));
 assert.match(r.sections.cost,/unknown/i);assert.match(r.sections.cost,/counterparty/i);assert.equal(r.timeCoverage,'partial');
 for(const s of packet.newSessions){assert.ok(s.endedAt);assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.ok(r.sessionIds.includes(s.id));}
 validateEditionReports(d,p);
});

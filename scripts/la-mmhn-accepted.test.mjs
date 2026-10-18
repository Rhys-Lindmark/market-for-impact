import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,scenarioIncomeEquivalent,validateEditionReports} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
test('MMHN preserves full initial diagnostics, signed resources and actual closed clocks',()=>{
 const d=read('data/geography-reports.json'),p=read('docs/geography-progress.json');
 const r=d.reports.find(x=>x.edition==='los-angeles'&&x.slug==='maternal-mental-health-now');
 const packet=read('docs/geography-discovery/la-mmhn-accepted-packet-20261005.json');
 assert.deepEqual(r,packet.acceptedReports[0]);
 assert.deepEqual(r.model.historicalAlphaModel,read(r.historical.initialReport).report.model);
 assert.ok(Math.abs(reportPrice(r)-49193205.30340124)<1e-6);
 const by=Object.fromEntries(r.model.scenarios.map(s=>[s.id,s]));
 assert.equal(by.central.editionQalys,.44021191187453323);
 assert.ok(scenarioIncomeEquivalent(by.central)<0);
 assert.ok(scenarioIncomeEquivalent(by['clinical-null'])<0);
 assert.equal(by['clinical-null'].editionQalys,0);assert.equal(by['clinical-null'].costPer10Qalys,null);
 assert.equal(by['zero-expansion'].editionQalys,0);assert.equal(scenarioIncomeEquivalent(by['zero-expansion']),0);
 assert.equal(scenarioIncomeEquivalent(by['negative-resource-gain']),scenarioIncomeEquivalent(by['negative-resource-no-overlap']));
 assert.ok(by['conditional-fund-transfer'].incomePathways.some(x=>x.id==='hypothetical-fund-payer'));
 assert.ok(by['fund-transfer-course-overlap'].incomePathways.some(x=>x.id==='joint-course-fund-recipient'));
 assert.match(r.sections.cost,/unknown/i);assert.match(r.sections.cost,/jointly nets/i);
 assert.equal(r.timeCoverage,'partial');
 for(const s of packet.newSessions){assert.ok(s.endedAt);assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.ok(r.sessionIds.includes(s.id));}
 validateEditionReports(d,p);
});

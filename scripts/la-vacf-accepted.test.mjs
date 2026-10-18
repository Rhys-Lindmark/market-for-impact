import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,scenarioIncomeEquivalent,validateEditionReports} from '../lib/geography-reports.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
test('VACF preserves full initial model, signed burdens and closed actual clocks',()=>{
 const data=read('data/geography-reports.json'),progress=read('docs/geography-progress.json');
 const r=data.reports.find(x=>x.edition==='los-angeles'&&x.slug==='vietnamese-american-cancer-foundation');
 const packet=read('docs/geography-discovery/la-vacf-accepted-packet-20261005.json');
 assert.deepEqual(r,packet.acceptedReports[0]);
 assert.deepEqual(r.model.historicalAlphaModel,read(r.historical.initialReport).report.model);
 assert.ok(Math.abs(reportPrice(r)-20598207.780573618)<1e-6);
 const by=Object.fromEntries(r.model.scenarios.map(s=>[s.id,s]));
 assert.equal(by.central.editionQalys,1.2018628125);
 assert.ok(scenarioIncomeEquivalent(by.central)<0);
 assert.equal(by.central.inputs.members,1);
 for(const p of by.central.incomePathways)assert.equal(p.people,p.households*p.membersPerHousehold);
 assert.equal(by['clinical-null'].editionQalys,0);assert.equal(reportPrice({...r,model:{...r.model,scenarios:[{...by['clinical-null'],id:'central'}]}}),null);
 assert.ok(scenarioIncomeEquivalent(by['no-additional-care'])<0);
 assert.equal(by['zero-expansion'].editionQalys,0);assert.equal(scenarioIncomeEquivalent(by['zero-expansion']),0);
 assert.ok(scenarioIncomeEquivalent(by['partner-cost-1459-stress'])<scenarioIncomeEquivalent(by.central));
 assert.match(r.sections.cost,/mutually exclusive/i);assert.match(r.sections.cost,/unknown/i);
 assert.equal(r.timeCoverage,'partial');
 for(const s of packet.newSessions){assert.ok(s.endedAt);assert.ok(Date.parse(s.endedAt)>Date.parse(s.startedAt));assert.ok(r.sessionIds.includes(s.id));}
 validateEditionReports(data,progress);
});

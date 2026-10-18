import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reportPrice,validateEditionReports} from '../lib/geography-reports.mjs';
import {validateResearchEffort} from '../lib/research-effort.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
test('CCA LA integration preserves original history, signed cases and only real closed clocks',()=>{
 const packet=read('docs/geography-discovery/la-cca-accepted-packet-20261005.json');
 const data=read('data/geography-reports.json'),p=read('docs/geography-progress.json');
 const r=data.reports.find(r=>r.edition==='los-angeles'&&r.slug==='coalition-for-clean-air');
 const old=read('docs/geography-discovery/la-cca-held-20261005/initial-diagnostic.json');
 assert.deepEqual(r,packet.acceptedReports[0]);
 assert.deepEqual(r.model.historicalAlphaModel,old.model);
 assert.deepEqual(read(r.historical.initialReport),old);
 assert.equal(r.stage,'beta');assert.equal(r.timeCoverage,'partial');
 assert.ok(Math.abs(reportPrice(r)-10031384.432836773)<1e-6);
 assert.equal(r.model.scenarios.length,23);
 for(const s of r.model.scenarios)assert.equal(s.inputs.Nall,s.inputs.N);
 const f=r.model.scenarios.find(s=>s.id==='clinical-null-financial');
 assert.equal(f.editionQalys,0);assert.ok(f.incomeEquivalentYears>0);
 const adverse=r.model.scenarios.find(s=>s.id==='failed-policy-induced-loss');
 assert.ok(adverse.incomeEquivalentYears<0);assert.equal(adverse.costPer10Qalys,null);
 const rejected=['79cbc8e8-3e35-4a3d-b164-ac3264233be4','53346935-918b-459e-973a-642731ce017d'];
 for(const id of rejected){assert.ok(!r.sessionIds.includes(id));assert.ok(!data.sessions.some(s=>s.id===id));}
 for(const s of packet.sessions)assert.ok(s.endedAt&&Date.parse(s.endedAt)>Date.parse(s.startedAt));
 const effort=read('data/research-effort.json');validateResearchEffort(effort);
 assert.equal(effort.organizations['Coalition for Clean Air'].coverage,'partial');
 validateEditionReports(data,p);
});

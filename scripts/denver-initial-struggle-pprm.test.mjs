import {sameData} from './lib/same-data.mjs';
import {reportsRetained,sessionsRetained,effortRetained} from './lib/history-retained.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
for(const[name,id,cost]of [['struggle','org:struggle-love',3006875],['pprm','ein:84-0404253',67062349]])test(name+' preserves initial diagnostic and synchronized health/income reference',async()=>{
 const dir='../docs/geography-discovery/denver-struggle-pprm-initial-20261006/',r=data.reports.find(r=>r.edition==='denver'&&r.organizationId===id),
 // PPRM was rebuilt as beta (denver-pprm-beta-20261007); its current model lives there.
 m=await import(r.stage==='beta'&&name==='pprm'?'../docs/geography-discovery/denver-pprm-beta-20261007/model.mjs':dir+name+'-model.mjs'),initial=await import(dir+name+'-initial-model.mjs'),diag=JSON.parse(fs.readFileSync(new URL(dir+name+'-initial-diagnostic.json',import.meta.url)));
 assert.equal(diag.model.scenarios.find(s=>s.id==='central').price10,initial.calculate().price10);
 assert.equal(r.acceptance.status,'accepted');assert.ok(['alpha','beta'].includes(r.stage));
 for(const s of r.model.scenarios){const x=JSON.parse(JSON.stringify(m.calculate(s.overrides)));for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])sameData(s[k],x[k]);}
 const c=r.model.scenarios[0];assert.equal(c.costUSD,cost);assert.equal(reportPrice(r),10*cost/(c.editionQalys+c.incomeEquivalent));assert.equal(researchListPrice(r),reportPrice(r));assert.ok(c.incomePathways.length);
 for(const sid of r.sessionIds){const s=data.sessions.find(s=>s.id===sid);assert.equal(s.organizationId,id);assert.ok(s.endedAt);assert.ok(s.model);}
 assert.ok(!r.sessionIds.includes('3f41dce1-5bca-4e6b-97cb-f768b08ca7f6'));
 if(name==='struggle'){assert.equal(m.defaults.therapyN,30);assert.equal(m.calculate({unique:.5}).editionQalys,c.editionQalys);assert.equal(m.calculate({therapyQ:-.03,therapyOverlap:0}).editionQalys,m.calculate({therapyQ:-.03,therapyOverlap:1}).editionQalys);assert.equal(m.calculate({N:0,resourceN:0,therapyN:0,C:0}).totalEquivalent,0);}
});
test('all prior reports/sessions/provenance retained without duplicate imports',()=>{
 const old=JSON.parse(execFileSync('git',['show','e856ede:data/geography-reports.json'],{maxBuffer:67108864}));reportsRetained(data,old);sessionsRetained(data,old);assert.ok(data.reports.length>=old.reports.length+2);assert.equal(new Set(data.sessions.map(s=>s.id)).size,data.sessions.length);
 const effort=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url))),prev=JSON.parse(execFileSync('git',['show','e856ede:data/research-effort.json'],{maxBuffer:67108864}));effortRetained(effort,prev);
 for(const name of ['Struggle of Love Foundation','Planned Parenthood of the Rocky Mountains'])assert.ok(effort.organizations[name].sessions.every(s=>s.endedAt&&s.model));
});

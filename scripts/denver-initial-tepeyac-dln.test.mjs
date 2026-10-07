import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
for(const[name,id,cost]of [['tepeyac','org:tepeyac',18893488],['dln','ein:84-6129064',10000]])test(name+' preserves initial diagnostics and synchronized signed-health/resource price',async()=>{
 const dir='../docs/geography-discovery/denver-tepeyac-dln-initial-20261006/',m=await import(dir+name+'-model.mjs'),initial=await import(dir+name+'-initial-model.mjs'),diag=JSON.parse(fs.readFileSync(new URL(dir+name+'-initial-diagnostic.json',import.meta.url)));
 assert.equal(diag.model.scenarios.find(s=>s.id==='central').price10,initial.calculate().price10);
 const r=data.reports.find(r=>r.edition==='denver'&&r.organizationId===id);assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');assert.equal(r.model.scenarios[0].id,'central');
 for(const s of r.model.scenarios){const x=JSON.parse(JSON.stringify(m.calculate(s.overrides)));for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])assert.deepEqual(s[k],x[k]);}
 const c=r.model.scenarios[0];assert.equal(c.costUSD,cost);assert.ok(c.incomeEquivalent<0);assert.equal(reportPrice(r),10*cost/(c.editionQalys+c.incomeEquivalent));assert.equal(researchListPrice(r),reportPrice(r));
 for(const sid of r.sessionIds){const s=data.sessions.find(s=>s.id===sid);assert.equal(s.organizationId,id);assert.ok(s.endedAt);assert.ok(s.model);}
 assert.ok(!r.sessionIds.includes('e7a97ad7-a8a8-43d2-9643-2b059b1c328e'));
 if(name==='tepeyac'){assert.equal(m.defaults.N,7901);assert.equal(m.calculate({unique:.5}).editionQalys,c.editionQalys);assert.equal(m.calculate({response:0}).incomeEquivalent,m.calculate({response:0,workGain:1000}).incomeEquivalent);}
 else{assert.equal(m.defaults.g,.04);assert.equal(m.calculate({s:0}).incomeEquivalent,m.calculate({s:0,annualNetPayGain:1000}).incomeEquivalent);assert.equal(m.calculate({g:0}).totalEquivalent,0);assert.ok(r.sessionIds.includes('usa-dln-recalibration-20261002-1'));}
});
test('prior reports and sessions preserved; reused national research not duplicated',()=>{
 const old=JSON.parse(execFileSync('git',['show','128ab4c:data/geography-reports.json'],{maxBuffer:67108864}));assert.deepEqual(data.reports.slice(0,old.reports.length),old.reports);assert.deepEqual(data.sessions.slice(0,old.sessions.length),old.sessions);assert.equal(data.reports.length,old.reports.length+2);assert.equal(data.sessions.length,old.sessions.length+5);assert.equal(new Set(data.sessions.map(s=>s.id)).size,data.sessions.length);
 const effort=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url))),prev=JSON.parse(execFileSync('git',['show','128ab4c:data/research-effort.json'],{maxBuffer:67108864}));for(const[k,v]of Object.entries(prev.organizations))assert.deepEqual(effort.organizations[k],v);
 const dln=effort.organizations['Dental Lifeline Network'];assert.ok(dln.reusedSessionIds.includes('usa-dln-recalibration-20261002-1'));assert.equal(dln.sessions.length,2);assert.equal(new Set(dln.sessions.map(s=>s.id)).size,dln.sessions.length);assert.ok(effort.organizations['ein:84-6129064'].sessions.some(s=>s.id==='usa-dln-recalibration-20261002-1'));
});

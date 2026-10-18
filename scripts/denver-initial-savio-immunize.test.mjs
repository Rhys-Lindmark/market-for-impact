import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
for(const [name,id,cost,n]of [['savio','ein:84-0570279',14274461,520],['immunize','org:immunize-colorado',571433,440]])test(name+' separates patient health from household income with preserved diagnostics',async()=>{
 const m=await import('../docs/geography-discovery/denver-savio-immunize-initial-20261006/'+name+'-model.mjs'),initial=await import('../docs/geography-discovery/denver-savio-immunize-initial-20261006/'+name+'-initial-model.mjs');
 const diag=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/denver-savio-immunize-initial-20261006/'+name+'-initial-diagnostic.json',import.meta.url)));
 assert.equal(diag.model.scenarios.find(x=>x.id==='central').price10,initial.calculate().price10);
 const r=data.reports.find(x=>x.edition==='denver'&&x.organizationId===id);assert.equal(r.stage,'alpha');assert.equal(r.acceptance.status,'accepted');assert.equal(r.model.scenarios[0].id,'central');
 for(const s of r.model.scenarios){const x=JSON.parse(JSON.stringify(m.calculate(s.overrides)));for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])assert.deepEqual(s[k],x[k]);}
 const c=r.model.scenarios[0];assert.equal(c.costUSD,cost);assert.equal(m.defaults.N,n);assert.equal(m.calculate({unique:.5}).editionQalys,c.editionQalys);assert.ok(c.incomeEquivalent<0);assert.equal(reportPrice(r),10*cost/(c.editionQalys+c.incomeEquivalent));assert.equal(researchListPrice(r),reportPrice(r));
 for(const sid of r.sessionIds){const s=data.sessions.find(x=>x.id===sid);assert.equal(s.organizationId,id);assert.ok(s.endedAt);assert.equal(s.model.id,'gpt-6.1-sol');}assert.equal(r.sessionIds.length,4);
 if(name==='immunize'){assert.equal(m.defaults.childShare,388/440);assert.equal(m.defaults.adultShare,49/440);assert.ok(r.sources.some(x=>x.url.includes('Shots-for-Tots-and-Teens-2025-Year-End-Report')));}
});
test('preserves every prior report, session and effort record',()=>{
 const old=JSON.parse(execFileSync('git',['show','871a7be:data/geography-reports.json'],{maxBuffer:67108864}));
 assert.deepEqual(data.reports.slice(0,old.reports.length),old.reports);assert.deepEqual(data.sessions.slice(0,old.sessions.length),old.sessions);assert.equal(data.reports.length,old.reports.length+2);assert.equal(data.sessions.length,old.sessions.length+8);
 const effort=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url))),prev=JSON.parse(execFileSync('git',['show','871a7be:data/research-effort.json'],{maxBuffer:67108864}));for(const[k,v]of Object.entries(prev.organizations))assert.deepEqual(effort.organizations[k],v);
});

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
for(const[name,id,cost,n]of [['chn','org:colorado-health-network',36416135,557],['jefferson','org:jefferson-center',91195341,24681]])test(name+' preserves initial and clinical/resource units with synchronized current price',async()=>{
 const dir='../docs/geography-discovery/denver-chn-jefferson-initial-20261006/',m=await import(dir+name+'-model.mjs'),initial=await import(dir+name+'-initial-model.mjs'),diag=JSON.parse(fs.readFileSync(new URL(dir+name+'-initial-diagnostic.json',import.meta.url)));
 assert.equal(diag.model.scenarios.find(s=>s.id==='central').price10,initial.calculate().price10);
 const r=data.reports.find(r=>r.edition==='denver'&&r.organizationId===id);assert.equal(r.acceptance.status,'accepted');assert.equal(r.stage,'alpha');assert.equal(r.model.scenarios[0].id,'central');
 for(const s of r.model.scenarios){const x=JSON.parse(JSON.stringify(m.calculate(s.overrides)));for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])assert.deepEqual(s[k],x[k]);}
 const c=r.model.scenarios[0];assert.equal(c.costUSD,cost);assert.equal(m.defaults.N,n);assert.equal(m.calculate({unique:.5}).editionQalys,c.editionQalys);assert.equal(reportPrice(r),10*cost/(c.editionQalys+c.incomeEquivalent));assert.equal(researchListPrice(r),reportPrice(r));
 for(const sid of r.sessionIds){const s=data.sessions.find(s=>s.id===sid);assert.equal(s.organizationId,id);assert.ok(s.endedAt);assert.equal(s.model.id,'gpt-6.1-sol');}
 assert.ok(!r.sessionIds.includes('deac940a-8a5d-4fc5-a0d6-261ec8102bb7'));
 if(name==='chn'){assert.ok(c.incomeEquivalent<0);assert.equal(m.calculate({response:0,workGain:0}).incomeEquivalent,m.calculate({response:0,workGain:1000}).incomeEquivalent);}
 else{assert.ok(c.incomeEquivalent>0);assert.equal(m.defaults.T,1);}
});
test('all prior reports, sessions and effort records preserved exactly',()=>{
 const old=JSON.parse(execFileSync('git',['show','e8ef3e8:data/geography-reports.json'],{maxBuffer:67108864}));assert.deepEqual(data.reports.slice(0,old.reports.length),old.reports);assert.deepEqual(data.sessions.slice(0,old.sessions.length),old.sessions);assert.equal(data.reports.length,old.reports.length+2);assert.equal(data.sessions.length,old.sessions.length+4);
 const effort=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url))),prev=JSON.parse(execFileSync('git',['show','e8ef3e8:data/research-effort.json'],{maxBuffer:67108864}));for(const[k,v]of Object.entries(prev.organizations))assert.deepEqual(effort.organizations[k],v);
});

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {reportPrice,researchListPrice} from '../lib/geography-reports.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
for(const [prefix,id,cost,n]of [['dcac','org:denver-childrens-advocacy',3354733,624],['blue','org:blue-bench',2589919,212]])test(prefix+' accepted matched full costs and clinical plus signed household resources',async()=>{
 const mod=await import('../docs/geography-discovery/denver-dcac-blue-initial-20261006/'+prefix+'-model.mjs');
 const initial=await import('../docs/geography-discovery/denver-dcac-blue-initial-20261006/'+prefix+'-initial-model.mjs');
 const diag=JSON.parse(fs.readFileSync(new URL('../docs/geography-discovery/denver-dcac-blue-initial-20261006/'+prefix+'-initial-diagnostic.json',import.meta.url)));
 assert.equal(diag.model.scenarios[0].price10,initial.calculate().price10);
 const r=data.reports.find(x=>x.edition==='denver'&&x.organizationId===id);assert.equal(r.stage,'alpha');assert.equal(r.acceptance.status,'accepted');
 for(const s of r.model.scenarios){const expected=JSON.parse(JSON.stringify(mod.calculate(s.overrides)));for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10','incomePathways'])assert.deepEqual(s[k],expected[k]);}
 const c=r.model.scenarios[0];assert.equal(c.costUSD,cost);assert.equal(r.model.inputs.find(x=>x.name==='N').value,n);assert.equal(r.model.inputs.find(x=>x.name==='N').basis,'observed');assert.ok(c.incomeEquivalent<0&&c.editionQalys>0);
 assert.equal(reportPrice(r),10*cost/(c.editionQalys+c.incomeEquivalent));assert.equal(researchListPrice(r),reportPrice(r));assert.match(r.priceScope,/not whole-portfolio|not whole|not.*marginal-gift/);
 for(const sid of r.sessionIds){const s=data.sessions.find(x=>x.id===sid);assert.equal(s.organizationId,id);assert.ok(s.endedAt);assert.equal(s.model.id,'gpt-6.1-sol');}
 assert.ok(!data.sessions.some(x=>['a030129f-fbf8-443b-9cbe-01729f99cc45','3bf34d3d-d87c-47f5-8b2a-eae25b585495'].includes(x.id)));
 assert.equal(mod.calculate({eligible:0,workGain:10000}).incomeEquivalent,mod.calculate({eligible:0}).incomeEquivalent);
 if(prefix==='blue')assert.equal(mod.calculate({C:(2589919+2576348+2203137)/3}).costUSD,2456468);
});
test('two-report integration preserves every prior report, session and effort entry',()=>{
 const old=JSON.parse(execFileSync('git',['show','c4ab33a:data/geography-reports.json'],{maxBuffer:67108864}));assert.deepEqual(data.reports.slice(0,old.reports.length),old.reports);assert.deepEqual(data.sessions.slice(0,old.sessions.length),old.sessions);assert.equal(data.reports.length,old.reports.length+2);assert.equal(data.sessions.length,old.sessions.length+3);
 const effort=JSON.parse(fs.readFileSync(new URL('../data/research-effort.json',import.meta.url))),previous=JSON.parse(execFileSync('git',['show','c4ab33a:data/research-effort.json'],{maxBuffer:67108864}));for(const[k,v]of Object.entries(previous.organizations))assert.deepEqual(effort.organizations[k],v);
});

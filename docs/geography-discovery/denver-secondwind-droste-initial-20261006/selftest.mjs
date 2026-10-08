import fs from 'node:fs';import assert from 'node:assert/strict';import path from 'node:path';import {incomeHealthyYearEquivalent as eq} from './income-health-equivalence.mjs';
const dir=path.dirname(new URL(import.meta.url).pathname);let checks=0;
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b)));checks++;};
for(const prefix of ['secondwind','droste']){const m=await import('./'+prefix+'-model.mjs'),r=JSON.parse(fs.readFileSync(path.join(dir,prefix+'-initial-diagnostic.json'))),original=JSON.parse(fs.readFileSync(path.join(dir,prefix+'-initial-diagnostic.json')));assert.deepEqual(r,original);checks++;
for(const s of r.model.scenarios){const v=m.calculate(s.overrides);for(const k of ['costUSD','editionQalys','incomeEquivalent','totalEquivalent','price10'])near(s[k],v[k]);near(s.incomePathways.reduce((n,p)=>n+eq(p),0),v.incomeEquivalent);}
assert.ok(m.calculate({b:0}).incomeEquivalent<0);assert.ok(m.calculate({b:0}).editionQalys<0);near(m.calculate({N:0}).totalEquivalent,0);near(m.calculate({g:0}).totalEquivalent,0);near(m.calculate({q:0,harm:0}).editionQalys,0);near(m.calculate({q:0}).incomeEquivalent,m.calculate().incomeEquivalent);near(m.calculate({workGain:-500,overlap:0}).incomeEquivalent,m.calculate({workGain:-500,overlap:1}).incomeEquivalent);
for(const o of [{unique:1.1},{cost:-1},{g:-1},{baseline:0}]){assert.throws(()=>m.calculate(o));checks++;}}
console.log(JSON.stringify({status:'pass',checks,scenarios:64}));

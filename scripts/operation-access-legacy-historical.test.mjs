import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash}from 'node:crypto';
import model from '../data/san-francisco/oa-portfolio-model-v2.json' with {type:'json'};
import frozen from '../data/san-francisco/operation-access-legacy-pre-recalibration-model.json' with {type:'json'};
import {calculate}from '../lib/oa-portfolio-model.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
test('Operation Access original model bytes and all nine complete output hashes remain exact',()=>{
 assert.equal(hash(fs.readFileSync(new URL('../'+frozen.modelPath,import.meta.url))),frozen.modelSha256);
 assert.equal(model.scenarios.length,9);assert.equal(frozen.scenarios.length,9);
 for(const s of model.scenarios){const r=calculate(model,s),old=frozen.scenarios.find(x=>x.id===s.id);assert(old);assert.equal(hash(JSON.stringify(r)),old.resultSha256);assert.deepEqual(r.regions,old.regions);assert.equal(r.total_q,old.totalQ);}
});

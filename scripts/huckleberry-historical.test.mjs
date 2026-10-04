import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import historical from '../data/san-francisco/huckleberry-pre-recalibration-20261004.json' with {type:'json'};
import {directQalyModel} from '../lib/direct-qaly-model.mjs';
test('Three original Huckleberry course worlds remain fully reproducible',()=>{
 assert.equal(historical.evaluated.length,3);
 for(const row of historical.evaluated)assert.deepEqual(directQalyModel(row.inputs),row.result);
 assert.equal(historical.evaluated[1].result.costPerTenQalys,3692307.6923076925);
});
test('Original Huckleberry source data and shared direct-QALY engine remain unchanged',()=>{
 for(const p of ['data/san-francisco/huckleberry-counseling-cea-v1.json','lib/direct-qaly-model.mjs'])assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+p,import.meta.url))).digest('hex'),historical.hashes[p],p);
});

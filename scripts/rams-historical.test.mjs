import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import historical from '../data/san-francisco/rams-pre-recalibration-20261004.json' with {type:'json'};
import {signedCourseQalyModel} from '../lib/signed-course-qaly-model.mjs';
test('RAMS three original course worlds remain reproducible',()=>{
 assert.equal(historical.evaluated.length,3);for(const row of historical.evaluated)assert.deepEqual(signedCourseQalyModel(row.inputs),row.result);
 assert.equal(historical.evaluated[1].result.costPerTenQalys,4210526.315789473);
});
test('RAMS original source model and shared engine remain unchanged',()=>{
 for(const p of ['data/san-francisco/rams-depression-cea-v1.json','lib/signed-course-qaly-model.mjs'])assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+p,import.meta.url))).digest('hex'),historical.hashes[p],p);
});

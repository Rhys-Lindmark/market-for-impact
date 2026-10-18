import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import frozen from '../data/san-francisco/selfhelp-pre-recalibration-20261004.json' with {type:'json'};
import {fallsCourseModel} from '../lib/falls-course-model.mjs';
test('Self-Help three initial endpoint-utility worlds remain reproducible',()=>{
 assert.equal(frozen.evaluated.length,3);
 for(const world of frozen.evaluated)assert.deepEqual(fallsCourseModel(world.inputs),world.result);
 assert.equal(frozen.evaluated[1].result.costPerTenQalys,2400000);
 const s=frozen.evaluated[1].inputs;assert.equal(10*s.courseCost/(.04*s.localTransfer*s.additionality),600000);
});
test('Self-Help original model and shared engine stay unchanged',()=>{
 for(const p of ['data/san-francisco/selfhelp-falls-cea-v1.json','lib/falls-course-model.mjs'])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+p,import.meta.url))).digest('hex'),frozen.hashes[p]);
});

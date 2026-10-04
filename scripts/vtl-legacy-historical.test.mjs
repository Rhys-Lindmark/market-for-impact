import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {visionToLearn,visionToLearnModel} from '../lib/vision-to-learn-model.mjs';
const archived=JSON.parse(fs.readFileSync('data/us/vtl-legacy-pre-recalibration-model.json','utf8'));
test('All eleven original legacy Vision To Learn worlds remain reproducible',()=>{
 assert.deepEqual(visionToLearn,archived.model);
 assert.equal(archived.evaluated.length,11);
 for(const world of archived.evaluated)assert.deepEqual(visionToLearnModel(world.inputs),world.output,world.id);
});
test('Original Vision To Learn engine and input bytes stay immutable',()=>{
 for(const source of archived.sourceFiles.filter(s=>s.path==='lib/vision-to-learn-model.mjs'||s.path==='data/us/vision-to-learn-v2.json'))assert.equal(createHash('sha256').update(fs.readFileSync(source.path)).digest('hex'),source.sha256,source.path);
});

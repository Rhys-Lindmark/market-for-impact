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
test('All five original Vision To Learn source hashes stay preserved',()=>{
 const copies={'app/api/vision-to-learn-model/route.ts':'docs/geography-discovery/vtl-legacy-original-api-2026-10-04.ts.txt','app/charities/vision-to-learn/page.tsx':'docs/geography-discovery/vtl-legacy-original-page-2026-10-04.tsx.txt'};
 for(const source of archived.sourceFiles)assert.equal(createHash('sha256').update(fs.readFileSync(copies[source.path]??source.path)).digest('hex'),source.sha256,source.path);
});

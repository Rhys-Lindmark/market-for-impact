import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {calculate} from '../lib/newdoor-portfolio-model.mjs';
import {supportiveHealthModel} from '../lib/supportive-health-model.mjs';
import archive from '../data/san-francisco/newdoor-pre-recalibration-20261004.json' with {type:'json'};
import earlier from '../data/san-francisco/newdoor-earlier-employment-diagnostic-20261004.json' with {type:'json'};
test('All eight original New Door portfolio worlds remain exactly reproducible',()=>{
 assert.equal(archive.worlds.length,8);for(const w of archive.worlds)assert.deepEqual(calculate(w.inputs,archive.model.giftUsd),w.output);
 assert.equal(archive.worlds[0].output.bayUsdPer10Qaly,228571428.57142854);
});
test('Three earlier employment-only worlds remain separate and reproducible',()=>{
 assert.equal(earlier.worlds.length,3);for(const w of earlier.worlds)assert.deepEqual(supportiveHealthModel(w.inputs),w.output);
});
test('Frozen original model/data inputs remain unchanged',()=>{
 for(const a of [archive,earlier])for(const s of a.sourceHashes.filter(s=>s.path.startsWith('data/')||s.path.startsWith('lib/')))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+s.path,import.meta.url))).digest('hex'),s.sha256,s.path);
});

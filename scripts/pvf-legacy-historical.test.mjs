import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {runScenarios} from '../lib/pvf-portfolio-model.mjs';
import frozen from '../data/san-francisco/pvf-legacy-pre-recalibration-model.json' with {type:'json'};
const hash=s=>createHash('sha256').update(s).digest('hex');
test('PVF complete original sources and eighteen full scenario outputs remain exact',()=>{
 for(const f of frozen.files)assert.equal(hash(fs.readFileSync(f.path)),f.sha256,f.path);
 const r=runScenarios();assert.equal(Object.keys(r).length,18);
 for(const s of frozen.scenarios){assert.equal(hash(JSON.stringify(r[s.id])),s.resultSha256,s.id);assert.deepEqual(r[s.id].q,s.q);assert.deepEqual(r[s.id].prices,s.prices);}
});

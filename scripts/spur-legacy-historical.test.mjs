import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {calculate,scenarios,calculateAll} from '../lib/spur-v2-model.mjs';
import frozen from '../data/san-francisco/spur-legacy-pre-recalibration-model.json' with {type:'json'};
const hash=x=>createHash('sha256').update(x).digest('hex');
test('SPUR original eight source bytes and ten full clinical outputs remain exact',()=>{
 for(const f of frozen.files)assert.equal(hash(fs.readFileSync(f.path)),f.sha256,f.path);
 assert.equal(scenarios.length,10);assert.equal(frozen.scenarios.length,10);
 for(const s of frozen.scenarios){const r=calculate({scenario:scenarios.find(x=>x.id===s.id)});assert.equal(hash(JSON.stringify(r)),s.resultSha256,s.id);assert.equal(r.bayUsdPer10Qaly,s.bayClinicalPrice10);assert.equal(r.sfUsdPer10Qaly,s.sfClinicalPrice10);}
 assert.equal(hash(JSON.stringify(calculateAll())),frozen.calculateAllSha256);
});

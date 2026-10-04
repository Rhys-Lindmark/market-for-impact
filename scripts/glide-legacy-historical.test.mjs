import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {calculate,evaluate} from '../lib/glide-v2-model.mjs';import {scenarios} from '../lib/glide-coverage-scenarios.mjs';
import inputs from '../data/san-francisco/glide-coverage-v2.json' with {type:'json'};
import frozen from '../data/san-francisco/glide-legacy-pre-recalibration-model.json' with {type:'json'};
const hash=x=>createHash('sha256').update(x).digest('hex');
test('GLIDE full original report and distinct historical list worlds remain unchanged',()=>{for(const f of frozen.files)assert.equal(hash(fs.readFileSync(f.path)),f.sha256,f.path);const all=calculate();assert.deepEqual(all,frozen.reportModel);assert.equal(hash(JSON.stringify(all)),frozen.reportSha256);const ranking=scenarios(inputs).map(s=>({id:s.id,result:evaluate(s.inputs)}));assert.deepEqual(ranking,frozen.rankingScenarios);assert.equal(hash(JSON.stringify(ranking)),frozen.rankingSha256);});

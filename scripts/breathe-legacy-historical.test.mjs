import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {calculate,oldBaseline} from '../lib/breathe-v2-model.mjs';
import frozen from '../data/san-francisco/breathe-legacy-pre-recalibration-model.json' with {type:'json'};
const hash=x=>createHash('sha256').update(x).digest('hex');
test('Breathe complete historical report, allocation variants and ranking worlds are preserved',()=>{
  for(const f of frozen.files)assert.equal(hash(fs.readFileSync(f.path)),f.sha256,f.path);
  const current=calculate();
  assert.deepEqual(current,frozen.reportModel);
  assert.equal(hash(JSON.stringify(current)),frozen.reportSha256);
  assert.deepEqual(oldBaseline(),frozen.oldBaseline);
  assert.deepEqual(calculate({oldAllocation:true}),frozen.oldAllocation);
  assert.deepEqual(current.worlds,frozen.rankingScenarios);
});

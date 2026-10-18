import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {calculate} from '../lib/nems-v2-model.mjs';
import frozen from '../data/san-francisco/nems-legacy-pre-recalibration-model.json' with {type:'json'};
const hash=x=>createHash('sha256').update(x).digest('hex');
test('NEMS complete historical HBV outputs and original artifacts remain preserved',()=>{
  for(const f of frozen.files) assert.equal(hash(fs.readFileSync(f.path)),f.sha256,f.path);
  const current=calculate();
  assert.deepEqual(current,frozen.reportModel);
  assert.equal(hash(JSON.stringify(current)),frozen.reportSha256);
  assert.equal(current.ordinaryFoundationGiftExpectedQalys,null);
  assert.equal(current.weightedExpectation,null);
});

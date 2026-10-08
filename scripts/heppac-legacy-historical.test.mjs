import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {calculate} from '../lib/heppac-model.mjs';
import {calculate as eventLinear} from '../lib/heppac-event-linear-v1.mjs';
import frozen from '../data/bay/heppac-legacy-pre-recalibration-model.json' with {type:'json'};
const hash=x=>createHash('sha256').update(x).digest('hex');
test('HEPPAC complete unique-cohort and event-linear models stay unchanged',()=>{
  for(const f of frozen.files)assert.equal(hash(fs.readFileSync(f.path)),f.sha256,f.path);
  assert.deepEqual(calculate(),frozen.reportModel);
  assert.equal(hash(JSON.stringify(calculate())),frozen.reportSha256);
  assert.deepEqual(eventLinear(),frozen.eventLinearModel);
  for(const r of frozen.optionResults)assert.equal(hash(JSON.stringify(calculate(r.options))),r.sha256);
});

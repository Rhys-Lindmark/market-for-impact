import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate} from '../lib/glide-coverage-model.mjs';
import {scenarios} from '../lib/glide-coverage-scenarios.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../data/san-francisco/'+name,import.meta.url)));
test('GLIDE reproduces all accepted signed scenarios',()=>{
 const m=read('glide-coverage-v2.json');
 assert.deepEqual(scenarios(m).map(s=>({id:s.id,outputs:calculate(s.inputs)})),read('glide-coverage-results.json'));
 const c=calculate(m);assert.equal(c.bay.donor_per_10q,4890656.595775775);
 assert.ok(c.sf.qaly<c.bay.qaly);
 assert.equal(scenarios(m).length,20);
});

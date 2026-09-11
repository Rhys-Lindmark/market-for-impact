import test from 'node:test';
import assert from 'node:assert/strict';
import summaries from '../data/top-ten-summaries.json' with {type:'json'};
import readiness from '../data/donor-readiness.json' with {type:'json'};
import {calculate} from '../lib/recares-v2-model.mjs';

test('ten complete summaries use the requested structure and evidence links',()=>{
 assert.deepEqual(Object.keys(summaries).sort(),readiness.reviews.map(row=>row.slug).sort());
 for(const [slug,row]of Object.entries(summaries)){
  for(const key of ['intro','reasons','reservations','cost'])assert.equal(row[key].length,3,slug+' '+key);
  assert.ok(row.intro.every(sentence=>sentence.endsWith('.')));
  assert.ok(row.monitoring.length>100&&row.qualitative.length>100);
  assert.ok(row.cost.join(' ').includes('$'));
  assert.ok(row.sources.length>=2&&row.sources.every(url=>new URL(url).protocol==='https:'));
  assert.doesNotMatch(JSON.stringify(row),/\$100,000|whole-gift/);
 }
});
test('ReCARES service ratios and conditional benefit are not device promises',()=>{
 const model=calculate(),text=summaries.recares.cost.join(' ');
 assert.ok(text.includes('$'+model.costPerReportedRecipient.toFixed(2)));
 assert.ok(text.includes('$'+(model.inputs.totalExpenseUsd/model.inputs.reportedItems).toFixed(2)));
 const mobility=model.rows.find(row=>row.name==='central').mix.find(row=>row.name==='mobility');
 assert.ok(text.includes(String(mobility.utility*mobility.years)+' QALYs'));
 assert.match(text,/analyst assumption/);assert.match(text,/not a measured effect per donated item/);
});
test('unresolved recipients retain their giving restrictions',()=>{
 assert.match(summaries['hope-pacifica'].qualitative,/not a current giving recommendation/);
 assert.match(summaries['hearing-and-speech-center'].qualitative,/withholding a direct-gift recommendation/);
});

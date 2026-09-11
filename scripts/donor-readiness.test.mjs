import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import review from '../data/donor-readiness.json' with {type:'json'};
test('editorial shortlist is explicit, audited and never silently price-filled',()=>{
 assert.equal(review.reviews.length,10);
 assert.equal(new Set(review.reviews.map(r=>r.slug)).size,10);
 assert.deepEqual(review.homepageSlugs,['recares','project-homeless-connect','compass-family-services','san-francisco-aids-foundation']);
 for(const slug of review.homepageSlugs)assert.equal(review.reviews.find(r=>r.slug===slug).homepage,true);
 for(const row of review.reviews){assert.ok(row.reason.length>80);assert.ok(row.short.length>10);}
 const source=fs.readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.ok(!source.includes('.slice(0,4)'));
 for(const name of ['recares.png','compass.jpg','phc.jpg','sfaf.jpg'])assert.ok(fs.statSync(new URL('../public/images/'+name,import.meta.url)).size>1000);
});
test('financial and recipient blockers remain specific, not accusations',()=>{
 const hope=review.reviews.find(r=>r.slug==='hope-pacifica');
 assert.equal(hope.homepage,false);assert.match(hope.reason,/do not establish misconduct/);
 const hearing=review.reviews.find(r=>r.slug==='hearing-and-speech-center');
 assert.equal(hearing.homepage,false);assert.match(hearing.reason,/no verified reinstatement/);
 assert.match(review.reviews.find(r=>r.slug==='compass-family-services').reason,/does not cover the entire organization/);
});

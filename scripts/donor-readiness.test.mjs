import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import review from '../data/donor-readiness.json' with {type:'json'};
test('historical donor assessments remain explicit while homepage follows research',()=>{
 assert.equal(review.reviews.length,10);
 assert.equal(new Set(review.reviews.map(r=>r.slug)).size,10);
 assert.deepEqual(review.historicalEditorialSlugs,['recares','project-homeless-connect','compass-family-services','san-francisco-aids-foundation']);
 for(const slug of review.historicalEditorialSlugs)assert.equal(review.reviews.find(r=>r.slug===slug).homepage,true);
 assert.match(review.selectionNote,/follows the research ranking/);
 for(const row of review.reviews){assert.ok(row.reason.length>80);assert.ok(row.short.length>10);}
 const source=fs.readFileSync(new URL('../app/san-francisco/page.tsx',import.meta.url),'utf8');
 assert.match(source,/topFourResearch\.map/);
 assert.doesNotMatch(source,/readiness\.homepageSlugs/);
 assert.match(source,/hope4change650.org/);
 assert.match(source,/hearingspeech.org/);
 for(const name of ['recares.png','compass.jpg','phc.jpg','sfaf.jpg'])assert.ok(fs.statSync(new URL('../public/images/'+name,import.meta.url)).size>1000);
});
test('financial and recipient blockers remain specific, not accusations',()=>{
 const hope=review.reviews.find(r=>r.slug==='hope-pacifica');
 assert.equal(hope.homepage,false);assert.match(hope.reason,/do not establish misconduct/);
 const hearing=review.reviews.find(r=>r.slug==='hearing-and-speech-center');
 assert.equal(hearing.homepage,false);assert.match(hearing.reason,/no verified reinstatement/);
 assert.match(review.reviews.find(r=>r.slug==='compass-family-services').reason,/does not cover the entire organization/);
});

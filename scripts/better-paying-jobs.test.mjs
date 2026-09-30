import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {earningsResearchLanes,earningsScreen} from '../lib/better-paying-jobs.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';
assert.deepEqual(earningsResearchLanes.map(l=>l.id),['san-francisco','california','new-york-city','usa']);
for(const lane of earningsResearchLanes){
 assert.ok(lane.focus&&lane.next);
 assert.ok(lane.candidates.length>=2);
 for(const candidate of lane.candidates)assert.ok(candidate.url.startsWith('https://')&&candidate.mechanism);
}
for(const s of earningsScreen.scenarios){
 const expected=.5*100*s.years*Math.log1p(s.annualIncomeGainUSD/25000)*s.causalShare*.8;
 const result=incomeHealthyYearEquivalent({...earningsScreen,...s});
 assert.ok(Math.abs(result-expected)<1e-10);
 assert.ok(10*earningsScreen.costUSD/result>0);
}
assert.equal(incomeHealthyYearEquivalent({...earningsScreen,...earningsScreen.scenarios[1],causalShare:0}),0);
const page=readFileSync(new URL('../app/research/better-paying-jobs/page.tsx',import.meta.url),'utf8');
assert.match(page,/not four new organization reviews/);
assert.match(page,/not measured QALYs or DALYs/);
assert.match(page,/Year 10/);
for(const file of ['components/GeographyEdition.tsx','components/EditionDonorHome.tsx','app/san-francisco/page.tsx','app/san-francisco/all/page.tsx'])assert.doesNotMatch(readFileSync(new URL('../'+file,import.meta.url),'utf8'),/EarningsResearch/);
for(const file of ['components/EditionDonorHome.tsx','app/san-francisco/page.tsx']){
 const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
 assert.match(source,/sf-footer-separator/);
 assert.doesNotMatch(source,/Independent research\. Not affiliated/);
}
console.log('Earnings research preserved; promotional blocks removed and home footers simplified.');

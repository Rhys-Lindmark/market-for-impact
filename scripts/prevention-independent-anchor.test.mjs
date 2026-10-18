import assert from 'node:assert/strict';
import {calculateCandidate as calc,organizationInputs} from '../lib/prevention-independent-anchor.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
for(const org of ['compass','hamilton']){
 const r=calc(org),x=organizationInputs[org];
 close(r.incomePerCase,.5*Math.log1p(.8*x.transferPerCaseUSD/50000)/1.03**.25);
 close(r.healthPerCase,.02*.25*.025/1.03**.375);
 close(r.combinedYears,r.cases*(r.incomePerCase+r.healthPerCase));
 const lowerCash=calc(org,{netTenantShare:.5});
 assert.ok(lowerCash.combinedYears<r.combinedYears,'Changing cash must change total, not only allocation');
 close(lowerCash.healthPerCase,r.healthPerCase);
 const noHealth=calc(org,{noncashHealthGap:0});
 close(noHealth.incomeEquivalentYears,r.incomeEquivalentYears);assert.ok(noHealth.costPerBetterLifeUSD>r.costPerBetterLifeUSD);
 close(calc(org,{fundingAdditionality:.5}).combinedYears,r.combinedYears/2);
 close(calc(org,{donorBudgetUSD:50000}).costPerBetterLifeUSD,r.costPerBetterLifeUSD);
 close(calc(org,{sfShare:.5}).sf.costPerBetterLifeUSD,2*r.costPerBetterLifeUSD);
 for(const v of [{fundingAdditionality:0},{completionShare:0},{portfolioShare:0},{netTenantShare:0,noncashHealthGap:0}])assert.equal(calc(org,v).costPerBetterLifeUSD,null);
 const harm=calc(org,{fundingAdditionality:0,recipientBurdenUSD:100,inducedBurdenExposureShare:.25});
 assert.equal(harm.status,'harm');assert.equal(harm.costPerBetterLifeUSD,null);
 for(const v of [{donorBudgetUSD:100001},{unexpected:1},{sfShare:1,bayShare:.5},{sfShare:1e-310},{avoidedExposureYears:100},{adultEquivalentCount:1000},{transferPerCaseUSD:1e9},{recipientBurdenUSD:50000},{noncashHealthGap:NaN},{avoidedEpisodeProbability:1.1},{transferPerCaseUSD:0}])assert.throws(()=>calc(org,v),RangeError);
}
assert.throws(()=>calc('unknown'),RangeError);
console.log('PASS: independent cash/health magnitudes, cash sensitivity, null/harm, bounded dose, geography and attribution.');
console.log(JSON.stringify(Object.fromEntries(['compass','hamilton'].map(org=>[org,calc(org)])),null,2));

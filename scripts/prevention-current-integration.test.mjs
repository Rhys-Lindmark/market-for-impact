import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate as compass,diagnostics as compassCases} from '../lib/compass-calibrated-model.mjs';
import {calculate as hamilton,diagnostics as hamiltonCases} from '../lib/hamilton-calibrated-model.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
import summaries from '../data/top-ten-summaries.json' with {type:'json'};
for(const [slug,fn,scenarios,price,oldPrice] of [['compass-family-services',compass,compassCases,2832929.1542023914,1347730.8105206655],['hamilton-families',hamilton,hamiltonCases,2609546.7359875394,1388888.888888889]]){
 const r=fn(),row=researchCostRanking.find(x=>x.slug===slug),d=scenarios();
 assert.ok(Math.abs(r.costPerBetterLifeUSD-price)<1e-6);assert.equal(row.bayUsdPerTenQalys,price);
 assert.ok(Math.abs(r.historical.firstHealthIncomePriceUSD-oldPrice)<1e-6);
 for(const scenario of Object.values(d))assert.ok(scenario.costPerBetterLifeUSD===null||Number.isFinite(scenario.costPerBetterLifeUSD));
 assert.ok(d.highResources.costPerBetterLifeUSD>r.costPerBetterLifeUSD);assert.ok(d.lowResources.costPerBetterLifeUSD<r.costPerBetterLifeUSD);
 assert.ok(d.lowerCapture.costPerBetterLifeUSD>r.costPerBetterLifeUSD);assert.equal(d.lowerCapture.healthPerCase,r.healthPerCase);
 assert.ok(d.cashOnly.costPerBetterLifeUSD>r.costPerBetterLifeUSD);assert.equal(d.cashOnly.cashPerCase,r.cashPerCase);
 assert.ok(d.replacementHarm.combinedYears<0);
 assert.match(summaries[slug].cost[2],/independent/);
 const page=readFileSync(new URL(`../app/charities/${slug}/page.tsx`,import.meta.url),'utf8');
 assert.match(page,/preventionModelContent/);assert.match(page,/compactMoney.format\(current.costPerBetterLifeUSD!\)/);
}
console.log('PASS: both current report models, rankings, independent sensitivities, signed harm and frozen first-calibration history.');

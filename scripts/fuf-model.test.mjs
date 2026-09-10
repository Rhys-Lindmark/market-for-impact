import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {calculate,scenarios,finiteDiscountedSurvivingTreeYears} from '../lib/fuf-model.mjs';
const saved=JSON.parse(fs.readFileSync(new URL('../data/sf/fuf-accepted-results.json',import.meta.url),'utf8'));
test('FUF preserves accepted signed estimates and finite declining survival',()=>{
 const r=calculate();for(const k of ['netQaly','modeledOrdinaryGiftCostPer10Qaly','modeledGrossResourceCostPer10Qaly','favorableTailShareOfNetQaly'])assert.equal(r.weighted[k],saved.weighted[k]);
 assert.ok(finiteDiscountedSurvivingTreeYears(.75,.06,12)<finiteDiscountedSurvivingTreeYears(.75,0,12));
 assert.equal(r.inputs.fy2024TreesPlanted,1412);assert.equal(r.inputs.fy2024ExpenseUsd,5673426);
});
test('FUF retains real harm, null and zero-funding cases',()=>{
 const r=calculate();assert.ok(r.scenarios[0].netQaly<0);assert.equal(r.scenarios[1].netQaly,0);
 const z=calculate(undefined,scenarios.map(s=>({...s,fundingAdditionality:0})));
 for(const k of ['modeledOrdinaryGiftCostPer10Qaly','modeledGrossResourceCostPer10Qaly','bayImpactShare','sfImpactShare'])assert.equal(z.weighted[k],null);
 assert.equal(z.weighted.netQaly,0);assert.ok(r.weighted.favorableTailShareOfNetQaly>.84);assert.ok(r.noFavorableTail.modeledOrdinaryGiftCostPer10Qaly>6e6);
});
test('FUF site-attribution is nested and marginal prices are unverified',()=>{
 const r=calculate();assert.equal(r.weighted.bayImpactShare,1);assert.equal(r.weighted.sfImpactShare,1);
 for(const s of r.scenarios){assert.equal(s.sfQaly,s.bayQaly);assert.equal(s.verifiedMarginalGiftCostPer10Qaly,null);}
 assert.equal(r.inputs.fy2025ExpenseUsd-r.inputs.fy2025RevenueUsd,268035);
});

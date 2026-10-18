import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate} from '../lib/hope-independent-anchor.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const packet=JSON.parse(readFileSync(new URL('../docs/geography-discovery/hope-original-anchor-2026-10-01.calculations.json',import.meta.url),'utf8'));
for(const entry of packet.cases){const r=calculate(entry.overrides);close(r.bayEquivalentYears,entry.bayEquivalentYears);if(entry.bayPrice===null)assert.equal(r.bayPrice,null);else close(r.bayPrice,entry.bayPrice);}
const c=calculate();close(c.bayPrice,931745.122448699);close(c.healthBayYears+c.incomeBayYears+c.burdenBayYears,c.bayEquivalentYears);
close(c.healthAllRegionsYears*.95,c.healthBayYears);close(c.incomeAllRegionsYears*.95,c.incomeBayYears);
const oldReach=calculate({riskNetworkShare:.8,purchaserShare:0});close(oldReach.bayPrice,554659.551727141);
assert.ok(calculate({purchaserShare:.2}).healthBayYears<c.healthBayYears);
assert.ok(calculate({purchaserShare:.2}).incomeBayYears>c.incomeBayYears);
assert.equal(calculate({fundingResponse:0}).bayPrice,null);
assert.ok(calculate({fundingResponse:0,inducedBurdenExposure:1}).bayEquivalentYears<0);
assert.equal(calculate({portfolioShare:0}).bayPrice,null);
for(const input of [{giftUSD:1001},{unknown:1},{netPurchaserSavingUSD:-50000},{rescueIncrement:.3},{horizonYears:Infinity},{activeYears:2}])assert.throws(()=>calculate(input),RangeError);
console.log(`${packet.cases.length} independent HOPE cases plus counterfactual, signed, geography and domain checks PASS.`);
for(const input of [null,[],42,'',false,{annualOverdoseEvents:11},{otherMortalityHazard:2},{postHazard:2},{discount:2},{serviceDelayYears:21},{incomeReceiptYear:21},{burdenReceiptYear:21}])assert.throws(()=>calculate(input),RangeError);

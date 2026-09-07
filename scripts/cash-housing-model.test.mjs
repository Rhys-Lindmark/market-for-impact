import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cashHousingModel} from '../lib/cash-housing-model.mjs';
const model=JSON.parse(readFileSync(new URL('../data/san-francisco/larkin-cash-housing-cea-v1.json',import.meta.url)));
const central=model.scenarios[1];
test('Larkin central cash dose and explicit housing health bridge reproduce',()=>{
 const r=cashHousingModel(central);assert.equal(r.costPerParticipant,50500);assert.equal(r.incrementalQalys,.0125);assert.equal(r.costPerTenQalys,40400000);assert.equal(r.cashOnlyMaxHealthFloor,162000);assert.equal(r.qalysNeededForSub100k,5.05);
});
test('cash housing null effect never becomes a finite positive price',()=>{
 for(const key of ['additionalHousingYears','utilityGain','additionality'])assert.equal(cashHousingModel({...central,[key]:0}).costPerTenQalys,null);
});
test('cash housing validates bounded horizon and finite inputs',()=>{
 for(const override of [{cashUsd:-1},{supportUsd:NaN},{additionalHousingYears:3},{utilityGain:1.1},{additionality:2},{horizonYears:0},{cashUsd:0,supportUsd:0}])assert.throws(()=>cashHousingModel({...central,...override}),RangeError);
});
test('positive stress cases ordered; gifts scale benefits not price',()=>{
 const prices=model.scenarios.map(s=>cashHousingModel(s).costPerTenQalys);assert.ok(prices[0]<prices[1]&&prices[1]<prices[2]);assert.equal(cashHousingModel({...central,giftUsd:200000}).additionalQalys,2*cashHousingModel(central).additionalQalys);
});

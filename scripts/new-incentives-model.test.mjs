import test from 'node:test';import assert from 'node:assert/strict';
import data from '../data/international/new-incentives-cea-v1.json' with {type:'json'};
import {newIncentivesModel} from '../lib/new-incentives-model.mjs';
test('New Incentives rejects impossible fractions and transfer cost',()=>{for(const patch of [{coreAllocation:2},{utility:2},{cashTransferPerEligibleInfant:1e6}])assert.throws(()=>newIncentivesModel({...data.scenarios[0],...patch}),RangeError);});
test('New Incentives matches all independently audited scenarios',()=>{for(const s of data.scenarios){const r=newIncentivesModel(s,data.giftUsd);assert.ok(Math.abs(r.netGlobalQaly-s.outputs.netGlobalQaly)<1e-8);assert.equal(r.bayUsdPer10Qaly,null);if(s.outputs.donorUsdPer10Qaly===null)assert.equal(r.globalUsdPer10Qaly,null);else assert.ok(Math.abs(r.globalUsdPer10Qaly-s.outputs.donorUsdPer10Qaly)<.001);}});

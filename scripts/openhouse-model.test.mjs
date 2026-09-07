import test from 'node:test';
import assert from 'node:assert/strict';
import model from '../data/san-francisco/openhouse-companionship-cea-v1.json' with { type: 'json' };
import { supportiveHealthModel } from '../lib/supportive-health-model.mjs';
test('Openhouse scenarios retain expected health-only prices',()=>{const results=model.scenarios.map(s=>supportiveHealthModel(s));assert.ok(Math.abs(results[0].costPerTenQalys-592592.5925925926)<.01);assert.ok(Math.abs(results[1].costPerTenQalys-5333333.333333334)<.01);assert.equal(results[2].costPerTenQalys,320000000);assert.equal(results[1].additionalQalys,.1875);});
test('Openhouse no capacity and harmful contact have no positive price',()=>{assert.equal(supportiveHealthModel({...model.scenarios[1],additionality:0}).costPerTenQalys,null);assert.ok(supportiveHealthModel({...model.scenarios[1],utilityGain:-.01}).additionalQalys<0);});

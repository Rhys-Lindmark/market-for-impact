import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { directQalyModel } from '../lib/direct-qaly-model.mjs';
const m = JSON.parse(readFileSync(new URL('../data/san-francisco/huckleberry-counseling-cea-v1.json', import.meta.url)));
test('Huckleberry transfers an already integrated QALY endpoint exactly once', () => {
 const r = directQalyModel(m.scenarios[1]);
 assert.ok(Math.abs(r.costPerTenQalys - 3692307.6923076925) < .01);
 assert.equal(r.qalysPerOfferedCourse, .0065);
 assert.equal(m.fundingRoom.verifiedUsd, null);
});
test('Huckleberry null and invalid cases cannot appear as finite positive prices', () => {
 assert.equal(directQalyModel({...m.scenarios[1], additionality:0}).costPerTenQalys, null);
 assert.throws(()=>directQalyModel({...m.scenarios[1], transferRetention:2}));
 assert.throws(()=>directQalyModel({...m.scenarios[1], costPerOfferedCourse:0}));
 assert.throws(()=>directQalyModel({...m.scenarios[1], trialQalys:-1}));
});

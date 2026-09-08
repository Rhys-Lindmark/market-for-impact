import test from 'node:test';import assert from 'node:assert/strict';
import {benchmarkConversion,finiteSurvivalQaly,givewellBenchmarks} from '../lib/givewell-reconciliation.mjs';
test('Benchmarks distinguish perlife perQ and per10Q without double attribution',()=>{
 assert.equal(benchmarkConversion(5000,50).usdPerQaly,100);assert.equal(benchmarkConversion(5000,50).usdPer10Qalys,1000);
 assert.ok(Math.abs(finiteSurvivalQaly()-13.6461367536)<1e-8);
 assert.equal(givewellBenchmarks[0].illustrative50Conversion.usdPer10Qalys,1100);
 assert.equal(givewellBenchmarks[1].illustrative50Conversion.usdPer10Qalys,900);
 assert.ok(benchmarkConversion(5500,finiteSurvivalQaly(),2.5).usdPer10Qalys>benchmarkConversion(5500,finiteSurvivalQaly()).usdPer10Qalys);
 for(const args of [[0,50],[5000,0],[NaN,50],[5000,50,-1]])assert.throws(()=>benchmarkConversion(...args));
 assert.throws(()=>finiteSurvivalQaly({years:Infinity}));assert.throws(()=>finiteSurvivalQaly({utility:2}));
});

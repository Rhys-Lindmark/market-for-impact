import test from 'node:test';
import assert from 'node:assert/strict';
import {localImpact,spilloverScenario} from '../lib/local-impact-model.mjs';
test('Local model conserves national health and allocates independent harms separately',()=>{
 const p={gift:10000,sharedQ:1.312953397485858,sfShare:.005,bayShare:.02};
 const r=localImpact(p);assert.ok(Math.abs(r.sfUsdPer10Q-15232833.12134117)<.001);
 assert.ok(Math.abs(r.bayQ+r.outsideBayQ-r.nationalQ)<1e-12);
 const h=localImpact({...p,independentHarm:.1,harmSfShare:1,harmBayShare:1});assert.ok(h.sfQ<0);assert.equal(h.sfUsdPer10Q,null);
 const z=localImpact({...p,sfShare:0});assert.equal(z.sfUsdPer10Q,null);assert.ok(z.bayQ>0);
 assert.throws(()=>localImpact({...p,independentHarm:.1}));
 for(const patch of [{sfShare:.5,bayShare:.1},{gift:0},{sharedQ:NaN},{harmSfShare:1,harmBayShare:0}])assert.throws(()=>localImpact({...p,...patch}));
});
test('Spillovers are additional resident health, with zero/nonpositive local ratios null',()=>{
 const r=spilloverScenario(10,100,1e-6,1e-5);
 assert.equal(r.globalInclusiveQ,10+10e-5);assert.ok(Math.abs(r.sfUsdPer10Q-1e8)<.001);
 assert.equal(spilloverScenario(10,100,0,0).sfUsdPer10Q,null);assert.equal(spilloverScenario(-10,100,1e-6,1e-5).sfUsdPer10Q,null);
 assert.throws(()=>spilloverScenario(10,100,.2,.1));
});

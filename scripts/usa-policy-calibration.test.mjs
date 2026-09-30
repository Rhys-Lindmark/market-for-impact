import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateClinicalPolicy,evaluateEnergyPolicy} from '../lib/usa-policy-calibration.mjs';
const clinical={costUSD:100,patients:1000,annualQalyGain:.1,earlierYears:.5,reformProbability:.5,approvalProbability:.1,incrementalBenefitProbability:.5,organizationAttribution:.2,fundingAdditionality:.5,usShare:.5,delayYears:10,discountRate:.03};
const energy={costUSD:100,capacityGW:1,capacityFactor:.9,earlierYears:1,netDisplacement:.5,deathsPerTWh:1,qalyPerDeath:10,reformProbability:.5,buildProbability:.5,organizationAttribution:.2,fundingAdditionality:.5,usShare:1,delayYears:10,discountRate:.03};
test('clinical probabilities condition different events; delay discounts, not benefit duration',()=>{
 const r=evaluateClinicalPolicy(clinical);
 assert.equal(r.editionQalys,1000*.1*.5*.5*.1*.5*.2*.5*.5/1.03**10);
 assert.equal(evaluateClinicalPolicy({...clinical,earlierYears:1}).editionQalys,r.editionQalys*2);
 assert.equal(evaluateClinicalPolicy({...clinical,approvalProbability:0}).pricePerBetterLife,null);
 assert.ok(evaluateClinicalPolicy({...clinical,delayYears:0}).editionQalys>r.editionQalys);
});
test('GW to TWh conversion and construction/displacement failure points are explicit',()=>{
 const r=evaluateEnergyPolicy(energy);assert.equal(r.annualTWh,7.884);
 assert.equal(r.editionQalys,7.884*.5*1*10*.5*.5*.2*.5/1.03**10);
 for(const key of ['buildProbability','netDisplacement','fundingAdditionality'])assert.equal(evaluateEnergyPolicy({...energy,[key]:0}).editionQalys,0);
});
test('invalid inputs cannot silently produce an apparent favorable return',()=>{
 assert.throws(()=>evaluateClinicalPolicy({...clinical,approvalProbability:2}));
 assert.throws(()=>evaluateClinicalPolicy({...clinical,delayYears:-1}));
 assert.throws(()=>evaluateEnergyPolicy({...energy,costUSD:0}));
 assert.throws(()=>evaluateEnergyPolicy({...energy,capacityFactor:Infinity}));
});

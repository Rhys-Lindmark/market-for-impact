import assert from 'node:assert/strict';
import baseline from '../data/bay/heppac-event-linear-v1-baseline.json' with {type:'json'};
import saved from '../data/bay/heppac-cohort-v2-results.json' with {type:'json'};
import {calculate} from '../lib/heppac-model.mjs';
import {calculate as archivedCalculate} from '../lib/heppac-event-linear-v1.mjs';
assert.deepEqual(archivedCalculate(),baseline);
const b=JSON.stringify(baseline),r=calculate();assert.equal(r.expense,4953186);assert.equal(r.noBenefit.weight,.2);
assert.deepEqual(r,saved);
for(let i=0;i<3;i++){const n=r.results[i],o=baseline.results[i];assert.equal(n.inputs.weight,o.inputs.weight);assert.equal(n.pathwayQalyRaw.moud,o.pathwayQalyRaw.moud);assert.equal(n.pathwayQalyRaw.syringe,o.pathwayQalyRaw.syringe);assert.equal(n.pathwayQalyRaw.drugChecking,o.pathwayQalyRaw.drugChecking);assert(n.cohortResult.qaly<=n.cohortResult.maximumAbsoluteQaly);assert.equal(n.conditionalOrdinaryGift.grossResources,o.conditionalOrdinaryGift.grossResources)}
assert(calculate({repeatScale:100}).results.every(x=>x.cohortResult.qaly<=x.cohortResult.maximumAbsoluteQaly));
assert(calculate({rescueIncrement:-1}).results.every(x=>x.pathwayQalyRaw.naloxone<0));
assert(calculate({rescueIncrement:0}).results.every(x=>x.pathwayQalyRaw.naloxone===0));
assert(calculate({harmPerPerson:.01}).conditionalOrdinaryGiftWeighted.weightedBayGiftQaly<r.conditionalOrdinaryGiftWeighted.weightedBayGiftQaly);
for(const x of[null,42,[],true])assert.throws(()=>calculate(x));for(const x of[NaN,Infinity,0])assert.throws(()=>calculate({repeatScale:x}));
assert.equal(JSON.stringify(baseline),b);assert.deepEqual(calculate(),r);
console.log(JSON.stringify({status:'PASS',old:r.originalEventLinearBayPrice,new:r.conditionalOrdinaryGiftWeighted.bayDonorPer10Qaly,diagnostics:Object.fromEntries(Object.entries({repeat10:{repeatScale:10},oldMortality:{useOldSevereMortality:true},horizon2:{horizonCap:2},harm:{harmPerPerson:.01},rescueNull:{rescueIncrement:0},rescueAdverse:{rescueIncrement:-1}}).map(([k,v])=>[k,calculate(v).conditionalOrdinaryGiftWeighted.bayDonorPer10Qaly]))}));

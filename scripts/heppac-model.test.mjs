import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculate} from '../lib/heppac-model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)));

test('HEPPAC integrates all weights including the explicit no-benefit case',()=>{
 const r=calculate(), w=r.conditionalOrdinaryGiftWeighted;
 close(Object.values(w.scenarioWeights).reduce((a,b)=>a+b,0),1);
 assert.equal(w.scenarioWeights['no-benefit'],0.2);
 assert.equal(r.noBenefit.giftQaly,0);
 assert.equal(r.ordinaryGift,100000);
 close(w.weightedGiftQaly,r.results.reduce((sum,s)=>sum+s.inputs.weight*s.conditionalOrdinaryGift.giftQaly,0));
 close(w.donorPer10Qaly,1000000/w.weightedGiftQaly);
 assert.ok(w.donorPer10Qaly>1e7 && w.donorPer10Qaly<1.2e7);
});

test('HEPPAC finite survival and gift attribution reproduce independently',()=>{
 const r=calculate();
 for(const s of r.results){
  const p=s.inputs, ratio=p.survival.annualSurvival/(1+p.survival.discount);
  close(s.perFatalEventQaly,p.survival.utility*(1-ratio**p.survival.horizon)/(1-ratio));
  const g=s.conditionalOrdinaryGift;
  close(g.giftQaly,s.totalQaly*(r.ordinaryGift*p.giftDeployableShare/r.expense)*p.giftRealizationDiscount);
  assert.ok(g.giftSfQaly<=g.giftBayQaly && g.giftBayQaly<=g.giftQaly);
  close(s.totalQaly,s.sharedMortalityRaw*p.mortalityOverlapAdjustment+s.pathwayQalyRaw.syringe);
 }
});

test('HEPPAC local denominator retains the full donation cost',()=>{
 const w=calculate().conditionalOrdinaryGiftWeighted;
 close(w.bayDonorPer10Qaly,w.gift*10/w.weightedBayGiftQaly);
 close(w.sfDonorPer10Qaly,w.gift*10/w.weightedSfGiftQaly);
 assert.ok(w.sfDonorPer10Qaly>w.bayDonorPer10Qaly && w.bayDonorPer10Qaly>w.donorPer10Qaly);
 assert.ok(calculate().zeroCreditPathways.length>=7);
});

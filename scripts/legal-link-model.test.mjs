import test from 'node:test';
import assert from 'node:assert/strict';
import {anchors,scenarios,evaluateScenario,runModel} from '../lib/legal-link-model.mjs';
test('whole costs and annual geography anchors',()=>{
 assert.equal(anchors.expense,515395+180776+69660);
 assert.equal(anchors.annualCertified,195+84+90+124+93);
 assert.equal(anchors.cashAndTemporary,286980+222787);
});
test('signed worlds preserve nulls and harms',()=>{
 const r=runModel(); assert.equal(r.rows[0].bayQ,0);assert.equal(r.rows[1].bayQ,0);
 assert.ok(r.rows[2].bayQ<0);assert.equal(r.rows[2].bayCostPer10,null);
 assert.ok(r.bayQ<r.rows.reduce((a,s)=>a+s.weight*Math.max(0,s.bayQ),0));
});
test('Bay and SF remain nested for both signs',()=>{
 for(const s of runModel().rows){assert.ok(Math.abs(s.sfQ)<=Math.abs(s.bayQ));
 assert.ok(Math.abs(s.bayQ)<=Math.abs(s.modeledTrainingQ));}
});
test('linear diagnostic only; zero gift and unknown gross stay null',()=>{
 assert.equal(runModel(0).bayCostPer10,null);
 assert.equal(runModel().verifiedMarginalGrossCostPer10,null);
 assert.equal(runModel().completeSocietalCostPer10,null);
 assert.equal(runModel(50000).bayQ,runModel().bayQ/2);
});
test('reject invalid inputs and unbounded extrapolation',()=>{
 for(const g of [-1,100001,NaN,Infinity])assert.throws(()=>runModel(g));
 for(const s of [{...scenarios[4],duration:3},{...scenarios[4],funding:NaN},{...scenarios[4],active:2}])
 assert.throws(()=>evaluateScenario(s));
 assert.throws(()=>runModel(100000,[scenarios[4]]));
});
test('causal, health, and geographic gates actually gate',()=>{
 const c=scenarios[4];assert.equal(evaluateScenario({...c,funding:0}).bayQ,0);
 assert.equal(evaluateScenario({...c,bayWithinCalifornia:0}).bayCostPer10,null);
 assert.ok(evaluateScenario({...c,resolutionIncrement:0}).bayQ<0);
});
test('locked first-run snapshots and report agreement',async()=>{
 const r=runModel();
 assert.ok(Math.abs(r.bayQ-.21675930628934123)<1e-14);
 assert.ok(Math.abs(r.bayCostPer10-4613412.070368732)<1e-6);
 assert.ok(Math.abs(r.sfCostPer10-10255136.989434794)<1e-6);
 assert.equal(r.subjectiveMassBelow1m,.05); assert.equal(r.subjectiveMassBelow100k,0);
 assert.ok(Math.abs(r.favorableShareOfSignedQ-.9972924677424321)<1e-14);
 const {readFile}=await import('node:fs/promises');
 const report=JSON.parse(await readFile(new URL('../data/bay/legal-link-report.json',import.meta.url),'utf8'));
 assert.equal(report.modelVersion,r.modelVersion);
 assert.equal(report.model.equation.result,'$4,613,412 per 10 modeled Bay QALYs');
 assert.ok(!Object.hasOwn(report,'donationUrl'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,diagnostics,incomeJudgments} from '../docs/geography-discovery/recares-recalibration-2026-10-01.mjs';
import {calculate as previous,inputs} from '../lib/recares-v2-model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));
test('zero income reconstructs the original marginal health model exactly',()=>{
 const d=diagnostics();const old=previous();
 for(const r of d.marginalNoIncome.rows){const p=old.rows.find(x=>x.name===r.name);close(r.healthYears,p.bayQaly);close(r.totalYears,p.bayQaly);assert.equal(r.costUSD,10000);}
 close(d.marginalNoIncome.weighted.usdPerBetterLife,old.weighted.bayDonorCostPer10Qaly);
});
test('annual-work model removes only funding throughput, not recipient counterfactual access',()=>{
 const d=diagnostics();const central=d.annual.rows.find(r=>r.name==='central');
 close(central.uniqueRecipients,11000*.65);
 close(central.healthYears,previous().rows.find(r=>r.name==='central').bayQaly*inputs.totalExpenseUsd/10000/.5);
 assert.equal(central.costUSD,72583);
});
test('signed income harms and zero remain in the denominator',()=>{
 const d=calculate();assert.ok(d.rows.find(r=>r.name==='harm').incomeYears<0);
 assert.equal(d.rows.find(r=>r.name==='null').totalYears,0);
 assert.equal(d.rows.find(r=>r.name==='harm').usdPerBetterLife,null);
 assert.ok(d.rows.find(r=>r.name==='central').incomeYears>0);
});
test('no health benefit is silently booked to the same counterfactual purchaser',()=>{
 assert.throws(()=>calculate({judgments:{...incomeJudgments,central:{...incomeJudgments.central,purchaseShare:.9}}}),/overlapping/);
 assert.throws(()=>calculate({scope:'invented'}),/scope/);
});
test('lower clinical family and absent income worsen positive central prices',()=>{
 const d=diagnostics(),central=x=>x.rows.find(r=>r.name==='central').usdPerBetterLife;
 assert.ok(central(d.marginalLowerClinical)>central(d.marginal));
 assert.ok(central(d.marginalNoIncome)>central(d.marginal));
});
test('income uncertainty is independent of health, not forced to share its sign',()=>{
 const d=diagnostics(),central=x=>x.rows.find(r=>r.name==='central');
 assert.equal(central(d.marginalNullHealth).healthYears,0);
 assert.ok(central(d.marginalNullHealth).incomeYears>0);
 assert.ok(central(d.marginalNoIncome).healthYears>0);
 assert.equal(central(d.marginalNoIncome).incomeYears,0);
 assert.ok(central(d.marginalAdverseIncome).incomeYears<0);
 assert.ok(central(d.marginalAdverseIncome).usdPerBetterLife>central(d.marginalNoIncome).usdPerBetterLife);
});
test('unknown and invalid savings inputs cannot bypass validation in a zero-person case',()=>{
 for(const value of [NaN,Infinity,-20000])assert.throws(()=>calculate({judgments:{...incomeJudgments,null:{...incomeJudgments.null,netSavingsUSD:value}}}),/income inputs/);
});

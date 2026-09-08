import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/san-francisco/hearing-access-cea-v2.json' with {type:'json'};
import {hearingAccessModel} from '../lib/hearing-access-model.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));
test('hearing scenarios recompute finite exposure and cash/resource outputs',()=>{
 for(const s of data.scenarios){
  const r=hearingAccessModel(s);close(r.effectiveYears,s.effective_incremental_years);close(r.netQalys,s.qaly_per_offer);
  if(s.cash_cost_per_10_qaly===null){assert.equal(r.costPerTenQalys,null);assert.equal(r.resourceCostPerTenQalys,null);}
  else {close(r.costPerTenQalys,s.cash_cost_per_10_qaly);close(r.resourceCostPerTenQalys,s.resource_cost_per_10_qaly);}
 }
 assert.equal(data.scenarios[1].calendar_horizon_years,4);
 assert.equal(data.scenarios[1].cash_components.support_batteries_repairs,150);
});
test('hearing null and independent harm do not become negative bargains',()=>{
 assert.equal(hearingAccessModel(data.scenarios.find(s=>s.name==='zero_funding_shared_harm_cancels')).netQalys,0);
 assert.equal(hearingAccessModel(data.scenarios.find(s=>s.name==='zero_funding_independent_harm_persists')).netQalys,-0.001);
 const s=data.scenarios[0];
 assert.throws(()=>hearingAccessModel({...s,calendar_horizon_years:5}));
 assert.throws(()=>hearingAccessModel({...s,annual_incremental_benefit_fractions:[1.1]}));
 assert.throws(()=>hearingAccessModel({...s,supportBudgetCoversEntireCalendarWindow:false}));
 assert.throws(()=>hearingAccessModel({...s,cash_cost_per_offer:1}));
});
test('hearing identity and shared-outcome constraints persist',()=>{
 assert.match(data.current_charitable_eligibility,/2025-11-15/);
 assert.match(data.current_charitable_eligibility,/subsequent reinstatement/);
 assert.equal(data.shared_outcome_ledger_key,'phc-hsc-adult-hearing-aid-access');
 assert.ok(data.thresholds.central_required_effective_years_at_1500_cash>data.scenarios[0].calendar_horizon_years);
});

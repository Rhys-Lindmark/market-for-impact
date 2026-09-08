import test from 'node:test';
import assert from 'node:assert/strict';
import hac from '../data/san-francisco/hac-developer-pathway-cea-v1.json' with {type:'json'};
import spur from '../data/san-francisco/spur-clean-heat-cea-v1.json' with {type:'json'};
import {hacModel,resolveHacScenario,spurModel} from '../lib/urban-policy-model.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
test('all HAC scenarios resolve inheritance and recompute signed outcomes',()=>{
 for(const s of hac.scenarios){const r=hacModel(resolveHacScenario(hac,s));close(r.netQalys,s.incremental_qalys);assert.equal(r.status,s.outcome_status);s.cost_per_10_qalys_usd===null?assert.equal(r.costPerTenQalys,null):close(r.costPerTenQalys,s.cost_per_10_qalys_usd);}
 close(hac.cost_perspective.donor_cost_central_components.reduce((n,s)=>n+s.cost_usd,0),15000);
 assert.equal(hac.cost_perspective.full_resource_cost_usd,null);
});
test('historical SPUR clean-heat outcomes remain reproducible after portfolio revision',()=>{
 for(const s of spur.scenarios){const r=spurModel(s);close(r.netQalys,s.netQalys);assert.equal(r.status,s.signedStatus);s.usdPerTenQalys===null?assert.equal(r.costPerTenQalys,null):close(r.costPerTenQalys,s.usdPerTenQalys);}
 close(spurModel(spur.scenarios[0]).costPerTenQalys,13661202.18579235);
 assert.equal(researchCostRanking.find(s=>s.slug==='housing-action-coalition').centralUsdPerTenQalys,15000000);
});
test('nulls preserve donor cost, independent harm survives replacement, invalid inputs fail',()=>{
 const h=hac.scenarios[0],s=spur.scenarios[0];
 assert.equal(hacModel({...h,funding_additionality_a:0}).costPerTenQalys,null);
 assert.equal(hacModel({...h,funding_additionality_a:0,donor_specific_harm_qalys:0.001}).netQalys,-0.001);
 assert.equal(spurModel({...s,contribution:0,harm:0.01}).netQalys,-0.01);
 assert.equal(spurModel({...s,effectiveYears:0}).costPerTenQalys,null);
 assert.throws(()=>hacModel({...h,donor_cost_usd:-1}));
 assert.throws(()=>hacModel({...h,funding_additionality_a:1.1}));
 assert.throws(()=>spurModel({...s,sfShare:2}));
 assert.throws(()=>spurModel({...s,effectiveYears:NaN}));
 assert.throws(()=>resolveHacScenario(hac,{inherits:'missing'}));
});
test('finite delayed HAC health horizon is interpretation, not an extra multiplier',()=>{
 const k=Math.log(1.03),start=3;
 close(Math.exp(-k*start)*(1-Math.exp(-k*5.958932811498))/k,5);
 close(hacModel(hac.scenarios[0]).netQalys,0.01);
 close(7500/(10000*0.05),15);
});

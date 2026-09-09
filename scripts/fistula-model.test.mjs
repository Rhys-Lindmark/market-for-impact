import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculate,integrate} from '../lib/fistula-model.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/international/fistula-'+({model:'model-v1','report-content':'report',results:'results'}[n])+'.json',import.meta.url)));
const m=read('model'), r=read('report-content'), saved=read('results');
let checks=0;const ck=x=>{assert.ok(x);checks++;};const near=(a,b,t=1e-9)=>ck(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)));
const cash=n=>'$'+Math.round(n).toLocaleString('en-US'), price=n=>n===null?'No finite positive ratio':cash(n)+'/10 QALYs';
ck(m.scenarios.length===15);ck(r.model.sensitivity.length===15);
near(m.observed.program_expenses_2024+m.observed.management_2024+m.observed.fundraising_2024,m.observed.expenses_2024_usd);
for(const [i,s]of m.scenarios.entries()){
 const p={...m.central_inputs,...s.overrides},v=calculate(p), row=r.model.sensitivity[i];
 assert.deepEqual(saved[i],{case:s.id,...v});checks++;
 assert.deepEqual(Object.keys(row).sort(),['case','detail','headline']);checks++;
 ck(row.case===s.id.replaceAll('_',' '));ck(row.headline==='Total resources: '+price(v.resource_per_10q));
 ck(row.detail.includes('donor '+price(v.donor_per_10q)));ck(row.detail.includes('gross resources '+cash(v.gross_resource_usd)));ck(row.detail.includes('Status: '+v.status));
 near(Number(row.detail.match(/All-region QALYs ([-.\de+]+)/)[1]),v.all_region_q);
 ck(v.gift_usd===100000);ck(v.gross_resource_usd>=v.gift_usd);ck(v.sf_direct_q===0&&v.bay_direct_q===0);ck(v.sf_indirect_q===null&&v.bay_indirect_q===null);
 near(v.gross_q-v.procedure_harm_q-p.independent_harm_q,v.all_region_q);
 if(v.all_region_q>0){near(v.donor_per_10q*v.all_region_q,1000000);near(v.resource_per_10q*v.all_region_q,10*v.gross_resource_usd);}else ck(v.donor_per_10q===null&&v.resource_per_10q===null);
 // Independent midpoint integration of the health-time stream.
 const n=5000,dt=p.advantage_years/n;let integral=0;
 for(let j=0;j<n;j++){const t=(j+.5)*dt;integral+=dt*(1+p.discount_rate)**(-(p.delay_years+t))*Math.exp(-p.annual_mortality*(p.delay_years+t)-p.annual_effect_decay*t);}
 near(integral,v.finite_health_years,1e-8);
}
near(integrate(5,0),5);near(integrate(5,1e-14),5);
const c=calculate(m.central_inputs);ck(c.resource_per_10q>100000);ck(saved.find(v=>v.case==='fast_public_catchup').resource_per_10q>100000);ck(typeof r.model.giftHeading==='string');
near(m.central_inputs.dry_fraction,21/44);near(m.central_inputs.partial_fraction,13/44);
for(const k of Object.keys(m.central_inputs)){const p={...m.central_inputs};delete p[k];assert.throws(()=>calculate(p));checks++;}
for(const bad of [{gift_usd:Number.MAX_VALUE},{expense_per_surgery_2024:Number.MAX_VALUE,marginal_cost_multiplier:2},{expense_per_surgery_2024:Number.MIN_VALUE,marginal_cost_multiplier:Number.MIN_VALUE}]){assert.throws(()=>calculate({...m.central_inputs,...bad}));checks++;}
ck(saved.find(v=>v.case==='no_funding_additionality').all_region_q===0);
ck(saved.find(v=>v.case==='independent_harm_zero_activity').all_region_q===-1);
ck(saved.find(v=>v.case==='signed_worsening').all_region_q<0);
near(saved.find(v=>v.case==='all_external_resources_donor_paid').donor_per_10q,c.resource_per_10q);
for(const bad of [{dry_fraction:.8,partial_fraction:.4},{financial_additionality:1.1},{dry_utility_gain:2},{gift_usd:0},{advantage_years:Infinity},{advantage_years:41},{annual_mortality:-1}]){assert.throws(()=>calculate({...m.central_inputs,...bad}));checks++;}
let state=71;const rand=()=>{state=(1664525*state+1013904223)>>>0;return state/2**32;};
for(let i=0;i<1000;i++){
 const p={...m.central_inputs,advantage_years:rand()*40,discount_rate:rand()*.1,annual_mortality:rand()*.1,annual_effect_decay:rand()*.2,dry_utility_gain:rand()*2-1,partial_utility_gain:rand()*2-1,financial_additionality:rand()};
 const v=calculate(p);ck(Number.isFinite(v.all_region_q));ck(v.finite_health_years>=0&&v.finite_health_years<=p.advantage_years+1e-10);
 const upper=calculate({...p,dry_utility_gain:1,partial_utility_gain:1,procedure_harm_q:0});ck(v.all_region_q<=upper.all_region_q+1e-10);
}
console.log(JSON.stringify({accepted:true,checks,scenarios:15,finiteDomainTests:1000,sourceVerification:'Primary finance and clinical limitations documented in review; tests verify mathematics, not causal truth.'},null,2));

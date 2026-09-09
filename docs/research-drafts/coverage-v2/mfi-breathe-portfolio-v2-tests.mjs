import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,BOUNDS} from './mfi-breathe-portfolio-v2-calculator.mjs';
import {calculate as oldCalculate} from './mfi-breathe-portfolio-calculator.mjs';
const m=JSON.parse(fs.readFileSync(new URL('./mfi-breathe-portfolio-v2-model.json',import.meta.url)));
let checks=0;const ok=x=>{assert.ok(x);checks++;};const near=(a,b)=>ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
for(const s of m.scenarios){
 const r=calculate(m,s),p={...m.foundation,...s.foundation},x={...m.inputs,...s.inputs},o=oldCalculate(p);
 near(r.cpap_nominal_episodes,p.gift_usd*x.cpap_allocation/x.cpap_cash_per_episode);
 near(r.cpap_net_qaly,r.cpap_nominal_episodes*x.cpap_additionality*x.cpap_qaly_one_year*x.cpap_relative_transfer/(1+p.discount)**x.cpap_delay);
 let a=0;const n=10000,h=p.asthma_years/n;for(let i=0;i<n;i++)a+=Math.exp(-Math.log1p(p.discount)*((i+.5)*h+p.asthma_delay))*h;
 near(r.adult_asthma_net_qaly,o.additional_asthma_people*(1-p.asthma_child_fraction)*x.adult_asthma_homevisit_fraction*x.adult_asthma_days_per_fortnight/14*x.adult_asthma_transfer*x.adult_asthma_symptom_utility_gap*a);
 near(r.gross_partial_resource_usd,o.gross_resource_usd+r.cpap_nominal_episodes*x.cpap_outside_per_episode);
 assert.equal(r.whole_organization_expected_qaly,null);checks++;
 for(const g of ['us','bay','sf']){const cs=g==='us'?1:x['cpap_'+g+'_share'],as=g==='us'?1:p['asthma_'+g+'_share'];near(r[g].qaly,o[g].qaly+r.cpap_net_qaly*cs+r.adult_asthma_net_qaly*as);if(r[g].qaly>0&&p.gift_usd>0){near(r[g].donor_per_10q,10*p.gift_usd/r[g].qaly);near(r[g].gross_partial_resource_per_10q,10*r.gross_partial_resource_usd/r[g].qaly);}else {assert.equal(r[g].donor_per_10q,null);assert.equal(r[g].gross_partial_resource_per_10q,null);checks+=2;}}
}
for(const k of Object.keys(BOUNDS)){const copy=structuredClone(m);delete copy.inputs[k];assert.throws(()=>calculate(copy));checks++;for(const val of [NaN,Infinity,-Infinity,null,'1']){assert.throws(()=>calculate(m,{inputs:{[k]:val}}));checks++;}}
assert.throws(()=>calculate(m,{inputs:{cpap_sf_share:1,cpap_bay_share:0}}));checks++;
assert.throws(()=>calculate(m,{inputs:{cpap_allocation:1}}));checks++;
assert.throws(()=>calculate(m,{inputs:{cpap_qaly_one_year:1,cpap_relative_transfer:2}}));checks++;
let seed=62519;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<200;i++){const s={inputs:{cpap_qaly_one_year:rand()*.1-.05,cpap_additionality:rand(),cpap_relative_transfer:rand()*2,adult_asthma_days_per_fortnight:rand()*8-4,adult_asthma_transfer:rand()},foundation:{gift_usd:rand()*1e6,discount:rand()*.1}};const r=calculate(m,s);for(const g of ['us','bay','sf'])ok(Number.isFinite(r[g].qaly));ok(Math.abs(r.cpap_net_qaly)<=r.cpap_additional_episodes);}
console.log(JSON.stringify({status:'pass',checks,scenarios:m.scenarios.length,random_cases:200}));

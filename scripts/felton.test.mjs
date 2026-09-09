import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculate,bounds} from '../lib/felton-model.mjs';
const model=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/felton-model-v1.json',import.meta.url)));
let checks=0;
const check=x=>{assert.ok(x);checks++;};
const near=(a,b,tol=1e-9)=>check(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)));
const results=model.scenarios.map(s=>({id:s.id,...calculate({...model.central_inputs,...s.overrides})}));
const get=id=>results.find(r=>r.id===id),c=get('central'),p=model.central_inputs;
for(const [i,r]of results.entries()){
 const v={...p,...model.scenarios[i].overrides};
 near(r.ep_offers*v.ep_cost+r.crisis_offers*v.crisis_cost+r.unmodeled_gift_usd,v.gift_usd);
 near(r.all_us_q,r.ep_us_q+r.crisis_us_q-v.independent_harm);
 near(r.sf_q,r.ep_us_q*v.ep_sf_share+r.crisis_us_q*v.crisis_sf_share-v.independent_harm*v.harm_sf_share);
 near(r.bay_q,r.ep_us_q*v.ep_bay_share+r.crisis_us_q*v.crisis_bay_share-v.independent_harm*v.harm_bay_share);
 for(const region of ['sf','bay','us']){
  const q=region==='us'?r.all_us_q:r[region+'_q'];
  for(const cost of ['donor','resource']){
   const ratio=r[cost+'_'+region+'_per_10q'];
   if(q<=0)check(ratio===null);else near(q*ratio,10*(cost==='donor'?v.gift_usd:r.gross_resource_usd));
  }
 }
 // Independent fine midpoint integration of the piecewise person survival curves.
 const window=v.crisis_days/365,h=-Math.log1p(-v.crisis_suicide_probability)/window;
 const reduce=h*v.crisis_residual_gap*v.crisis_relative_reduction;
 const d=Math.log1p(v.discount);let numeric=0;
 for(const [start,end]of [[0,window],[window,v.crisis_horizon]]){
  const n=10000,dt=(end-start)/n;
  for(let j=0;j<n;j++){
   const t=start+(j+.5)*dt;
   const base=(h+v.other_death_hazard)*Math.min(t,window)+(v.later_suicide_hazard+v.other_death_hazard)*Math.max(0,t-window);
   numeric+=(Math.exp(-base+reduce*Math.min(t,window))-Math.exp(-base))*v.crisis_utility*Math.exp(-d*(v.start_delay+t))*dt;
  }
 }
 near(numeric,r.crisis_survival_q_per_additional_person,1e-8);
 for(const x of Object.values(r))if(typeof x==='number')check(Number.isFinite(x));
}
check(get('no_additional_activity').all_us_q===0);check(get('null_without_harm').all_us_q===0);
check(get('no_clinical_effect_shared_harm').all_us_q<0);check(get('ep_harm').all_us_q<0);
near(get('independent_donor_harm').all_us_q,-.05);check(get('no_modeled_allocation').all_us_q===0);
near(get('one_extra_year_delay').all_us_q,c.all_us_q/1.03);
near(get('zero_external_resources_lower_bound').all_us_q,c.all_us_q);
near(get('all_modeled_health_sf').sf_q,c.all_us_q);
for(const id of ['strong_public_baseline','one_year_survival_window','higher_later_mortality','early_care_catches_up_six_months','crisis_mortality_uncredited'])check(get(id).all_us_q<c.all_us_q);
const noGift=calculate({...p,gift_usd:0});check(noGift.all_us_q===0);check(noGift.gross_resource_usd===0);
const doubled=calculate({...p,gift_usd:200000});near(doubled.all_us_q,2*c.all_us_q);near(doubled.donor_sf_per_10q,c.donor_sf_per_10q);
for(const [key,[lo,hi]]of Object.entries(bounds)){
 for(const bad of [undefined,null,NaN,Infinity,-Infinity,'1',true,lo-1,hi+1]){assert.throws(()=>calculate({...p,[key]:bad}));checks++;}
 const missing={...p};delete missing[key];assert.throws(()=>calculate(missing));checks++;
}
for(const bad of [null,[],{...p,ep_fraction:1,crisis_fraction:1},{...p,ep_sf_share:1},{...p,crisis_sf_share:1},{...p,harm_sf_share:1}]){assert.throws(()=>calculate(bad));checks++;}
const max=Object.fromEntries(Object.entries(bounds).map(([k,v])=>[k,v[1]]));max.ep_fraction=.5;max.crisis_fraction=.5;
for(const x of Object.values(calculate(max)))if(typeof x==='number')check(Number.isFinite(x));
console.log(JSON.stringify({checks,scenarios:results.length}));

import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculate,bounds} from '../lib/code-tenderloin-model.mjs';
const model=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/code-tenderloin-model-v1.json',import.meta.url)));
let checks=0;
const check=x=>{assert.ok(x);checks++;};
const near=(a,b)=>check(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b)));
const results=model.scenarios.map(s=>({id:s.id,...calculate({...model.central_inputs,...s.overrides})}));
const get=id=>results.find(s=>s.id===id),c=get('central');
for(const [i,r] of results.entries()){
  const p={...model.central_inputs,...model.scenarios[i].overrides};
  near(r.sf_q,r.all_us_q*p.sf_share);near(r.bay_q,r.all_us_q*p.bay_share);
  near(r.funded_worker_hours*r.direct_worker_hour_cash_usd,p.gift_usd*p.peer_fraction);
  near(r.offered_person_years*r.offered_person_year_cash_usd,p.gift_usd*p.peer_fraction);
  check(r.gross_resource_usd>=p.gift_usd);
  if(r.sf_q<=0)check(r.donor_sf_per_10q===null);else near(r.sf_q*r.donor_sf_per_10q,p.gift_usd*10);
  const h=p.baseline_od_hazard+p.other_death_hazard;
  const e=p.baseline_od_hazard*p.addressable_fraction*p.rescue_effect;
  let numeric=0;
  for(let k=0;k<p.horizon_years*120;k++){
    const t=(k+.5)/120;
    numeric+=(Math.exp(-h*t+e*Math.min(1,t))-Math.exp(-h*t))
      *p.utility/(1+p.discount)**(p.start_delay_years+t)/120;
  }
  check(Math.abs(numeric-r.q_per_additional_package_before_harm)<1e-6);
  for(const row of r.schedule){
    check(row.alive_with_peer>=row.alive_no_gift&&row.alive_with_peer<=1);
    check(row.discounted_q_per_person>=0);
  }
}
near(c.direct_worker_hour_cash_usd,60);near(c.offered_person_year_cash_usd,360);
near(c.donor_sf_per_10q,1969156.9925036551);
check(get('no_additional_activity').all_us_q===0);
check(get('no_peer_allocation').all_us_q===0);
check(get('no_residual_coverage_gap').all_us_q<0);
check(get('ineffective_response').all_us_q<0);
check(get('null_without_shared_harm').all_us_q===0);
near(get('independent_donor_harm').all_us_q,-.05);
for(const id of ['one_year_health_window','high_competing_mortality','strong_public_baseline'])check(get(id).all_us_q<c.all_us_q);
near(get('one_extra_year_delay').q_per_additional_package_before_harm,c.q_per_additional_package_before_harm/1.03);
near(get('zero_extra_resources_lower_bound').all_us_q,c.all_us_q);
check(get('full_health_utility').all_us_q>c.all_us_q);
check(c.incremental_undiscounted_life_years<c.extra_alive_at_year_one*model.central_inputs.horizon_years);
const p=model.central_inputs;
for(const key of Object.keys(bounds)){
  for(const bad of [undefined,null,NaN,Infinity,-Infinity,'1',true]){assert.throws(()=>calculate({...p,[key]:bad}));checks++;}
  const missing={...p};delete missing[key];assert.throws(()=>calculate(missing));checks++;
  for(const bad of [bounds[key][0]-1,bounds[key][1]+1]){assert.throws(()=>calculate({...p,[key]:bad}));checks++;}
}
for(const invalid of [null,[],{...p,horizon_years:2.5},{...p,sf_share:1}]){assert.throws(()=>calculate(invalid));checks++;}
const maximal=Object.fromEntries(Object.entries(bounds).map(([k,v])=>[k,v[1]]));
maximal.staff_wage_usd_per_hour=1;maximal.payroll_multiplier=1;
maximal.delivery_nonwage_usd_per_hour=0;maximal.worker_hours_per_offered_person_year=.01;
function finiteTree(v){if(typeof v==='number')check(Number.isFinite(v));else if(v&&typeof v==='object')Object.values(v).forEach(finiteTree);}
finiteTree(calculate(maximal));
const none=calculate({...p,baseline_od_hazard:0,other_death_hazard:0,discount:0,shared_harm_q_per_offer:0});
check(none.all_us_q===0);
console.log(`Code Tenderloin: ${checks} assertions, ${results.length} scenarios`);

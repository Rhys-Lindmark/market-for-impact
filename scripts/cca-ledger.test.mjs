import fs from 'node:fs';
import assert from 'node:assert/strict';
const m=JSON.parse(fs.readFileSync(new URL('../data/california/cca-model-v1.json',import.meta.url)));
let checks=0;
const ok=x=>{assert.ok(x);checks++;};
const near=(a,b)=>ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)));
for(const s of m.scenarios){
 const p=s.inputs,o=s.outputs;
 for(const x of Object.values(p))ok(typeof x==='number'&&Number.isFinite(x)&&x>=0);
 for(const k of ['charging_fraction','incremental_change_probability','funding_additionality','enabled_clean_operation_fraction','health_transfer_factor','survival_utility','annual_competing_mortality'])ok(p[k]<=1);
 for(const pre of ['target','displaced','independent_harm']){
  const bay=p[pre+'_bay_share'],sf=p[pre+'_sf_share'];ok(sf>=0&&bay>=sf&&bay<=1);
 }
 ok(Number.isInteger(p.acceleration_years)&&p.acceleration_years<=20);
 ok(Number.isInteger(p.health_tail_years)&&p.health_tail_years<=120);
 const staff=p.gift_usd*p.charging_fraction/p.staff_year_cash_usd;
 const n=staff*p.decision_opportunities_per_staff_year*p.incremental_change_probability*p.funding_additionality;
 const target=n*p.vehicles_per_changed_decision*p.enabled_clean_operation_fraction;
 const displaced=n*p.vehicles_per_changed_decision*p.displaced_equivalent_vehicle_fraction;
 const r=(1-p.annual_competing_mortality)/(1+p.discount_rate);
 const tail=p.survival_utility*r*(1-r**p.health_tail_years)/(1-r);
 let healthTime=0;for(let j=0;j<p.acceleration_years;j++)healthTime+=(1+p.discount_rate)**-(p.start_delay_years+j+.5);
 const per=tail*healthTime*p.deaths_per_vehicle_year*p.health_transfer_factor;
 near(staff,o.staff_years);near(n,o.expected_changed_decisions);near(target,o.target_vehicles_accelerated);near(displaced,o.displaced_equivalent_vehicles);near(tail,o.finite_qaly_per_death_at_event);
 const pub=n*(p.target_public_real_cost_per_decision-p.displaced_public_real_cost_per_decision);
 const priv=n*(p.target_private_net_cost_per_decision-p.displaced_private_net_cost_per_decision);
 near(pub,o.expected_net_public_real_cost_usd);near(priv,o.expected_net_private_real_cost_usd);near(p.gift_usd+pub+priv,o.total_net_resource_usd);
 for(const [reg,ts,ds,hs]of [['us',1,1,1],['bay',p.target_bay_share,p.displaced_bay_share,p.independent_harm_bay_share],['sf',p.target_sf_share,p.displaced_sf_share,p.independent_harm_sf_share]]){
  const q=per*(target*ts-displaced*ds)-p.independent_harm_us_qaly*hs;near(q,o[reg].qaly);
  if(q>0){near(10*p.gift_usd/q,o[reg].donor_usd_per_10_qaly);near(10*(p.gift_usd+pub+priv)/q,o[reg].net_resource_usd_per_10_qaly)}else{ok(o[reg].donor_usd_per_10_qaly===null);ok(o[reg].net_resource_usd_per_10_qaly===null)}
 }
 function finite(x){if(typeof x==='number')ok(Number.isFinite(x));else if(x&&typeof x==='object')Object.values(x).forEach(finite)}finite(o);
}
const by=id=>m.scenarios.find(s=>s.id===id).outputs;
ok(by('no_clean_vehicle_operation').us.qaly<0);
ok(by('equal_benefit_displacement').us.qaly===0);
ok(by('independent_donor_harm').us.qaly===-.01);
ok(by('no_sf_health').sf.qaly===0);
console.log(JSON.stringify({status:'PASS',scenarios:m.scenarios.length,checks}));

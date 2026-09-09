/**
 * Pure CCA conditional whole-gift charging model. No I/O or import side effects.
 * Computational bounds are not credible intervals. Priors are not measurements.
 * Health and real-resource displacement remain independent of target deployment.
 */
export const INPUT_BOUNDS=Object.freeze(Object.fromEntries(Object.entries({
  "gift_usd": [
    0,
    1000000000000
  ],
  "charging_fraction": [
    0,
    1
  ],
  "staff_year_cash_usd": [
    0.01,
    1000000000000
  ],
  "decision_opportunities_per_staff_year": [
    0,
    100
  ],
  "incremental_change_probability": [
    0,
    1
  ],
  "funding_additionality": [
    0,
    1
  ],
  "vehicles_per_changed_decision": [
    0,
    1000000
  ],
  "enabled_clean_operation_fraction": [
    0,
    1
  ],
  "displaced_equivalent_vehicle_fraction": [
    0,
    10
  ],
  "acceleration_years": [
    0,
    20
  ],
  "start_delay_years": [
    0,
    100
  ],
  "deaths_per_vehicle_year": [
    0,
    1
  ],
  "health_transfer_factor": [
    0,
    1
  ],
  "survival_utility": [
    0,
    1
  ],
  "annual_competing_mortality": [
    0,
    1
  ],
  "health_tail_years": [
    0,
    120
  ],
  "discount_rate": [
    0,
    1
  ],
  "target_bay_share": [
    0,
    1
  ],
  "target_sf_share": [
    0,
    1
  ],
  "displaced_bay_share": [
    0,
    1
  ],
  "displaced_sf_share": [
    0,
    1
  ],
  "target_public_real_cost_per_decision": [
    0,
    1000000000000
  ],
  "displaced_public_real_cost_per_decision": [
    0,
    1000000000000
  ],
  "target_private_net_cost_per_decision": [
    -1000000000000,
    1000000000000
  ],
  "displaced_private_net_cost_per_decision": [
    -1000000000000,
    1000000000000
  ],
  "independent_harm_us_qaly": [
    0,
    1000000000000
  ],
  "independent_harm_bay_share": [
    0,
    1
  ],
  "independent_harm_sf_share": [
    0,
    1
  ]
}).map(([key,b])=>[key,Object.freeze(b)])));
export function validateInputs(p){
 if(p===null||typeof p!=='object'||Array.isArray(p))throw new TypeError('CCA inputs must be an object.');
 for(const [key,[min,max]]of Object.entries(INPUT_BOUNDS)){
  if(!Object.hasOwn(p,key)||typeof p[key]!=='number'||!Number.isFinite(p[key]))throw new TypeError(key+' must be a required finite number.');
  if(p[key]<min||p[key]>max)throw new RangeError(key+' outside supported bounds.');
 }
 for(const k of ['acceleration_years','health_tail_years'])if(!Number.isInteger(p[k]))throw new RangeError(k+' must be an integer.');
 for(const pre of ['target','displaced','independent_harm'])if(p[pre+'_sf_share']>p[pre+'_bay_share'])throw new RangeError(pre+' SF share cannot exceed Bay share.');
}
const price=(cost,health)=>{if(health<=0||cost<=0)return null;const result=10*cost/health;return Number.isFinite(result)?result:null;};
export function calculate(p) {
 validateInputs(p);
 const staff=p.gift_usd*p.charging_fraction/p.staff_year_cash_usd,decisions=staff*p.decision_opportunities_per_staff_year*p.incremental_change_probability*p.funding_additionality,target=decisions*p.vehicles_per_changed_decision*p.enabled_clean_operation_fraction,displaced=decisions*p.vehicles_per_changed_decision*p.displaced_equivalent_vehicle_fraction;
 let tail=0,time=0;for(let k=1;k<=p.health_tail_years;k++)tail+=p.survival_utility*(1-p.annual_competing_mortality)**k/(1+p.discount_rate)**k;for(let j=1;j<=p.acceleration_years;j++)time+=1/(1+p.discount_rate)**(p.start_delay_years+j-.5);
 const each=p.deaths_per_vehicle_year*p.health_transfer_factor*tail*time, publicNet=decisions*(p.target_public_real_cost_per_decision-p.displaced_public_real_cost_per_decision),privateNet=decisions*(p.target_private_net_cost_per_decision-p.displaced_private_net_cost_per_decision),net=p.gift_usd+publicNet+privateNet,gross=p.gift_usd+decisions*(p.target_public_real_cost_per_decision+p.target_private_net_cost_per_decision);
 const region=(ts,ds,hs)=>{const q=(each*(target*ts-displaced*ds)-p.independent_harm_us_qaly*hs)||0;return{qaly:q,donor_usd_per_10_qaly:price(p.gift_usd,q),net_resource_usd_per_10_qaly:price(net,q)}};
 return{staff_years:staff,expected_changed_decisions:decisions,target_vehicles_accelerated:target,displaced_equivalent_vehicles:displaced,net_vehicle_years:(target-displaced)*p.acceleration_years,net_deaths_averted:(target-displaced)*p.acceleration_years*p.deaths_per_vehicle_year*p.health_transfer_factor,finite_qaly_per_death_at_event:tail,expected_net_public_real_cost_usd:publicNet,expected_net_private_real_cost_usd:privateNet,total_net_resource_usd:net,target_gross_resource_envelope_usd:gross,us:region(1,1,1),bay:region(p.target_bay_share,p.displaced_bay_share,p.independent_harm_bay_share),sf:region(p.target_sf_share,p.displaced_sf_share,p.independent_harm_sf_share)};
}

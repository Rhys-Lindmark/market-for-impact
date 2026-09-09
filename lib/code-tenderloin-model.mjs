/** Whole unrestricted Code Tenderloin gift: conditional finite peer-response core. */
export const bounds = Object.freeze(Object.fromEntries(Object.entries({
  gift_usd:[0,1e12], peer_fraction:[0,1], staff_wage_usd_per_hour:[1,10000],
  payroll_multiplier:[1,10], delivery_nonwage_usd_per_hour:[0,10000],
  worker_hours_per_offered_person_year:[0.01,10000], extra_resources_per_offer_usd:[0,1e6],
  funding_additionality:[0,1], baseline_od_hazard:[0,2], other_death_hazard:[0,2],
  addressable_fraction:[0,1], rescue_effect:[0,1], utility:[0,1], horizon_years:[1,120],
  start_delay_years:[0,100], discount:[0,1], shared_harm_q_per_offer:[0,100],
  independent_harm_q:[0,1e12], bay_share:[0,1], sf_share:[0,1],
}).map(([key,value])=>[key,Object.freeze(value)])));
const integral = rate => rate===0 ? 1 : -Math.expm1(-rate)/rate;
const price = (cost,q) => q>0 && Number.isFinite(10*cost/q) ? 10*cost/q : null;

export function calculate(p) {
  if(!p || typeof p!=='object' || Array.isArray(p))throw new TypeError('Required input object');
  for(const [key,[low,high]] of Object.entries(bounds)){
    if(!Object.hasOwn(p,key)||typeof p[key]!=='number'||!Number.isFinite(p[key]))throw new TypeError(`${key}: finite required number`);
    if(p[key]<low||p[key]>high)throw new RangeError(`${key}: ${low} to ${high}`);
  }
  if(!Number.isInteger(p.horizon_years))throw new RangeError('Integer finite horizon required');
  if(p.sf_share>p.bay_share)throw new RangeError('SF is nested within Bay');
  const hourCost=p.staff_wage_usd_per_hour*p.payroll_multiplier+p.delivery_nonwage_usd_per_hour;
  const packageCost=hourCost*p.worker_hours_per_offered_person_year;
  const offers=p.gift_usd*p.peer_fraction/packageCost;
  const extraPackages=offers*p.funding_additionality;
  const h0=p.baseline_od_hazard+p.other_death_hazard;
  const reduction=p.baseline_od_hazard*p.addressable_fraction*p.rescue_effect;
  const d=Math.log1p(p.discount);
  let s0=1,s1=1,q=0,ly=0;
  const schedule=[];
  for(let j=0;j<p.horizon_years;j++){
    const h1=j===0 ? h0-reduction : h0;
    const alive0=s0*integral(h0),alive1=s1*integral(h1);
    const gain=p.utility*Math.exp(-d*(p.start_delay_years+j))
      *(s1*integral(h1+d)-s0*integral(h0+d));
    ly+=alive1-alive0;q+=gain;
    s0*=Math.exp(-h0);s1*=Math.exp(-h1);
    schedule.push({care_year:j+1,alive_no_gift:s0,alive_with_peer:s1,
      incremental_ly_per_person:alive1-alive0,discounted_q_per_person:gain});
  }
  const us=extraPackages*(q-p.shared_harm_q_per_offer)-p.independent_harm_q;
  const bay=us*p.bay_share||0,sf=us*p.sf_share||0;
  const resource=p.gift_usd+offers*p.extra_resources_per_offer_usd;
  return {
    direct_worker_hour_cash_usd:hourCost,offered_person_year_cash_usd:packageCost,
    funded_worker_hours:offers*p.worker_hours_per_offered_person_year,
    offered_person_years:offers,incremental_person_year_packages:extraPackages,
    od_hazard_reduction_during_service_year:reduction,
    extra_alive_at_year_one:extraPackages*(Math.exp(-(h0-reduction))-Math.exp(-h0)),
    incremental_undiscounted_life_years:extraPackages*ly,
    q_per_additional_package_before_harm:q,
    all_us_q:us,bay_q:bay,sf_q:sf,gift_usd:p.gift_usd,gross_resource_usd:resource,
    donor_us_per_10q:price(p.gift_usd,us),donor_bay_per_10q:price(p.gift_usd,bay),
    donor_sf_per_10q:price(p.gift_usd,sf),resource_sf_per_10q:price(resource,sf),schedule,
  };
}

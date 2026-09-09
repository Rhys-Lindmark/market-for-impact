/** Conditional whole unrestricted gift. All effects and prospective unit costs are priors. */
export const bounds=Object.freeze({
 gift_usd:[0,1e12],ep_fraction:[0,1],crisis_fraction:[0,1],
 ep_cost:[1,1e8],crisis_cost:[1,1e8],ep_extra_resources:[0,1e8],crisis_extra_resources:[0,1e8],
 ep_additionality:[0,1],crisis_additionality:[0,1],ep_utility_difference:[-1,1],ep_transfer:[0,1],
 ep_duration:[0,2],start_delay:[0,100],discount:[0,1],
 crisis_days:[1,365],crisis_suicide_probability:[0,0.99],crisis_residual_gap:[0,1],crisis_relative_reduction:[0,1],
 later_suicide_hazard:[0,2],other_death_hazard:[0,2],crisis_utility:[0,1],crisis_horizon:[1,100],
 crisis_shared_harm:[0,100],independent_harm:[0,1e9],ep_sf_share:[0,1],ep_bay_share:[0,1],
 crisis_sf_share:[0,1],crisis_bay_share:[0,1],harm_sf_share:[0,1],harm_bay_share:[0,1]
});
export const integral=(rate,t)=>rate===0?t:-Math.expm1(-rate*t)/rate;
const price=(cost,q)=>q>0&&Number.isFinite(cost*10/q)?cost*10/q:null;
export function calculate(p){
 if(!p||typeof p!=='object'||Array.isArray(p))throw new TypeError('Required input object');
 for(const [k,[lo,hi]]of Object.entries(bounds)){
  if(!Object.hasOwn(p,k)||typeof p[k]!=='number'||!Number.isFinite(p[k]))throw new TypeError(k+' finite number required');
  if(p[k]<lo||p[k]>hi)throw new RangeError(k+' bounds');
 }
 if(p.ep_fraction+p.crisis_fraction>1)throw new RangeError('Portfolio fractions exceed gift');
 for(const k of ['ep','crisis','harm'])if(p[k+'_sf_share']>p[k+'_bay_share'])throw new RangeError('Nested geography');
 const d=Math.log1p(p.discount),delay=Math.exp(-d*p.start_delay);
 const epOffers=p.gift_usd*p.ep_fraction/p.ep_cost,crisisOffers=p.gift_usd*p.crisis_fraction/p.crisis_cost;
 const epN=epOffers*p.ep_additionality,crisisN=crisisOffers*p.crisis_additionality;
 const epQ=epN*p.ep_utility_difference*p.ep_transfer*delay*integral(d,p.ep_duration);
 const t=p.crisis_days/365,h=-Math.log1p(-p.crisis_suicide_probability)/t;
 const h0=h+p.other_death_hazard,h1=h*(1-p.crisis_residual_gap*p.crisis_relative_reduction)+p.other_death_hazard;
 const first=integral(h1+d,t)-integral(h0+d,t);
 const aliveGap=Math.exp(-h1*t)-Math.exp(-h0*t);
 const tail=aliveGap*Math.exp(-d*t)*integral(p.later_suicide_hazard+p.other_death_hazard+d,p.crisis_horizon-t);
 const survivalQ=p.crisis_utility*delay*(first+tail);
 const crisisQ=crisisN*(survivalQ-p.crisis_shared_harm*delay);
 const all=epQ+crisisQ-p.independent_harm;
 const sf=epQ*p.ep_sf_share+crisisQ*p.crisis_sf_share-p.independent_harm*p.harm_sf_share;
 const bay=epQ*p.ep_bay_share+crisisQ*p.crisis_bay_share-p.independent_harm*p.harm_bay_share;
 const resources=p.gift_usd+epOffers*p.ep_extra_resources+crisisOffers*p.crisis_extra_resources;
 return {ep_offers:epOffers,crisis_offers:crisisOffers,ep_additional_packages:epN,crisis_additional_people:crisisN,
  unmodeled_gift_usd:p.gift_usd*(1-p.ep_fraction-p.crisis_fraction),ep_us_q:epQ,crisis_us_q:crisisQ,
  crisis_survival_q_per_additional_person:survivalQ,crisis_extra_alive_at_window_end:crisisN*aliveGap,
  all_us_q:all,bay_q:bay,sf_q:sf,gift_usd:p.gift_usd,gross_resource_usd:resources,
  donor_us_per_10q:price(p.gift_usd,all),donor_bay_per_10q:price(p.gift_usd,bay),donor_sf_per_10q:price(p.gift_usd,sf),
  resource_us_per_10q:price(resources,all),resource_bay_per_10q:price(resources,bay),resource_sf_per_10q:price(resources,sf)};
}

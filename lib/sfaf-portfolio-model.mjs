/** Pure whole-organization SFAF gift model. Unique cohorts, finite recurring-event survival. */
export const INPUT_BOUNDS=Object.freeze(Object.fromEntries(Object.entries({"gift_usd":[0,1000000000],"discount":[0,1],"od_allocation":[0,1],"prep_allocation":[0,1],"od_cash_per_offer":[1,10000000],"prep_cash_per_offer":[1,10000000],"od_funding_additionality":[0,1],"prep_funding_additionality":[0,1],"od_events_per_year":[0,20],"od_fatality_without_effective_rescue":[0,1],"od_baseline_effective_rescue":[0,1],"od_rescue_increment":[-1,1],"od_other_mortality_hazard":[0,2],"od_utility":[0,1],"od_active_years":[0,10],"od_horizon_years":[0,60],"od_delay_years":[0,10],"prep_baseline_infection_hazard":[0,1],"prep_extra_coverage_fraction":[-1,1],"prep_effectiveness":[0,1],"prep_other_mortality_hazard":[0,2],"prep_hiv_utility_gap":[0,1],"prep_active_years":[0,10],"prep_horizon_years":[0,60],"prep_delay_years":[0,10],"prep_disjoint_fraction":[0,1],"od_outside_resources_per_offer":[0,10000000],"prep_outside_resources_per_offer":[0,10000000],"od_bay_share":[0,1],"od_sf_share":[0,1],"prep_bay_share":[0,1],"prep_sf_share":[0,1],"od_harm_per_incremental_offer":[0,10],"prep_harm_per_incremental_offer":[0,10],"independent_harm_qaly":[0,100000000],"harm_bay_share":[0,1],"harm_sf_share":[0,1]}).map(([k,v])=>[k,Object.freeze(v)])));
export function validateInputs(p){
 if(!p||typeof p!=='object'||Array.isArray(p))throw new TypeError('Inputs must be an object.');
 for(const[k,[lo,hi]]of Object.entries(INPUT_BOUNDS)){
  if(!Object.hasOwn(p,k)||typeof p[k]!=='number'||!Number.isFinite(p[k]))throw new TypeError(k+' must be finite.');
  if(p[k]<lo||p[k]>hi)throw new RangeError(k+' out of bounds.');
 }
 if(p.od_allocation+p.prep_allocation>1)throw new RangeError('Gift allocations exceed one.');
 if(p.od_baseline_effective_rescue+p.od_rescue_increment<0||p.od_baseline_effective_rescue+p.od_rescue_increment>1)throw new RangeError('Effective rescue probability outside [0,1].');
 for(const k of ['od','prep','harm'])if(p[k+'_sf_share']>p[k+'_bay_share'])throw new RangeError('SF must nest in Bay.');
}
// Integral of exp(-rate*t) over [start,end], stable at zero rate.
const integral=(rate,start,end)=>end<=start?0:Math.exp(-rate*start)*(rate===0?end-start:-Math.expm1(-rate*(end-start))/rate);
export function cohortGain(baseHazard,hazardReduction,activeYears,horizonYears,utility,discount,delay){
 const a=baseHazard+Math.log1p(discount),c=Math.min(activeYears,horizonYears);
 if(c===0||hazardReduction===0||utility===0)return 0;
 const during=integral(a-hazardReduction,0,c)-integral(a,0,c);
 const after=Math.expm1(hazardReduction*c)*integral(a,c,horizonYears);
 return utility*(during+after)/(1+discount)**delay;
}
const price=(c,q)=>q>0&&Number.isFinite(10*c/q)?10*c/q:null;
export function calculate(p){
 validateInputs(p);
 const odOffers=p.gift_usd*p.od_allocation/p.od_cash_per_offer;
 const prepOffers=p.gift_usd*p.prep_allocation/p.prep_cash_per_offer;
 const odPeople=odOffers*p.od_funding_additionality;
 const prepPeople=prepOffers*p.prep_funding_additionality*p.prep_disjoint_fraction;
 const odBase=p.od_other_mortality_hazard+p.od_events_per_year*p.od_fatality_without_effective_rescue*(1-p.od_baseline_effective_rescue);
 const odReduction=p.od_events_per_year*p.od_fatality_without_effective_rescue*p.od_rescue_increment;
 const odQ=cohortGain(odBase,odReduction,p.od_active_years,p.od_horizon_years,p.od_utility,p.discount,p.od_delay_years);
 // The HIV-free state differs; common survival and treated-HIV utility remain baseline.
 // No HIV mortality difference, secondary transmission or untreated-AIDS lifetime is credited.
 const prepQ=cohortGain(p.prep_other_mortality_hazard+p.prep_baseline_infection_hazard,p.prep_baseline_infection_hazard*p.prep_extra_coverage_fraction*p.prep_effectiveness,p.prep_active_years,p.prep_horizon_years,p.prep_hiv_utility_gap,p.discount,p.prep_delay_years);
 const odNet=odPeople*(odQ-p.od_harm_per_incremental_offer);
 // Harm can affect all added PrEP offers, including those excluded to deduplicate health.
 const prepNet=prepPeople*prepQ-prepOffers*p.prep_funding_additionality*p.prep_harm_per_incremental_offer;
 const resources=p.gift_usd+odOffers*p.od_outside_resources_per_offer+prepOffers*p.prep_outside_resources_per_offer;
 const region=(odShare,prepShare,harmShare)=>{const q=odNet*odShare+prepNet*prepShare-p.independent_harm_qaly*harmShare;return{qaly:q||0,donor_per_10q:price(p.gift_usd,q),gross_resource_per_10q:price(resources,q)};};
 return{unquantified_gift_usd:p.gift_usd*(1-p.od_allocation-p.prep_allocation),od_offers:odOffers,prep_offers:prepOffers,od_incremental_unique_people:odPeople,prep_incremental_disjoint_people:prepPeople,od_qaly_per_incremental_person:odQ,prep_qaly_per_incremental_person:prepQ,od_baseline_fatal_hazard:odBase,od_supported_fatal_hazard:odBase-odReduction,od_net_qaly:odNet,prep_net_qaly:prepNet,gross_resource_usd:resources,us:region(1,1,1),bay:region(p.od_bay_share,p.prep_bay_share,p.harm_bay_share),sf:region(p.od_sf_share,p.prep_sf_share,p.harm_sf_share)};
}

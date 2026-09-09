// Pure HRT whole-gift model; no IO. One finite survival difference per unique person.
export const BOUNDS=Object.freeze({gift_usd:[1,1e9],free_access_allocation:[0,1],other_capacity_allocation:[0,1],other_partnership_allocation:[0,1],cash_per_twin_pack:[1,1e5],funding_additionality:[0,1],max_additional_twin_packs:[0,1e8],high_risk_placement:[0,1],twin_packs_per_unique_person:[1,100],max_unique_people:[0,1e8],events_per_person_year:[0,5],fatality_without_effective_rescue:[0,1],baseline_effective_rescue:[0,1],rescue_increment:[-1,1],mean_doses_per_incremental_response:[1,10],other_mortality_hazard:[0,2],utility:[0,1],active_years:[0,5],horizon_years:[0,30],delay_years:[0,5],discount:[0,1],episode_harm_per_unique_person:[0,1],independent_harm_q:[0,1e8],outside_per_nominal_pack:[0,1e6],outside_other_usd:[0,1e10],bay_share:[0,1],sf_share:[0,1]});
export function inputsFor(m,s){return {...m.central_inputs,...s.overrides};}
export function validate(p){
 for(const [k,[lo,hi]]of Object.entries(BOUNDS))if(!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)throw new Error('Invalid '+k);
 if(Math.abs(p.free_access_allocation+p.other_capacity_allocation+p.other_partnership_allocation-1)>1e-10)throw new Error('Whole gift allocation must sum1');
 if(p.sf_share>p.bay_share)throw new Error('Non-nested geography');
 if(p.baseline_effective_rescue+p.rescue_increment<0||p.baseline_effective_rescue+p.rescue_increment>1)throw new Error('Invalid supported rescue');
 if(p.active_years>p.horizon_years)throw new Error('Protection exceeds observation horizon');
 const demand=p.events_per_person_year*p.active_years*Math.max(0,p.rescue_increment)*p.mean_doses_per_incremental_response;
 if(demand>2*p.twin_packs_per_unique_person+1e-12)throw new Error('Incremental response dose demand exceeds device pool');
}
export const finiteYears=(r,t)=>r===0?t:-Math.expm1(-r*t)/r;
// Stable even for infinitesimal signed effect; no subtraction of nearly equal survivor tails.
export function survivalDifference(base,reduction,active,t){
 const protectedTime=Math.min(t,active),z=reduction*protectedTime;
 return reduction>=0?Math.exp(-base*t+z)*(-Math.expm1(-z)):Math.exp(-base*t)*Math.expm1(z);
}
// Eight-point Gauss-Legendre across16 subintervals during protection, analytic tail afterward.
const nodes=[.1834346424956498,.525532409916329,.7966664774136267,.9602898564975363];
const weights=[.362683783378362,.3137066458778873,.2223810344533745,.1012285362903763];
export function cohortGain(base,reduction,active,horizon,utility,discount,delay){
 if(active===0||horizon===0||reduction===0||utility===0)return 0;
 const d=Math.log1p(discount);let during=0;const h=active/16;
 for(let i=0;i<16;i++){const mid=(i+.5)*h;for(let j=0;j<4;j++)for(const s of [-1,1]){const t=mid+s*nodes[j]*h/2;during+=weights[j]*h/2*survivalDifference(base,reduction,active,t)*Math.exp(-d*t);}}
 const tail=survivalDifference(base,reduction,active,active)*Math.exp(-d*active)*finiteYears(base+d,horizon-active);
 return utility*Math.exp(-d*delay)*(during+tail);
}
const price=(c,q)=>q>0&&Number.isFinite(10*c/q)?10*c/q:null;
export function calculate(p){validate(p);
 const nominal_packs=p.gift_usd*p.free_access_allocation/p.cash_per_twin_pack;
 const additional_packs=Math.min(nominal_packs*p.funding_additionality,p.max_additional_twin_packs);
 const placed_packs=additional_packs*p.high_risk_placement;
 const unique_people=Math.min(placed_packs/p.twin_packs_per_unique_person,p.max_unique_people);
 const base=p.other_mortality_hazard+p.events_per_person_year*p.fatality_without_effective_rescue*(1-p.baseline_effective_rescue);
 const reduction=p.events_per_person_year*p.fatality_without_effective_rescue*p.rescue_increment;
 const q_per_person=cohortGain(base,reduction,p.active_years,p.horizon_years,p.utility,p.discount,p.delay_years);
 const gross_q=unique_people*q_per_person,harm_q=unique_people*p.episode_harm_per_unique_person+p.independent_harm_q;
 const us_q=gross_q-harm_q,bay_q=us_q*p.bay_share,sf_q=us_q*p.sf_share;
 const gross_resource_usd=p.gift_usd+nominal_packs*p.outside_per_nominal_pack+p.outside_other_usd;
 const r={nominal_packs,nominal_devices:2*nominal_packs,additional_packs,placed_packs,unique_people,unquantified_cash:p.gift_usd*(1-p.free_access_allocation),baseline_fatal_hazard:base,supported_fatal_hazard:base-reduction,q_per_person,gross_q,harm_q,us_q:us_q||0,overall_q:us_q||0,bay_q:bay_q||0,sf_q:sf_q||0,gift_usd:p.gift_usd,gross_resource_usd,status:us_q>0?'positive':us_q<0?'harm':'zero',expected_incremental_response_doses_per_person:p.events_per_person_year*p.active_years*Math.max(0,p.rescue_increment)*p.mean_doses_per_incremental_response};
 for(const [geo,q]of [['us',us_q],['bay',bay_q],['sf',sf_q]]){r['donor_'+geo+'_per_10q']=price(p.gift_usd,q);r['resource_'+geo+'_per_10q']=price(gross_resource_usd,q);}
 for(const v of Object.values(r))if(typeof v==='number'&&!Number.isFinite(v))throw new Error('Nonfinite output');return r;
}

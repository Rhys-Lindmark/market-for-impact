/** Conditional whole-gift HPP model; pure, no I/O. DFDs are signed net days over actual available care, not symptom-score QALYs. */
export const INPUT_BOUNDS=Object.freeze(Object.fromEntries(Object.entries({"gift_usd":[0,1000000000000],"maternal_depression_allocation":[0,1],"cash_per_offer":[0.01,1000000000000],"funding_additionality":[0,1],"incremental_depression_free_days":[-730,730],"observation_days":[1,730],"utility_gain_per_depression_free_day":[0,1],"discount":[0,1],"gift_to_start_years":[0,50],"extra_resource_per_offer":[0,1000000000000],"shared_harm_q_per_offer":[0,1000000],"independent_harm_q":[0,1000000000000],"bay_share":[0,1],"sf_share":[0,1]}).map(([k,v])=>[k,Object.freeze(v)])));
export function validateInputs(p){
 if(!p||typeof p!=='object'||Array.isArray(p))throw new TypeError('Inputs must be an object.');
 for(const [k,[lo,hi]] of Object.entries(INPUT_BOUNDS)){
  if(!Object.hasOwn(p,k)||typeof p[k]!=='number'||!Number.isFinite(p[k]))throw new TypeError(k+' must be a finite required number.');
  if(p[k]<lo||p[k]>hi)throw new RangeError(k+' outside computational bounds.');
 }
 if(!Number.isInteger(p.observation_days))throw new RangeError('Observation days must be integer.');
 if(Math.abs(p.incremental_depression_free_days)>p.observation_days)throw new RangeError('Net days cannot exceed the observed window.');
 if(p.sf_share>p.bay_share)throw new RangeError('SF is nested in Bay.');
}
const ratio=(c,q)=>{if(q<=0)return null;const r=10*c/q;return Number.isFinite(r)?r:null;};
export function calculate(p){
 validateInputs(p);
 const offers=p.gift_usd*p.maternal_depression_allocation/p.cash_per_offer;
 const incremental_offers=offers*p.funding_additionality;
 // Analyst uniform allocation of the signed incremental days across finite observed window.
 // Earlier spontaneous recovery / other treatment is already in net days; no second catch-up factor.
 let discounted_day_fraction=0;
 for(let day=0;day<p.observation_days;day++)discounted_day_fraction+=1/(1+p.discount)**(p.gift_to_start_years+(day+.5)/365);
 discounted_day_fraction/=p.observation_days;
 const qper=p.incremental_depression_free_days/365*p.utility_gain_per_depression_free_day*discounted_day_fraction;
 const q=incremental_offers*(qper-p.shared_harm_q_per_offer)-p.independent_harm_q;
 const resource=p.gift_usd+offers*p.extra_resource_per_offer;
 const region=s=>{const health=q*s||0;return{qaly:health,donor_per_10q:ratio(p.gift_usd,health),gross_resource_per_10q:ratio(resource,health)};};
 return{offers,incremental_offers,discounted_day_fraction,qaly_per_incremental_offer:qper,gross_resource_usd:resource,us:region(1),bay:region(p.bay_share),sf:region(p.sf_share)};
}

/** Pure conditional SFPHF whole-gift HCV model. No I/O or import effects.
 * Bounds protect computation; they are not empirical uncertainty intervals.
 * US/Bay/SF health is nested. The health allocation is a heuristic, not a
 * rerun of the reference lifetime disease-progression model.
 */
export const INPUT_BOUNDS=Object.freeze(Object.fromEntries(Object.entries({
 gift_usd:[0,1e12],hcv_allocation:[0,1],navigation_cash_per_offer:[.01,1e12],
 incremental_cure_probability:[0,1],additional_start_probability:[0,1],funding_additionality:[0,1],
 reference_qaly_per_cure:[0,150],health_years:[0,120],benefit_shape:[0,3],discount:[0,1],
 reinfection_hazard:[0,5],excess_mortality_hazard:[0,5],later_cure_probability:[0,1],
 later_cure_years:[0,120],gift_to_cure_years:[0,120],daa_resource_per_start:[0,1e12],
 donor_daa_share:[0,1],extra_resource_per_offer:[0,1e12],shared_harm_q_per_offer:[0,1e6],
 independent_harm_q:[0,1e12],bay_share:[0,1],sf_share:[0,1]
}).map(([key,bounds])=>[key,Object.freeze(bounds)])));

export function validateInputs(p){
 if(p===null||typeof p!=='object'||Array.isArray(p))throw new TypeError('SFPHF inputs must be an object.');
 for(const [key,[min,max]] of Object.entries(INPUT_BOUNDS)){
  if(!Object.hasOwn(p,key)||typeof p[key]!=='number'||!Number.isFinite(p[key]))throw new TypeError(`${key} must be a finite required number.`);
  if(p[key]<min||p[key]>max)throw new RangeError(`${key} must be between ${min} and ${max}.`);
 }
 if(!Number.isInteger(p.health_years))throw new RangeError('health_years must be an integer.');
 if(p.sf_share>p.bay_share)throw new RangeError('SF share cannot exceed Bay share.');
 if(p.incremental_cure_probability>p.additional_start_probability)throw new RangeError('Additional cure probability cannot exceed additional starts in this treatment pathway.');
}
const ratio=(cost,health)=>{
 if(health<=0)return null;
 const value=10*cost/health;
 return Number.isFinite(value)?value:null;
};

export function calculate(p){
 validateInputs(p);
 const cash=p.navigation_cash_per_offer+p.donor_daa_share*p.additional_start_probability*p.daa_resource_per_start;
 const offers=p.gift_usd*p.hcv_allocation/cash;
 let total=0,retained=0;
 for(let k=1;k<=p.health_years;k++){
  const w=k**p.benefit_shape/(1+p.discount)**k;
  total+=w;
  retained+=w*Math.exp(-(p.reinfection_hazard+p.excess_mortality_hazard)*k)*(k>p.later_cure_years?1-p.later_cure_probability:1);
 }
 // Normalization prevents discounting the already-discounted reference twice.
 const qper=total>0?p.reference_qaly_per_cure*retained/total/(1+p.discount)**p.gift_to_cure_years:0;
 const cures=offers*p.incremental_cure_probability*p.funding_additionality;
 const q=cures*qper-offers*p.funding_additionality*p.shared_harm_q_per_offer-p.independent_harm_q;
 const resource=p.gift_usd+offers*(p.extra_resource_per_offer+(1-p.donor_daa_share)*p.additional_start_probability*p.daa_resource_per_start);
 const region=share=>{
  const health=q*share||0;
  return{qaly:health,donor_per_10q:ratio(p.gift_usd,health),gross_resource_per_10q:ratio(resource,health)};
 };
 return{offers,additional_cures:cures,retained_qaly_per_cure_at_gift:qper,gross_resource_usd:resource,us:region(1),bay:region(p.bay_share),sf:region(p.sf_share)};
}

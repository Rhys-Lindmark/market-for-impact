/** Expanded clinical coverage only: not a complete organization expected-value model. */
import {calculate as foundationCalculate} from './breathe-v2-foundation.mjs';
export const BOUNDS={cpap_allocation:[0,1],cpap_cash_per_episode:[1,1e7],cpap_additionality:[0,1],cpap_qaly_one_year:[-1,1],cpap_relative_transfer:[0,2],cpap_delay:[0,10],cpap_outside_per_episode:[0,1e7],cpap_bay_share:[0,1],cpap_sf_share:[0,1],adult_asthma_days_per_fortnight:[-14,14],adult_asthma_transfer:[0,1],adult_asthma_symptom_utility_gap:[0,1],adult_asthma_homevisit_fraction:[0,1]};
const price=(c,q)=>q>0&&c>0&&Number.isFinite(10*c/q)?10*c/q:null;
export function calculate(model,scenario={}){
 const p={...model.foundation,...scenario.foundation},x={...model.inputs,...scenario.inputs};
 for(const [k,[lo,hi]] of Object.entries(BOUNDS)){if(!Object.hasOwn(x,k)||typeof x[k]!=='number'||!Number.isFinite(x[k]))throw new TypeError(k);if(x[k]<lo||x[k]>hi)throw new RangeError(k);}
 if(x.cpap_sf_share>x.cpap_bay_share)throw new RangeError('geography');
 if(Math.abs(x.cpap_qaly_one_year*x.cpap_relative_transfer)>1)throw new RangeError('one-year QALY bound');
 if(p.cessation_allocation+p.asthma_allocation+x.cpap_allocation>0.9+1e-12)throw new RangeError('retain central overhead');
 const old=foundationCalculate(p),d=Math.log1p(p.discount),annuity=d===0?p.asthma_years:-Math.expm1(-d*p.asthma_years)/d;
 const cpap_nominal=p.gift_usd*x.cpap_allocation/x.cpap_cash_per_episode;
 const cpap_added=cpap_nominal*x.cpap_additionality;
 // Trial one-year ITT QALYs already include adherence, mortality and within-year usual-care access.
 // Relative transfer changes that complete contrast; no extra adherence/survival/catch-up haircut.
 const cpap_q=cpap_added*x.cpap_qaly_one_year*x.cpap_relative_transfer*Math.exp(-d*x.cpap_delay);
 const adult_people=old.additional_asthma_people*(1-p.asthma_child_fraction)*x.adult_asthma_homevisit_fraction;
 const adult_q=adult_people*(x.adult_asthma_days_per_fortnight/14)*x.adult_asthma_transfer*x.adult_asthma_symptom_utility_gap*annuity*Math.exp(-d*p.asthma_delay);
 const resources=old.gross_resource_usd+cpap_nominal*x.cpap_outside_per_episode;
 const regions={};for(const geo of ['us','bay','sf']){
  const cpapShare=geo==='us'?1:x['cpap_'+geo+'_share'],adultShare=geo==='us'?1:p['asthma_'+geo+'_share'];
  const q=(old[geo].qaly+cpap_q*cpapShare+adult_q*adultShare)||0;
  regions[geo]={qaly:q,donor_per_10q:price(p.gift_usd,q),gross_partial_resource_per_10q:price(resources,q)};
 }
 const out={status:'expanded clinical subset; whole-organization expected QALYs unresolved',cpap_nominal_episodes:cpap_nominal,cpap_additional_episodes:cpap_added,cpap_net_qaly:cpap_q,adult_asthma_people:adult_people,adult_asthma_net_qaly:adult_q,foundation_qaly:old.us.qaly,whole_gift_usd:p.gift_usd,gross_partial_resource_usd:resources,central_enabling_cost_usd:p.gift_usd*.1,other_allocation_usd:p.gift_usd*(.9-p.cessation_allocation-p.asthma_allocation-x.cpap_allocation),whole_organization_expected_qaly:null,...regions};
 const walk=o=>{for(const v of Object.values(o)){if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('nonfinite output');if(v&&typeof v==='object')walk(v);}};walk(out);return out;
}

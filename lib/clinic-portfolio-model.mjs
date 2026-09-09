// Pure calculator. No I/O, dependency, clock, randomness or mutable global state.
const bounds={"gift_usd":[1,1000000],"funding_additionality":[0,1],"dental_allocation":[0,1],"mental_allocation":[0,1],"medical_allocation":[0,1],"food_other_allocation":[0,1],"dental_episode_cost":[50,10000],"mental_course_cost":[100,20000],"dental_target":[0,1],"mental_target":[0,1],"dental_completion":[0,1],"mental_completion":[0,1],"dental_unique":[0,1],"mental_disjoint":[0,1],"dental_capacity":[0,10000],"mental_capacity":[0,10000],"dental_utility":[-0.3,0.3],"dental_resolution":[0,1],"dental_catchup":[0,50],"dental_horizon":[0,2],"dental_delay":[0,5],"dental_harm":[0,0.5],"mental_utility":[-0.3,0.3],"mental_fidelity":[0,1],"mental_catchup":[0,50],"mental_horizon":[0,1],"mental_delay":[0,5],"mental_harm":[0,0.5],"mortality":[0,1],"discount":[0,1],"bay_share":[0,1],"sf_share":[0,1],"volunteer_resource_per_donor":[0,5],"external_resource_per_donor":[0,5],"independent_harm_q":[0,1000],"bp_medical_fraction":[0,1],"bp_course_cost":[100,20000],"bp_unique":[0,1],"bp_capacity":[0,10000],"bp_baseline_hazard":[0,1],"bp_relative_hazard":[0,2],"bp_modern_gap":[0,1],"bp_delivery_transfer":[0,1],"bp_active_years":[0,5],"bp_latency":[0,5],"bp_horizon":[0,20],"bp_delay":[0,5],"bp_utility":[0,1],"bp_harm":[0,0.5],"bp_external_per_course":[0,10000],"residual_unique":[0,1],"residual_capacity":[0,10000],"residual_delay":[0,5],"residual_harm":[0,0.5],"acute_cost":[100,20000],"acute_target":[0,1],"acute_utility":[-0.3,0.3],"acute_response":[0,1],"acute_catchup":[0,50],"acute_horizon":[0,3],"acute_external":[0,10000],"chronic_cost":[100,20000],"chronic_target":[0,1],"chronic_utility":[-0.3,0.3],"chronic_response":[0,1],"chronic_catchup":[0,50],"chronic_horizon":[0,3],"chronic_external":[0,10000],"referral_cost":[100,20000],"referral_target":[0,1],"referral_utility":[-0.3,0.3],"referral_response":[0,1],"referral_catchup":[0,50],"referral_horizon":[0,3],"referral_external":[0,10000],"dental_other_cost":[100,20000],"dental_other_target":[0,1],"dental_other_utility":[-0.3,0.3],"dental_other_response":[0,1],"dental_other_catchup":[0,50],"dental_other_horizon":[0,3],"dental_other_external":[0,10000],"mental_other_cost":[100,20000],"mental_other_target":[0,1],"mental_other_utility":[-0.3,0.3],"mental_other_response":[0,1],"mental_other_catchup":[0,50],"mental_other_horizon":[0,3],"mental_other_external":[0,10000],"food_cost":[100,20000],"food_target":[0,1],"food_utility":[-0.3,0.3],"food_response":[0,1],"food_catchup":[0,50],"food_horizon":[0,3],"food_external":[0,10000],"acute_medical_share":[0,1],"chronic_medical_share":[0,1],"referral_medical_share":[0,1]};
export const inputKeys=Object.freeze(Object.keys(bounds));
export const inputsFor=(model,scenario)=>({...model.central_inputs,...scenario.overrides});
export function finiteIntegral(rate,horizon){
 if(!Number.isFinite(rate)||!Number.isFinite(horizon)||rate<0||horizon<0)throw Error('Invalid integration domain');
 return rate===0?horizon:-Math.expm1(-rate*horizon)/rate;
}
export function triangularIntegral(rate,horizon){
 if(!Number.isFinite(rate)||!Number.isFinite(horizon)||rate<0||horizon<0)throw Error('Invalid integration domain');
 if(horizon===0)return 0;
 const x=rate*horizon;
 if(x<1e-4)return horizon*(.5-x/6+x*x/24-x*x*x/120+x*x*x*x/720);
 return horizon*(x+Math.expm1(-x))/(x*x);
}

// All-cause survival difference, with finite latency/exposure and equal hazards thereafter.
export function bpSurvivalQ(p){
 const b=p.bp_baseline_hazard,bs=b*(1+(p.bp_relative_hazard-1)*p.bp_modern_gap*p.bp_delivery_transfer);
 const A=Math.min(p.bp_active_years,p.bp_horizon),L=Math.min(p.bp_latency,A),W=A-L,r=p.discount;
 const active=Math.exp(-(b+r)*L)*(finiteIntegral(bs+r,W)-finiteIntegral(b+r,W));
 const gap=Math.exp(-b*L)*Math.exp(-b*W)*Math.expm1((b-bs)*W);
 const tail=gap*Math.exp(-r*A)*finiteIntegral(b+r,p.bp_horizon-A);
 return p.bp_utility*Math.exp(-r*p.bp_delay)*(active+tail);
}
export function expectedValue(model,weights=model.expected_value.weights){
 if(Math.abs(weights.reduce((a,w)=>a+w.weight,0)-1)>1e-10)throw Error('Weights sum');
 const rows=weights.map(w=>{if(!Number.isFinite(w.weight)||w.weight<0)throw Error('Weight');const s=model.scenarios.find(s=>s.id===w.id);if(!s)throw Error('Scenario');const p=inputsFor(model,s);if(p.gift_usd!==model.central_inputs.gift_usd)throw Error('Mixture requires fixed gift');return{weight:w.weight,result:calculate(p)};});
 const out={gift_usd:model.central_inputs.gift_usd,expected_gross_resource_usd:rows.reduce((a,x)=>a+x.weight*x.result.gross_resource_usd,0)};
 for(const g of['all','bay','sf']){const q=rows.reduce((a,x)=>a+x.weight*x.result[g+'_q'],0);out[g+'_q']=q;out['donor_'+g+'_per_10q']=q>0?10*out.gift_usd/q:null;out['resource_'+g+'_per_10q']=q>0?10*out.expected_gross_resource_usd/q:null;}
 for(const v of Object.values(out))if(v!==null&&!Number.isFinite(v))throw Error('Nonfinite expected output');
 return out;
}

export const residualIds=Object.freeze(['acute','chronic','referral','dental_other','mental_other','food']);
export function residualBreakdown(p){
 const med=p.gift_usd*p.medical_allocation*(1-p.bp_medical_fraction);
 const budgets={acute:med*p.acute_medical_share,chronic:med*p.chronic_medical_share,referral:med*p.referral_medical_share,dental_other:p.gift_usd*p.dental_allocation*(1-p.dental_target),mental_other:p.gift_usd*p.mental_allocation*(1-p.mental_target),food:p.gift_usd*p.food_other_allocation};
 const nominal=residualIds.map(id=>budgets[id]/p[id+'_cost']),pre=nominal.map(n=>n*p.funding_additionality*p.residual_unique),sum=pre.reduce((a,b)=>a+b,0),scale=sum>0?Math.min(1,p.residual_capacity/sum):0;
 return residualIds.map((id,i)=>{const years=Math.exp(-p.discount*p.residual_delay)*finiteIntegral(p[id+'_catchup']+p.mortality+p.discount,p[id+'_horizon']),n=pre[i]*scale,q=n*(p[id+'_target']*p[id+'_response']*p[id+'_utility']*years-p.residual_harm);return{id,budget:budgets[id],nominal:nominal[i],n,years,q,external:nominal[i]*p[id+'_external']};});
}
export function calculate(p){
 for(const[k,[lo,hi]]of Object.entries(bounds))if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)throw Error('Invalid input '+k);
 if(Math.abs(p.dental_allocation+p.mental_allocation+p.medical_allocation+p.food_other_allocation-1)>1e-9)throw Error('Allocation must sum to one');
 if(Math.abs(p.acute_medical_share+p.chronic_medical_share+p.referral_medical_share-1)>1e-9)throw Error('Medical residual allocation');
 if(p.sf_share>p.bay_share)throw Error('SF is a subset of Bay');
 const dental_budget=p.gift_usd*p.dental_allocation,mental_budget=p.gift_usd*p.mental_allocation;
 const dental_nominal=dental_budget/p.dental_episode_cost,mental_nominal=mental_budget/p.mental_course_cost;
 const dental_n=Math.min(p.dental_capacity,dental_nominal*p.funding_additionality*p.dental_target*p.dental_completion*p.dental_unique);
 const mental_n=Math.min(p.mental_capacity,mental_nominal*p.funding_additionality*p.mental_target*p.mental_completion*p.mental_disjoint);
 const dental_years=Math.exp(-p.discount*p.dental_delay)*finiteIntegral(p.dental_catchup+p.mortality+p.discount,p.dental_horizon);
 const mental_years=Math.exp(-p.discount*p.mental_delay)*triangularIntegral(p.mental_catchup+p.mortality+p.discount,p.mental_horizon);
 const dental_q=dental_n*(p.dental_utility*p.dental_resolution*dental_years-p.dental_harm);
 const mental_q=mental_n*(p.mental_utility*p.mental_fidelity*mental_years-p.mental_harm);
 const bp_budget=p.gift_usd*p.medical_allocation*p.bp_medical_fraction;
 const bp_nominal=bp_budget/(p.bp_course_cost*Math.max(1,p.bp_active_years)),bp_n=Math.min(p.bp_capacity,bp_nominal*p.funding_additionality*p.bp_unique);
 const bp_q_per_person=bpSurvivalQ(p),bp_q=bp_n*(bp_q_per_person-p.bp_harm);
 const residual=residualBreakdown(p),sumResidual=key=>residual.reduce((s,x)=>s+x[key],0);
 const residual_budget=sumResidual('budget'),residual_nominal=sumResidual('nominal'),residual_n=sumResidual('n'),residual_q=sumResidual('q');
 const all_q=dental_q+mental_q+bp_q+residual_q-p.independent_harm_q;
 const gross_resource_usd=p.gift_usd*(1+p.volunteer_resource_per_donor+p.external_resource_per_donor)+bp_nominal*p.bp_external_per_course*Math.max(1,p.bp_active_years)+sumResidual('external');
 const out={bp_budget,bp_nominal,bp_n,bp_q_per_person,bp_q,residual_budget,residual_nominal,residual_n,residual_q,dental_budget,mental_budget,remaining_medical_food_budget:p.gift_usd*(p.medical_allocation+p.food_other_allocation),dental_nominal,mental_nominal,dental_n,mental_n,dental_years,mental_years,dental_q,mental_q,all_q,gross_resource_usd};
 for(const x of residual)for(const k of['budget','nominal','n','years','q','external'])out[x.id+'_'+k]=x[k];
 for(const[g,s]of[['all',1],['bay',p.bay_share],['sf',p.sf_share]]){
  const q=all_q*s;out[g+'_q']=q;
  out['donor_'+g+'_per_10q']=q>0?10*p.gift_usd/q:null;
  out['resource_'+g+'_per_10q']=q>0?10*gross_resource_usd/q:null;
 }
 for(const v of Object.values(out))if(v!==null&&!Number.isFinite(v))throw Error('Nonfinite output');
 return out;
}


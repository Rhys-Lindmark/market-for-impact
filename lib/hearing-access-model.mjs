const price=(c,q)=>q>0?10*c/q:null;
export function hearingAccessModel(s){
 const values=[s.cash_cost_per_offer,s.additional_resource_allowance,s.utility_increment,s.local_transfer,s.pre_fitting_completion,s.funding_additionality,s.discount_rate,s.shared_pathway_harm_qaly_per_offer,s.donor_specific_harm_qaly_per_offer,...s.annual_incremental_benefit_fractions];
 if(!values.every(Number.isFinite)||values.some(v=>v<0))throw new Error('Invalid hearing input');
 if([s.local_transfer,s.pre_fitting_completion,s.funding_additionality,...s.annual_incremental_benefit_fractions].some(v=>v>1))throw new Error('Invalid hearing share');
 if(s.annual_incremental_benefit_fractions.length!==s.calendar_horizon_years)throw new Error('Incomplete hearing horizon');
 if(!s.supportBudgetCoversEntireCalendarWindow)throw new Error('Unpriced support horizon');
 const cost=Object.values(s.cash_components).reduce((a,b)=>a+b,0);
 if(Math.abs(cost-s.cash_cost_per_offer)>1e-6)throw new Error('Hearing cost mismatch');
 const effectiveYears=s.annual_incremental_benefit_fractions.reduce((sum,f,i)=>sum+f/(1+s.discount_rate)**(i+1),0);
 // Completion is before fitting; the exposure profile already includes later
 // nonuse, mortality and alternative care. No second retention multiplier.
 const shared=s.funding_additionality===0?0:s.funding_additionality*(s.utility_increment*s.local_transfer*s.pre_fitting_completion*effectiveYears-s.shared_pathway_harm_qaly_per_offer);
 const netQalys=shared-s.donor_specific_harm_qaly_per_offer;
 const grossResourceCost=cost+s.additional_resource_allowance;
 return {effectiveYears,netQalys,costPerTenQalys:price(cost,netQalys),grossResourceCost,resourceCostPerTenQalys:price(grossResourceCost,netQalys),
 status:netQalys>0?'positive':netQalys<0?'harm':'null'};
}

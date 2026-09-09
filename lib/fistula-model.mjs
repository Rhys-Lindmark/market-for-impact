export function integrate(years,rate){return rate===0?years:-Math.expm1(-rate*years)/rate;}
export function calculate(p){
 const required=['gift_usd','expense_per_surgery_2024','marginal_cost_multiplier','unique_patient_fraction','fistula_fraction','financial_additionality','dry_fraction','partial_fraction','dry_utility_gain','partial_utility_gain','advantage_years','delay_years','annual_mortality','annual_effect_decay','discount_rate','procedure_harm_q','independent_harm_q','external_resource_per_nominal_surgery'];
 for(const k of required) if(!Object.hasOwn(p,k)||!Number.isFinite(p[k])) throw new Error('Missing/nonfinite required input '+k);
 for(const [k,v] of Object.entries(p)) if(!Number.isFinite(v)) throw new Error('Nonfinite '+k);
 for(const k of ['unique_patient_fraction','fistula_fraction','financial_additionality','dry_fraction','partial_fraction']) if(p[k]<0||p[k]>1) throw new Error('Invalid probability '+k);
 if(p.dry_fraction+p.partial_fraction>1+1e-12) throw new Error('Overlapping clinical states');
 for(const k of ['gift_usd','expense_per_surgery_2024','marginal_cost_multiplier']) if(p[k]<=0) throw new Error('Nonpositive cost '+k);
 for(const k of ['advantage_years','delay_years','annual_mortality','annual_effect_decay','discount_rate','procedure_harm_q','independent_harm_q','external_resource_per_nominal_surgery']) if(p[k]<0) throw new Error('Negative '+k);
 for(const k of ['dry_utility_gain','partial_utility_gain']) if(Math.abs(p[k])>1) throw new Error('Utility outside [-1,1]');
 if(p.advantage_years>40) throw new Error('Finite clinical horizon exceeded');
 const complete_cash_per_surgery=p.expense_per_surgery_2024*p.marginal_cost_multiplier;
 const nominal_surgeries=p.gift_usd/complete_cash_per_surgery;
 const additional_unique_episodes=nominal_surgeries*p.unique_patient_fraction*p.financial_additionality;
 const additional_fistula_episodes=additional_unique_episodes*p.fistula_fraction;
 const average_utility=p.dry_fraction*p.dry_utility_gain+p.partial_fraction*p.partial_utility_gain;
 const logDiscount=Math.log1p(p.discount_rate);
 const finite_health_years=Math.exp(-(logDiscount+p.annual_mortality)*p.delay_years)*integrate(p.advantage_years,logDiscount+p.annual_mortality+p.annual_effect_decay);
 const gross_q=additional_fistula_episodes*average_utility*finite_health_years;
 const procedure_harm_q=additional_unique_episodes*p.procedure_harm_q;
 const all_region_q=gross_q-procedure_harm_q-p.independent_harm_q;
 const gross_resource_usd=p.gift_usd+nominal_surgeries*p.external_resource_per_nominal_surgery;
 const price=c=>all_region_q>0?10*c/all_region_q:null;
 const result={complete_cash_per_surgery,nominal_surgeries,additional_unique_episodes,additional_fistula_episodes,average_utility,finite_health_years,gross_q,procedure_harm_q,all_region_q,gift_usd:p.gift_usd,gross_resource_usd,donor_per_10q:price(p.gift_usd),resource_per_10q:price(gross_resource_usd),sf_direct_q:0,bay_direct_q:0,sf_direct_per_10q:null,bay_direct_per_10q:null,sf_indirect_q:null,bay_indirect_q:null,status:all_region_q>0?'positive':all_region_q<0?'harm':'zero'};
 for(const [k,v]of Object.entries(result)) if(typeof v==='number'&&!Number.isFinite(v)) throw new Error('Nonfinite output '+k);
 if(complete_cash_per_surgery<=0) throw new Error('Underflow cost');
 return result;
}

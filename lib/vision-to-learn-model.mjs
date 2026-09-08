import model from '../data/us/vision-to-learn-v2.json' with {type:'json'};
export {model as visionToLearn};
export function visionToLearnModel(i){
 for(const key of ['gift_usd','cash_cost_per_delivered_child','incremental_public_per_ca_donor','donation_to_dispensing_years','incremental_calendar_years','discount_rate','in_kind_per_child','shared_harm_qaly_per_child','independent_donor_harm_qaly'])if(!Number.isFinite(i[key])||i[key]<0)throw new RangeError(key);
 if(i.donation_to_dispensing_years>150||i.incremental_calendar_years>150)throw new RangeError('Unbounded timing');
 for(const [key,v] of Object.entries(i))if(typeof v==='number'&&(!Number.isFinite(v)||v<0))throw new RangeError(key);
 for(const key of ['core_fraction','california_budget_fraction','funding_additionality','uncorrected_counterfactual_fraction','wear_fraction','utility_gain_while_worn','bay_share','sf_share','match_ca_bay_share','match_ca_sf_share'])if(!Number.isFinite(i[key])||i[key]>1)throw new RangeError(key);
 if(i.gift_usd<=0||i.cash_cost_per_delivered_child<=0||i.sf_share>i.bay_share||i.match_ca_sf_share>i.match_ca_bay_share)throw new RangeError('Cost or geography');
 const public_usd=i.gift_usd*i.core_fraction*i.california_budget_fraction*i.incremental_public_per_ca_donor;
 const base_delivered_children=i.gift_usd*i.core_fraction/i.cash_cost_per_delivered_child,match_delivered_children=public_usd/i.cash_cost_per_delivered_child;
 const dispensing_discount=(1+i.discount_rate)**(-i.donation_to_dispensing_years);
 const discounted_years=i.discount_rate===0?i.incremental_calendar_years:(1-(1+i.discount_rate)**(-i.incremental_calendar_years))/Math.log(1+i.discount_rate);
 const per=i.funding_additionality*(i.uncorrected_counterfactual_fraction*i.wear_fraction*i.utility_gain_while_worn*discounted_years-i.shared_harm_qaly_per_child)*dispensing_discount;
 const gross_resource_usd=i.gift_usd+public_usd+(base_delivered_children+match_delivered_children)*i.in_kind_per_child;
 const out={donor_usd:i.gift_usd,public_usd,base_delivered_children,match_delivered_children,modeled_delivered_children:base_delivered_children+match_delivered_children,dispensing_discount,discounted_years,calendar_health_end:i.donation_to_dispensing_years+i.incremental_calendar_years,gross_resource_usd};
 for(const[g,b,m]of[['us',1,1],['bay',i.bay_share,i.match_ca_bay_share],['sf',i.sf_share,i.match_ca_sf_share]]){const q=(base_delivered_children*b+match_delivered_children*m)*per-i.independent_donor_harm_qaly*b;out[g+'_qaly']=q;out['donor_per10_'+g]=q>0?10*i.gift_usd/q:null;out['gross_resource_per10_'+g]=q>0?10*gross_resource_usd/q:null;}
 return out;
}

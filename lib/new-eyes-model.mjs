const price=(cost,q)=>q>0&&Number.isFinite(cost*10/q)?cost*10/q:null;
const bounded=(x,lo,hi,name)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)throw Error('Invalid '+name);};
export function scenario(model,s){
 bounded(model.gift_usd,1,1e9,'gift');bounded(model.discount_rate,0,1,'discount');
 for(const[k,lo,hi]of[['weight',0,1],['cost_per_reported_individual',1,1e5],['funding_additionality',0,1],['uncorrected_without_program',0,1],['wear',0,1],['utility_gain',-1,1],['years',0,30],['delay_years',0,10],['shared_harm_q',0,1],['exam_resource_usd',0,1e5],['direct_fee_incidence',0,1]])bounded(s[k],lo,hi,k);
 const recipients=model.gift_usd/s.cost_per_reported_individual;
 const discountedYears=model.discount_rate===0?s.years:Math.log1p(model.discount_rate*s.years)/model.discount_rate;
 const delayDiscount=Math.pow(1+model.discount_rate,-s.delay_years);
 const perRecipientQ=s.funding_additionality*(s.uncorrected_without_program*s.wear*s.utility_gain*discountedYears-s.shared_harm_q)*delayDiscount;
 const giftQ=recipients*perRecipientQ;
 const externalResources=recipients*(s.exam_resource_usd+15*s.direct_fee_incidence);
 return {id:s.id,weight:s.weight,recipients,discounted_years:discountedYears,per_recipient_q:perRecipientQ,gift_q:giftQ,external_resources_usd:externalResources,total_resources_usd:model.gift_usd+externalResources};
}
export function calculate(model,includeFavorable=true){
 bounded(model.geography.bay_share,0,1,'bay share');bounded(model.geography.sf_share,0,model.geography.bay_share,'sf share');
 const rows=model.scenarios.map(s=>scenario(model,s)).filter(s=>includeFavorable||s.id!=='favorable');
 const totalWeight=rows.reduce((n,s)=>n+s.weight,0);if(Math.abs((includeFavorable?1:0.95)-totalWeight)>1e-9)throw Error('Unexpected weight total');
 const q=rows.reduce((n,s)=>n+s.gift_q*s.weight/totalWeight,0);
 const resources=rows.reduce((n,s)=>n+s.total_resources_usd*s.weight/totalWeight,0);
 const region=share=>({q:q*share,donor_per_10q:price(model.gift_usd,q*share),resource_per_10q:price(resources,q*share)});
 return {scenarios:rows,total_weight:totalWeight,expected_q:q,expected_resources_usd:resources,national:region(1),bay:region(model.geography.bay_share),sf:region(model.geography.sf_share)};
}

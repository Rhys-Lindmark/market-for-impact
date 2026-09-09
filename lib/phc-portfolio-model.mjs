export function inputsFor(m,s){const {all={},pathways={},...root}=s.overrides;return {...m.central_inputs,...root,pathways:m.central_inputs.pathways.map(p=>({...p,...all,...pathways[p.id]}))};}
export function calculate(p){
 const root=['gift_usd','discount_rate','annual_mortality','sf_share','bay_share','independent_harm_us_q','external_other_usd'];
 for(const k of root)if(!Number.isFinite(p[k]))throw new Error('Missing/nonfinite '+k);
 if(p.gift_usd<=0||p.discount_rate<0||p.annual_mortality<0||p.independent_harm_us_q<0||p.external_other_usd<0||p.sf_share<0||p.bay_share<p.sf_share||p.bay_share>1)throw new Error('Invalid root');
 if(!Array.isArray(p.pathways)||p.pathways.length!==3||new Set(p.pathways.map(x=>x.id)).size!==3)throw new Error('Three distinct pathways required');
 let allocation=0,gross_resource_usd=p.gift_usd+p.external_other_usd,us_q=-p.independent_harm_us_q;
 const components=p.pathways.map(x=>{
 const keys=['allocation','cash_per_completed','external_per_nominal','financial_additionality','max_additional_completed','nonoverlap_share','utility','effective_use','horizon','delay','alternative_free_share','procedure_harm_q'];
 for(const k of keys)if(!Number.isFinite(x[k]))throw new Error('Missing/nonfinite pathway '+k);
 for(const k of ['allocation','financial_additionality','nonoverlap_share','effective_use','alternative_free_share'])if(x[k]<0||x[k]>1)throw new Error('Invalid fraction '+k);
 if(x.cash_per_completed<=0||x.external_per_nominal<0||x.max_additional_completed<0||Math.abs(x.utility)>1||x.horizon<0||x.horizon>1||x.delay<0||x.procedure_harm_q<0)throw new Error('Invalid pathway');
 allocation+=x.allocation;const cash=p.gift_usd*x.allocation,nominal=cash/x.cash_per_completed;
 const additional=Math.min(nominal*x.financial_additionality,x.max_additional_completed),distinct=additional*x.nonoverlap_share;
 const rate=Math.log1p(p.discount_rate)+p.annual_mortality;
 const years=Math.exp(-rate*x.delay)*(rate===0?x.horizon:-Math.expm1(-rate*x.horizon)/rate)*x.effective_use;
 const gross_q=distinct*x.alternative_free_share*x.utility*years,harm_q=additional*x.procedure_harm_q,net_q=gross_q-harm_q;
 const external=nominal*x.external_per_nominal;gross_resource_usd+=external;us_q+=net_q;
 return {id:x.id,cash,nominal,additional,distinct,years,gross_q,harm_q,net_q,external};
 });
 if(allocation>1+1e-12)throw new Error('Allocation exceeds gift');
 const sf_q=us_q*p.sf_share,bay_q=us_q*p.bay_share,price=(c,q)=>q>0?10*c/q:null;
 const result={components,allocated_fraction:allocation,unmodeled_cash:p.gift_usd*(1-allocation),gift_usd:p.gift_usd,gross_resource_usd,us_q,bay_q,sf_q,donor_us_per_10q:price(p.gift_usd,us_q),donor_bay_per_10q:price(p.gift_usd,bay_q),donor_sf_per_10q:price(p.gift_usd,sf_q),resource_us_per_10q:price(gross_resource_usd,us_q),resource_bay_per_10q:price(gross_resource_usd,bay_q),resource_sf_per_10q:price(gross_resource_usd,sf_q),status:us_q>0?'positive':us_q<0?'harm':'zero'};
 const finite=o=>{for(const v of Object.values(o)){if(typeof v==='number'&&!Number.isFinite(v))throw new Error('Nonfinite output');if(v&&typeof v==='object')finite(v);}};finite(result);return result;
}

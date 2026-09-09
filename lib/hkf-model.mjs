// Pure bounded model; no IO or dependency on a website/runtime.
export function inputsFor(model, scenario) {
  const {all={},pathways={},portfolio,...root}=scenario.overrides;
  const p=structuredClone(model.central_inputs);
  Object.assign(p,root);
  if(portfolio) p.portfolio={...portfolio};
  p.pathways=p.pathways.map(x=>({...x,...all,...pathways[x.id]}));
  return p;
}
const range=(x,lo,hi,k)=>{if(!Number.isFinite(x)||x<lo||x>hi)throw new Error('Invalid '+k);};
export function finiteYears(rate,horizon) { return rate===0?horizon:-Math.expm1(-rate*horizon)/rate; }
export function calculate(p) {
  range(p.gift_usd,1,1e9,'gift');range(p.discount_rate,0,1,'discount');range(p.annual_mortality,0,1,'mortality');
  range(p.sf_share,0,1,'SF');range(p.bay_share,p.sf_share,1,'Bay');range(p.independent_harm_q,0,1e7,'independent harm');range(p.external_other_usd,0,1e10,'outside other');
  const ids=['vision','dental','hearing'],portfolioIds=[...ids,'wellness','education','coverage_appointments','baby_gateway','kids_in_common','turning_wheels','general_operations_fundraising'];
  if(!p.portfolio||Object.keys(p.portfolio).length!==portfolioIds.length)throw new Error('Complete portfolio required');
  for(const k of portfolioIds)range(p.portfolio[k],0,1,k);
  if(Math.abs(Object.values(p.portfolio).reduce((a,b)=>a+b,0)-1)>1e-10)throw new Error('Portfolio must sum to one');
  if(!Array.isArray(p.pathways)||p.pathways.length!==3||new Set(p.pathways.map(x=>x.id)).size!==3||p.pathways.some(x=>!ids.includes(x.id)))throw new Error('Three distinct clinical pathways required');
  let us_q=-p.independent_harm_q,gross_resource_usd=p.gift_usd+p.external_other_usd;
  const components=p.pathways.map(x=>{
    for(const k of ['referral_yield','financial_additionality','completion','treatable_share','nonoverlap','effective_use','no_equivalent_at_start'])range(x[k],0,1,k);
    range(x.screen_cost,1,1e6,'screen cost');range(x.navigation_per_referral,0,1e6,'navigation');range(x.max_additional_screens,0,1e8,'capacity');range(x.utility,-1,1,'utility');
    range(x.horizon,0,x.id==='vision'?5:1,'horizon');range(x.delay,0,5,'delay');
    for(const k of ['alternative_catchup_rate','benefit_loss_rate'])range(x[k],0,20,k);
    range(x.episode_harm_q,0,1,'episode harm');range(x.external_per_screen,0,1e6,'screen outside');range(x.external_per_completed,0,1e6,'clinical outside');
    const cash=p.gift_usd*p.portfolio[x.id],cash_per_screen=x.screen_cost+x.referral_yield*x.navigation_per_referral;
    const nominal_screens=cash/cash_per_screen,nominal_referrals=nominal_screens*x.referral_yield,nominal_completed=nominal_referrals*x.completion;
    const additional_screens=Math.min(nominal_screens*x.financial_additionality,x.max_additional_screens);
    const additional_completed=additional_screens*x.referral_yield*x.completion,distinct_treatable=additional_completed*x.treatable_share*x.nonoverlap;
    const rate=Math.log1p(p.discount_rate)+p.annual_mortality+x.alternative_catchup_rate+x.benefit_loss_rate;
    const effective_years=Math.exp(-Math.log1p(p.discount_rate)*x.delay)*finiteYears(rate,x.horizon)*x.effective_use*x.no_equivalent_at_start;
    const gross_q=distinct_treatable*x.utility*effective_years,harm_q=additional_completed*x.episode_harm_q,net_q=gross_q-harm_q;
    const external=nominal_screens*x.external_per_screen+nominal_completed*x.external_per_completed;
    us_q+=net_q;gross_resource_usd+=external;
    return {id:x.id,cash,cash_per_screen,nominal_screens,nominal_referrals,nominal_completed,additional_screens,additional_completed,distinct_treatable,effective_years,gross_q,harm_q,net_q,external};
  });
  const bay_q=us_q*p.bay_share,sf_q=us_q*p.sf_share,price=(c,q)=>q>0?10*c/q:null;
  const out={components,gift_usd:p.gift_usd,unquantified_cash:p.gift_usd*(1-ids.reduce((s,id)=>s+p.portfolio[id],0)),gross_resource_usd,us_q,overall_q:us_q,bay_q,sf_q,status:us_q>0?'positive':us_q<0?'harm':'zero'};
  for(const [name,q]of [['us',us_q],['bay',bay_q],['sf',sf_q]]) {out['donor_'+name+'_per_10q']=price(p.gift_usd,q);out['resource_'+name+'_per_10q']=price(gross_resource_usd,q);}
  const check=o=>{for(const v of Object.values(o)){if(typeof v==='number'&&!Number.isFinite(v))throw new Error('Nonfinite output');if(v&&typeof v==='object')check(v);}};check(out);return out;
}

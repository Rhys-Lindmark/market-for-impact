const price = (cost, q) => q > 0 ? 10 * cost / q : null;
const finite = values => { if (!values.every(Number.isFinite)) throw new Error('Nonfinite policy input'); };
const share = values => { if (values.some(v => v < 0 || v > 1)) throw new Error('Invalid policy share'); };

export function hacModel(s) {
  const {donor_cost_usd:c,net_sf_homes_H:h,incremental_completion_probability_p:p,
    funding_additionality_a:a,health_affected_people_per_net_home:n,net_annual_utility_change:u,
    discounted_incremental_health_years:t,donor_specific_harm_qalys:loss}=s;
  finite([c,h,p,a,n,u,t,loss]); share([p,a]);
  if ([c,h,n,t,loss].some(v=>v<0) || Math.abs(u)>1) throw new Error('Invalid HAC input');
  // p already includes other-provider/completion counterfactuals. Shared health
  // harms are net inside u; only independent donor harm belongs outside a.
  const attributableHomes=h*p*a, netQalysPerHome=n*u*t;
  const netQalys=attributableHomes*netQalysPerHome-loss;
  return {attributableHomes,netQalysPerHome,netQalys,costPerTenQalys:price(c,netQalys),
    status:netQalys>0?'positive':netQalys<0?'harm':'null'};
}

export function resolveHacScenario(data,s) {
  if (!s.inherits) return s;
  const base=data.scenarios.find(v=>v.id===s.inherits);
  if (!base || base.inherits) throw new Error('Invalid scenario inheritance');
  return {...base,...s.overrides,id:s.id,label:s.id};
}

export function spurModel(s) {
  const {donorCostUsd:c,fraction:f,realization:p,contribution:a,effectiveYears:t,
    sfShare:g,deaths:d,qalysPerDeath:l,harm:h}=s;
  finite([c,f,p,a,t,g,d,l,h]); share([f,p,a,g]);
  if ([c,t,d,l,h].some(v=>v<0)) throw new Error('Invalid SPUR input');
  // t handles exposure/mortality timing; l is remaining health at case time.
  // h is already-net grant-attributable harm, not raw installation harm.
  const grossQalys=f*p*a*t*g*d*l,netQalys=grossQalys-h;
  return {grossQalys,netQalys,costPerTenQalys:price(c,netQalys),
    status:netQalys>0?'positive':netQalys<0?'harm':'null'};
}

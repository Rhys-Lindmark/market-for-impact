// Pure design calculator. No I/O; not a report API or accepted whole-org expectation.
const number=(x,name,lo,hi)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<lo||x>hi)throw new RangeError(name);return x;};
export const flow=(hazard,years)=>hazard===0?years:-Math.expm1(-hazard*years)/hazard;
export function survivalQ({base,rescue,hr,rescueYears,moudYears,horizon,utility,discount,delay}) {
  number(base,'base',0,1);number(rescue,'rescue',-base,base);number(hr,'hr',0,2);
  for(const [k,v] of Object.entries({rescueYears,moudYears,horizon,delay}))number(v,k,0,30);
  number(utility,'utility',0,1);number(discount,'discount',0,0.2);
  const cuts=[...new Set([0,Math.min(rescueYears,horizon),Math.min(moudYears,horizon),horizon])].sort((a,b)=>a-b);
  let s0=1,s1=1,q=0;const r=Math.log1p(discount);
  for(let i=1;i<cuts.length;i++){
    const t=cuts[i-1],dt=cuts[i]-t;
    const h1=(base-(t<rescueYears?rescue:0))*(t<moudYears?hr:1);
    q+=Math.exp(-r*t)*(s1*flow(h1+r,dt)-s0*flow(base+r,dt));
    s0*=Math.exp(-base*dt);s1*=Math.exp(-h1*dt);
  }
  return utility*Math.exp(-r*delay)*q;
}
export function calculate(m){
  const s=m.shared,p=m.survival,h=m.housing;
  for(const k of ['gift','capacity_gift'])number(s[k],k,0,1e7);
  for(const k of ['discount'])number(s[k],k,0,.2);
  for(const k of ['bay','sf','funding_additionality','common_external_fraction'])number(s[k],k,0,1);
  number(s.independent_harm_q,'independent_harm_q',0,1e5);
  if(s.sf>s.bay)throw new RangeError('nested geography');
  const allocationIds=['rescue','housing','meals','parenting','childcare','women','moud','behavioral','infection_linkage','wound_care','policy','common_operations','property_affiliate'];
  let sum=0;for(const id of allocationIds)sum+=number(m.allocation[id],id,0,1);
  if(Math.abs(sum-1)>1e-10||Object.keys(m.allocation).length!==allocationIds.length)throw new RangeError('allocation partition');
  const effectiveGift=Math.min(s.gift,s.capacity_gift),budget=id=>effectiveGift*m.allocation[id];
  for(const k of ['rescue_cost','moud_annual_foundation_cost'])number(p[k],k,1,1e6);
  for(const k of ['rescue_external','moud_annual_external_cost'])number(p[k],k,0,1e6);
  for(const k of ['rescue_capacity','moud_capacity'])number(p[k],k,0,1e5);
  for(const k of ['rescue_active_years','moud_active_years','horizon_years','delay_years'])number(p[k],k,0,30);
  for(const k of ['moud_no_gift_treatment_share','moud_effective_retention','moud_causal_transfer','rescue_moud_overlap','utility'])number(p[k],k,0,1);
  number(p.baseline_all_cause_hazard,'baseline',0,1);number(p.rescue_hazard_reduction,'rescue reduction',-p.baseline_all_cause_hazard,p.baseline_all_cause_hazard);number(p.moud_observed_hr,'HR',0,2);
  for(const k of ['rescue_harm_q','moud_harm_q'])number(p[k],k,0,1);
  const nr0=Math.min(budget('rescue')/(p.rescue_cost*Math.max(1,p.rescue_active_years)),p.rescue_capacity);
  const nm0=Math.min(budget('moud')/(p.moud_annual_foundation_cost*Math.max(1,p.moud_active_years)),p.moud_capacity);
  const nr=nr0*s.funding_additionality,nm=nm0*s.funding_additionality*(1-p.moud_no_gift_treatment_share)*p.moud_effective_retention;
  const shared=Math.min(nr,nm)*p.rescue_moud_overlap,hr=1-(1-p.moud_observed_hr)*p.moud_causal_transfer;
  const args={base:p.baseline_all_cause_hazard,rescue:p.rescue_hazard_reduction,hr,rescueYears:p.rescue_active_years,moudYears:p.moud_active_years,horizon:p.horizon_years,utility:p.utility,discount:s.discount,delay:p.delay_years};
  const qr=survivalQ({...args,moudYears:0}),qm=survivalQ({...args,rescueYears:0}),qb=survivalQ(args);
  const survival=(nr-shared)*qr+(nm-shared)*qm+shared*qb-nr*p.rescue_harm_q-nm*p.moud_harm_q;
  let external=effectiveGift*s.common_external_fraction+nr0*p.rescue_external*Math.max(1,p.rescue_active_years)+nm0*p.moud_annual_external_cost*Math.max(1,p.moud_active_years);
  for(const k of ['cost'])number(h[k],k,1,1e6);
  for(const k of ['external','cash_transfer'])number(h[k],k,0,1e6);
  if(h.cash_transfer>h.cost)throw new RangeError('rent transfer exceeds cost');
  number(h.capacity,'housing capacity',0,1e5);
  for(const k of ['no_gift_stability','unique_health'])number(h[k],k,0,1);
  number(h.incremental_stability,'stability difference',-h.no_gift_stability,1-h.no_gift_stability);
  number(h.utility,'housing utility',-1,1);number(h.years,'housing years',0,10);
  for(const k of ['catchup_hazard','mortality','delay','harm_q'])number(h[k],k,0,10);
  const hn0=Math.min(budget('housing')/(h.cost*Math.max(1,h.years)),h.capacity),hn=hn0*s.funding_additionality*h.unique_health;
  const housing=hn*(h.incremental_stability*h.utility*Math.exp(-Math.log1p(s.discount)*h.delay)*flow(h.catchup_hazard+h.mortality+Math.log1p(s.discount),h.years)-h.harm_q);
  external+=hn0*h.external*Math.max(1,h.years);
  const rows=[];const ids=['meals','parenting','childcare','women','behavioral','infection_linkage','wound_care'];
  if(m.groups.length!==ids.length||new Set(m.groups.map(g=>g.id)).size!==ids.length)throw new RangeError('group partition');
  number(m.hcv_external_treatment_cost,'HCV external',0,1e6);
  for(const g of m.groups){
    if(!ids.includes(g.id))throw new RangeError('group id');
    number(g.cost,'group cost',1,1e6);number(g.external,'group external',0,1e6);number(g.capacity,'group capacity',0,1e5);
    for(const k of ['target','unique_health'])number(g[k],k,0,1);
    for(const k of ['response','utility'])number(g[k],k,-1,1);
    number(g.years,'years',0,10);number(g.cost_basis_years,'cost basis',1/365,10);
    for(const k of ['catchup','mortality','delay','harm_q'])number(g[k],k,0,10);
    const durationCost=Math.max(1,g.years/g.cost_basis_years);
    const nominal=Math.min(budget(g.id)/(g.cost*durationCost),g.capacity),incremental=nominal*s.funding_additionality;
    const q=incremental*(g.unique_health*g.target*g.response*g.utility*Math.exp(-Math.log1p(s.discount)*g.delay)*flow(g.catchup+g.mortality+Math.log1p(s.discount),g.years)-g.harm_q);
    let outside=nominal*g.external*durationCost;
    if(g.id==='infection_linkage')outside+=nominal*g.target*m.hcv_external_treatment_cost;
    external+=outside;rows.push({id:g.id,nominal,incremental,qaly:q,external:outside});
  }
  const total=survival+housing+rows.reduce((a,g)=>a+g.qaly,0)-s.independent_harm_q;
  const transfer=hn0*h.cash_transfer*Math.max(1,h.years),funding=s.gift+external,resources=funding-transfer;
  const geo=share=>({qaly:total*share,donor_per_10q:total*share>0?s.gift*10/(total*share):null,gross_resources_per_10q:total*share>0?resources*10/(total*share):null});
  const out={rescue_nominal:nr0,moud_nominal:nm0,rescue_incremental:nr,moud_incremental:nm,shared_survival_people:shared,rescue_q_per_person:qr,moud_q_per_person:qm,joint_q_per_person:qb,survival_q:survival,housing_q:housing,groups:rows,gross_external:external,gross_associated_funding:funding,rental_transfer_excluded:transfer,gross_resources:resources,us:geo(1),bay:geo(s.bay),sf:geo(s.sf)};
  const check=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite output');if(x&&typeof x==='object')Object.values(x).forEach(check);};check(out);return out;
}

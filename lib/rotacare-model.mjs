// Five years of offered care; first-event differences only. All gift dollars retained.
export function rotacareModel(p) {
 const fractions=['bp_allocation_fraction','baseline_five_year_first_cvd_risk','funding_additionality','fatal_event_share','stroke_event_share','mi_event_share','hf_event_share','fatal_utility','fatal_annual_competing_mortality','stroke_utility_loss','mi_utility_loss','hf_utility_loss','sf_health_share','rest_bay_health_share'];
 const positive=['gift_usd','annual_cash_cost_usd','rr_per_10_mm_hg'];
 const nonnegative=['annual_unpaid_resource_usd','achieved_sbp_difference_mm_hg','discount','shared_qaly_harm_per_offer','donor_specific_qaly_harm'];
 const horizons=['course_years','fatal_years','stroke_years','mi_years','hf_years'];
 for(const k of [...fractions,...positive,...nonnegative,...horizons]) if(!Number.isFinite(p[k]))throw Error('Nonfinite or missing '+k);
 for(const k of fractions)if(p[k]<0||p[k]>1)throw Error('Invalid fraction '+k);
 for(const k of positive)if(p[k]<=0)throw Error('Nonpositive '+k);
 for(const k of nonnegative)if(p[k]<0)throw Error('Negative '+k);
 for(const k of horizons)if(!Number.isInteger(p[k])||p[k]<0||p[k]>150)throw Error('Invalid horizon '+k);
 if(p.course_years!==5||p.rr_per_10_mm_hg>1||p.sf_health_share+p.rest_bay_health_share>1||typeof p.clip_health_at_course_end!=='boolean')throw Error('Invalid scope');
 if(Math.abs(['fatal','stroke','mi','hf'].reduce((a,t)=>a+p[t+'_event_share'],0)-1)>1e-9)throw Error('Event shares must sum to one');
 const offered_five_year_courses=p.gift_usd*p.bp_allocation_fraction/(p.annual_cash_cost_usd*p.course_years);
 const cumulative_rr=p.rr_per_10_mm_hg**(p.achieved_sbp_difference_mm_hg/10);
 const eventQ=(remaining=150)=>['fatal','stroke','mi','hf'].reduce((sum,t)=>{
  const u=t==='fatal'?p.fatal_utility:p[t+'_utility_loss'];let q=0;
  for(let k=1;k<=Math.min(p[t+'_years'],remaining);k++)q+=u*(1-p.fatal_annual_competing_mortality)**k/(1+p.discount)**k;
  return sum+p[t+'_event_share']*q;
 },0);
 const weighted_qaly_per_first_event=eventQ();
 const pc=1-(1-p.baseline_five_year_first_cvd_risk)**(1/5),pt=1-(1-p.baseline_five_year_first_cvd_risk*cumulative_rr)**(1/5);
 const event_schedule=[];let unadjusted_health_per_offer=0;
 for(let year=1;year<=5;year++){
  const absolute_first_event_difference=(1-pc)**(year-1)*pc-(1-pt)**(year-1)*pt;
  const q=p.clip_health_at_course_end?eventQ(5-year):weighted_qaly_per_first_event;
  unadjusted_health_per_offer+=absolute_first_event_difference*q/(1+p.discount)**year;
  event_schedule.push({year,absolute_first_event_difference,...(p.clip_health_at_course_end?{clipped_qaly_per_first_event:q}:{})});
 }
 const q=offered_five_year_courses*p.funding_additionality*(unadjusted_health_per_offer-p.shared_qaly_harm_per_offer)-p.donor_specific_qaly_harm;
 const gross_resource_usd=p.gift_usd+offered_five_year_courses*p.course_years*p.annual_unpaid_resource_usd;
 const region=share=>{const qaly=q*share;return {qaly,donor_usd_per_qaly:qaly>0?p.gift_usd/qaly:null,donor_usd_per_10_qaly:qaly>0?10*p.gift_usd/qaly:null,gross_resource_usd_per_10_qaly:qaly>0?10*gross_resource_usd/qaly:null};};
 return {offered_five_year_courses,cumulative_rr,event_schedule,weighted_qaly_per_first_event,unadjusted_health_per_offer,gross_resource_usd,global:region(1),bay:region(p.sf_health_share+p.rest_bay_health_share),sf:region(p.sf_health_share)};
}

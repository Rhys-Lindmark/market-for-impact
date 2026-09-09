// Pure conditional whole-gift model. No I/O, fitted parameters, or live state.
export const central = Object.freeze({gift:100000,allocation:0.5,course_cash:100,additionality:0.5,unique_fraction:0.5,event_hazard:0.2,active_years:1,horizon_years:15,delay_years:0.05,mortality_hazard:0.07,discount:0.03,utility:0.7,fatality_difference:0.05,course_harm_q:0,independent_harm_q:0,alternative_q:0,public_per_course:20,private_per_course:20,ems_per_event:100,real_savings:0,bay_share:0.02,sf_share:0,harm_bay_share:0.02,harm_sf_share:0});
export const scenarios = Object.freeze({central:{},favorable_joint:{allocation:0.7,course_cash:40,additionality:0.8,unique_fraction:0.8,event_hazard:0.4,fatality_difference:0.1,mortality_hazard:0.04,horizon_years:20},pessimistic_positive:{allocation:0.2,course_cash:250,additionality:0.2,unique_fraction:0.25,event_hazard:0.05,fatality_difference:0.01,horizon_years:10},zero_allocation:{allocation:0},replacement_only:{additionality:0},no_use:{event_hazard:0},no_incremental_rescue:{fatality_difference:0},short_access:{active_years:0.25},five_year_horizon:{horizon_years:5},zero_horizon:{horizon_years:0},negative_clinical_effect:{fatality_difference:-0.02},independent_harm_no_activity:{allocation:0,independent_harm_q:0.2},target_failure_displaced_alternative:{fatality_difference:0,alternative_q:1},course_burden:{course_harm_q:0.02},donor_pays_outside:{course_cash:140,public_per_course:0,private_per_course:0},no_bay_health:{bay_share:0,harm_bay_share:0},resource_saving_diagnostic:{real_savings:150000},zero_associated_resources:{public_per_course:0,private_per_course:0,ems_per_event:0}});
const probabilities=['allocation','additionality','unique_fraction','utility','bay_share','sf_share','harm_bay_share','harm_sf_share'];
export function validate(p){
 for(const k of Object.keys(central)) if(typeof p[k]!=='number'||!Number.isFinite(p[k])) throw new RangeError('Missing/nonfinite '+k);
 for(const k of probabilities) if(p[k]<0||p[k]>1) throw new RangeError(k);
 const limits={gift:[1,1e9],course_cash:[1,1e6],event_hazard:[0,5],active_years:[0,5],horizon_years:[0,50],delay_years:[0,10],mortality_hazard:[0,1],discount:[0,0.2],fatality_difference:[-1,1],course_harm_q:[0,50],independent_harm_q:[0,1e8],alternative_q:[0,1e8],public_per_course:[0,1e6],private_per_course:[0,1e6],ems_per_event:[0,1e6],real_savings:[-1e9,1e9]};
 for(const [k,[lo,hi]] of Object.entries(limits)) if(p[k]<lo||p[k]>hi) throw new RangeError(k);
 if(p.sf_share>p.bay_share||p.harm_sf_share>p.harm_bay_share) throw new RangeError('Geography nesting');
}
export function annuity(rate,years){return rate===0?years:-Math.expm1(-rate*years)/rate;}
// Simpson integration on a bounded domain. First eligible use only; no new
// lifetime for repeat reports. Background mortality competes before and after.
export function eventIntegrals(p,steps=2048){
 const T=Math.min(p.active_years,p.horizon_years),l=p.event_hazard,m=p.mortality_hazard,d=p.discount;
 if(T===0||l===0)return {event_probability:0,health_integral:0};
 const prob=l*annuity(l+m,T),dt=T/steps;
 let sum=0;
 for(let i=0;i<=steps;i++){let t=i*dt;let f=l*Math.exp(-(l+m+d)*t)*annuity(m+d,p.horizon_years-t);sum+=(i===0||i===steps?1:i%2?4:2)*f;}
 return {event_probability:prob,health_integral:sum*dt/3*Math.exp(-d*p.delay_years)};
}
export function calculate(p){
 validate(p);
 const courses=p.gift*p.allocation/p.course_cash,added_courses=courses*p.additionality,people=added_courses*p.unique_fraction;
 const {event_probability,health_integral}=eventIntegrals(p),events=people*event_probability;
 const benefit=people*p.fatality_difference*p.utility*health_integral;
 const loss=added_courses*p.course_harm_q+p.independent_harm_q+p.alternative_q;
 const q={us:benefit-loss,bay:benefit*p.bay_share-loss*p.harm_bay_share,sf:benefit*p.sf_share-loss*p.harm_sf_share};
 for(const key of Object.keys(q)) if(Object.is(q[key],-0)) q[key]=0;
 const outside=p.public_per_course+p.private_per_course,ems=events*p.ems_per_event;
 const gross_resources=p.gift+courses*outside+courses*p.unique_fraction*event_probability*p.ems_per_event;
 const net_resources=p.gift+added_courses*outside+ems-p.real_savings;
 const ratio=(cost,x)=>x>0?10*cost/x:null;
 const prices={};for(const k of ['us','bay','sf'])prices[k]={donor:ratio(p.gift,q[k]),gross:ratio(gross_resources,q[k]),net:ratio(net_resources,q[k])};
 const out={courses,added_courses,people,events,event_probability,health_integral,benefit,loss,q,gross_resources,net_resources,prices};
 const check=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('Nonfinite output');if(x&&typeof x==='object')Object.values(x).forEach(check);};check(out);return out;
}
export function runScenarios(){return Object.fromEntries(Object.entries(scenarios).map(([k,v])=>[k,calculate({...central,...v})]));}

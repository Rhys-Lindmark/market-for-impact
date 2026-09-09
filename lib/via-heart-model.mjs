// Via Heart whole-gift partial-health model. All causal inputs are explicit priors.
export function annuity(r,t){return r===0?t:-Math.expm1(-r*t)/r;}
export function integral(hazard,active,horizon,mortality,discount){
 const T=Math.min(active,horizon); if(T===0||hazard===0)return 0;
 const n=2048,dt=T/n;
 const f=t=>hazard*Math.exp(-(hazard+discount)*t)*annuity(mortality+discount,horizon-t);
 let s=f(0)+f(T);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(i*dt);return s*dt/3;
}
export const bounds={gift:[1,1e9],new_allocation:[0,1],maintenance_allocation:[0,1],new_cash:[1,1e7],maintenance_cash:[1,1e7],new_additionality:[0,1],maintenance_additionality:[0,1],new_distinct:[0,1],maintenance_distinct:[0,1],new_hazard:[0,1],maintenance_hazard:[0,1],new_active:[0,5],maintenance_active:[0,1],new_baseline:[0,1],maintenance_baseline:[0,1],new_increment:[-1,1],maintenance_increment:[-1,1],survival_gain:[0,1],horizon:[0,30],mortality:[0,1],utility:[0,1],discount:[0,1],delay:[0,10],us_share:[0,1],bay_share:[0,1],sf_share:[0,1],harm_us_share:[0,1],harm_bay_share:[0,1],harm_sf_share:[0,1],harm_per_added_course:[0,100],independent_harm_q:[0,1e6],alternative_health_q:[0,1e6],new_outside:[0,1e7],maintenance_outside:[0,1e7],medical_per_added_survivor:[0,1e7],real_resource_savings:[-1e9,1e9]};
export function calculate(p){
 if(p.new_active>5||p.maintenance_active>1)throw Error("Duration exceeds funded package");
 for(const [k,[lo,hi]]of Object.entries(bounds))if(typeof p[k]!=="number"||!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)throw Error("Invalid "+k);
 if(p.new_allocation+p.maintenance_allocation>1+1e-12)throw Error("Allocation exceeds gift");
 for(const prefix of ["","harm_"])if(p[prefix+"sf_share"]>p[prefix+"bay_share"]||p[prefix+"bay_share"]>p[prefix+"us_share"])throw Error("Geography not nested");
 let benefit=0,addedSurvivors=0,addedCourses=0,grossOutside=0,netOutside=0;const branches={};
 for(const b of ["new","maintenance"]){
  if(p[b+"_baseline"]+p[b+"_increment"]<0||p[b+"_baseline"]+p[b+"_increment"]>1)throw Error("Invalid covered-response probability");
  const nominal=p.gift*p[b+"_allocation"]/p[b+"_cash"],added=nominal*p[b+"_additionality"],distinct=added*p[b+"_distinct"];
  const firstEvents=distinct*(-Math.expm1(-p[b+"_hazard"]*Math.min(p[b+"_active"],p.horizon)));
  const survivors=firstEvents*p[b+"_increment"]*p.survival_gain;
  const q=distinct*p[b+"_increment"]*p.survival_gain*p.utility*Math.exp(-p.discount*p.delay)*integral(p[b+"_hazard"],p[b+"_active"],p.horizon,p.mortality,p.discount);
  branches[b]={nominal,added,distinct,firstEvents,survivors,q};
  benefit+=q;addedSurvivors+=survivors;addedCourses+=added;
  grossOutside+=nominal*p[b+"_outside"];netOutside+=added*p[b+"_outside"];
 }
 const harm=addedCourses*p.harm_per_added_course+p.independent_harm_q+p.alternative_health_q;
 const medical=Math.max(0,addedSurvivors)*p.medical_per_added_survivor;
 const gross=p.gift+grossOutside+medical,net=p.gift+netOutside+medical-p.real_resource_savings;
 const q={total:benefit-harm};for(const r of ["us","bay","sf"])q[r]=benefit*p[r+"_share"]-harm*p["harm_"+r+"_share"];
 const prices={};for(const r of Object.keys(q))prices[r]={donor:q[r]>0?10*p.gift/q[r]:null,gross:q[r]>0?10*gross/q[r]:null,net:q[r]>0?10*net/q[r]:null};
 const out={branches,benefit,harm,q,costs:{gift:p.gift,gross,net,medical,grossOutside,netOutside},prices};
 function check(x){if(typeof x==="number"&&!Number.isFinite(x))throw Error("Nonfinite output");if(x&&typeof x==="object")Object.values(x).forEach(check);}check(out);return out;
}

import assert from 'node:assert/strict';
import {central,scenarios,calculate,runScenarios,eventIntegrals} from '../lib/next-distro-model.mjs';
let checks=0;const ok=(x)=>{assert.ok(x);checks++;};const near=(a,b,tol=1e-7)=>ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)));
const all=runScenarios();
for(const [name,r] of Object.entries(all)){
 const p={...central,...scenarios[name]};
 near(r.courses*p.course_cash,p.gift*p.allocation);ok(r.people<=r.added_courses&&r.events<=r.people+1e-8);ok(r.event_probability>=0&&r.event_probability<=1);
 ok(Math.abs(r.benefit)<=r.people*p.horizon_years*p.utility+1e-8);
 for(const k of ['us','bay','sf']){const v=r.prices[k];for(const [j,c] of [['donor',p.gift],['gross',r.gross_resources],['net',r.net_resources]]){if(r.q[k]>0)near(v[j]*r.q[k],10*c);else ok(v[j]===null);}}
 near(eventIntegrals(p,4096).health_integral,r.health_integral,1e-8);
}
near(all.central.q.sf,0);ok(all.favorable_joint.q.us>all.central.q.us);ok(all.negative_clinical_effect.q.us<0);near(all.target_failure_displaced_alternative.q.us,-1);near(all.independent_harm_no_activity.q.us,-0.2);
for(const k of ['zero_allocation','replacement_only','no_use','no_incremental_rescue','zero_horizon'])near(all[k].q.us,0);
ok(all.resource_saving_diagnostic.net_resources<0);ok(all.resource_saving_diagnostic.prices.us.net<0);
near(all.central.gross_resources,124381.8612159842);near(all.central.net_resources,112190.9306079921);
// Independent midpoint integration of first event time and finite remaining life.
let mid=0,n=100000,p=central,T=Math.min(p.active_years,p.horizon_years);
for(let i=0;i<n;i++){let t=(i+0.5)*T/n;let tail=-Math.expm1(-(p.mortality_hazard+p.discount)*(p.horizon_years-t))/(p.mortality_hazard+p.discount);mid+=p.event_hazard*Math.exp(-(p.event_hazard+p.mortality_hazard+p.discount)*t)*tail*T/n;}
near(all.central.health_integral,mid*Math.exp(-p.discount*p.delay_years),1e-9);
// Closed form no-background-hazard, no-discount finite horizon.
p={...central,mortality_hazard:0,discount:0};let l=p.event_hazard;
let expected=p.horizon_years*(-Math.expm1(-l))-(-Math.expm1(-l)-l*Math.exp(-l))/l;
near(calculate(p).health_integral,expected,1e-9);
for(const key of Object.keys(central)){const bad={...central};delete bad[key];assert.throws(()=>calculate(bad));checks++;for(const v of [NaN,Infinity,-Infinity]){assert.throws(()=>calculate({...central,[key]:v}));checks++;}}
for(const bad of [{course_cash:0},{gift:0},{allocation:1.1},{sf_share:0.5},{event_hazard:6},{active_years:6},{horizon_years:51},{fatality_difference:2}]){assert.throws(()=>calculate({...central,...bad}));checks++;}
let seed=20260908;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<500;i++){
 let p={...central,gift:1+rand()*1e8,allocation:rand(),course_cash:1+rand()*1e5,additionality:rand(),unique_fraction:rand(),event_hazard:5*rand(),active_years:5*rand(),horizon_years:50*rand(),mortality_hazard:rand(),discount:0.2*rand(),utility:rand(),fatality_difference:2*rand()-1,course_harm_q:rand(),independent_harm_q:rand(),alternative_q:rand(),real_savings:1e8*(2*rand()-1)};
 let r=calculate(p);ok(Number.isFinite(r.q.us));ok(r.events<=r.people+1e-8);near(eventIntegrals(p,4096).health_integral,r.health_integral,1e-8);
}
for(const [m,d,l] of [[0,0,0],[1,0.2,5],[0,0,5],[1,0,1e-10],[1e-10,1e-10,1e-10]]){let p={...central,mortality_hazard:m,discount:d,event_hazard:l,active_years:5,horizon_years:50};let r=calculate(p);near(r.health_integral,eventIntegrals(p,8192).health_integral,1e-8);ok(r.benefit<=r.people*50+1e-7);}
console.log(JSON.stringify({status:'PASS',scenarios:Object.keys(all).length,checks,central:all.central},null,2));

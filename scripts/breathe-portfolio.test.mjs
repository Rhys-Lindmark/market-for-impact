import fs from 'node:fs';import assert from 'node:assert/strict';import {calculate,cessationGain,INPUT_BOUNDS} from '../lib/breathe-portfolio-model.mjs';
const m=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/breathe-portfolio-model-v1.json',import.meta.url))),r=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/breathe-portfolio-report.json',import.meta.url)));
let checks=0;const ck=x=>{assert.ok(x);checks++},near=(a,b,tol=1e-8)=>ck(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)));
function propagate(v,t,ms,mq,a,b){
 const A=-ms-a,B=b,C=a,D=-mq-b,mid=(A+D)/2,gap=Math.sqrt((A-D)**2+4*B*C)/2,l1=mid+gap,l2=mid-gap;
 if(gap<1e-12){const e=Math.exp(mid*t);return[e*(v[0]+t*((A-mid)*v[0]+B*v[1])),e*(v[1]+t*(C*v[0]+(D-mid)*v[1]))];}
 const e1=Math.exp(l1*t),e2=Math.exp(l2*t),z=(e1-e2)/(2*gap);return[e2*v[0]+z*((A-l2)*v[0]+B*v[1]),e2*v[1]+z*(C*v[0]+(D-l2)*v[1])];
}
function exactStateQuadrature(p){
 let v=[-1,1],q=0;const H=p.cessation_horizon,lag=Math.min(H,p.mortality_recovery_lag),d=Math.log1p(p.discount);
 for(const[start,end,mq]of [[0,lag,p.smoking_mortality],[lag,H,p.quit_mortality]]){if(end<=start)continue;const n=4000,h=(end-start)/n;let sum=0;for(let j=0;j<=n;j++){const x=propagate(v,j*h,p.smoking_mortality,mq,p.background_quit_hazard,p.relapse_hazard);sum+=(j===0||j===n?1:j%2?4:2)*(p.smoking_utility*x[0]+p.quit_utility*x[1])*Math.exp(-d*(start+j*h));}q+=h*sum/3;v=propagate(v,end-start,p.smoking_mortality,mq,p.background_quit_hazard,p.relapse_hazard);}
 return q*Math.exp(-d*p.cessation_delay);
}
for(const[i,s]of m.scenarios.entries()){
 const p={...m.central_inputs,...s.overrides},o=calculate(p);assert.deepEqual(o,s.outputs);checks++;
 near(o.qaly_per_extra_initial_quit,exactStateQuadrature(p));near(o.qaly_per_extra_initial_quit,cessationGain(p,240),1e-9);
 near(o.unquantified_gift_usd+p.gift_usd*(p.cessation_allocation+p.asthma_allocation),p.gift_usd);
 near(o.cessation_net_qaly,p.gift_usd*p.cessation_allocation/p.cessation_cash_per_offer*p.cessation_additionality*(p.extra_six_month_quit*o.qaly_per_extra_initial_quit-p.cessation_harm_per_added_offer));
 const rows=JSON.parse(r.model.sensitivity[i].detail);
 for(const reg of ['us','bay','sf']){assert.deepEqual(rows[reg],o[reg]);checks++;const share=prefix=>reg==='us'?1:p[prefix+'_'+reg+'_share'];near(o[reg].qaly,o.cessation_net_qaly*share('cessation')+o.asthma_net_qaly*share('asthma')-p.independent_harm_q*share('harm'));for(const[k,c]of [['donor_per_10q',p.gift_usd],['gross_resource_per_10q',o.gross_resource_usd]]){if(o[reg].qaly>0&&c>0)near(o[reg][k],10*c/o[reg].qaly);else ck(o[reg][k]===null);}}
 near(rows.gross_resources,o.gross_resource_usd);
}
for(const k of Object.keys(INPUT_BOUNDS)){const x={...m.central_inputs};delete x[k];assert.throws(()=>calculate(x));checks++;const[lo,hi]=INPUT_BOUNDS[k];for(const bad of[NaN,Infinity,-Infinity,'0',null,lo-1,hi+1]){assert.throws(()=>calculate({...m.central_inputs,[k]:bad}));checks++;}}
for(const pre of['cessation','asthma','harm']){assert.throws(()=>calculate({...m.central_inputs,[pre+'_sf_share']:.9,[pre+'_bay_share']:.1}));checks++;}
assert.throws(()=>calculate({...m.central_inputs,cessation_allocation:.8,asthma_allocation:.8}));checks++;
near(m.allocation.reduce((a,b)=>a+b.share,0),1);ck(m.organization.ein==='94-1156307');
const get=id=>m.scenarios.find(s=>s.id===id).outputs;for(const id of['replacement_only','no_quantified_allocation','no_clinical_effect','zero_horizons'])ck(get(id).us.qaly===0);
ck(get('signed_clinical_harm').us.qaly<0);ck(get('shared_harm').us.qaly<0);ck(get('independent_harm_zero_activity').us.qaly===-.1);ck(get('no_sf_health').sf.qaly===0);
ck(get('donor_pays_external').gross_resource_usd===100000);ck(get('donor_pays_external').cessation_offers<get('central').cessation_offers);ck(get('no_child_allocation').asthma_net_qaly===0);
const allAgeHarm=calculate({...m.central_inputs,asthma_child_fraction:0,asthma_harm_per_added_offer:.01});ck(allAgeHarm.asthma_net_qaly<0);
const noStateDifference={...m.central_inputs,smoking_mortality:.01,quit_mortality:.01,smoking_utility:.8,quit_utility:.8};near(cessationGain(noStateDifference),0,1e-12);
const pureMorbidity={...noStateDifference,background_quit_hazard:0,relapse_hazard:0,discount:0,smoking_utility:.7,quit_utility:.8,smoking_mortality:0,quit_mortality:0};near(cessationGain(pureMorbidity),1,1e-10);
let seed=51;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2**32};function finite(o){for(const v of Object.values(o))if(v&&typeof v==='object')finite(v);else if(typeof v==='number')ck(Number.isFinite(v));}
for(let i=0;i<500;i++){const p=Object.fromEntries(Object.entries(INPUT_BOUNDS).map(([k,[lo,hi]])=>[k,lo+random()*(hi-lo)]));p.asthma_allocation*=1-p.cessation_allocation;for(const pre of['cessation','asthma','harm'])p[pre+'_sf_share']*=p[pre+'_bay_share'];const o=calculate(p);finite(o);ck(Math.abs(o.qaly_per_extra_initial_quit)<=p.cessation_horizon+1e-8);ck(Math.abs(o.qaly_per_added_child)<=p.asthma_years+1e-8);if(i<20)near(o.qaly_per_extra_initial_quit,exactStateQuadrature(p),2e-7);}
for(const[o,keys]of[[r,['organization','eyebrow','program','published','modelVersion']],[r.nutshell,['headline','body','whyItMayWork','whyWeAreCautious','recommendationBlocker']],[r.programSection,['body','boundary']],[r.model,['headline','body','giftHeading','fundingBoundary']],[r.model.equation,['label','expression','result']]])for(const k of keys)ck(typeof o[k]==='string');
for(const[rows,keys]of[[r.summary,['label','value','detail']],[r.programSection.steps,['title','detail']],[r.model.inputs,['key','label','confidence','best','range','basis']],[r.model.sensitivity,['case','headline','detail']],[r.evidence,['key','design','population','result','transfer']],[r.sources,['publisher','title','url','published','retrieved','sourceType']]])for(const row of rows)for(const k of keys)ck(typeof row[k]==='string');
for(const rows of[r.reservations,r.excludedBenefits]){ck(Array.isArray(rows));for(const row of rows)ck(typeof row==='string');}
console.log(JSON.stringify({status:'pass',scenarios:m.scenarios.length,checks,randomized_finite_cases:500,independent_method:'Closed-form two-state propagation plus Simpson quadrature; RK4 convergence; all region/report parity'},null,2));

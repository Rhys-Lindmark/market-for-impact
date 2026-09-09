import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,inputsFor,finiteYears} from '../lib/hkf-model.mjs';
const m=JSON.parse(fs.readFileSync(new URL('../data/bay/hkf-model-v1.json',import.meta.url)));
let assertions=0;const ok=x=>{assert.ok(x);assertions++},near=(a,b,t=1e-9)=>{ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)));};
const central=()=>structuredClone(m.central_inputs);
const results=m.scenarios.map(s=>({case:s.id,...calculate(inputsFor(m,s))}));
for(const [i,r] of results.entries()) {
 const p=inputsFor(m,m.scenarios[i]);const before=JSON.stringify(p);calculate(p);ok(before===JSON.stringify(p));
 near(r.us_q,r.components.reduce((s,x)=>s+x.net_q,0)-p.independent_harm_q);near(r.sf_q,r.us_q*p.sf_share);near(r.bay_q,r.us_q*p.bay_share);
 near(r.gross_resource_usd,p.gift_usd+p.external_other_usd+r.components.reduce((s,x)=>s+x.external,0));
 for(const geo of ['us','bay','sf'])for(const [prefix,cost]of [['donor',p.gift_usd],['resource',r.gross_resource_usd]]){const q=r[geo+'_q'],v=r[prefix+'_'+geo+'_per_10q'];if(q>0)near(v*q,10*cost);else ok(v===null);}
 // Independent midpoint integration of earlier-care health; conditions alive at treatment start.
 for(const x of p.pathways) {const c=r.components.find(y=>y.id===x.id);let sum=0,N=20000,dt=x.horizon/N;
 for(let j=0;j<N;j++){const t=(j+.5)*dt;sum+=Math.pow(1+p.discount_rate,-(x.delay+t))*Math.exp(-p.annual_mortality*t)*Math.exp(-x.alternative_catchup_rate*t)*Math.exp(-x.benefit_loss_rate*t)*dt;}
 const expected=sum*x.no_equivalent_at_start*x.effective_use*c.distinct_treatable*x.utility;
 near(c.gross_q,expected,1e-7);ok(c.additional_screens<=c.nominal_screens+1e-9);ok(c.additional_screens<=x.max_additional_screens+1e-9);
 }
}
near(finiteYears(0,3),3);near(finiteYears(1e-14,3),3);near(finiteYears(2,0),0);
const get=id=>results.find(x=>x.case===id);
ok(get('central').sf_q===0);ok(get('central').resource_sf_per_10q===null);
ok(get('no_funding_additionality').us_q===0);ok(get('zero_all_health').us_q===0);ok(get('null_utility_retains_harms').us_q<0);
near(get('independent_harm_zero_activity').us_q,-1);ok(get('signed_health_harm').us_q<0);
near(get('external_resource_double').us_q,get('central').us_q);ok(get('external_resource_double').gross_resource_usd>get('central').gross_resource_usd);
ok(get('rapid_alternative_care').us_q<get('central').us_q);ok(get('one_year_vision').us_q<get('central').us_q);
ok(get('favorable').donor_bay_per_10q<100000);ok(get('favorable').resource_bay_per_10q>100000);
const base=calculate(central());
let p=central();p.gift_usd*=2;p.external_other_usd*=2;const twice=calculate(p);near(twice.us_q,2*base.us_q);near(twice.gross_resource_usd,2*base.gross_resource_usd);
p=central();p.pathways.forEach(x=>x.referral_yield=0);const none=calculate(p);near(none.us_q,0);ok(none.gross_resource_usd>p.gift_usd);
p=central();p.pathways.forEach(x=>x.no_equivalent_at_start=0);ok(calculate(p).us_q<0);
p=central();p.pathways.forEach(x=>x.nonoverlap=0);ok(calculate(p).us_q<0);near(calculate(p).gross_resource_usd,base.gross_resource_usd);
p=central();p.pathways.forEach(x=>{x.horizon=0;x.episode_harm_q=0;});near(calculate(p).us_q,0);
let seed=543210;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
for(let i=0;i<2000;i++) {const p=central();p.discount_rate=rand();p.annual_mortality=rand();p.sf_share=rand();p.bay_share=p.sf_share+(1-p.sf_share)*rand();p.gift_usd=1+rand()*1e8;p.independent_harm_q=rand();
 for(const x of p.pathways){for(const k of ['referral_yield','financial_additionality','completion','treatable_share','nonoverlap','effective_use','no_equivalent_at_start'])x[k]=rand();x.utility=2*rand()-1;x.horizon=rand()*(x.id==='vision'?5:1);x.delay=5*rand();x.alternative_catchup_rate=20*rand();x.benefit_loss_rate=20*rand();x.screen_cost=1+1e5*rand();x.navigation_per_referral=1e5*rand();}
 const r=calculate(p);ok(Number.isFinite(r.us_q));near(r.bay_q,r.us_q*p.bay_share);near(r.sf_q,r.us_q*p.sf_share);for(const geo of ['us','bay','sf']){if(r[geo+'_q']>0)near(r['resource_'+geo+'_per_10q']*r[geo+'_q'],10*r.gross_resource_usd);else ok(r['resource_'+geo+'_per_10q']===null);}
}
const invalid=[p=>p.gift_usd=0,p=>p.gift_usd=Infinity,p=>p.sf_share=.9,p=>p.bay_share=-1,p=>p.portfolio.vision=.99,p=>delete p.portfolio.education,p=>p.pathways.pop(),p=>p.pathways[1].id='vision',p=>p.pathways[0].screen_cost=0,p=>p.pathways[0].horizon=6,p=>p.pathways[1].horizon=2,p=>p.pathways[0].completion=1.1,p=>p.pathways[0].utility=NaN,p=>p.independent_harm_q=-1];
for(const mutate of invalid){const p=central();if(mutate===invalid[2])p.bay_share=.8;mutate(p);assert.throws(()=>calculate(p));assertions++;}
console.log(JSON.stringify({status:'PASS',scenarios:results.length,randomSets:2000,independentQuadratureStepsPerComponent:20000,assertions}));

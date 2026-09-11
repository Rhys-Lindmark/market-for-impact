import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {calculate,cohortGain,INPUT_BOUNDS} from '../lib/sfaf-portfolio-model.mjs';
const read=n=>JSON.parse(readFileSync(new URL(n,import.meta.url)));
const m=read('../data/san-francisco/sfaf-portfolio-model-v1.json'),r=read('../data/san-francisco/sfaf-portfolio-report.json'),p=m.scenarios[0].inputs;
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),a+' vs '+b);
for(const s of m.scenarios)test('exact scenario '+s.id,()=>assert.deepEqual(calculate(s.inputs),s.outputs));
test('independent midpoint integration of two survival/state trajectories',()=>{
 for(const s of m.scenarios){
  const p=s.inputs;for(const branch of ['od','prep']){
   const base=branch==='od'?p.od_other_mortality_hazard+p.od_events_per_year*p.od_fatality_without_effective_rescue*(1-p.od_baseline_effective_rescue):p.prep_other_mortality_hazard+p.prep_baseline_infection_hazard;
   const reduction=branch==='od'?p.od_events_per_year*p.od_fatality_without_effective_rescue*p.od_rescue_increment:p.prep_baseline_infection_hazard*p.prep_extra_coverage_fraction*p.prep_effectiveness;
   const utility=branch==='od'?p.od_utility:p.prep_hiv_utility_gap;const horizon=p[branch+'_horizon_years'];const steps=Math.max(1,Math.ceil(horizon*2400)),dt=horizon/steps;
   let q=0;for(let i=0;i<steps;i++){const t=(i+.5)*dt,baseState=Math.exp(-base*t),intervention=Math.exp(-base*t+reduction*Math.min(t,p[branch+'_active_years']));q+=(intervention-baseState)*utility/(1+p.discount)**(t+p[branch+'_delay_years'])*dt;}
   near(q,s.outputs[branch+'_qaly_per_incremental_person'],1e-8);
  }
 }
});
test('finite unique-person benefit cannot exceed a full person horizon',()=>{
 for(const s of m.scenarios){const p=s.inputs;assert.ok(Math.abs(s.outputs.od_qaly_per_incremental_person)<=p.od_utility*p.od_horizon_years);assert.ok(Math.abs(s.outputs.prep_qaly_per_incremental_person)<=p.prep_hiv_utility_gap*p.prep_horizon_years);}
 assert.equal(cohortGain(.1,0,1,15,.7,.03,0),0);assert.equal(cohortGain(.1,.05,0,15,.7,.03,0),0);
 // With zero baseline and zero hazard improvement the function stays zero, including zero discount.
 assert.equal(cohortGain(0,0,0,0,0,0,0),0);
});
test('all gift allocations and financial categories reconcile',()=>{
 near(m.central_gift_allocation.reduce((a,b)=>a+b.share,0),1);
 const a=m.audited_portfolio_usd;assert.equal(a.sexual_health+a.substance_behavioral_health+a.linkage_retention_social_support+a.policy_public_education+a.management_general+a.fund_development,a.total_functional_expenses);
 for(const s of m.scenarios){const p=s.inputs,o=s.outputs;near(o.unquantified_gift_usd+p.gift_usd*(p.od_allocation+p.prep_allocation),p.gift_usd);near(o.sf.qaly>0?o.sf.qaly*o.sf.donor_per_10q:0,o.sf.qaly>0?1000000:0);}
});
test('funding, clinical nulls, disjoint exclusion and independent harm',()=>{
 const by=id=>m.scenarios.find(s=>s.id===id).outputs;
 for(const id of ['replacement_only','no_clinical_increment','no_quantified_allocation','zero_health_horizon']){assert.equal(by(id).us.qaly,0);assert.equal(by(id).us.donor_per_10q,null);}
 near(by('independent_harm_zero_activity').us.qaly,-.1);
 assert.equal(by('prep_fully_overlaps').prep_net_qaly,0);
 const harmed=calculate({...p,prep_disjoint_fraction:0,prep_harm_per_incremental_offer:.1});near(harmed.prep_net_qaly,-p.gift_usd*p.prep_allocation/p.prep_cash_per_offer*p.prep_funding_additionality*.1);
 assert.ok(by('negative_rescue_effect').us.qaly<0);assert.ok(by('adverse_shared_burdens').us.qaly<0);
});
test('outside resources enter donor cash once if paid by gift',()=>{
 const o=m.scenarios.find(s=>s.id==='donor_pays_outside_inputs').outputs;assert.equal(o.gross_resource_usd,100000);assert.ok(o.od_offers<calculate(p).od_offers);assert.ok(o.prep_offers<calculate(p).prep_offers);
});
test('required bounds, identities, nesting and finite outputs',()=>{
 for(const[key,[lo,hi]]of Object.entries(INPUT_BOUNDS)){
  const missing={...p};delete missing[key];assert.throws(()=>calculate(missing));
  for(const value of [NaN,Infinity,-Infinity,'1',null,undefined,lo-1,hi+1])assert.throws(()=>calculate({...p,[key]:value}));
 }
 for(const change of [{od_allocation:1},{od_baseline_effective_rescue:1},{prep_sf_share:1}])assert.throws(()=>calculate({...p,...change}));
 for(const s of m.scenarios){const snapshot=JSON.stringify(s.inputs);const o=calculate(Object.freeze({...s.inputs}));assert.equal(JSON.stringify(s.inputs),snapshot);const finite=x=>{if(typeof x==='number')assert.ok(Number.isFinite(x));else if(x&&typeof x==='object')Object.values(x).forEach(finite);};finite(o);}
});
test('report schema, identity and all regional output rows',()=>{
 for(const k of ['organization','eyebrow','program','published','modelVersion'])assert.ok(r[k]);assert.equal(r.modelVersion,m.model_id);assert.equal(r.donationUrl,m.organization.donation_url);
 for(const k of ['summary','evidence','reservations','excludedBenefits','sources'])assert.ok(Array.isArray(r[k])&&r[k].length);
 assert.equal(r.model.sensitivity.length,m.scenarios.length);
 const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
 for(const[i,s]of m.scenarios.entries())for(const reg of ['us','bay','sf']){
  const price=s.outputs[reg].donor_per_10q;
  assert.ok((r.model.sensitivity[i].headline+' '+r.model.sensitivity[i].detail).includes(price===null?'No finite positive ratio':money.format(price)));
 }
 assert.doesNotMatch(JSON.stringify(r),/100,000|100K|100k/);
 for(const source of r.sources)for(const key of ['publisher','title','url','published','retrieved','sourceType'])assert.ok(source[key]);
});

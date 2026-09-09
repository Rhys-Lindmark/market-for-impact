import fs from 'node:fs';
import assert from 'node:assert/strict';
import {BOUNDS,calculate,inputsFor,cohortGain} from '../lib/hrt-model.mjs';
const m=JSON.parse(fs.readFileSync(new URL('../data/us/hrt-model-v1.json',import.meta.url)));
let checks=0; const ok=x=>{assert.ok(x);checks++},near=(x,y,t=1e-7)=>ok(Math.abs(x-y)<=t*Math.max(1,Math.abs(y)));
// Independent midpoint integration directly subtracts survival functions, split at protection end.
function independent(p){const h=p.other_mortality_hazard+p.events_per_person_year*p.fatality_without_effective_rescue*(1-p.baseline_effective_rescue),v=p.events_per_person_year*p.fatality_without_effective_rescue*p.rescue_increment;let q=0;
for(const [a,b]of [[0,p.active_years],[p.active_years,p.horizon_years]]){const dx=(b-a)/30000;for(let i=0;i<30000;i++){const t=a+(i+.5)*dx;q+=(Math.exp(-h*t+v*Math.min(t,p.active_years))-Math.exp(-h*t))*Math.pow(1+p.discount,-t)*dx;}}
return q*p.utility*Math.pow(1+p.discount,-p.delay_years);}
for(const s of m.scenarios){const p=inputsFor(m,s),r=calculate(p);near(r.q_per_person,independent(p));near(r.nominal_devices,2*r.nominal_packs);ok(r.unique_people<=r.placed_packs/p.twin_packs_per_unique_person+1e-8);near(r.us_q,r.gross_q-r.harm_q);near(r.bay_q,r.us_q*p.bay_share);near(r.sf_q,r.us_q*p.sf_share);near(r.gross_resource_usd,p.gift_usd+r.nominal_packs*p.outside_per_nominal_pack+p.outside_other_usd);
for(const g of ['us','bay','sf'])for(const type of ['donor','resource']){const q=r[g+'_q'],price=r[type+'_'+g+'_per_10q'];if(q<=0)ok(price===null);else near(price,10*(type==='donor'?p.gift_usd:r.gross_resource_usd)/q);}}
for(const k of Object.keys(BOUNDS)){const p={...m.central_inputs};delete p[k];assert.throws(()=>calculate(p));checks++;for(const v of [NaN,Infinity,-Infinity,BOUNDS[k][0]-1,BOUNDS[k][1]+1]){assert.throws(()=>calculate({...m.central_inputs,[k]:v}));checks++;}}
for(const p of [{sf_share:.1,bay_share:.01},{free_access_allocation:.9},{baseline_effective_rescue:.99,rescue_increment:.08},{active_years:5,horizon_years:1},{events_per_person_year:5,active_years:5,rescue_increment:.2,mean_doses_per_incremental_response:10}]){assert.throws(()=>calculate({...m.central_inputs,...p}));checks++;}
let seed=742; const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
for(let i=0;i<1000;i++){const p={...m.central_inputs,events_per_person_year:5*rand(),other_mortality_hazard:2*rand(),baseline_effective_rescue:rand(),fatality_without_effective_rescue:rand(),active_years:5*rand(),horizon_years:5+25*rand(),discount:rand(),utility:rand(),delay_years:5*rand(),twin_packs_per_unique_person:100};p.rescue_increment=(1-p.baseline_effective_rescue)*rand()-p.baseline_effective_rescue*rand();const r=calculate(p);ok(Number.isFinite(r.q_per_person));ok(Math.sign(r.q_per_person)===Math.sign(p.rescue_increment));ok(Math.abs(r.q_per_person)<=p.utility*p.horizon_years);if(i<50)near(r.q_per_person,independent(p),1e-6);}
const n=calculate({...m.central_inputs,funding_additionality:0,independent_harm_q:1});ok(n.us_q===-1);ok(n.gross_resource_usd===140000);ok(n.donor_us_per_10q===null);
ok(cohortGain(.07,1e-14,1,10,.7,.03,.5)>0);
const f=m.finance;ok(f.gross_sales-f.cost_of_goods_sold===f.gross_profit);ok(f.cost_of_goods_sold+f.operating_expenses_excluding_cogs===f.combined_cogs_plus_operating);ok(f.combined_cogs_plus_operating-f.reported_direct_charitable_activity===1);
console.log(JSON.stringify({status:'PASS',scenarios:m.scenarios.length,checks}));

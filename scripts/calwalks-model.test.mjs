import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculate,validateInputs} from '../lib/calwalks-model.mjs';
const m=JSON.parse(fs.readFileSync(new URL('../data/california/calwalks-model-v1.json',import.meta.url)));let checks=0;
const ok=x=>{assert.ok(x);checks++};const near=(a,b)=>ok(Math.abs(a-b)<=1e-11*Math.max(1,Math.abs(a),Math.abs(b)));
function compare(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object')compare(a[k],b[k]);else if(typeof b[k]==='number')near(a[k],b[k]);else{assert.equal(a[k],b[k]);checks++}}}
for(const s of m.scenarios){const p=s.inputs,o=calculate(p);compare(o,s.outputs);const r=(1-p.annual_competing_mortality)/(1+p.discount_rate);const geometric=n=>r===1?n:r*(1-r**n)/(1-r);const death=p.survival_utility*geometric(p.survival_years),inj=p.injury_disutility*geometric(p.injury_duration_years);near(death,o.mortality_qaly_at_event);near(inj,o.serious_injury_qaly_at_event);const n=p.gift_usd*p.implementation_fraction/p.package_cost_usd*p.funding_additionality*p.incremental_change_probability;near(n,o.expected_changed_projects);near(p.gift_usd+n*(p.target_public_pv-p.displaced_public_pv+p.target_private_pv-p.displaced_private_pv),o.total_net_resource_usd);for(const reg of ['us','bay','sf']){ok(Number.isFinite(o[reg].qaly));if(o[reg].qaly<=0)ok(o[reg].donor_usd_per_10_qaly===null);else near(o[reg].donor_usd_per_10_qaly,10*p.gift_usd/o[reg].qaly)}}
const base=m.scenarios[0].inputs,by=id=>m.scenarios.find(s=>s.id===id).outputs;
ok(by('no_target_implementation').us.qaly<0);ok(by('equal_health_displacement').us.qaly===0);ok(by('no_sf_benefit').sf.qaly===0);ok(by('sf_net_harm').us.qaly>0&&by('sf_net_harm').sf.qaly<0);ok(by('independent_harm').us.qaly===-.01);
compare(calculate({...base,gift_usd:0}),calculate({...base,gift_usd:0,funding_additionality:0}));
const z=calculate({...base,discount_rate:0,annual_competing_mortality:0});near(z.mortality_qaly_at_event,base.survival_utility*base.survival_years);near(z.serious_injury_qaly_at_event,base.injury_disutility*base.injury_duration_years);
for(const bad of [{...base,package_cost_usd:0},{...base,target_sf_share:1},{...base,discount_rate:NaN},{...base,survival_years:1.5}]){assert.throws(()=>validateInputs(bad));checks++}
const long=calculate({...base,survival_years:100,injury_duration_years:100,acceleration_years:30});ok(Number.isFinite(long.us.qaly));const high=calculate({...base,independent_harm_qaly:1});ok(high.us.qaly<0);console.log(JSON.stringify({status:'PASS',scenarios:m.scenarios.length,checks}));

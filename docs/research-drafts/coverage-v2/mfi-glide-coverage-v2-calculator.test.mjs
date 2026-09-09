import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,survivalQ} from './mfi-glide-coverage-v2-calculator.mjs';
import {scenarios} from './mfi-glide-coverage-v2-scenarios.mjs';
const m=JSON.parse(fs.readFileSync(new URL('./mfi-glide-coverage-v2-model.json',import.meta.url)));
let checks=0;const eq=(a,b,t=1e-9)=>{assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);checks++;};
const cases=scenarios(m);
for(const c of cases){const x=calculate(c.inputs);eq(x.us.qaly,x.survival_q+x.housing_q+x.groups.reduce((a,g)=>a+g.qaly,0)-c.inputs.shared.independent_harm_q);eq(x.sf.qaly,x.us.qaly*c.inputs.shared.sf);eq(x.bay.qaly,x.us.qaly*c.inputs.shared.bay);eq(x.gross_resources,x.gross_associated_funding-x.rental_transfer_excluded);for(const region of ['us','bay','sf']){if(x[region].qaly>0){eq(x[region].donor_per_10q,c.inputs.shared.gift*10/x[region].qaly);eq(x[region].gross_resources_per_10q,x.gross_resources*10/x[region].qaly);}else{assert.equal(x[region].donor_per_10q,null);checks++;}}}
eq(calculate(cases.find(c=>c.id==='no_additional_funding').inputs).us.qaly,0);
eq(calculate(cases.find(c=>c.id==='zero_absorbable_capacity').inputs).us.qaly,0);
assert.ok(calculate(cases.find(c=>c.id==='harm_only').inputs).us.qaly<0);checks++;
assert.ok(calculate(cases.find(c=>c.id==='no_favorable_clinical_effect').inputs).us.qaly<0);checks++;
const central=calculate(m),long=calculate(cases.find(c=>c.id==='fully_funded_three_year_moud').inputs);
eq(long.moud_nominal,central.moud_nominal/3);
const doubled=calculate(cases.find(c=>c.id==='longer_funded_symptom_courses').inputs);
for(const g of central.groups)eq(doubled.groups.find(x=>x.id===g.id).nominal,g.nominal/2);
eq(calculate(cases.find(c=>c.id==='large_gift_capacity_held').inputs).us.qaly,central.us.qaly);
let seed=20260909;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
// Independent midpoint quadrature on explicit cumulative piecewise hazards.
for(let i=0;i<160;i++){
 const base=.01+rand()*.2,args={base,rescue:(rand()-.3)*base,hr:.2+rand()*1.6,rescueYears:rand()*3,moudYears:rand()*3,horizon:3+rand()*20,utility:rand(),discount:rand()*.08,delay:rand()};
 const n=20000,dt=args.horizon/n;let sum=0;
 for(let j=0;j<n;j++){const t=(j+.5)*dt,a=Math.min(t,args.rescueYears),b=Math.min(t,args.moudYears),both=Math.min(t,args.rescueYears,args.moudYears);const cumulative=base*t-args.rescue*a+base*(args.hr-1)*b-args.rescue*(args.hr-1)*both;sum+=(Math.exp(-cumulative)-Math.exp(-base*t))*Math.exp(-Math.log1p(args.discount)*(t+args.delay))*args.utility*dt;}
 eq(survivalQ(args),sum,1e-7);
}
// Each required numeric field is tested for omission and NaN independently.
const paths=[];for(const section of ['shared','survival','housing','allocation'])for(const [k,v]of Object.entries(m[section]))if(typeof v==='number')paths.push([section,k]);
for(let i=0;i<m.groups.length;i++)for(const[k,v]of Object.entries(m.groups[i]))if(typeof v==='number')paths.push(['groups',i,k]);
paths.push(['hcv_external_treatment_cost']);
for(const p of paths)for(const invalid of [undefined,NaN,Infinity]){const clone=structuredClone(m);let target=clone;for(const k of p.slice(0,-1))target=target[k];target[p.at(-1)]=invalid;assert.throws(()=>calculate(clone),p.join('.'));checks++;}
for(const change of [x=>x.shared.sf=1.1,x=>x.allocation.meals=.8,x=>x.housing.cash_transfer=1e9,x=>x.groups[0].cost_basis_years=0,x=>x.shared.gift=1e300,x=>x.survival.rescue_hazard_reduction=1]){const x=structuredClone(m);change(x);assert.throws(()=>calculate(x));checks++;}
console.log(JSON.stringify({status:'PASS',checks,scenarios:cases.length,random_survival_quadratures:160,substeps_each:20000,numeric_required_fields:paths.length}));


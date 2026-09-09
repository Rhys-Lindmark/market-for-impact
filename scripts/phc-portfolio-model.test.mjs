import fs from 'node:fs';import assert from 'node:assert/strict';import {calculate,inputsFor}from '../lib/phc-portfolio-model.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/san-francisco/phc-portfolio-'+({model:'model-v1','report-content':'report',results:'results'}[n])+'.json',import.meta.url)));const m=read('model'),r=read('report-content'),saved=read('results');let checks=0;const ck=x=>{assert.ok(x);checks++;};const near=(a,b,t=1e-9)=>ck(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)));const cash=n=>'$'+Math.round(n).toLocaleString('en-US'),price=n=>n===null?'No finite positive ratio':cash(n)+'/10 QALYs';
ck(m.scenarios.length===15&&r.model.sensitivity.length===15);ck(typeof r.model.giftHeading==='string');
for(const [i,s]of m.scenarios.entries()){
const p=inputsFor(m,s),v=calculate(p),row=r.model.sensitivity[i];assert.deepEqual(saved[i],{case:s.id,...v});checks++;assert.deepEqual(Object.keys(row).sort(),['case','detail','headline']);checks++;
ck(row.case===s.id.replaceAll('_',' '));ck(row.headline==='SF gross resources: '+price(v.resource_sf_per_10q));ck(row.detail.includes('Gross envelope '+cash(v.gross_resource_usd)));
for(const k of ['donor_us_per_10q','donor_bay_per_10q','donor_sf_per_10q','resource_us_per_10q','resource_bay_per_10q','resource_sf_per_10q'])ck(row.detail.includes(price(v[k])));
const q=row.detail.match(/QALYs: ([-\de+.]+) \/ ([-\de+.]+) \/ ([-\de+.]+)\. Donor/);[v.us_q,v.bay_q,v.sf_q].forEach((x,j)=>near(Number(q[j+1]),x));
near(v.gift_usd,100000);near(v.unmodeled_cash+v.components.reduce((a,b)=>a+b.cash,0),v.gift_usd);near(v.gross_resource_usd,v.gift_usd+p.external_other_usd+v.components.reduce((a,b)=>a+b.external,0));near(v.us_q,v.components.reduce((a,b)=>a+b.net_q,0)-p.independent_harm_us_q);
for(const [j,x]of p.pathways.entries()){
const c=v.components[j];near(c.additional,Math.min(p.gift_usd*x.allocation/x.cash_per_completed*x.financial_additionality,x.max_additional_completed));ck(c.distinct<=c.additional+1e-12);
let integral=0;const dt=x.horizon/2000;for(let z=0;z<2000;z++){const t=x.delay+(z+.5)*dt;integral+=dt*(1+p.discount_rate)**(-t)*Math.exp(-p.annual_mortality*t)*x.effective_use;}near(integral,c.years,1e-8);near(c.net_q,c.distinct*x.alternative_free_share*x.utility*integral-c.additional*x.procedure_harm_q,1e-8);
}
if(v.us_q<=0)ck(v.donor_sf_per_10q===null&&v.resource_sf_per_10q===null);else{near(v.resource_sf_per_10q*v.sf_q,10*v.gross_resource_usd);ck(v.resource_sf_per_10q>=v.donor_sf_per_10q);}
}
const h=JSON.parse(fs.readFileSync(new URL('../data/san-francisco/phc-glasses-cea-v1.json',import.meta.url)));near(10*h.scenarios[1].costPerDispensedPair/(h.scenarios[1].utilityGain*h.scenarios[1].effectiveUseYears*h.scenarios[1].additionality),m.historical_comparison.donor_per_10q);
near(m.historical_comparison.donor_per_10q,10*h.scenarios[1].costPerDispensedPair/(h.scenarios[1].utilityGain*h.scenarios[1].effectiveUseYears*h.scenarios[1].additionality));checks++;
const c=calculate(m.central_inputs);ck(c.resource_sf_per_10q>100000);ck(saved[1].resource_sf_per_10q<100000);ck(saved.find(x=>x.case==='no_capacity').us_q===0);ck(saved.find(x=>x.case==='independent_harm_zero_activity').us_q===-1);
for(const k of Object.keys(m.central_inputs).filter(k=>k!=='pathways')){const p=structuredClone(m.central_inputs);delete p[k];assert.throws(()=>calculate(p));checks++;}
for(const k of Object.keys(m.central_inputs.pathways[0]).filter(k=>k!=='id')){const p=structuredClone(m.central_inputs);delete p.pathways[0][k];assert.throws(()=>calculate(p));checks++;}
for(const changes of [{gift_usd:Number.MAX_VALUE},{sf_share:1.1},{discount_rate:-1}]){assert.throws(()=>calculate({...m.central_inputs,...changes}));checks++;}
let state=345;const rnd=()=>{state=(1664525*state+1013904223)>>>0;return state/2**32;};
for(let j=0;j<1000;j++){const p=structuredClone(m.central_inputs);p.pathways.forEach(x=>{x.utility=rnd()*.2-.1;x.effective_use=rnd();x.financial_additionality=rnd();x.max_additional_completed=rnd()*200;});const v=calculate(p);ck(Number.isFinite(v.us_q));v.components.forEach(x=>ck(x.years>=0&&x.years<=1));}
console.log(JSON.stringify({accepted:true,checks,scenarios:15,finiteTests:1000,historicalPreserved:true},null,2));

import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,calculateAll,exposure,inputs,worlds} from '../lib/hac-v2-model.mjs';
let checks=0;const ok=x=>{assert.ok(x);checks++;};const throws=f=>{assert.throws(f);checks++;};
const saved=JSON.parse(readFileSync(new URL('../data/san-francisco/hac-v2-results.json',import.meta.url)));
assert.deepEqual(calculateAll(),saved);checks++;
assert.equal(calculate().bayCostPer10,23307277.040449742);checks++;
assert.equal(calculate().bayQ,0.04290505485752375);checks++;
for(const x of [null,[],42,'bad',true])throws(()=>calculate(x));
for(const x of [null,[],42,'bad',true])throws(()=>calculate({world:x}));
for(const k of Object.keys(inputs.central).filter(k=>k!=='id'))for(const bad of [NaN,Infinity,'1'])throws(()=>calculate({world:{...inputs.central,[k]:bad}}));
for(const k of ['completionDifference','advisoryFunding','advisoryBayShare','advisorySfShareOfBay','advisoryNonOverlap','policyResidual','policyGiftContribution'])for(const bad of [-.1,1.1])throws(()=>calculate({world:{...inputs.central,[k]:bad}}));
for(const id of ['', ' ', ' central',42])throws(()=>calculate({world:{...inputs.central,id}}));
throws(()=>calculate({additionalResources:1e308}));throws(()=>calculate({additionalResources:-1}));throws(()=>calculate({world:worlds[3],additionalResources:1e308}));
throws(()=>calculate({world:{...inputs.central,advisoryCost:0}}));throws(()=>calculate({world:{...inputs.central,policyScaleHomes:1e308,affectedPeoplePerHome:1e308}}));
throws(()=>exposure(30,30,.03));throws(()=>exposure(-1,2,.03));ok(exposure(3,6,0)===6);
const numerical=(s,d,r)=>{let n=10000,h=d/n,total=0;for(let i=0;i<n;i++)total+=Math.pow(1+r,-s-(i+.5)*h)*h;return total;};
for(const [s,d] of [[3,6],[10,5],[15,2],[5,10]])ok(Math.abs(exposure(s,d,.03)-numerical(s,d,.03))<1e-8);
for(const r of saved.results){ok(Math.abs(r.bayQ-r.sfQ-r.restBayQ)<1e-12);ok(r.bayQ>0?r.bayCostPer10>0:r.bayCostPer10===null);for(const v of Object.values(r))if(typeof v==='number')ok(Number.isFinite(v));}
const prior=JSON.parse(readFileSync(new URL('../data/san-francisco/hac-v2-prior-dpp.json',import.meta.url)));for(const s of prior.scenarios){const w=s.inherits?{...prior.scenarios.find(x=>x.id===s.inherits),...s.overrides}:s;const q=w.net_sf_homes_H*w.incremental_completion_probability_p*w.funding_additionality_a*w.health_affected_people_per_net_home*w.net_annual_utility_change*w.discounted_incremental_health_years-w.donor_specific_harm_qalys;ok(Math.abs(q-s.incremental_qalys)<1e-12);ok(q>0?Math.abs(10*w.donor_cost_usd/q/s.cost_per_10_qalys_usd-1)<1e-12:s.cost_per_10_qalys_usd===null);}
const report=JSON.parse(readFileSync(new URL('../data/san-francisco/hac-v2-report.json',import.meta.url)));
for(const row of report.evidence)for(const key of ['key','design','population','result','transfer'])ok(typeof row[key]==='string'&&row[key].length>0);
for(const row of report.model.sensitivity)for(const key of ['case','headline','detail'])ok(typeof row[key]==='string');
const ids=new Set();for(const row of report.longForm){ok(typeof row.id==='string'&&!ids.has(row.id));ids.add(row.id);ok(typeof row.title==='string'&&row.markdown.length>100);}
const markdown=readFileSync(new URL('../docs/reports/hac-v2.md',import.meta.url),'utf8');for(const row of report.longForm)ok(markdown.includes(row.markdown));
const finance=JSON.parse(readFileSync(new URL('../data/san-francisco/hac-v2-finance.json',import.meta.url)));for(const y of finance.years){ok(y.program+y.management+y.fundraising===y.functionalExpense);ok(y.functionalExpense+y.nettedEventCost===y.grossAccountingExpense);}
ok(Object.values(inputs.allocation).reduce((a,b)=>a+b,0)===1);ok(report.modelVersion===saved.version);
console.log(checks+' checks passed; first V2 output unchanged, prior DPP arithmetic retained, renderer and finance checked.');

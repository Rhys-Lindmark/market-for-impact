import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,calculateAll,scenarios,finance} from '../lib/spur-v2-model.mjs';
let checks=0;const ok=(x)=>{assert.ok(x);checks++;};const bad=f=>{assert.throws(f);checks++;};
const outputs=calculateAll();
for(const s of scenarios){const actual=calculate({scenario:s});for(const [k,v] of Object.entries(s.outputs)){assert.equal(actual[k],v,`${s.id}.${k}`);checks++;}}
ok(finance.grossExpense===finance.auditExpense+finance.investmentFeeReconciliation+finance.eventCostsNetted);
ok(Math.abs(calculate().bayIncludingSfNetQaly-.4564)<1e-12);
ok(calculate({gift:0}).giftBayQaly===0);
ok(calculate({gift:1000}).giftBayQaly===calculate().bayIncludingSfNetQaly/100);
ok(calculate().weightedExpectation===null);
for(const x of [null,42,'bad',[],NaN])bad(()=>calculate(x));
for(const x of [null,[],{}, {id:' '}])bad(()=>calculate({scenario:x}));
for(const value of [NaN,Infinity,-1])bad(()=>calculate({gift:value}));
let s=structuredClone(scenarios[0]);s.housing.calendarSchedule.yearsAfterGift[0]=100;bad(()=>calculate({scenario:s}));
s=structuredClone(scenarios[0]);s.housing.calendarSchedule.annualUndiscountedSfEquivalentOccupiedHomes[0]*=2;bad(()=>calculate({scenario:s}));
s=structuredClone(scenarios[0]);s.heat.qalyPerDeath=Infinity;bad(()=>calculate({scenario:s}));
s=structuredClone(scenarios[0]);s.heat.effectiveDiscountedMortalityYears=31;bad(()=>calculate({scenario:s}));
bad(()=>calculate({additionalResources:1e308}));
bad(()=>calculate({scenario:scenarios.find(s=>s.id==='nullPhysicalOutput'),additionalResources:1e308}));
const saved=new URL('../data/san-francisco/spur-v2-results.json',import.meta.url);
if(fs.existsSync(saved)){assert.deepEqual(outputs,JSON.parse(fs.readFileSync(saved,'utf8')));checks++;}
console.log(`${checks} checks passed; inherited outputs unchanged; finite schedule and ratio guards checked.`);

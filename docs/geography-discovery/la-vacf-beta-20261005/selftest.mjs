import fs from 'node:fs';
import assert from 'node:assert/strict';
import {calculate,serializedScenarios} from './model.mjs';
import {reportPrice,scenarioIncomeEquivalent} from './headline.mjs';
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
const report=JSON.parse(fs.readFileSync(new URL('./report.json',import.meta.url)));
const initial=JSON.parse(fs.readFileSync(new URL('./initial-diagnostic.json',import.meta.url)));
assert.deepEqual(report.historical.initialReport,initial.report);
assert.deepEqual(report.model.historicalAlphaModel,initial.report.model);
assert.deepEqual(report.historical.originalSessions,initial.sessions);
const generated=serializedScenarios();assert.equal(report.model.scenarios.length,generated.length);
const near=(a,b)=>{if(a===null||b===null)assert.equal(a,b);else assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);};
let checks=3;
for(const s of report.model.scenarios){
 const c=calculate(s.inputs);near(s.editionQalys,c.editionQalys);near(s.allPopulationQalys,c.allPopulationQalys);
 assert.deepEqual(s.incomePathways,c.incomePathways);near(s.incomeEquivalent,c.incomeEquivalent);near(s.price10,c.price10);
 near(s.branches.reduce((a,x)=>a+x.share,0),1);
 for(const p of s.incomePathways){assert.ok(p.people>0);if(p.households!==undefined)near(p.people,p.households*p.membersPerHousehold);assert.ok(p.annualIncomeBeforeUSD+p.annualIncomeGainUSD>0);}
 const rr={...report,model:{...report.model,scenarios:[{...s,id:'central'}]}};near(reportPrice(rr),s.price10);
 if(!s.incomeUnknown)near(scenarioIncomeEquivalent(s),s.incomeEquivalent);checks+=7;
}
near(reportPrice(report),20598207.780573618);
const central=calculate(),nullcase=calculate({clinicalTransfer:0});near(central.incomeEquivalent,nullcase.incomeEquivalent);assert.ok(nullcase.totalEquivalent<0);
near(calculate({capacityShare:0}).totalEquivalent,0);
assert.equal(calculate({incomeUnknown:true}).price10,null);
assert.equal(calculate({clinicalUnknown:true,incomeUnknown:true}).price10,null);
assert.ok(calculate({commonCost:200,falseAlarmCost:1000,disruption:1000}).incomeEquivalent<central.incomeEquivalent);
assert.throws(()=>calculate({resourceCareShare:1,additionalCare:1,falseAlarmShare:.1}));
assert.throws(()=>calculate({baseline:1}));
if(process.argv[2]){
 const prod=await import(process.argv[2]+'/lib/income-health-equivalence.mjs');
 for(const s of generated)for(const p of s.incomePathways)near(incomeHealthyYearEquivalent(p),prod.incomeHealthyYearEquivalent(p));
}
console.log('PASS '+generated.length+' serialized scenarios; '+checks+' core scenario/history checks; null/negative/finite cohort guards and optional production income parity.');

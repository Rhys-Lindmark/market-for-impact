import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {defaults,resourceDefaults,income,health,pathways,evaluate,scenarios,historicalHealth} from './model.mjs';
const root=process.env.GLWD_REPO_ROOT||path.resolve(path.dirname(new URL(import.meta.url).pathname),'../../..');
const {incomeHealthyYearEquivalent}=await import(path.join(root,'lib/income-health-equivalence.mjs'));
const {reportPrice}=await import(path.join(root,'lib/geography-reports.mjs'));
const r=JSON.parse(fs.readFileSync(new URL('./report.json',import.meta.url))),a=JSON.parse(fs.readFileSync(new URL('./initial-diagnostic.json',import.meta.url)));
assert.deepEqual(r.model.historicalAlphaModel,a.report.model);assert.deepEqual(r.historical.report,a.report);assert.deepEqual(r.historical.sessions,a.sessions);assert.deepEqual(r.historical.scenarios,a.report.model.scenarios);assert.deepEqual(r.historical.sensitivity,a.report.model.sensitivity);
const close=(x,y)=>assert.ok(Math.abs(x-y)<=Math.max(1e-10,Math.abs(x)*1e-12),`${x} != ${y}`);
for(const old of a.report.model.scenarios){const h=historicalHealth(JSON.parse(old.assumptions.split(';')[0]));for(const key of ['costUSD','allPopulationQalys','editionQalys'])close(h[key],old[key]);}
const rows=scenarios();assert.equal(rows.length,r.model.scenarios.length);
for(const x of rows){const saved=r.model.scenarios.find(y=>y.id===x.id);assert.deepEqual(saved,x);for(const p of x.incomePathways)close(income(p),incomeHealthyYearEquivalent(p));if(!x.incomeUnknown){close(x.totalWelfareEquivalentHealthyYears,x.editionQalys+x.incomeEquivalentHealthyYears);assert.equal(x.pricePer10Qalys,x.pricePer10WelfareEquivalent);}else {assert.equal(x.incomeEquivalentHealthyYears,null);assert.equal(x.pricePer10Qalys,null);}}
const get=id=>rows.find(x=>x.id===id),c=get('central');close(reportPrice(r),c.pricePer10Qalys);
assert.equal(c.costUSD,59921600.2);close(c.editionQalys,9.685767);close(c.incomeEquivalentHealthyYears,4.9008361609408);
assert.equal(get('clinical-null').editionQalys,0);close(get('clinical-null').incomeEquivalentHealthyYears,c.incomeEquivalentHealthyYears);assert.ok(get('financial-only').incomeEquivalentHealthyYears>get('clinical-null').incomeEquivalentHealthyYears);
for(const id of ['zero','negative','adverse','unknown','income-unknown-clinical-null'])assert.equal(get(id).pricePer10Qalys,null);
assert.equal(get('zero').totalWelfareEquivalentHealthyYears,0);assert.equal(get('zero').costUSD,c.costUSD);assert.ok(get('negative').incomeEquivalentHealthyYears<0);assert.ok(get('adverse').editionQalys<0);assert.ok(get('poor').totalWelfareEquivalentHealthyYears<0);
assert.equal(get('complete-overlap').incomePathways[0].annualIncomeGainUSD,-25);assert.equal(get('clinical-null').incomePathways[0].annualIncomeGainUSD,125);assert.equal(get('other-households').incomePathways.length,3);assert.ok(get('other-households').incomePathways[2].annualIncomeGainUSD<0);assert.equal(get('other-households').incomePathways[2].independentShare,1);assert.equal(get('consumption-zero').editionQalys,0);assert.ok(get('consumption-zero').incomeEquivalentHealthyYears<0);assert.equal(get('consumption-zero').costUSD,c.costUSD);
for(const id of ['funding-low','funding-high','duration','geography-low','geography-high','delay']){const x=get(id);close(x.incomeEquivalentHealthyYears/c.incomeEquivalentHealthyYears,x.editionQalys/c.editionQalys);}
assert.ok(get('delay').totalWelfareEquivalentHealthyYears<c.totalWelfareEquivalentHealthyYears);assert.ok(get('extra-resources').costUSD>c.costUSD);assert.equal(get('extra-resources').editionQalys,c.editionQalys);
assert.equal(r.summary.what.length,3);assert.equal(r.summary.strengths.length,3);assert.equal(r.summary.reservations.length,3);
const ids=new Set(r.sources.map(x=>x.id));for(const x of rows)for(const p of x.incomePathways)for(const id of p.sourceIds)assert.ok(ids.has(id));
assert.throws(()=>health({D:0}));assert.throws(()=>income({people:1,annualIncomeBeforeUSD:100,annualIncomeGainUSD:-100,years:1}));assert.throws(()=>pathways({}, {burden:-1}));
console.log(JSON.stringify({passed:true,scenarios:rows.length,historicalScenarios:a.report.model.scenarios.length,historicalExact:true,sharedCrosswalk:true,sharedReportPrice:true,central:c.pricePer10Qalys,health:c.editionQalys,signedResources:c.incomeEquivalentHealthyYears}));

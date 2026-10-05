import fs from 'node:fs';
import assert from 'node:assert/strict';
import {income,health,scenarios} from './model.mjs';
const {incomeHealthyYearEquivalent}=await import('../../../lib/income-health-equivalence.mjs');
const r=JSON.parse(fs.readFileSync(new URL('./report.json',import.meta.url)));
const a=JSON.parse(fs.readFileSync(new URL('./initial-diagnostic.json',import.meta.url)));
assert.deepEqual(r.model.historicalAlphaModel,a.report.model);assert.deepEqual(r.historical.scenarios,a.report.model.scenarios);assert.deepEqual(r.historical.sensitivity,a.report.model.sensitivity);
const s=scenarios();for(const row of s){for(const p of row.incomePathways)assert.ok(Math.abs(income(p)-incomeHealthyYearEquivalent(p))<1e-10);assert.ok(Math.abs(row.editionQalys-r.model.scenarios.find(x=>x.id===row.id).editionQalys)<1e-10);}
for(const row of a.report.model.scenarios){const v=health(JSON.parse(row.assumptions));assert.ok(Math.abs(v.editionQalys-row.editionQalys)<1e-10);if(row.pricePer10Qalys!==null)assert.ok(Math.abs(10*v.costUSD/v.editionQalys-row.pricePer10Qalys)<1e-3);}
const get=id=>s.find(x=>x.id===id),ref=get('central');assert.equal(get('clinical-null').incomeEquivalentHealthyYears,ref.incomeEquivalentHealthyYears);assert.equal(get('clinical-null').editionQalys,0);assert.ok(get('clinical-null').totalWelfareEquivalentHealthyYears>0);assert.ok(get('financial-only').totalWelfareEquivalentHealthyYears<0);assert.equal(get('unknown').totalWelfareEquivalentHealthyYears,null);assert.equal(get('zero').totalWelfareEquivalentHealthyYears,0);assert.ok(get('adverse').totalWelfareEquivalentHealthyYears<0);
assert.ok(Math.abs(get('funding-low').incomeEquivalentHealthyYears/ref.incomeEquivalentHealthyYears-.4)<1e-12);assert.ok(Math.abs(get('funding-high').incomeEquivalentHealthyYears/ref.incomeEquivalentHealthyYears-2)<1e-12);assert.ok(get('delay').totalWelfareEquivalentHealthyYears<ref.totalWelfareEquivalentHealthyYears);
assert.ok(Math.abs(get('geography').incomeEquivalentHealthyYears/ref.incomeEquivalentHealthyYears-.8/.98)<1e-12);assert.ok(Math.abs(get('geography').editionQalys/ref.editionQalys-.8/.98)<1e-12);
const sourceIds=new Set(r.sources.map(x=>x.id));for(const row of r.model.scenarios)for(const p of row.incomePathways)for(const id of p.sourceIds)assert.ok(sourceIds.has(id));
console.log(JSON.stringify({passed:true,alphaScenarioArithmetic:6,betaScenarios:s.length,sharedIncomeCalculatorAgreement:true,historicalModelExact:true,centralHealth:ref.editionQalys,centralSignedIncome:ref.incomeEquivalentHealthyYears,centralWelfarePrice:ref.pricePer10WelfareEquivalent}));

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculate,cases} from '../lib/hrs-ca-calibrated-model.mjs';
import {reportPrice,scenarioIncomeEquivalent,expenseAverage} from '../lib/geography-reports.mjs';
const data=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=data.reports.find(r=>r.edition==='california'&&r.slug==='harm-reduction-services');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Every current HRS scenario reproduces health and distinct signed resources once',()=>{
 for(const[id,o]of Object.entries(cases)){
  const v=calculate(o),s=report.model.scenarios.find(s=>s.id===id);assert.ok(s,id);
  near(s.editionQalys,v.healthYearsCA);near(s.allPopulationQalys,v.healthYearsAll);
  near(scenarioIncomeEquivalent(s),v.incomeEquivalentYearsCA+v.inducedBurdenYearsCA);
  const q=s.editionQalys+scenarioIncomeEquivalent(s);
  if(v.caUsdPerBetterLife===null)assert.ok(q<=0);else near(10*s.costUSD/q,v.caUsdPerBetterLife);
 }
 near(reportPrice(report),6852222.069522628);near(expenseAverage(report),1899047.6666666667);
 const h=report.model.scenarios.find(s=>s.id==='historical-prior-health-central');near(10*h.costUSD/h.editionQalys,3089019.7114568832);
 assert.match(report.sections.cost,/6.85M/);assert.match(report.sections.cost,/3,089,019/);
});
test('HRS closed sessions preserve actual assigned models and cohort identities',()=>{
 for(const id of ['5d9450af-4638-4779-9e37-778d642b57a9','hrs-root-source-check-20261001']){
  const sessions=data.sessions.filter(s=>s.id===id);assert.equal(sessions.length,1);assert.ok(report.sessionIds.includes(id));
  assert.equal(sessions[0].model.id,'gpt-6.1-sol');assert.equal(sessions[0].phase,'research');
 }
 assert.equal(data.reports.filter(r=>r.edition==='california').length,25);
 assert.equal(data.reports.filter(r=>r.edition==='california'&&r.stage==='beta').length,10);
});

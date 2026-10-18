import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,cases,results,tests} from '../lib/ist-usa-calibrated-model.mjs';
import {readFileSync} from 'node:fs';
import {scenarioIncomeEquivalent,reportPrice,researchListPrice,expenseAverage} from '../lib/geography-reports.mjs';
const geo=JSON.parse(readFileSync(new URL('../data/geography-reports.json',import.meta.url)));
const report=geo.reports.find(r=>r.edition==='usa'&&r.slug==='institute-for-safer-trucking');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);

test('IST guarded signed health and resource calculator passes its assertions',()=>{
  assert.equal(tests(),'25 assertions passed');
  for(const scenario of Object.values(cases)) assert.doesNotThrow(()=>calculate(scenario));
});

test('annual-expense diagnostic uses exact three-year mean, not rounded display',()=>{
  const r=results(),mean=988148/3;
  assert.equal(r.meanExpense,mean);
  assert.equal(cases.meanAnnualWholeRecipientCost.gift,mean);
  assert.equal(cases.meanAnnualWholeRecipientCost.packetCost,mean);
  const expected=r.scenarios.central.price10*mean/100000;
  assert.ok(Math.abs(calculate(cases.meanAnnualWholeRecipientCost).price10-expected)<expected*1e-12);
});

test('central partial forecast matches independently reconstructed health and resources',()=>{
  const c=calculate();
  assert.ok(Math.abs(c.healthYears-.5700128002529878)<1e-12);
  assert.ok(Math.abs(c.incomeYears-.0032528652913561364)<1e-12);
  assert.ok(Math.abs(c.price10-1744391.9287411897)<1e-6);
  assert.equal(c.completePortfolioPrice10,null);
  assert.equal(c.identifiedDonorPrice10,null);
});

test('report and list serialize every signed or unknown health/resource scenario exactly',()=>{
  for(const [id,overrides] of Object.entries(cases)){
    const z=calculate(overrides),s=report.model.scenarios.find(s=>s.id===id);
    assert.ok(s,id);
    z.healthYears===null?assert.equal(s.editionQalys,null):near(s.editionQalys,z.healthYears);
    z.incomeYears===null?assert.equal(scenarioIncomeEquivalent(s),null):near(scenarioIncomeEquivalent(s),z.incomeYears);
    z.price10===null?assert.equal(s.costPer10Qalys,null):near(s.costPer10Qalys,z.price10);
  }
  near(reportPrice(report),calculate().price10);
  near(researchListPrice(report),calculate().price10);
  near(expenseAverage(report),988148/3);
  assert.equal(report.historicalModel.version,'usa-ist-beta-20260930-withdrawn-central');
  const old=report.model.scenarios.find(s=>s.id==='historical-alpha-central');
  near(10*old.costUSD/old.editionQalys,1649020.400067);
});

test('closed research intervals imported once without changing original model receipts',()=>{
  const effort=JSON.parse(readFileSync(new URL('../data/research-effort.json',import.meta.url)));
  const author=JSON.parse(readFileSync(new URL('../docs/geography-discovery/ist-usa-recalibration-2026-10-02.closed.json',import.meta.url)));
  const root=JSON.parse(readFileSync(new URL('../docs/geography-discovery/ist-usa-root-primary-2026-10-02.closed.json',import.meta.url)));
  let seconds=0;
  for(const s of [...author.sessions,root.session]){
    assert.equal(report.sessionIds.filter(id=>id===s.id).length,1);
    for(const list of [geo.sessions,effort.organizations[report.organization].sessions]){
      const matches=list.filter(x=>x.id===s.id);assert.equal(matches.length,1);
      assert.equal(matches[0].startedAt,s.startedAt);assert.equal(matches[0].endedAt,s.endedAt);
      assert.match(matches[0].model.evidence,/user-confirmed model assignment/i);
      assert.doesNotMatch(matches[0].evidence,/private\/tmp/);
    }
    seconds+=(Date.parse(s.endedAt)-Date.parse(s.startedAt))/1000;
  }
  near(seconds,539.184);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculate,diagnostics,inputs,scenarios,incomeJudgments} from '../lib/recares-calibrated-model.mjs';
import {validateResearchEffort} from '../lib/research-effort.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));
test('accepted central is independently reconstructed from explicit pathway assumptions',()=>{
 const n=10000/72583*11000*.5*.65;
 const health=n*(.2*.5*.85*.03*.25+.15*.4*.85*.02*.25+.65*.3*.9*.002*.05-.0001)*.95;
 const r=calculate().rows.find(s=>s.name==='central');
 close(r.healthYears,health);assert.equal(r.incomeYears,0);close(r.usdPerBetterLife,263829.550000969);close(r.sfTotalYears,health*.3/.95);
});
test('economic incidence cases and health are independently varied',()=>{
 const d=diagnostics(),r=d.incomeCases.smallPositive;
 close(r.incomeYears,.5*(10000/72583*11000*.5*.65)*.01*Math.log1p(45/50000)*.95);
 close(d.incomeCases.sparsePickup.incomeYears,.5*(10000/72583*11000*.5*.65)*.1*Math.log1p(-3/50000)*.95);
 assert.ok(d.incomeCases.adverse.incomeYears<0);
 assert.equal(d.healthCases.nullHealthPositiveIncome.healthYears,0);
 assert.ok(d.healthCases.nullHealthPositiveIncome.incomeYears>0);
 for(const key of ['completeNull','utilityZeroWithHarm','jointAdverse'])assert.equal(d.healthCases[key].usdPerBetterLife,null);
 close(d.incomeCases.transferOffset.incomeYears,r.incomeYears*.5);
});
test('scope, signs, favorable tails, and extra-money response remain visible',()=>{
 const d=diagnostics();close(d.annual.rows[3].usdPerBetterLife,131914.7750004845);
 assert.ok(d.marginal.rows[2].totalYears<0);assert.equal(d.marginal.rows[2].usdPerBetterLife,null);
 assert.ok(d.tail.annual.favorableShare>1);assert.ok(d.tail.annual.withoutFavorableSignedYears<0);
 assert.equal(d.fundingCases['0'].totalYears,0);assert.equal(d.fundingCases['0'].usdPerBetterLife,null);
 close(d.fundingCases['0.25'].totalYears,d.fundingCases['0.5'].totalYears*.5);
 assert.ok(d.healthCases.suppliesZero.usdPerBetterLife>d.marginal.rows[3].usdPerBetterLife);
});
test('invalid incidence, overlap and invalid zero-person values are rejected',()=>{
 for(const j of [{...incomeJudgments.central,purchaseShare:.9},{...incomeJudgments.central,adverseShare:-1},{...incomeJudgments.central,netSavingsUSD:NaN}])
  assert.throws(()=>calculate({judgments:{...incomeJudgments,central:j}}),RangeError);
 assert.throws(()=>calculate({scope:'wrong'}),RangeError);
});
test('zero geographic attribution yields finite zeros rather than NaN',()=>{
 const changed=scenarios.map(s=>({...s,bayShare:0,sfShare:0}));
 for(const r of calculate({healthScenarios:changed}).rows){
  assert.equal(r.totalYears,0);assert.equal(r.sfTotalYears,0);
  assert.equal(r.usdPerBetterLife,null);assert.equal(r.sfUsdPerBetterLife,null);
 }
});
test('public summary and API/index select accepted model; historical arithmetic is preserved',()=>{
 const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
 for(const p of ['app/api/recares-model/route.ts','app/charities/recares/page.tsx','lib/bay-research-index.ts'])assert.match(read(p),/recares-calibrated-model/);
 const summary=JSON.parse(read('data/top-ten-summaries.json')).recares.cost.join(' ');
 assert.match(summary,/\$264,000/);assert.match(summary,/zero central credit/);
 const narrative=JSON.parse(read('data/bay/recares-v2-narrative.json')).markdown;
 assert.match(narrative,/263,830/);assert.match(narrative,/historical comparisons/);
 assert.match(narrative,/cash accounting/);
 validateResearchEffort(JSON.parse(read('data/research-effort.json')));
});

import assert from 'node:assert/strict';
import data from '../data/san-francisco/hearing-access-cea-v2.json' with {type:'json'};
import {hearingAccessModel} from '../lib/hearing-access-model.mjs';
import {hearingCalibratedModel as calculate,hearingDiagnostics,incomeJudgments} from '../lib/hearing-calibrated-model.mjs';
import {researchRankBySlug} from '../lib/research-cost-ranking.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)));
const central=data.scenarios.find(s=>s.name==='central'),d=hearingDiagnostics();
close(d.central.healthYears,.012);assert.equal(d.central.incomeEquivalentYears,0);
close(d.central.costPerTenQalys,1250000);
close(researchRankBySlug.get('hearing-and-speech-center').bayUsdPerTenQalys,d.central.bayCostPerTenQalys);
const earnings=.5*.5*.8*.1*(.515/1.03)*Math.log1p(.05);
const loss=.5*.5*.8*.1*(.515/1.03)*Math.log1p(-.05);
const burden=.5*.5*.8*Math.log1p(-6/50000)/(1.03**.25);
close(d.earnings.incomeEquivalentYears,earnings);
close(d.earningsLoss.incomeEquivalentYears,loss);
close(d.acquisition.incomeEquivalentYears,burden);
close(d.earnings.costPerTenQalys,1201162.5676101055);
close(d.earningsLoss.costPerTenQalys,1305816.3521386024);
close(d.acquisition.costPerTenQalys,1252486.6797875292);
close(d.noHealthPositiveIncome.costPerTenQalys,15000/earnings);
assert.equal(d.completeNull.costPerTenQalys,null);
assert.equal(d.jointHarm.status,'harm');assert.equal(d.jointHarm.costPerTenQalys,null);
for(const name of ['noFunding','noCompletion','noPortfolioCredit']){
 assert.equal(d[name].totalYears,0);assert.equal(d[name].costPerTenQalys,null);
 assert.equal(d[name].grossResourceCost,2100);
}
const j={...incomeJudgments,earningsShare:.1,netEarningsFraction:.05};
for(const s of data.scenarios){
 const old=hearingAccessModel(s),r=calculate(s);
 assert.deepEqual(r.historicalHealthOnly,old);close(r.healthYears,old.netQalys);
 assert.equal(r.costPerTenQalys,old.costPerTenQalys);
 for(const income of [incomeJudgments,j,{...j,netEarningsFraction:-.05},{...incomeJudgments,acquisitionLossUSD:6}]){
  const x=calculate(s,income);
  close(x.healthYears+x.earningsYears+x.acquisitionYears,x.totalYears);
  close(x.bayIncomeYears,x.incomeEquivalentYears);
  if(x.totalYears>0)close(x.costPerTenQalys*x.totalYears,10*s.cash_cost_per_offer);
  else assert.equal(x.costPerTenQalys,null);
 }
}
// Clinical instrument transfer and cash/earnings exposure are different ledgers.
close(calculate({...central,local_transfer:0},j).incomeEquivalentYears,earnings);
close(calculate(central,{...j,annualExposure:[0]}).healthYears,.012);
assert.equal(calculate(central,{...j,annualExposure:[0]}).incomeEquivalentYears,0);
const allocated=calculate({...central,donor_specific_harm_qaly_per_offer:.001},{...j,nonoverlapShare:0});
assert.equal(allocated.healthYears,-.001);assert.equal(allocated.incomeEquivalentYears,0);
const away=calculate(central,{...j,bayShare:0,sfShare:0});
assert.equal(away.bayCostPerTenQalys,null);assert.equal(away.sfCostPerTenQalys,null);
for(const [key,value]of [['baselineHouseholdIncomeUSD',0],['netEarningsFraction',-1],['acquisitionLossUSD',50000],['earningsShare',1.1],['receiptDelayYears',-1],['annualExposure',[1,1]],['annualExposure',[NaN]],['bayShare',.5]]){
 assert.throws(()=>calculate(central,{...incomeJudgments,[key]:value}));
}
console.log('PASS: frozen hearing parity, independent signed income arithmetic, incidence/time/geography/null/harm crossings and invalid inputs.');

import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/san-francisco/spur-portfolio-cea-v3.json' with {type:'json'};
import {spurPortfolioModel} from '../lib/spur-portfolio-model.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),a+' != '+b);
test('SPUR portfolio matches independently checked signed scenario outputs',()=>{
  close(Object.values(data.budget.allocationUsd).reduce((a,b)=>a+b,0),data.budget.totalUsd);
  for(const s of data.scenarios){
    const r=spurPortfolioModel(s,data.budget.totalUsd);
    for(const [k,v]of Object.entries(s.outputs))if(v===null)assert.equal(r[k],null);else close(r[k],v);
    close(r.sfNetQaly+r.restBayNetQaly,r.bayIncludingSfNetQaly);
    if(r.sfUsdPer10Qaly!==null)close(r.sfUsdPerQaly*10,r.sfUsdPer10Qaly);
    if(r.bayUsdPer10Qaly!==null)close(r.bayUsdPerQaly*10,r.bayUsdPer10Qaly);
  }
});
test('SPUR ranking uses revised central SF result, not Bay or old/favorable prior',()=>{
  const r=spurPortfolioModel(data.scenarios.find(s=>s.id==='central'));
  close(r.sfNetQaly,.09214);close(r.bayIncludingSfNetQaly,.4564);
  close(researchCostRanking.find(s=>s.slug==='spur').centralUsdPerTenQalys,r.sfUsdPer10Qaly);
  assert.equal(researchCostRanking.filter(s=>s.slug==='spur').length,1);
});
test('SPUR contribution null does not erase independent donor harm',()=>{
  const r=spurPortfolioModel(data.scenarios.find(s=>s.id==='nullContributionDonorHarm'));
  close(r.sfNetQaly,-.2);close(r.bayIncludingSfNetQaly,-.7);
  assert.equal(r.sfUsdPer10Qaly,null);assert.equal(r.bayUsdPerQaly,null);
});
test('SPUR finite calendar schedules integrate to the exposure inputs exactly once',()=>{
  for(const s of data.scenarios)for(const [group,sf,rest,sk,rk,maxYear]of [
    [s.housing,s.housing.conditionalSfOccupiedHomeYears,s.housing.conditionalRestBayOccupiedHomeYears,'annualUndiscountedSfEquivalentOccupiedHomes','annualUndiscountedRestBayEquivalentOccupiedHomes',s.id==='pessimisticPositive'?3:8],
    [s.transit,s.transit.conditionalSfUsefulServiceHours,s.transit.conditionalRestBayUsefulServiceHours,'annualUndiscountedSfEquivalentServiceHours','annualUndiscountedRestBayEquivalentServiceHours',5]
  ]){
    const c=group.calendarSchedule,years=c.yearsAfterGift;
    assert(years.length>0 && years.every(y=>Number.isInteger(y)&&y>0&&y<=maxYear));
    assert.equal(new Set(years).size,years.length);
    for(const [key,total]of [[sk,sf],[rk,rest]]){
      assert.equal(c[key].length,years.length);
      close(c[key].reduce((sum,value,i)=>sum+value/(1+data.duration.annualDiscountRate)**years[i],0),total);
    }
  }
});
test('SPUR rejects invalid inputs and preserves signed utility effects',()=>{
  const bad=structuredClone(data.scenarios[0]);bad.transit.tripsPerRecurrentRiderYear=0;
  assert.throws(()=>spurPortfolioModel(bad),RangeError);
  bad.transit.tripsPerRecurrentRiderYear=400;bad.heat.sfHealthShare=1.1;
  assert.throws(()=>spurPortfolioModel(bad),RangeError);
  const negative=structuredClone(data.scenarios[0]);negative.housing.directUtility=-1;
  assert(spurPortfolioModel(negative).sfNetQaly<0);
});

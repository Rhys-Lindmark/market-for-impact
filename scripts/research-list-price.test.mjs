import test from 'node:test';
import assert from 'node:assert/strict';
import {researchListPrice} from '../lib/research-list-price.mjs';
import {calculate,cases} from '../lib/newdoor-current-model.mjs';
import {formatImpactPrice} from '../lib/impact-metric.mjs';
import {researchCostRanking} from '../lib/research-cost-ranking.mjs';

test('conditional list references are compact numeric prices, not rewritten rankings',()=>{
  const newDoor=researchListPrice(null,'New Door Ventures');
  const reference=calculate(cases.find(s=>s.id==='finiteCourseWorkingPrior'));
  assert.equal(newDoor.label,formatImpactPrice(10*reference.budgetUsd/reference.bayIncludingSfCombinedHealthyYearEquivalent));
  assert.equal(newDoor.label,'-$1.5M');
  assert.equal(newDoor.note,'Modeled harm');
  assert.match(newDoor.detail,/negative value means modeled harm/);
  assert.match(newDoor.detail,/expected value remains unknown/);
  const nems=researchListPrice(null,'North East Medical Services');
  assert.equal(nems.label,'$120K');assert.equal(nems.note,'');
  assert.match(nems.detail,/health-only/);assert.match(nems.detail,/remain unknown/);
  for(const slug of ['new-door-ventures','north-east-medical-services']){
    const row=researchCostRanking.find(r=>r.slug===slug);
    assert.equal(row.bayUsdPerTenQalys,null);assert.equal(row.centralUsdPerTenQalys,null);
  }
});
test('ordinary list prices and missing values retain shared backend formatting',()=>{
  assert.deepEqual(researchListPrice(2500000,'Another organization'),{label:formatImpactPrice(2500000),note:'',detail:''});
  assert.equal(researchListPrice(null,'Another organization').label,'Not estimated');
});

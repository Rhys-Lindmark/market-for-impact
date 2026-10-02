import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,diagnostics,historicalResult,specialtyCounts} from '../lib/oa-ca-calibrated-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Matched-period cost and observed service mix reproduce the conditional center',()=>{
 const r=calculate();
 assert.equal(Object.values(specialtyCounts).reduce((a,b)=>a+b,0),1529);
 near(r.observed.expenseMean,(2658742+2678152+2261505)/3);
 near(r.nominalServices,100000/(2261505/1529));
 near(r.additionalServices,r.nominalServices*.3);
 near(r.additionalPeople,r.additionalServices/(1529/1130));
 near(r.healthYears,.30239317848068603);
 near(r.incomeEquivalentYears,-.0009156069848009217);
 near(r.price10,3316996.335873858);
 near(historicalResult.price10,1882705.7037158862);
});
test('Resource ledger independently uses one net first-year consumption change per household',()=>{
 const r=calculate();let total=0;
 for(const x of r.resourceLedger){
  const delay=r.model.paths.find(p=>p.id===x.id)?.delay_years??r.model.foundation.central_inputs[x.id+'_delay_years'];
  const net=(x.annualMedicationNet+x.annualWorkNet)*r.params.resourcesScale+x.firstYearExtraCash;
  const independently=.5*x.people*Math.log1p(net/30000)/1.03**(delay+.5);
  near(x.incomeEquivalent,independently);total+=independently;
 }
 near(r.incomeEquivalentYears,total);
 near(r.totalEquivalentYears,r.healthYears+r.incomeEquivalentYears);
 assert.equal(r.resourceLedger.find(x=>x.id==='eye').annualMedicationNet,0);
 assert.equal(r.resourceLedger.find(x=>x.id==='crc').annualWorkNet,0);
});
test('Overlap removes only positive gross health and component sums stay consistent',()=>{
 const c=calculate();
 for(const overlap of [.5,1]){
  const r=calculate({overlap});
  near(r.healthYears,c.grossHealthYears*(1-overlap)-c.proceduralHealthHarm);
  near(r.totalEquivalentYears,r.healthYears+r.incomeEquivalentYears);
 }
 assert.equal(calculate({overlap:1}).price10,null);
 near(calculate({healthZero:true}).healthYears,-c.proceduralHealthHarm);
 near(calculate({overlap:1,healthIndependentHarm:1}).healthYears,-c.proceduralHealthHarm-1);
 near(calculate({incomeIndependentHarm:1}).incomeEquivalentYears,c.incomeEquivalentYears-1);
 const negativePath=calculate({overlap:1,aubUtility:-.07});
 const aub=negativePath.healthPaths.find(x=>x.id==='aub');assert.ok(aub.gross_q<0);
 near(negativePath.healthYears,aub.gross_q-negativePath.proceduralHealthHarm);
 assert.ok(negativePath.healthYears<calculate({overlap:1,aubUtility:0}).healthYears);
});
test('Replacement and zero capacity create no recipients or resource gains; unknown is not zero',()=>{
 for(const inputs of [{funding:0},{cap:0}]){
  const r=calculate(inputs);assert.equal(r.additionalServices,0);assert.equal(r.additionalPeople,0);
  assert.equal(r.totalEquivalentYears,0);assert.equal(r.price10,null);assert.equal(r.params.gift,100000);
 }
 for(const inputs of [{incomeNull:true},{healthNull:true},{incomeNull:true,healthNull:true}]){
  const r=calculate(inputs);assert.equal(r.totalEquivalentYears,null);assert.equal(r.price10,null);
 }
 assert.equal(calculate({incomeZero:true}).incomeEquivalentYears,0);
 assert.ok(calculate({funding:0,incomeIndependentHarm:1}).totalEquivalentYears<0);
 const independentLoss=calculate({funding:0,incomeZero:true,incomeIndependentHarm:1});
 assert.equal(independentLoss.incomeEquivalentYears,-1);assert.equal(independentLoss.totalEquivalentYears,-1);assert.equal(independentLoss.price10,null);
});
test('Integrated cataract endpoint is finite first-year evidence, not an annual tail',()=>{
 const b=calculate().model.foundation.central_inputs;
 const hazard=b.eye_loss_hazard+b.eye_mortality_hazard+Math.log1p(b.discount);
 near(b.eye_utility_gain*(-Math.expm1(-hazard)/hazard),.056*.75);
 assert.equal(b.eye_horizon_years,1);assert.equal(b.eye_catchup_hazard,0);assert.equal(b.eye_treatment_success,1);
});
test('All diagnostic outputs are finite and invalid override domains reject',()=>{
 for(const r of Object.values(diagnostics())){
  near(r.totalEquivalentYears??0,r.totalEquivalentYears===null?0:r.healthYears+r.incomeEquivalentYears);
  for(const[k,v]of Object.entries(r))if(typeof v==='number')assert.ok(Number.isFinite(v),k);
 }
 for(const inputs of [null,[],{unknown:1},{gift:0},{funding:'0.3'},{funding:NaN},{funding:2},{overlap:2},{healthNull:1},{baselineConsumption:0},{medicationAnnual:Infinity},{fastCatchup:11},{aubUtility:2}])assert.throws(()=>calculate(inputs));
});

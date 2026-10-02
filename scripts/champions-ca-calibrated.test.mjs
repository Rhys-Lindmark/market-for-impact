import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,central,diagnostics} from '../lib/champions-ca-calibrated-model.mjs';
import {incomeHealthyYearEquivalent} from '../lib/income-health-equivalence.mjs';

const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<=1e-10*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);

test('candidate center reproduces closed author packet, not frozen historical price',()=>{
 near(central.partialPasdPrice10,306560672.01882434);
 near(central.healthYears,.005071872655126345);
 near(central.incomeEquivalentYears,-.001809875630476703);
 near(central.combinedYears,central.healthYears+central.incomeEquivalentYears);
 assert.equal(central.wholePortfolioPrice10,null);
 assert.equal(central.wholePortfolioCombinedYears,null);
});
test('dedicated PASD cost and explicit transferred throughput replace mixed category',()=>{
 near(central.parameters.costPerPerson,556597*(2062752/1718456)/79);
 near(central.parameters.allocation,556597/1718456);
 near(central.additionalPeople,100000*central.parameters.allocation/central.parameters.costPerPerson*.5);
 assert.ok(calculate({costPerPerson:central.costAnchors.matched2024CategoryFull}).partialPasdPrice10>central.partialPasdPrice10);
});
test('patients form disjoint paths; counts are not appointments plus procedures',()=>{
 near(central.ledger.reduce((sum,path)=>sum+path.people,0),central.additionalPeople);
 assert.ok(central.therapeuticShare<45/79);
 assert.equal(central.ledger.find(x=>x.id==='severe_gallstone').grossHealth,0);
 assert.ok(central.ledger.find(x=>x.id==='severe_gallstone').proceduralHarm>0);
});
test('finite exposure changes clinical effects without copying a clinical tail into resources',()=>{
 const longer=calculate({clinicalExposureYears:1});
 near(longer.incomeEquivalentYears,central.incomeEquivalentYears);
 assert.ok(longer.healthYears>central.healthYears);
 assert.ok(longer.partialPasdPrice10<central.partialPasdPrice10);
});
test('household first-year cash is netted before signed logarithmic conversion',()=>{
 const p=central.parameters;
 let reconstructed=0;
 for(const path of central.ledger){
  near(path.netFirstYearResources,path.firstYearMedications+path.firstYearRestoredWork-path.firstYearRecoveryLoss-path.firstYearExtraTravel);
  const income=.5*path.people*Math.log1p(path.netFirstYearResources/p.baselineConsumption)/Math.pow(1+p.discount,p.delayYears+.5);
  near(income,incomeHealthyYearEquivalent({people:path.people,annualIncomeBeforeUSD:p.baselineConsumption,annualIncomeGainUSD:path.netFirstYearResources,years:1,delayYears:p.delayYears+.5,discountRate:p.discount}));
  near(path.incomeEquivalentYears,income);reconstructed+=income;
 }
 near(reconstructed,central.incomeEquivalentYears);
 assert.ok(reconstructed<0);
});
test('unknown components do not become known zero or finite price',()=>{
 for(const key of ['healthUnknown','incomeUnknown']){
  const result=calculate({[key]:true});
  assert.equal(result.combinedYears,null);assert.equal(result.partialPasdPrice10,null);
 }
 assert.equal(calculate({incomeZero:true}).incomeEquivalentYears,0);
 assert.ok(calculate({incomeZero:true}).partialPasdPrice10>0);
});
test('independent harms survive ordinary-income and funding zeros',()=>{
 assert.equal(calculate({incomeZero:true,independentIncomeHarm:.01}).incomeEquivalentYears,-.01);
 const harm=calculate({funding:0,independentHealthHarm:.01,independentIncomeHarm:.01});
 near(harm.combinedYears,-.02);assert.equal(harm.partialPasdPrice10,null);
 assert.equal(calculate({funding:0}).combinedYears,0);
});
test('full overlap removes positive gross health only; negative pathways and procedure harms persist',()=>{
 const positive=calculate({overlap:1});
 near(positive.healthYears,-positive.proceduralHarm);
 near(positive.healthYears,positive.ledger.reduce((sum,path)=>sum+path.healthNet,0));
 near(positive.combinedYears,positive.healthYears+positive.incomeEquivalentYears);
 const signed=calculate({gallstoneUtility:-.05,overlap:1});
 const negativeGross=signed.ledger.reduce((sum,path)=>sum+Math.min(0,path.grossHealth),0);
 near(signed.healthYears,negativeGross-signed.proceduralHarm);
 near(signed.healthYears,signed.ledger.reduce((sum,path)=>sum+path.healthNet,0));
 assert.ok(signed.healthYears<positive.healthYears);
});
test('malformed, out-of-domain and nonfinite overrides are rejected',()=>{
 for(const input of [null,[],new Date(),{typo:1},{gift:NaN},{funding:2},{incomeUnknown:1},{baselineConsumption:1},{clinicalExposureYears:3}])assert.throws(()=>calculate(input));
 for(const output of Object.values(diagnostics())){
  const visit=value=>{if(typeof value==='number')assert.ok(Number.isFinite(value));else if(value&&typeof value==='object')Object.values(value).forEach(visit);};visit(output);
 }
});

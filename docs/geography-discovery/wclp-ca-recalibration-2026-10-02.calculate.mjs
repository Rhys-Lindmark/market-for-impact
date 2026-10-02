// Research-only conditional output benchmark. This is NOT an identified WCLP donor forecast.
const annual=(6805266+7077961+7409717)/3;
const anchors={annualTAResponses:1208,healthExpense:2154071,grossExpense:7409717,healthRequestShare:2154071/7409717,eligibilityTransferRequestShare:.25,uniqueAdultsPerRelevantResponse:5,resolutionWithoutWCLP:.6,resolutionWithWCLP:.8,addedDays:90};
const addedHouseholds=anchors.annualTAResponses*anchors.healthRequestShare*anchors.eligibilityTransferRequestShare*anchors.uniqueAdultsPerRelevantResponse*(anchors.resolutionWithWCLP-anchors.resolutionWithoutWCLP);
const base={households:addedHouseholds,years:90/365,coveredAdultsPerHousehold:1,q:0.05,netResourcePerHousehold:569,baselineHousehold:9214*2.91,overlapShare:0,healthHarm:0,resourceHarm:0,replacementShare:0,cost:annual,discount:.03,receiptTime:(90/365)/2};
function calc(o={}){
 const p={...base,...o};
 if(Object.values(p).some(x=>!Number.isFinite(x)))throw Error('Nonfinite parameter');
 if(p.households<0||p.years<0||p.years>1||p.cost<=0||p.coveredAdultsPerHousehold<0||p.coveredAdultsPerHousehold>1||p.discount<0||p.discount>1||p.receiptTime<0||p.receiptTime>10||p.q< -1||p.q>1||p.healthHarm<0||p.resourceHarm<0||p.replacementShare<0||p.replacementShare>1||p.overlapShare<0||p.overlapShare>1||p.baselineHousehold<=0)throw Error('Invalid parameters');
 const h=p.households*(1-p.replacementShare), f=1/(1+p.discount)**p.receiptTime;
 const net=p.netResourcePerHousehold-p.resourceHarm;
 if(net<=-p.baselineHousehold)throw Error('Nonpositive consumption');
 const health=(h*p.years*p.coveredAdultsPerHousehold*p.q-p.healthHarm)*f;
 const income=.5*h*p.years*Math.log1p(net/p.baselineHousehold)*f;
 // A separately specified overlap premise, not health := total minus income.
 const total=health-p.overlapShare*Math.max(0,health)+income;
 // One annual budget committed at start of2027. Benefits are90-day flows,
 // midpoint approximation atT/2; cost is intentionally undiscounted.
 const cost=p.cost;
 return {params:p,discountedCostUSD:cost,healthYears:health,incomeEquivalentYears:income,totalEquivalentYears:total,price10:total>0?10*cost/total:null,healthOnlyPrice10:health>0?10*cost/health:null,incomeOnlyPrice10:income>0?10*cost/income:null};
}
const out={version:'wclp-ca-20261002-annual-TA-judgment-v1',anchors,identifiedDonorCentral:{costUSD:null,healthYears:null,incomeEquivalentYears:null,totalEquivalentYears:null,price10:null},conditionalCentral:calc(),outputBenchmark1000:calc({households:1000,years:1,receiptTime:.5}),cases:{null:{healthYears:null,incomeEquivalentYears:null,totalEquivalentYears:null,price10:null},healthNull:{...calc(),healthYears:null,totalEquivalentYears:null,price10:null,healthOnlyPrice10:null},incomeNull:{...calc(),incomeEquivalentYears:null,totalEquivalentYears:null,price10:null,incomeOnlyPrice10:null},healthZero:calc({q:0}),incomeZero:calc({netResourcePerHousehold:0}),completeReplacement:calc({replacementShare:1}),halfReplacement:calc({replacementShare:.5}),signedHealthHarm:calc({q:-.01}),signedIncomeHarm:calc({netResourcePerHousehold:-569}),signedBothHarm:calc({q:-.01,netResourcePerHousehold:-569}),partialOverlap:calc({overlapShare:.5}),fullOverlap:calc({overlapShare:1}),reportedSpendingAmountDiagnostic:calc({netResourcePerHousehold:215.35}),oneYearExposure:calc({years:1,receiptTime:.5}),healthAttenuated:calc({q:.02}),consumptionRatioHalf:calc({netResourcePerHousehold:284.5}),consumptionRatioDouble:calc({netResourcePerHousehold:1138}),oneAdultPerResponse:calc({households:addedHouseholds/5}),twentyAdultsPerResponse:calc({households:addedHouseholds*4}),eligibilitySharePointOne:calc({households:addedHouseholds*.4}),deltaResolutionPointZeroFive:calc({households:addedHouseholds*.25})},noEmpiricalScenarioWeights:true};
// Export full reproducible results, or lean artifact data for apply_patch persistence.
console.log(JSON.stringify(process.argv.includes('--compact')?{version:out.version,anchors,identifiedDonorCentral:out.identifiedDonorCentral,conditionalCentral:out.conditionalCentral,outputBenchmark1000:out.outputBenchmark1000,cases:Object.fromEntries(Object.entries(out.cases).map(([k,v])=>[k,{healthYears:v.healthYears,incomeEquivalentYears:v.incomeEquivalentYears,totalEquivalentYears:v.totalEquivalentYears,price10:v.price10}])),noEmpiricalScenarioWeights:true}:out,null,2));

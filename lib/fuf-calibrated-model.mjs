// Explicit conditional health + net-resource ledger. Not measured FUF clinical
// QALYs or a verified marginal offer. No frozen engine or probability mixture.
export const modelVersion='fuf-health-income-calibration-2026-10-01';
export const sourceInputs=Object.freeze({
 wholeExpenseUSD:5410095,annualStreetPlantings:1506,annualGreenCrewParticipants:10,
 meanPortlandTractPopulation:4318,portlandRateYoung:.154,portlandRateMiddle:.262,portlandRateOld:.306,
 hourlyWageUSD:23.68,referenceIncomeUSD:50000,healthyYearValueCG:100000,
});
export const assumptionBasis=Object.freeze({
 health:'Portland observational mortality rate by planted-tree age; causal/local/QALY bridge judgments, not measured FUF effect. No extra survival haircut.',
 income:'FY2025 ten Green Crew participants and April2026 pay projection. Counterfactual earnings, net retention, household baseline and gift response are judgments; no postprogram wage effect.',
 burden:'One-off household resource loss valued over one annual resource window at the stated receipt delay. Exposure survives failed funding/completion; not a six-month wage flow.',
 cost:'Whole-organization FY2025 accounting allocation, including payroll and shared support, not a marginal quote or complete external-resource inventory.',
});
export const central=Object.freeze({
 donorBudgetUSD:100000,...sourceInputs,
 treeAdditionality:.4,netNewExposureShare:.5,causalRetention:.1,localHealthTransfer:.5,
 remainingQualityAdjustedYearsPerDeath:5,healthHorizonYears:15,discountRate:.03,
 healthHarmPerImplementedTree:.002,jobAdditionality:.4,
 weeklyHours:27,paidWeeks:26,counterfactualEarningsShare:.5,netResourceRetention:.75,
 baselineHouseholdResourcesUSD:50000,
 recipientBurdenUSD:0,burdenReceiptDelayYears:.25,burdenAnnualResourceWindowYears:1,burdenExposureShare:1,
 portfolioShare:1,healthSFShare:1,healthBayShare:1,incomeSFShare:1,incomeBayShare:1,
});
const fraction=v=>Number.isFinite(v)&&v>=0&&v<=1;
const positive=v=>Number.isFinite(v)&&v>0;
const nonnegative=v=>Number.isFinite(v)&&v>=0;
const price=(cost,years)=>years>0?10*cost/years:null;
export function calculate(overrides={}){
 if(overrides===null||typeof overrides!=='object'||Array.isArray(overrides))throw new TypeError('FUF input object required');
 for(const key of Object.keys(overrides))if(!(key in central))throw new TypeError(`Unknown FUF input: ${key}`);
 const x={...central,...overrides};
 if(!['donorBudgetUSD','wholeExpenseUSD','baselineHouseholdResourcesUSD','meanPortlandTractPopulation','referenceIncomeUSD','healthyYearValueCG'].every(k=>positive(x[k]))||
  !['annualStreetPlantings','annualGreenCrewParticipants','hourlyWageUSD','weeklyHours','paidWeeks','remainingQualityAdjustedYearsPerDeath','discountRate','healthHarmPerImplementedTree','recipientBurdenUSD','burdenReceiptDelayYears','portlandRateYoung','portlandRateMiddle','portlandRateOld'].every(k=>nonnegative(x[k]))||
  !['treeAdditionality','netNewExposureShare','causalRetention','localHealthTransfer','jobAdditionality','counterfactualEarningsShare','netResourceRetention','burdenExposureShare','portfolioShare','healthSFShare','healthBayShare','incomeSFShare','incomeBayShare'].every(k=>fraction(x[k]))||
  !Number.isInteger(x.healthHorizonYears)||x.healthHorizonYears<0||x.healthHorizonYears>15||
  x.paidWeeks>26||x.weeklyHours>168||x.discountRate>1||x.recipientBurdenUSD>=x.baselineHouseholdResourcesUSD||
  x.burdenAnnualResourceWindowYears!==1||x.healthSFShare>x.healthBayShare||x.incomeSFShare>x.incomeBayShare)
  throw new RangeError('Invalid FUF cost, health, six-month resource, annual burden, fraction or nested geography input');
 const giftShare=x.donorBudgetUSD/x.wholeExpenseUSD;
 const allocatedPlantingEquivalents=x.annualStreetPlantings*giftShare;
 const implementedTrees=allocatedPlantingEquivalents*x.treeAdditionality*x.portfolioShare;
 const healthSchedule=[];
 for(let t=1;t<=x.healthHorizonYears;t++){
  const rate=t<=5?x.portlandRateYoung:t<=10?x.portlandRateMiddle:x.portlandRateOld;
  const perTree=rate*x.meanPortlandTractPopulation/100000*x.causalRetention*x.localHealthTransfer*x.remainingQualityAdjustedYearsPerDeath/(1+x.discountRate)**(t-.5);
  healthSchedule.push({year:t,rateAssociationPer100K:rate,healthYearsPerPlantedTree:perTree});
 }
 // Planted-tree association embodies unknown source attrition. Do not multiply
 // again by establishment or post-establishment mortality/survival parameters.
 const healthYearsPerPlantedTree=healthSchedule.reduce((s,r)=>s+r.healthYearsPerPlantedTree,0);
 const grossHealthYears=implementedTrees*x.netNewExposureShare*healthYearsPerPlantedTree;
 const healthHarmYears=-implementedTrees*x.healthHarmPerImplementedTree;
 const healthYears=grossHealthYears+healthHarmYears;
 const allocatedParticipantEquivalents=x.annualGreenCrewParticipants*giftShare*x.portfolioShare;
 const additionalParticipantEquivalents=allocatedParticipantEquivalents*x.jobAdditionality;
 const grossProgramWagesUSD=x.hourlyWageUSD*x.weeklyHours*x.paidWeeks;
 const netIncrementalResourcesUSD=grossProgramWagesUSD*(1-x.counterfactualEarningsShare)*x.netResourceRetention;
 const incomeDurationYears=x.paidWeeks/52,weight=x.referenceIncomeUSD/x.healthyYearValueCG;
 const incomeSchedule=[];
 // Six equal receipt/exposure bins spanning at most six months, never annual
 // gains repeated after completion. Zero dose has zero earnings, no 0/0.
 if(incomeDurationYears>0)for(let j=1;j<=6;j++){
  const delay=incomeDurationYears*(j-.5)/6;
  const years=weight*incomeDurationYears/6*Math.log1p(netIncrementalResourcesUSD/incomeDurationYears/x.baselineHouseholdResourcesUSD)/(1+x.discountRate)**delay;
  incomeSchedule.push({period:j,exposureYears:incomeDurationYears/6,receiptDelayYears:delay,incomeEquivalentYears:years});
 }
 const incomeYearsPerParticipant=incomeSchedule.reduce((s,r)=>s+r.incomeEquivalentYears,0);
 const wageIncomeEquivalentYears=additionalParticipantEquivalents*incomeYearsPerParticipant;
 // Burden is incurred by exposed allocated applicants, NOT only successful
 // additional jobs; one annual resource window, independently discounted.
 const burdenYearsPerExposedParticipant=weight*Math.log1p(-x.recipientBurdenUSD/x.baselineHouseholdResourcesUSD)/(1+x.discountRate)**x.burdenReceiptDelayYears;
 const recipientBurdenEquivalentYears=allocatedParticipantEquivalents*x.burdenExposureShare*burdenYearsPerExposedParticipant;
 const incomeEquivalentYears=wageIncomeEquivalentYears+recipientBurdenEquivalentYears;
 const combinedYears=healthYears+incomeEquivalentYears;
 const region=(h,i)=>{const health=healthYears*h,income=incomeEquivalentYears*i,combined=health+income;return{healthYears:health,incomeEquivalentYears:income,combinedYears:combined,costPerBetterLifeUSD:price(x.donorBudgetUSD,combined)};};
 const r={modelVersion,inputs:x,giftShare,allocatedPlantingEquivalents,implementedTrees,
  healthSchedule,healthYearsPerPlantedTree,grossHealthYears,healthHarmYears,healthYears,
  allocatedParticipantEquivalents,additionalParticipantEquivalents,grossProgramWagesUSD,netIncrementalResourcesUSD,
  incomeDurationYears,incomeSchedule,incomeYearsPerParticipant,wageIncomeEquivalentYears,
  burdenYearsPerExposedParticipant,recipientBurdenEquivalentYears,incomeEquivalentYears,combinedYears,
  costPerBetterLifeUSD:price(x.donorBudgetUSD,combinedYears),status:combinedYears>0?'positive':combinedYears<0?'harm':'null',
  sf:region(x.healthSFShare,x.incomeSFShare),bay:region(x.healthBayShare,x.incomeBayShare)};
 const finiteTree=v=>{if(typeof v==='number'&&!Number.isFinite(v))throw new RangeError('Nonfinite FUF result');if(v&&typeof v==='object')for(const q of Object.values(v))finiteTree(q);};finiteTree(r);return r;
}
export const scenarios=Object.freeze({
 central:{},zeroIncome:{counterfactualEarningsShare:1},cashOnly:{causalRetention:0,healthHarmPerImplementedTree:0},
 healthNull:{causalRetention:0},noFunding:{treeAdditionality:0,jobAdditionality:0},
 fundingReplacementBurden:{treeAdditionality:0,jobAdditionality:0,recipientBurdenUSD:500},
 allNull:{treeAdditionality:0,jobAdditionality:0,healthHarmPerImplementedTree:0},
 cautious:{treeAdditionality:.2,netNewExposureShare:.25,causalRetention:.02,localHealthTransfer:.25,remainingQualityAdjustedYearsPerDeath:3,jobAdditionality:.2,counterfactualEarningsShare:.75,netResourceRetention:.5,weeklyHours:24},
 favorable:{treeAdditionality:.75,netNewExposureShare:.75,causalRetention:.25,localHealthTransfer:.75,remainingQualityAdjustedYearsPerDeath:10,jobAdditionality:.75,counterfactualEarningsShare:.25,netResourceRetention:.9,weeklyHours:30,healthHarmPerImplementedTree:.0006},
 adverse:{treeAdditionality:.15,causalRetention:0,healthHarmPerImplementedTree:.02,jobAdditionality:0,recipientBurdenUSD:500},
 fullyAdditionalExposure:{netNewExposureShare:1},noTreeHarms:{healthHarmPerImplementedTree:0},
});
export const diagnostics=()=>Object.fromEntries(Object.entries(scenarios).map(([key,x])=>[key,calculate(x)]));

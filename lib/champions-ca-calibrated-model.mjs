// Standalone declared-prior PASD forecast. No checkout writes or dependencies.
const observed={fy2024:{people:79,appointments:373,procedures:45,categoryExpense:872510,programExpense:4193210,taxExpense:4581892,eventExpense:128162},fy2025:{pasdExpense:556597,programExpense:1718456,taxExpense:1963721,eventExpense:99031},grossResourceSeries:[3621619,5011784,2378718],cashLikeSeries:[3239627,4710054,2062752]};
const costs={matched2024CategoryFull:872510*(4710054/4193210)/79,latest2025Same79Forecast:556597*(2062752/1718456)/79,whole2024RecipientPartial:4710054/79};
const base={gift:100000,allocation:556597/1718456,costPerPerson:costs.latest2025Same79Forecast,funding:.5,capacity:20,uniqueProcedureFraction:.8,therapeuticFraction:.5,clinicalExposureYears:.5,resourceBenefitFraction:.5,clinicalTransfer:1,healthGrossScale:1,healthHarmScale:1,gallstoneUtility:0,diagnosticUtility:.01,medicineAnnual:60,netPayPerDay:100,paidCashIncidence:.5,postopLostDays:3,netCashPerAppointment:10,baselineConsumption:30000,discount:.03,delayYears:.25,overlap:0,independentHealthHarm:0,independentIncomeHarm:0,healthUnknown:false,incomeUnknown:false,otherPortfolioUnknown:true,incomeZero:false,allPatientHealthZero:false};
const clinical=[{id:'symptomatic_hernia',share:.4,utility:.04,success:.9,harm:.004,recoveredPaidDays:5},{id:'severe_gallstone',share:.3,utility:0,success:.9,harm:.008,recoveredPaidDays:0},{id:'unrepaired_fracture',share:.2,utility:.10,success:.8,harm:.015,recoveredPaidDays:10},{id:'refractory_aub',share:.1,utility:.07,success:.85,harm:.010,recoveredPaidDays:0}];
export function calculate(overrides={}){
 if(overrides===null||typeof overrides!=='object'||Array.isArray(overrides)||Object.getPrototypeOf(overrides)!==Object.prototype)throw Error('Overrides must be a plain object');
 for(const k of Object.keys(overrides))if(!Object.hasOwn(base,k))throw Error('Unknown input '+k);
 const p={...base,...overrides};
 for(const[k,v]of Object.entries(p)){if(typeof v!==typeof base[k])throw Error('Type '+k);if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite '+k);}
 const bounds={gift:[1,1e9],allocation:[0,1],costPerPerson:[1,1e7],funding:[0,1],capacity:[0,1e7],uniqueProcedureFraction:[0,1],therapeuticFraction:[0,1],clinicalExposureYears:[0,2],resourceBenefitFraction:[0,1],clinicalTransfer:[0,2],healthGrossScale:[0,10],healthHarmScale:[0,10],gallstoneUtility:[-1,1],diagnosticUtility:[-1,1],medicineAnnual:[0,1e5],netPayPerDay:[0,1e4],paidCashIncidence:[0,1],postopLostDays:[0,365],netCashPerAppointment:[0,1e4],baselineConsumption:[1,1e8],discount:[0,1],delayYears:[0,5],overlap:[0,1],independentHealthHarm:[0,1e6],independentIncomeHarm:[0,1e6]};
 for(const[k,[lo,hi]]of Object.entries(bounds))if(p[k]<lo||p[k]>hi)throw Error('Bounds '+k);
 const nominalPeople=p.gift*p.allocation/p.costPerPerson,additionalPeople=Math.min(p.capacity,nominalPeople*p.funding);
 const procedureShare=45/79*p.uniqueProcedureFraction,therapeuticShare=procedureShare*p.therapeuticFraction;
 const paths=clinical.map(x=>({...x,utility:x.id==='severe_gallstone'?p.gallstoneUtility:x.utility,people:additionalPeople*therapeuticShare*x.share}));
 paths.push({id:'diagnostic_and_nonprocedural_management',people:additionalPeople*(1-therapeuticShare),utility:p.diagnosticUtility,success:.2,harm:.0005,recoveredPaidDays:0});
 let grossHealth=0,overlapRemoved=0,proceduralHarm=0,income=0;const ledger=[];
 const healthTime=Math.pow(1+p.discount,-(p.delayYears+p.clinicalExposureYears/2)),resourceTime=Math.pow(1+p.discount,-(p.delayYears+.5));
 for(const x of paths){
  const intervention=x.id!=='diagnostic_and_nonprocedural_management';
  const gross=p.allPatientHealthZero?0:x.people*x.utility*x.success*p.clinicalExposureYears*p.clinicalTransfer*p.healthGrossScale*healthTime;
  // Judged incremental recovery/adverse-event health burden occurs at treatment arrival.
  const harm=x.people*x.harm*p.healthHarmScale*Math.pow(1+p.discount,-p.delayYears);
  // Gallstone center has no identified relief versus conservative care: no linked medicine saving.
  const medications=intervention&&x.id!=='severe_gallstone'?p.medicineAnnual*p.resourceBenefitFraction*x.success:0;
  const restoredWork=x.recoveredPaidDays*p.resourceBenefitFraction*x.success*p.netPayPerDay*p.paidCashIncidence;
  const recoveryLoss=intervention?p.postopLostDays*p.netPayPerDay*p.paidCashIncidence:0;
  // First-year cash totals. Work figures are net paid household resources, not shadow time.
  const travelLoss=p.netCashPerAppointment*(373/79),netResources=medications+restoredWork-recoveryLoss-travelLoss;
  if(netResources<=-p.baselineConsumption)throw Error('Nonpositive household consumption');
  const resource=p.incomeZero?0:.5*x.people*Math.log1p(netResources/p.baselineConsumption)*resourceTime;
  grossHealth+=gross;overlapRemoved+=p.overlap*Math.max(0,gross);proceduralHarm+=harm;income+=resource;
  ledger.push({id:x.id,people:x.people,grossHealth:gross,overlapRemoved:p.overlap*Math.max(0,gross),proceduralHarm:harm,healthNet:gross-p.overlap*Math.max(0,gross)-harm,firstYearMedications:medications,firstYearRestoredWork:restoredWork,firstYearRecoveryLoss:recoveryLoss,firstYearExtraTravel:travelLoss,netFirstYearResources:netResources,firstYearExposureYears:1,receiptTimeYears:p.delayYears+.5,incomeEquivalentYears:resource});
 }
 const healthNet=grossHealth-overlapRemoved-proceduralHarm-p.independentHealthHarm;
 // Unknown is not zero. Independent harms survive zero funding/income flags and overlap.
 const resourceNet=income-p.independentIncomeHarm;
 const combined=p.healthUnknown||p.incomeUnknown?null:grossHealth-overlapRemoved-proceduralHarm-p.independentHealthHarm+resourceNet;
 const out={parameters:p,observed,costAnchors:costs,nominalPeople,additionalPeople,procedureShare,therapeuticShare,grossHealth,overlapRemoved,proceduralHarm,healthYears:p.healthUnknown?null:healthNet,incomeEquivalentYears:p.incomeUnknown?null:resourceNet,combinedYears:combined,partialPasdPrice10:combined>0?10*p.gift/combined:null,healthOnlyPrice10:healthNet>0&&!p.healthUnknown?10*p.gift/healthNet:null,incomeOnlyPrice10:resourceNet>0&&!p.incomeUnknown?10*p.gift/resourceNet:null,wholePortfolioCombinedYears:p.otherPortfolioUnknown?null:combined,wholePortfolioPrice10:p.otherPortfolioUnknown?null:combined>0?10*p.gift/combined:null,ledger};
 const finite=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw Error('Nonfinite result');if(x&&typeof x==='object')for(const v of Object.values(x))finite(v)};finite(out);return out;
}

export const modelVersion='champions-ca-pasd-health-resources-judgment-20261002';
export const defaultInputs=Object.freeze({...base});
export const central=calculate();
export const scenarios=Object.freeze({
 central:{},lowFunding:{funding:.1},legacyFunding:{funding:.25},highFunding:{funding:.8},
 completeReplacement:{funding:0},replacementWithHarms:{funding:0,independentHealthHarm:.01,independentIncomeHarm:.01},
 lowCapacity:{capacity:.5},mixedCategoryCost:{costPerPerson:costs.matched2024CategoryFull},
 undatedThroughput:{costPerPerson:costs.latest2025Same79Forecast*79/335},
 wholeRecipientCost:{costPerPerson:costs.whole2024RecipientPartial,allocation:1},allGiftPasd:{allocation:1},
 quarterYear:{clinicalExposureYears:.25},fullYear:{clinicalExposureYears:1},twoYears:{clinicalExposureYears:2},
 gallstonePositive:{gallstoneUtility:.05},gallstoneNegativeFullOverlap:{gallstoneUtility:-.05,overlap:1},
 diagnosticZero:{diagnosticUtility:0},healthUnknown:{healthUnknown:true},incomeUnknown:{incomeUnknown:true},
 incomeZero:{incomeZero:true},incomeZeroWithHarm:{incomeZero:true,independentIncomeHarm:.01},
 benefitZeroRetainsHarm:{allPatientHealthZero:true},fullOverlap:{overlap:1},halfOverlap:{overlap:.5},
 consumption15000:{baselineConsumption:15000},consumption60000:{baselineConsumption:60000},
 noMedicine:{medicineAnnual:0},noPaidWork:{paidCashIncidence:0},resourceHarm:{medicineAnnual:0,postopLostDays:14,netCashPerAppointment:50}
});
export const diagnostics=()=>Object.fromEntries(Object.entries(scenarios).map(([key,input])=>[key,calculate(input)]));

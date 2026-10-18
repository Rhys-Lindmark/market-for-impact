// Integrate as lib/heppac-legacy-current.mjs. Static relative imports are portable
// with the preserved historical engine/helper/baseline and shared welfare helper.
import {calculate as calculateHealth} from './heppac-model.mjs';
import {uniqueCohort} from './heppac-unique-cohort.mjs';
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';

export const modelVersion='heppac-legacy-health-net-consumption-v3-20261004';
export const latestAnnualExpenseUSD=4953186;
export const measuredWholeGiftExpectedValue=null;
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};

// All quantities below are explicitly subjective bounded scenario priors.
// Counts are synthetic recipient cohorts, not PWL's reported people or samples.
// Saved pay concerns missed work/appointments among otherwise-living people;
// no future wages for people whose lives are extended and no GDP credit.
export const incomePriors=freeze([
 {name:'downside',people:25,annualConsumptionBeforeUSD:6000,years:1,delayYears:0.5,discountRate:0.03,causalShare:0.10,independentShare:0.25,
  savedTakeHomePayUSD:0,feesUSD:0,travelUSD:120,careUSD:60,medicalOutOfPocketSavingsUSD:0,basicNeedsTransferValueUSD:0,displacedTransferShare:0.75},
 {name:'central',people:100,annualConsumptionBeforeUSD:12000,years:1,delayYears:0.5,discountRate:0.03,causalShare:0.25,independentShare:0.50,
  savedTakeHomePayUSD:120,feesUSD:0,travelUSD:60,careUSD:30,medicalOutOfPocketSavingsUSD:60,basicNeedsTransferValueUSD:180,displacedTransferShare:0.50},
 {name:'favorable-stress',people:300,annualConsumptionBeforeUSD:18000,years:1,delayYears:0.5,discountRate:0.03,causalShare:0.50,independentShare:0.75,
  savedTakeHomePayUSD:300,feesUSD:0,travelUSD:30,careUSD:15,medicalOutOfPocketSavingsUSD:180,basicNeedsTransferValueUSD:300,displacedTransferShare:0.25}
]);
export const unknownMeasurements=freeze(['current unduplicated HEPPAC people','victims/rescuers/refills linkage','retained MOUD-years','income/consumption baseline','saved take-home pay','fees/travel/care','medical out-of-pocket change','basic-needs value and alternative transfers','cross-program person overlap','residence shares','marginal funding capacity','private-gift displacement','complete donated/public resource cost']);
const inRange=(k,v,lo,hi)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(k);return v;};
const price=(cost,benefit)=>benefit>0?10*cost/benefit:null;
export function netConsumption(p,{incomeScale=1,additionalAnnualFeeUSD=0,positiveIncomeIndependentScale=1}={}){
 inRange('incomeScale',incomeScale,0,10);inRange('additionalAnnualFeeUSD',additionalAnnualFeeUSD,0,10000);
 inRange('positiveIncomeIndependentScale',positiveIncomeIndependentScale,0,1);inRange('independentShare',p.independentShare,0,1);
 for(const key of ['savedTakeHomePayUSD','feesUSD','travelUSD','careUSD','medicalOutOfPocketSavingsUSD','basicNeedsTransferValueUSD'])inRange(key,p[key],0,1e6);
 inRange('displacedTransferShare',p.displacedTransferShare,0,1);
 // Overlap can remove credit, never conceal household cash harms. Apply it to
 // positive mechanism rows before one signed net; helper gets independentShare 1.
 const positives=p.savedTakeHomePayUSD+p.medicalOutOfPocketSavingsUSD+p.basicNeedsTransferValueUSD*(1-p.displacedTransferShare);
 const costs=p.feesUSD+p.travelUSD+p.careUSD+additionalAnnualFeeUSD;
 const direct=positives*p.independentShare*positiveIncomeIndependentScale-costs;
 return incomeScale*direct;
}
export function calculate(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))throw new TypeError('options');
 const {giftUSD=100000,incomeScale=1,additionalAnnualFeeUSD=0,positiveIncomeIndependentScale=1,healthMultiplier=1,mortalityPositiveOverlapScale=1,healthDelayYears=0,healthOptions={}}=options;
 inRange('giftUSD',giftUSD,1,latestAnnualExpenseUSD);inRange('healthMultiplier',healthMultiplier,-1,1);
 inRange('healthDelayYears',healthDelayYears,0,10);
 inRange('mortalityPositiveOverlapScale',mortalityPositiveOverlapScale,0,1);
 const health=calculateHealth(healthOptions),giftScale=giftUSD/health.ordinaryGift;
 const rows=health.results.map((h,i)=>{
  const p=incomePriors[i],annualNetUSD=netConsumption(p,{incomeScale,additionalAnnualFeeUSD,positiveIncomeIndependentScale});
  const annualNetConsumptionBeforeOverlapUSD=p.savedTakeHomePayUSD+p.medicalOutOfPocketSavingsUSD+p.basicNeedsTransferValueUSD*(1-p.displacedTransferShare)-p.feesUSD-p.travelUSD-p.careUSD-additionalAnnualFeeUSD;
  const equivalenceInputs={people:p.people,annualIncomeBeforeUSD:p.annualConsumptionBeforeUSD,annualIncomeGainUSD:annualNetUSD,years:p.years,causalShare:p.causalShare,editionShare:1,independentShare:1,delayYears:p.delayYears,discountRate:p.discountRate};
  const annualIncomeHealthyYearEquivalent=incomeHealthyYearEquivalent(equivalenceInputs);
  // Historical engine remains intact as a diagnostic. Current overlap reduces
  // only positive mortality channels; adverse channels and independent harms
  // remain fully signed, including when all positive overlap credit is removed.
  const mortalityChannels=['naloxone','moud','drugChecking'].map(key=>h.pathwayQalyRaw[key]*healthMultiplier);
  const positiveMortalityQaly=mortalityChannels.reduce((sum,q)=>sum+Math.max(0,q),0)*h.inputs.mortalityOverlapAdjustment*mortalityPositiveOverlapScale;
  const negativeMortalityQaly=mortalityChannels.reduce((sum,q)=>sum+Math.min(0,q),0);
  const annualHealthQaly=(positiveMortalityQaly+negativeMortalityQaly+h.pathwayQalyRaw.syringe*healthMultiplier-h.independentHarmQaly)/Math.pow(1.03,healthDelayYears);
  const annualCombinedHealthyYearEquivalent=annualHealthQaly+annualIncomeHealthyYearEquivalent;
  const realizationFactor=giftUSD*h.inputs.giftDeployableShare/latestAnnualExpenseUSD*h.inputs.giftRealizationDiscount;
  const giftHealthQaly=annualHealthQaly*realizationFactor;
  const giftIncomeHealthyYearEquivalent=annualIncomeHealthyYearEquivalent*realizationFactor;
  const giftCombinedHealthyYearEquivalent=giftHealthQaly+giftIncomeHealthyYearEquivalent;
  const bayGiftCombinedHealthyYearEquivalent=giftCombinedHealthyYearEquivalent*h.inputs.bayImpactSharePrior;
  const sfGiftCombinedHealthyYearEquivalent=giftCombinedHealthyYearEquivalent*h.inputs.sfImpactSharePrior;
  return {name:h.name,weight:h.inputs.weight,incomePrior:structuredClone(p),annualNetConsumptionBeforeOverlapUSD,annualNetConsumptionPerPersonUSD:annualNetUSD,equivalenceInputs,
   annualHealthQaly,annualIncomeHealthyYearEquivalent,annualCombinedHealthyYearEquivalent,healthDelayYears,realizationFactor,
   giftHealthQaly,giftIncomeHealthyYearEquivalent,giftCombinedHealthyYearEquivalent,bayGiftCombinedHealthyYearEquivalent,sfGiftCombinedHealthyYearEquivalent,
   donorPer10HealthyYearEquivalent:price(giftUSD,giftCombinedHealthyYearEquivalent),bayDonorPer10HealthyYearEquivalent:price(giftUSD,bayGiftCombinedHealthyYearEquivalent),sfDonorPer10HealthyYearEquivalent:price(giftUSD,sfGiftCombinedHealthyYearEquivalent),
   illustrativeGrossResourcesUSD:h.conditionalOrdinaryGift.grossResources*giftScale,
   incomeEvidenceStatus:'Unmeasured; explicit one-year net-consumption prior',healthEvidenceStatus:'Preserved finite unique-naloxone V2; other pathway/overlap priors unresolved'};
 });
 const weighted=key=>rows.reduce((sum,r)=>sum+r.weight*r[key],0);
 const weightedGiftHealthQaly=weighted('giftHealthQaly');
 const weightedGiftIncomeHealthyYearEquivalent=weighted('giftIncomeHealthyYearEquivalent');
 const weightedGiftCombinedHealthyYearEquivalent=weighted('giftCombinedHealthyYearEquivalent');
 const weightedBayGiftCombinedHealthyYearEquivalent=weighted('bayGiftCombinedHealthyYearEquivalent');
 const weightedSfGiftCombinedHealthyYearEquivalent=weighted('sfGiftCombinedHealthyYearEquivalent');
 // Do not condition on positive worlds: old .20 zero-credit weight remains.
 const output={modelVersion,expenseUSD:latestAnnualExpenseUSD,giftUSD,measuredWholeGiftExpectedValue,marginalCapacityStatus:'unknown',incomeMeasurementsStatus:'unknown',unknownMeasurements:structuredClone(unknownMeasurements),
  interpretation:'Conditional prior illustration, including 20% zero-credit world; no verified whole-gift EV or marginal funding offer. Healthy-year equivalent combines modeled QALYs and normative income welfare; it is not measured clinical QALYs.',
  healthOnly:health,rows,noBenefit:{weight:0.2,giftHealthQaly:0,giftIncomeHealthyYearEquivalent:0,giftCombinedHealthyYearEquivalent:0,donorPer10HealthyYearEquivalent:null},
  conditionalOrdinaryGiftWeighted:{weightedGiftHealthQaly,weightedGiftIncomeHealthyYearEquivalent,weightedGiftCombinedHealthyYearEquivalent,weightedBayGiftCombinedHealthyYearEquivalent,weightedSfGiftCombinedHealthyYearEquivalent,
   donorPer10HealthyYearEquivalent:price(giftUSD,weightedGiftCombinedHealthyYearEquivalent),bayDonorPer10HealthyYearEquivalent:price(giftUSD,weightedBayGiftCombinedHealthyYearEquivalent),sfDonorPer10HealthyYearEquivalent:price(giftUSD,weightedSfGiftCombinedHealthyYearEquivalent),
   illustrativeGrossResourcesUSD:health.conditionalOrdinaryGiftWeighted.grossResources*giftScale,
   illustrativeGrossPer10HealthyYearEquivalent:price(health.conditionalOrdinaryGiftWeighted.grossResources*giftScale,weightedGiftCombinedHealthyYearEquivalent),completeGrossResourceCostUSD:null},
  costBoundary:'Annual FY2025 legal-entity expense retained once. A single gift buys a prior-defined share of one annual service cohort; finite survival tails and one-year consumption gains are then credited. Gross multipliers remain illustrative, not measured. Donated services/public naloxone/volunteers and fiscal-sponsor allocation require reconciliation.'};
 const check=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw new RangeError('nonfinite output');if(x&&typeof x==='object')Object.values(x).forEach(check);};check(output);return output;
}

// Finite independent arithmetic/invariant checks for the separate review phase.
// No Node-only dependencies: root can call this in existing repository tests.
export function runSelfTests(){
 let checks=0;const assert=(x,m)=>{if(!x)throw new Error(m);checks++;};
 const near=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`arithmetic mismatch ${a} ${b}`);
 const base=calculate(),w=base.conditionalOrdinaryGiftWeighted;
 near(base.rows.reduce((s,r)=>s+r.weight,0)+base.noBenefit.weight,1);
 for(const r of base.rows){
  const p=r.incomePrior;
  const dollars=(p.savedTakeHomePayUSD+p.medicalOutOfPocketSavingsUSD+p.basicNeedsTransferValueUSD-p.basicNeedsTransferValueUSD*p.displacedTransferShare)*p.independentShare-p.feesUSD-p.travelUSD-p.careUSD;
  near(r.annualNetConsumptionPerPersonUSD,dollars);
  // Independent direct formula: .5 is reference $50K / healthy-year $100K.
  const expected=0.5*p.people*Math.log((p.annualConsumptionBeforeUSD+dollars)/p.annualConsumptionBeforeUSD)*p.causalShare/Math.pow(1.03,0.5);
  near(r.annualIncomeHealthyYearEquivalent,expected);
  near(r.giftCombinedHealthyYearEquivalent,(r.annualHealthQaly+expected)*base.giftUSD/base.expenseUSD*base.healthOnly.results.find(h=>h.name===r.name).inputs.giftDeployableShare*base.healthOnly.results.find(h=>h.name===r.name).inputs.giftRealizationDiscount);
  assert(r.sfGiftCombinedHealthyYearEquivalent<=r.bayGiftCombinedHealthyYearEquivalent,'nested geography');
 }
 assert(base.rows[0].annualIncomeHealthyYearEquivalent<0,'signed downside income preserved');
 const noOverlapCredit=calculate({positiveIncomeIndependentScale:0,additionalAnnualFeeUSD:100});
 for(const r of noOverlapCredit.rows){near(r.annualNetConsumptionPerPersonUSD,-r.incomePrior.feesUSD-r.incomePrior.travelUSD-r.incomePrior.careUSD-100);assert(r.annualIncomeHealthyYearEquivalent<0,'overlap zero must retain full fee/travel/care harms');near(r.equivalenceInputs.independentShare,1);}
 assert(base.measuredWholeGiftExpectedValue===null,'unknown EV must remain unknown');
 near(w.weightedGiftCombinedHealthyYearEquivalent,w.weightedGiftHealthQaly+w.weightedGiftIncomeHealthyYearEquivalent);
 near(w.bayDonorPer10HealthyYearEquivalent,10*base.giftUSD/w.weightedBayGiftCombinedHealthyYearEquivalent);
 const half=calculate({giftUSD:50000});near(half.conditionalOrdinaryGiftWeighted.weightedGiftCombinedHealthyYearEquivalent,w.weightedGiftCombinedHealthyYearEquivalent/2);near(half.conditionalOrdinaryGiftWeighted.bayDonorPer10HealthyYearEquivalent,w.bayDonorPer10HealthyYearEquivalent);
 const healthOnly=calculate({incomeScale:0});near(healthOnly.conditionalOrdinaryGiftWeighted.weightedGiftCombinedHealthyYearEquivalent,base.healthOnly.conditionalOrdinaryGiftWeighted.weightedGiftQaly);
 near(healthOnly.conditionalOrdinaryGiftWeighted.bayDonorPer10HealthyYearEquivalent,base.healthOnly.conditionalOrdinaryGiftWeighted.bayDonorPer10Qaly);
 const adverse=calculate({healthMultiplier:-1,incomeScale:0});assert(adverse.conditionalOrdinaryGiftWeighted.weightedGiftCombinedHealthyYearEquivalent<0,'negative health retained');assert(adverse.conditionalOrdinaryGiftWeighted.donorPer10HealthyYearEquivalent===null,'adverse price undefined');
 const shorter=calculate({healthOptions:{horizonCap:2}});assert(shorter.conditionalOrdinaryGiftWeighted.weightedGiftHealthQaly<w.weightedGiftHealthQaly,'finite horizon sensitivity');
 const repeated=calculate({healthOptions:{repeatScale:100}});assert(repeated.healthOnly.results.every((r,i)=>r.pathwayQalyRaw.naloxone<=base.healthOnly.results[i].pathwayQalyRaw.naloxone),'fixed opportunities do not buy repeat lifetimes');
 const harmed=calculate({healthOptions:{harmPerPerson:0.01}});assert(harmed.conditionalOrdinaryGiftWeighted.weightedGiftHealthQaly<w.weightedGiftHealthQaly,'independent harms reduce credit');
 const delayed=calculate({healthDelayYears:0.5});near(delayed.conditionalOrdinaryGiftWeighted.weightedGiftHealthQaly,w.weightedGiftHealthQaly/Math.sqrt(1.03));
 const fees=calculate({additionalAnnualFeeUSD:100});assert(fees.conditionalOrdinaryGiftWeighted.weightedGiftIncomeHealthyYearEquivalent<w.weightedGiftIncomeHealthyYearEquivalent,'fees reduce consumption welfare');
 const a=base.healthOnly.results[1].cohortInputs,q=uniqueCohort(a).qaly;
 // Independent midpoint integration of two unique-person survival curves.
 let numerical=0;const dt=0.0001;
 for(let t=dt/2;t<a.horizonYears;t+=dt){const active=Math.min(t,a.activeYears),tail=Math.max(0,t-a.activeYears);const supported=Math.exp(-a.otherHazard*active-a.postHazard*tail);const counterfactual=Math.exp(-(a.otherHazard+a.opportunitiesPerPersonYear*a.otherwiseFatal)*active-a.postHazard*tail);numerical+=(supported-counterfactual)*a.utility*a.uniquePeople*Math.pow(1+a.discount,-t)*dt;}
 near(q,numerical,1e-7);
 assert(q<=uniqueCohort(a).maximumAbsoluteQaly,'person-time bound');
 const snapshot=JSON.stringify(base);assert(JSON.stringify(calculate())===snapshot,'deterministic unchanged inputs');
 for(const o of [{giftUSD:NaN},{giftUSD:0},{giftUSD:latestAnnualExpenseUSD+1},{incomeScale:Infinity},{additionalAnnualFeeUSD:-1},{healthMultiplier:2},{healthDelayYears:-1}]){let threw=false;try{calculate(o);}catch{threw=true;}assert(threw,'reject invalid options');}
 return {checks,status:'pass',independentArithmetic:'signed logarithmic welfare, donor annual scaling, midpoint survival integration',weighted:w};
}

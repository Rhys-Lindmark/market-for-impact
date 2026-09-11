import prior from '../data/san-francisco/spur-v2-priors.json' with {type:'json'};
export const version='spur-whole-portfolio-v2-evidence-refresh-unchanged-health-v1';
export const scenarios=prior.scenarios;
export const finance={periodEnd:'2025-03-31',auditExpense:6047824,investmentFeeReconciliation:30000,eventCostsNetted:236161,grossExpense:6313985,latestUnauditedExpense:6916547};
// Output-years already include calendar discounting and comparator catch-up.
// SF and rest-of-Bay are beneficiary allocation judgments, not inferred from addresses.
function rawModel(s, donorCostUsd = 100000, resourceStressAdditionalUsd = 1000000) {
  const {housing: h, transit: t, heat: e, donorSpecificHarm: harm} = s;
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  if (![donorCostUsd, resourceStressAdditionalUsd].every(n => finite(n) && n >= 0)) throw new RangeError('Invalid cost');
  for (const inputs of [h, t, e, harm]) {
    if (!inputs || !Object.entries(inputs).filter(([key])=>key!=='calendarSchedule').every(([,value])=>finite(value))) throw new RangeError('Nonfinite or missing model input');
  }
  if (t.tripsPerRecurrentRiderYear <= 0) throw new RangeError('Invalid rider-year denominator');
  for (const share of [h.netGiftContribution, h.improvedStateFraction, t.netGiftContribution, t.healthRelevantFraction, e.conditionalRegionalExposureFraction, e.implementationProbability, e.giftAttribution, e.sfHealthShare]) {
    if (share < 0 || share > 1) throw new RangeError('Invalid share');
  }
  for (const quantity of [h.conditionalSfOccupiedHomeYears,h.conditionalRestBayOccupiedHomeYears,h.peoplePerDirectHomeYear,h.spilloverHouseholdYearsPerHomeYear,h.adultsPerSpilloverHousehold,t.conditionalSfUsefulServiceHours,t.conditionalRestBayUsefulServiceHours,t.marginalTripsPerServiceHour,e.effectiveDiscountedMortalityYears,e.modeledRegionalDeathsPerYear,e.qalyPerDeath,harm.sfQaly,harm.restBayQaly]) {
    if (quantity < 0) throw new RangeError('Invalid nonnegative quantity');
  }
  const housingPerYear = h.netGiftContribution * (h.peoplePerDirectHomeYear * h.improvedStateFraction * h.directUtility + h.spilloverHouseholdYearsPerHomeYear * h.adultsPerSpilloverHousehold * h.spilloverUtility);
  const transitPerHour = t.netGiftContribution * t.marginalTripsPerServiceHour / t.tripsPerRecurrentRiderYear * t.healthRelevantFraction * t.netQalyPerChangedRiderYear;
  const heatBay = e.conditionalRegionalExposureFraction * e.implementationProbability * e.giftAttribution * e.effectiveDiscountedMortalityYears * e.modeledRegionalDeathsPerYear * e.qalyPerDeath;
  const housingSfQaly = h.conditionalSfOccupiedHomeYears * housingPerYear;
  const housingRestBayQaly = h.conditionalRestBayOccupiedHomeYears * housingPerYear;
  const transitSfQaly = t.conditionalSfUsefulServiceHours * transitPerHour;
  const transitRestBayQaly = t.conditionalRestBayUsefulServiceHours * transitPerHour;
  const heatSfQaly = heatBay * e.sfHealthShare;
  const heatRestBayQaly = heatBay * (1-e.sfHealthShare);
  const sfNetQaly = housingSfQaly + transitSfQaly + heatSfQaly - harm.sfQaly;
  const restBayNetQaly = housingRestBayQaly + transitRestBayQaly + heatRestBayQaly - harm.restBayQaly;
  const bayIncludingSfNetQaly = sfNetQaly + restBayNetQaly;
  if (![sfNetQaly,restBayNetQaly,bayIncludingSfNetQaly].every(finite)) throw new RangeError('Output overflow');
  const ratio = (q,cost) => q > 0 ? cost/q : null;
  return {housingSfQaly,housingRestBayQaly,transitSfQaly,transitRestBayQaly,heatSfQaly,heatRestBayQaly,sfNetQaly,restBayNetQaly,bayIncludingSfNetQaly,donorCostUsd,
    sfUsdPerQaly:ratio(sfNetQaly,donorCostUsd),bayUsdPerQaly:ratio(bayIncludingSfNetQaly,donorCostUsd),
    sfUsdPer10Qaly:ratio(sfNetQaly,10*donorCostUsd),bayUsdPer10Qaly:ratio(bayIncludingSfNetQaly,10*donorCostUsd),
    resourceStressAdditionalUsd,
    sfResourceStressUsdPer10Qaly:ratio(sfNetQaly,10*(donorCostUsd+resourceStressAdditionalUsd)),
    bayResourceStressUsdPer10Qaly:ratio(bayIncludingSfNetQaly,10*(donorCostUsd+resourceStressAdditionalUsd))};
}

const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const num=(x,n)=>{if(typeof x!=='number'||!Number.isFinite(x))throw new RangeError(n);return x;};
function validateSchedule(schedule,totalA,totalB,keys){
 if(!obj(schedule)||!Array.isArray(schedule.yearsAfterGift)||!schedule.yearsAfterGift.length)throw new RangeError('schedule');
 const ys=schedule.yearsAfterGift;
 if(new Set(ys).size!==ys.length||ys.some(y=>!Number.isInteger(y)||y<0||y>30))throw new RangeError('finite unique years');
 for(const [key,target] of [[keys[0],totalA],[keys[1],totalB]]){
 const arr=schedule[key];if(!Array.isArray(arr)||arr.length!==ys.length||arr.some(x=>typeof x!=='number'||!Number.isFinite(x)||x<0))throw new RangeError('exposure schedule');
 const integrated=arr.reduce((s,x,i)=>s+x/1.03**ys[i],0);
 if(Math.abs(integrated-target)>1e-8*Math.max(1,target))throw new RangeError('schedule integration');
 }
}
export function calculate(options={}){
 if(!obj(options))throw new TypeError('options must be object');
 const {scenario=scenarios[0],gift=100000,additionalResources=1000000}=options;
 num(additionalResources,'additional resources');
 if(additionalResources<0)throw new RangeError('additional resources');
 num(10*(100000+additionalResources),'resource cost overflow');
 if(!obj(scenario)||typeof scenario.id!=='string'||!scenario.id.trim())throw new TypeError('scenario');
 for(const key of ['housing','transit','heat','donorSpecificHarm'])if(!obj(scenario[key]))throw new TypeError(key);
 const {housing:h,transit:t,heat:e}=scenario;
 for(const x of [h.directUtility,h.spilloverUtility,t.netQalyPerChangedRiderYear]){num(x,'utility');if(Math.abs(x)>1)throw new RangeError('utility');}
 for(const [x,cap] of [[e.effectiveDiscountedMortalityYears,30],[e.qalyPerDeath,50]]){num(x,'finite horizon');if(x<0||x>cap)throw new RangeError('finite horizon');}
 validateSchedule(h.calendarSchedule,h.conditionalSfOccupiedHomeYears,h.conditionalRestBayOccupiedHomeYears,['annualUndiscountedSfEquivalentOccupiedHomes','annualUndiscountedRestBayEquivalentOccupiedHomes']);
 validateSchedule(t.calendarSchedule,t.conditionalSfUsefulServiceHours,t.conditionalRestBayUsefulServiceHours,['annualUndiscountedSfEquivalentServiceHours','annualUndiscountedRestBayEquivalentServiceHours']);
 const out=rawModel(scenario,100000,additionalResources);
 num(gift,'gift');if(gift<0)throw new RangeError('gift');
 const giftSfQaly=num(out.sfNetQaly*gift/100000,'gift SF overflow');
 const giftBayQaly=num(out.bayIncludingSfNetQaly*gift/100000,'gift Bay overflow');
 for(const [key,value] of Object.entries(out))if(value!==null)num(value,key);
 return {...out,gift,giftSfQaly,giftBayQaly,weightedExpectation:null,expectationStatus:'No probability weights assigned; central and joint scenarios are not a probability distribution'};
}
export function calculateAll(){
 const ids=new Set();return scenarios.map(s=>{if(ids.has(s.id.trim()))throw new Error('duplicate id');ids.add(s.id.trim());return {id:s.id,...calculate({scenario:s})};});
}

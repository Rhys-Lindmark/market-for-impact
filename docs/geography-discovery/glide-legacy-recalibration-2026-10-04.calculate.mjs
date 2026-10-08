// Portable research packet. Root replaces these absolute readonly imports on integration.
import { BASE, calculate as historicalCalculate, evaluate as historicalEvaluate, FINANCES } from '/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta/lib/glide-v2-model.mjs';
import { scenarios as historicalScenarios } from '/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta/lib/glide-v2-original-scenarios.mjs';
import { incomeHealthyYearEquivalent } from '/Users/rhyslindmark/Documents/Codex/2026-08-29/okay-you-re-gonna-make-this/work/market-for-impact-california-six-surgery-beta/lib/income-health-equivalence.mjs';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
export const VERSION='glide-legacy-native-signed-recalibration-20261004';
const clone=structuredClone;
export function nativeInputs(){
 const health=clone(BASE);
 // Explicit correlated conditional priors, not estimates inferred from financial ratios.
 health.shared.funding_additionality=.25;
 health.survival.rescue_hazard_reduction=.0025;
 health.survival.horizon_years=10;
 return {health,economic:{incomeBeforeUSD:15000,housingReplacementProbability:.5,mealReplacementProbability:.25,mealPurchaseUSD:3,mealsPerCourse:90,childcareReplacementProbability:.25,employmentProbability:.2,childcareAvoidedUSD:3000,grossWagesUSD:3000,alternativeCareUSD:600,employmentTravelUSD:200,employmentTaxUSD:300,courseBurdenUSD:{housing:30,meals:10,childcare:100},independentBurdenUSD:25,independentHealthHarm:0,positiveIndependentShare:1,crossHealthIncomeOverlap:.2,benefitRouteShare:1,benefitBayShare:.99,benefitSFShare:.95,harmBayShare:.99,harmSFShare:.95,reportingPersonsPerHousehold:1,householdOverlap:'disjoint',durationMultiplier:1,unknownFlows:['owner_net_surplus','public_transfer_displacement','taxpayer_funding_incidence','SSI_CalFresh_net_benefits','CM_gift_cards','health_related_incremental_wages','policy','TAY','affiliate','other_household_goods']}};
}
export const MODEL=nativeInputs();
const finite=(v,n,lo=0,hi=Infinity)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(n);return v;};
const probability=(v,n)=>finite(v,n,0,1);
const nullableProbability=(v,n)=>v===null?null:probability(v,n);
const part=(v,share)=>({raw:v,positive:Math.max(0,v)*share,negative:Math.min(0,v),credited:Math.max(0,v)*share+Math.min(0,v)});
export function healthLedger(health){
 const raw=clone(health),s=health.shared;
 raw.housing.unique_health=1;raw.housing.harm_q=0;
 raw.groups.forEach(g=>{g.unique_health=1;g.harm_q=0;});
 raw.survival.rescue_harm_q=0;raw.survival.moud_harm_q=0;raw.shared.independent_harm_q=0;
 const r=historicalEvaluate(raw),effective=Math.min(s.gift,s.capacity_gift),h=health.housing;
 const hn=Math.min(effective*health.allocation.housing/(h.cost*Math.max(1,h.years)),h.capacity)*s.funding_additionality;
 const survivalHarm=r.rescue_incremental*health.survival.rescue_harm_q+r.moud_incremental*health.survival.moud_harm_q;
 const rows=[{id:'survival',...part(r.survival_q,1),explicitHarm:-survivalHarm},{id:'housing',...part(r.housing_q,h.unique_health),explicitHarm:-hn*h.harm_q}];
 r.groups.forEach(row=>{const g=health.groups.find(g=>g.id===row.id);rows.push({id:row.id,...part(row.qaly,g.unique_health),explicitHarm:-row.incremental*g.harm_q});});
 const positive=rows.reduce((a,x)=>a+x.positive,0),negative=rows.reduce((a,x)=>a+x.negative+x.explicitHarm,0)-s.independent_harm_q;
 return {rows,rawPositive:rows.reduce((a,x)=>a+Math.max(0,x.raw),0),positive,negative,total:positive+negative,nominal:{rescue:r.rescue_nominal,moud:r.moud_nominal,housing:hn/(s.funding_additionality||1),...Object.fromEntries(r.groups.map(x=>[x.id,x.nominal]))},grossAssociatedFunding:r.gross_associated_funding,grossResources:r.gross_resources,rentalTransferExcluded:r.rental_transfer_excluded};
}
function eq(people,before,gain,years,discount,delay=0){
 if(people===0||years===0||gain===0)return 0;
 return incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD:before,annualIncomeGainUSD:gain/years,years,delayYears:delay,discountRate:discount});
}
// Separate event states before the log. Positive and negative log increments telescope
// exactly before positive-only independence; never log an expected payment.
export function stateValue({people,probability:p,before,gainUSD,burdenUSD,years,discount,independentShare=1,delay=0}){
 finite(people,'people');probability(p,'state probability');finite(before,'cash before',Number.MIN_VALUE);finite(gainUSD,'signed cash gain',-Infinity);finite(burdenUSD,'burden');finite(years,'years');finite(discount,'discount');probability(independentShare,'independence');
 // A zero benefit window does not waive the incurred course/setup burden.
 if(years===0)return stateValue({people,probability:p,before,gainUSD:Math.min(0,gainUSD),burdenUSD,years:1,discount,independentShare,delay});
 const net=gainUSD-burdenUSD;if(before+net/years<=0)throw new RangeError('post-payment cash must be positive');
 const pos=Math.max(0,gainUSD),neg=Math.min(0,gainUSD)-burdenUSD;
 const rawPositive=eq(people*p,before,pos,years,discount,delay);
 const rawNegative=eq(people*p,before+pos/years,neg,years,discount,delay);
 return {rawPositive,rawNegative,creditedPositive:rawPositive*independentShare,creditedNegative:rawNegative,rawNet:rawPositive+rawNegative,creditedNet:rawPositive*independentShare+rawNegative,netCashUSD:people*p*net};
}
function validateEconomic(e){
 finite(e.incomeBeforeUSD,'income before',Number.MIN_VALUE);for(const k of ['housingReplacementProbability','mealReplacementProbability','childcareReplacementProbability','employmentProbability','benefitRouteShare','positiveIndependentShare','crossHealthIncomeOverlap','benefitBayShare','benefitSFShare','harmBayShare','harmSFShare'])nullableProbability(e[k],k);
 for(const k of ['positiveIndependentShare','crossHealthIncomeOverlap','benefitBayShare','benefitSFShare','harmBayShare','harmSFShare'])if(e[k]===null)throw new RangeError(k+' cannot be null; use unknown benefitRouteShare');
 if(e.benefitSFShare>e.benefitBayShare||e.harmSFShare>e.harmBayShare)throw new RangeError('nested geography');
 for(const k of ['mealPurchaseUSD','mealsPerCourse','childcareAvoidedUSD','grossWagesUSD','alternativeCareUSD','employmentTravelUSD','employmentTaxUSD','independentBurdenUSD','independentHealthHarm','durationMultiplier'])finite(e[k],k);
 finite(e.reportingPersonsPerHousehold,'reporting unit',Number.MIN_VALUE);for(const id of ['housing','meals','childcare'])finite(e.courseBurdenUSD[id],id+' burden');
 if(e.childcareReplacementProbability!==null&&e.employmentProbability!==null&&e.childcareReplacementProbability+e.employmentProbability>1)throw new RangeError('exclusive childcare state partition');
 if(!['disjoint','fully_shared'].includes(e.householdOverlap)||!Array.isArray(e.unknownFlows))throw new RangeError('household scope');
}
export function economicLedger(model,hl){
 const {health,economic:e}=model,s=health.shared;validateEconomic(e);
 // Count nominal courses independently of funding additionality so raw exposures survive
 // zero-credit states. No multiply unknown raw flows by zero to manufacture a known zero.
 const effective=Math.min(s.gift,s.capacity_gift),housingNominal=Math.min(effective*health.allocation.housing/(health.housing.cost*Math.max(1,health.housing.years)),health.housing.capacity);
 const exposure={housing:housingNominal/e.reportingPersonsPerHousehold,meals:hl.nominal.meals,childcare:hl.nominal.childcare};
 const wageNet=e.grossWagesUSD-e.alternativeCareUSD-e.employmentTravelUSD-e.employmentTaxUSD;
 const rawFlows=[{id:'housing_cash',nominalPeople:exposure.housing,grossPerCourseUSD:health.housing.cash_transfer,positiveStateProbability:e.housingReplacementProbability,ownerGrossReceiptsPerCourseUSD:health.housing.cash_transfer},{id:'meal_displaced_purchase',nominalPeople:exposure.meals,grossPerCourseUSD:e.mealsPerCourse*e.mealPurchaseUSD,positiveStateProbability:e.mealReplacementProbability},{id:'childcare_displaced_purchase',nominalPeople:exposure.childcare,grossPerCourseUSD:e.childcareAvoidedUSD,positiveStateProbability:e.childcareReplacementProbability},{id:'childcare_incremental_wages',nominalPeople:exposure.childcare,grossPerCourseUSD:e.grossWagesUSD,alternativeCareUSD:e.alternativeCareUSD,travelUSD:e.employmentTravelUSD,taxUSD:e.employmentTaxUSD,netPerCourseUSD:wageNet,positiveStateProbability:e.employmentProbability},...e.unknownFlows.map(id=>({id,amountUSD:null,status:'unknown; not numeric zero'}))];
 const missing=[];let stateRows=[];
 function cohort(id,years,states){
  const people=exposure[id]*s.funding_additionality,burden=e.courseBurdenUSD[id],route=e.benefitRouteShare;
  const unknown=route===null||states.some(st=>st.p===null);
  if(unknown)missing.push(id+': unknown route/probability');
  // Unknown-positive known-only diagnostic retains the burden and the raw unresolved row.
  if(unknown){const knownNegative=states.filter(st=>st.gain<0&&st.p!==null);states=[...knownNegative,{id:'unknown_positive_known_burden_only',p:1-knownNegative.reduce((n,st)=>n+st.p,0),gain:0}];}
  const yr=years*e.durationMultiplier;
  if(!unknown)states=states.flatMap(st=>st.gain>0?[{...st,p:st.p*route},{id:st.id+'_route_failed',p:st.p*(1-route),gain:0}]:[st]);
  for(const st of states){
   const gain=(unknown?Math.min(0,st.gain):st.gain)*e.durationMultiplier;
   const value=stateValue({people,probability:st.p,before:e.incomeBeforeUSD,gainUSD:gain,burdenUSD:burden,years:yr,discount:s.discount,independentShare:e.positiveIndependentShare});
   stateRows.push({cohort:id,id:st.id,people,probability:st.p,annualCashBeforeUSD:e.incomeBeforeUSD,courseGainUSD:unknown&&st.gain>=0?null:gain,courseBurdenUSD:burden,years:yr,positiveUnknown:unknown,...value});
  }
 }
 const hp=e.housingReplacementProbability,mp=e.mealReplacementProbability,cp=e.childcareReplacementProbability,wp=e.employmentProbability;
 cohort('housing',1,[{id:'cash_relief',p:hp,gain:health.housing.cash_transfer},{id:'alternative_cash',p:hp===null?null:1-hp,gain:0}]);
 cohort('meals',30/365,[{id:'purchase_displaced',p:mp,gain:e.mealsPerCourse*e.mealPurchaseUSD},{id:'no_purchase_displaced',p:mp===null?null:1-mp,gain:0}]);
 cohort('childcare',.5,[{id:'fee_displaced',p:cp,gain:e.childcareAvoidedUSD},{id:'new_net_earnings',p:wp,gain:wageNet},{id:'no_cash_change',p:cp===null||wp===null?null:1-cp-wp,gain:0}]);
 if(e.householdOverlap==='fully_shared'){
  // Finite same-recipient annual diagnostic: enumerate cartesian event states for
  // the shared minimum cohort; only the remaining disjoint people keep original rows.
  // Re-express finite course payments over ONE year, baseline counted once.
  const people=Math.min(...['housing','meals','childcare'].map(id=>exposure[id]*s.funding_additionality));
  if(people>0&&!missing.length){
   const cohorts=['housing','meals','childcare'].map(id=>stateRows.filter(st=>st.cohort===id));
   const residual=stateRows.map(st=>({...st,people:st.people-people,...stateValue({people:st.people-people,probability:st.probability,before:e.incomeBeforeUSD,gainUSD:st.courseGainUSD,burdenUSD:st.courseBurdenUSD,years:st.years,discount:s.discount,independentShare:e.positiveIndependentShare})}));
   const joint=[];for(const h of cohorts[0])for(const m of cohorts[1])for(const c of cohorts[2]){const p=h.probability*m.probability*c.probability,gain=h.courseGainUSD+m.courseGainUSD+c.courseGainUSD,burden=h.courseBurdenUSD+m.courseBurdenUSD+c.courseBurdenUSD;joint.push({cohort:'shared_household',id:[h.id,m.id,c.id].join('+'),people,probability:p,annualCashBeforeUSD:e.incomeBeforeUSD,courseGainUSD:gain,courseBurdenUSD:burden,years:1,positiveUnknown:false,...stateValue({people,probability:p,before:e.incomeBeforeUSD,gainUSD:gain,burdenUSD:burden,years:1,discount:s.discount,independentShare:e.positiveIndependentShare})});}
   stateRows=[...residual,...joint];
  }else if(missing.length)missing.push('shared household joint cash unknown');
 }
 const independentPeople=s.gift/100000,independent=stateValue({people:independentPeople,probability:1,before:e.incomeBeforeUSD,gainUSD:0,burdenUSD:e.independentBurdenUSD,years:1,discount:s.discount});
 stateRows.push({cohort:'independent_donor_related_burden',id:'independent',people:independentPeople,probability:1,annualCashBeforeUSD:e.incomeBeforeUSD,courseGainUSD:0,courseBurdenUSD:e.independentBurdenUSD,years:1,positiveUnknown:false,...independent});
 const sum=k=>stateRows.reduce((n,st)=>n+st[k],0);
 return {status:'conditional known-flow subtotal; incomplete portfolio',missing,unknownFlows:e.unknownFlows,rawFlows,exposure,stateRows,rawPositive:sum('rawPositive'),rawNegative:sum('rawNegative'),positive:sum('creditedPositive'),negative:sum('creditedNegative'),rawNet:sum('rawNet'),total:sum('creditedNet'),netCashUSD:sum('netCashUSD'),ownerWelfare:null,publicWelfare:null,fullPortfolioEconomicEquivalent:null};
}
export function evaluate(model=MODEL){
 const hl=healthLedger(model.health),el=economicLedger(model,hl),e=model.economic,gift=model.health.shared.gift;
 const independentHealth=-e.independentHealthHarm*gift/100000;
 function geo(benefitShare,harmShare){
  const healthPositive=hl.positive*benefitShare,economicPositive=el.positive*benefitShare;
  const crossOverlapRemoval=e.crossHealthIncomeOverlap*Math.min(healthPositive,economicPositive);
  const healthNegative=hl.negative*harmShare+independentHealth*harmShare,economicNegative=el.negative*harmShare;
  const health=healthPositive+healthNegative,economic=economicPositive+economicNegative,total=health+economic-crossOverlapRemoval;
  return {healthPositive,healthNegative,economicPositive,economicNegative,crossOverlapRemoval,healthQaly:health,economicHealthyYearEquivalent:economic,combinedKnownHealthyYearEquivalent:total,donorPer10HealthyYears:total>0?gift*10/total:null,grossResourcesPer10HealthyYears:total>0?hl.grossResources*10/total:null};
 }
 return {version:VERSION,giftUSD:gift,scope:'Whole unrestricted Foundation gift; finite conditional partial health + signed household cash/consumption equivalent',healthLedger:hl,economicLedger:el,us:geo(1,1),bay:geo(e.benefitBayShare,e.harmBayShare),sf:geo(e.benefitSFShare,e.harmSFShare),grossAssociatedFundingUSD:hl.grossAssociatedFunding,grossResourcesUSD:hl.grossResources,rentalTransferExcludedUSD:hl.rentalTransferExcluded,capacityOfferVerified:null,weightedExpectation:null,scenarioWeights:null,wholeOrganizationExpectedHealthyYears:null};
}
export function scenarios(base=MODEL){
 const make=(id,fn)=>{let inputs=clone(base);fn(inputs);return {id,inputs,result:evaluate(inputs)};};
 return [make('conditional_center',()=>{}),make('weak_delivery',m=>{m.health.shared.funding_additionality=.1;m.health.survival.rescue_hazard_reduction=.001;m.health.survival.moud_causal_transfer=.1;m.economic.housingReplacementProbability=.1;m.economic.mealReplacementProbability=.1;m.economic.childcareReplacementProbability=.1;m.economic.employmentProbability=.05;}),make('favorable_delivery',m=>{m.health.shared.funding_additionality=.7;m.health.survival.rescue_hazard_reduction=.01;m.health.survival.moud_causal_transfer=.8;m.health.survival.moud_effective_retention=.8;m.economic.housingReplacementProbability=.8;m.economic.mealReplacementProbability=.5;m.economic.childcareReplacementProbability=.4;m.economic.employmentProbability=.3;}),make('zero_additional_funding',m=>m.health.shared.funding_additionality=0),make('zero_capacity',m=>m.health.shared.capacity_gift=0),make('zero_gift',m=>m.health.shared.gift=0),make('zero_economic_route',m=>m.economic.benefitRouteShare=0),make('unknown_economic_route',m=>m.economic.benefitRouteShare=null),make('housing_unknown_not_all_economics',m=>m.economic.housingReplacementProbability=null),make('no_clinical_response',m=>{m.health.survival.rescue_hazard_reduction=0;m.health.survival.moud_causal_transfer=0;m.health.housing.incremental_stability=0;m.health.groups.forEach(g=>g.response=0);}),make('no_funded_active_response',m=>{m.health.survival.rescue_active_years=0;m.health.survival.moud_active_years=0;m.health.housing.years=0;m.health.groups.forEach(g=>g.years=0);}),make('adverse_clinical',m=>{m.health.survival.rescue_hazard_reduction=-.01;m.health.survival.moud_observed_hr=1.3;m.health.groups.forEach(g=>g.utility=-Math.abs(g.utility));}),make('adverse_income',m=>{m.economic.grossWagesUSD=100;m.economic.alternativeCareUSD=1000;m.economic.courseBurdenUSD={housing:100,meals:100,childcare:1000};m.economic.housingReplacementProbability=0;m.economic.mealReplacementProbability=0;m.economic.childcareReplacementProbability=0;}),make('no_positive_independence',m=>{m.economic.positiveIndependentShare=0;m.health.housing.unique_health=0;m.health.groups.forEach(g=>g.unique_health=0);}),make('maximum_cross_overlap',m=>m.economic.crossHealthIncomeOverlap=1),make('no_cross_overlap',m=>m.economic.crossHealthIncomeOverlap=0),make('no_direct_sf_benefit',m=>m.economic.benefitSFShare=0),make('no_local_positive_credit',m=>{m.economic.benefitBayShare=0;m.economic.benefitSFShare=0;}),make('half_duration_cash',m=>m.economic.durationMultiplier=.5),make('double_duration_cash_funded',m=>{m.economic.durationMultiplier=2;m.health.groups.find(g=>g.id==='meals').years*=2;m.health.groups.find(g=>g.id==='childcare').years*=2;m.health.housing.years*=2;}),make('reporting_persons_three_per_household',m=>m.economic.reportingPersonsPerHousehold=3),make('fully_shared_households',m=>m.economic.householdOverlap='fully_shared'),make('double_native_costs',m=>{m.health.survival.rescue_cost*=2;m.health.survival.moud_annual_foundation_cost*=2;m.health.housing.cost*=2;m.health.groups.forEach(g=>g.cost*=2);}),make('gross_only_resource_diagnostic',m=>m.health.shared.common_external_fraction=.8),make('large_gift_capacity_held',m=>m.health.shared.gift=1000000),make('independent_harm_zero_positive_routes',m=>{m.economic.independentHealthHarm=.1;m.economic.benefitRouteShare=0;m.economic.benefitBayShare=0;m.economic.benefitSFShare=0;}),make('five_year_survival',m=>m.health.survival.horizon_years=5),make('fifteen_year_survival',m=>m.health.survival.horizon_years=15)];
}
export function calculate(){return {version:VERSION,model:clone(MODEL),conditionalCenter:evaluate(),scenarios:scenarios(),historicalReport:historicalCalculate(),historicalOriginalScenarios:historicalScenarios(BASE).map(s=>({id:s.id,inputs:s.inputs,result:historicalEvaluate(s.inputs)})),finance:FINANCES,weightedExpectation:null,wholeOrganizationExpectedHealthyYears:null,capacityOfferVerified:null};}
export function tests(){
 const r=evaluate(),all=scenarios(),get=id=>all.find(x=>x.id===id).result;
 assert.equal(historicalCalculate().central.bay.qaly,.2044715224666835);
 assert.equal(historicalScenarios(BASE).length,20);
 assert.equal(r.weightedExpectation,null);assert.equal(r.capacityOfferVerified,null);
 for(const id of ['zero_additional_funding','zero_capacity']){assert(get(id).bay.combinedKnownHealthyYearEquivalent<0);assert.equal(get(id).economicLedger.rawFlows.find(x=>x.id==='owner_net_surplus').amountUSD,null);}
 assert.equal(get('zero_gift').bay.combinedKnownHealthyYearEquivalent,0);
 assert(get('zero_economic_route').economicLedger.negative<0);assert.equal(get('zero_economic_route').economicLedger.positive,0);
 assert(get('unknown_economic_route').economicLedger.missing.length>0);assert(get('unknown_economic_route').economicLedger.negative<0);
 assert(get('housing_unknown_not_all_economics').economicLedger.positive>0);
 assert(get('no_clinical_response').bay.healthQaly<0);assert(get('no_funded_active_response').bay.healthQaly<0);
 assert(get('no_direct_sf_benefit').sf.combinedKnownHealthyYearEquivalent<0);assert(get('no_local_positive_credit').bay.combinedKnownHealthyYearEquivalent<0);
 assert.equal(get('no_positive_independence').economicLedger.negative,r.economicLedger.negative);
 assert.equal(get('maximum_cross_overlap').bay.healthNegative,r.bay.healthNegative);
 assert.equal(get('maximum_cross_overlap').bay.economicNegative,r.bay.economicNegative);
 assert(get('adverse_clinical').bay.healthQaly<0);assert(get('adverse_income').economicLedger.negative<0);
 assert.equal(get('gross_only_resource_diagnostic').bay.combinedKnownHealthyYearEquivalent,r.bay.combinedKnownHealthyYearEquivalent);
 assert(get('gross_only_resource_diagnostic').grossResourcesUSD>r.grossResourcesUSD);
 assert(get('large_gift_capacity_held').bay.donorPer10HealthyYears>r.bay.donorPer10HealthyYears);
 const unknown=clone(MODEL);unknown.economic.benefitRouteShare=null;unknown.health.shared.funding_additionality=0;assert(evaluate(unknown).economicLedger.missing.length>0);
 const joint=get('fully_shared_households').economicLedger.stateRows.filter(s=>s.cohort==='shared_household');assert(Math.abs(joint.reduce((n,s)=>n+s.probability,0)-1)<1e-12);
 const st={people:1,probability:.5,before:15000,gainUSD:3045,burdenUSD:30,years:1,discount:0};let v=stateValue(st);assert(Math.abs(v.rawNet-.25*Math.log1p(3015/15000))<1e-12);
 const split=.5*stateValue({...st,probability:1}).rawNet+.5*stateValue({...st,probability:1,gainUSD:0}).rawNet;const mean=stateValue({...st,probability:1,gainUSD:1522.5}).rawNet;assert.notEqual(split,mean);
 assert.throws(()=>stateValue({...st,gainUSD:-20000}));const bad=clone(MODEL);bad.economic.childcareReplacementProbability=.9;assert.throws(()=>evaluate(bad));
 for(const world of all){const scan=x=>{if(typeof x==='number')assert(Number.isFinite(x));else if(x&&typeof x==='object')Object.values(x).forEach(scan);};scan(world.result);}
 return {status:'PASS',checks:26,originalScenarios:20,recalibratedScenarios:all.length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const out=process.argv.includes('--test')?tests():process.argv.includes('--summary')?{center:evaluate().bay,scenarios:scenarios().map(w=>({id:w.id,health:w.result.bay.healthQaly,economic:w.result.bay.economicHealthyYearEquivalent,combined:w.result.bay.combinedKnownHealthyYearEquivalent,donorPer10:w.result.bay.donorPer10HealthyYears}))}:calculate();console.log(JSON.stringify(out,null,2));}

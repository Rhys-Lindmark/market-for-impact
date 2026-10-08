// Isolated conditional calibration; frozen originals are neither imported nor changed.
export const modelVersion='code-tenderloin-health-income-2026-10-01';
export const defaultInputs=Object.freeze({
 giftUsd:100000,paymentFeeUsd:0,peerFraction:.25,wageUsdPerHour:27,payrollMultiplier:1.35,nonwageUsdPerHour:23.55,hoursPerOfferedPackage:6,
 fundingAdditionality:.5,portfolioAssignment:1,odHazard:.04,otherDeathHazard:.03,addressableFraction:.1,rescueEffect:.9,healthUtility:.8,
 healthHorizonYears:10,startDelayYears:.25,discountRate:.03,sharedHarmYearsPerAdditionalPackage:.0005,independentGiftHealthHarmYears:0,
 healthBayShare:.98,healthSfShare:.9,incomeBayShare:.98,incomeSfShare:.9,
 paidHoursPerWorkerYear:1000,jobYears:1,householdResourcesUsd:25000,takeHomeFraction:.8,counterfactualWageUsdPerHour:10,counterfactualTakeHomeFraction:.8,
 benefitOffsetUsdPerHour:3,workCostUsdPerHour:2,workerIncidence:1,incomeWeight:.5,
 inducedApplicantExposure:0,applicantBurdenUsd:0
});
export const assumptionBasis=Object.freeze({
 source:'Current official ambassador wage about27/hour. Current paidhours/tenure/counterfactual earnings are not identified.',
 clinical:'Existing finite integral and conditional priors retained; no local causal hazard/coverage estimate. First-year OD reduction only, equal recurrent/competing hazards afterward.',
 cost:'Prospective60/hour loaded directcost and25% giftallocation are judgments, not sponsor annualexpense/output ratio or binding marginal offer. Supported exploration maximum100000.',
 income:'One-year1000hour worker-equivalent, resources25000, net8.6/hour and incidence1 are explicit judgments. Wageincrement signed, no allpayroll or futurecareer credit.',
 overlap:'Paidworker resources versus separate reached high-risk recipient cohort; no worker mentalhealth, patient earnings or caregiver credit added.',
 burden:'Only separately gift-induced application exposure, never unchanged baselinepickup/payroll. Portfolio assignment once on each effect.',
 missing:'Current standalone originalfinancials/latest3mean, actual recipient reach, workerperiod/incidence and verified donor capacity remain unavailable.'
});
const finite=(v,k,lo=0,hi=1e12)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<lo||v>hi)throw new RangeError(`Invalid ${k}`);};
const fraction=(v,k)=>finite(v,k,0,1);
function validate(p){
 for(const [k,v] of Object.entries(p))finite(v,k);
 finite(p.giftUsd,'giftUsd',0,100000);if(p.paymentFeeUsd>p.giftUsd)throw new RangeError('Fee exceeds gross donor budget');
 for(const k of ['peerFraction','fundingAdditionality','portfolioAssignment','addressableFraction','rescueEffect','healthUtility','discountRate','healthBayShare','healthSfShare','incomeBayShare','incomeSfShare','takeHomeFraction','counterfactualTakeHomeFraction','workerIncidence','incomeWeight','inducedApplicantExposure'])fraction(p[k],k);
 finite(p.odHazard,'odHazard',0,2);finite(p.otherDeathHazard,'otherDeathHazard',0,2);
 finite(p.payrollMultiplier,'payrollMultiplier',1,10);
 for(const k of ['wageUsdPerHour','hoursPerOfferedPackage','paidHoursPerWorkerYear','jobYears','householdResourcesUsd'])if(p[k]<=0)throw new RangeError(`${k} must be positive`);
 finite(p.jobYears,'jobYears',0,1);finite(p.paidHoursPerWorkerYear,'paidHoursPerWorkerYear',0,8760);
 finite(p.healthHorizonYears,'healthHorizonYears',1,120);if(!Number.isInteger(p.healthHorizonYears))throw new RangeError('Integer finite health horizon required');
 if(p.healthSfShare>p.healthBayShare||p.incomeSfShare>p.incomeBayShare)throw new RangeError('SF must be nested within Bay independently');
 if(p.applicantBurdenUsd>=p.householdResourcesUsd)throw new RangeError('Applicant burden must be below annual resources');
}
const integral=r=>r===0?1:-Math.expm1(-r)/r;
export function calculate(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw new TypeError('Overrides object required');
 if(Object.keys(overrides).some(k=>!(k in defaultInputs)))throw new TypeError('Unknown model input');
 const p={...defaultInputs,...overrides};validate(p);
 const netProgramBudgetUsd=p.giftUsd-p.paymentFeeUsd;
 const directWorkerHourCashUsd=p.wageUsdPerHour*p.payrollMultiplier+p.nonwageUsdPerHour;
 const fundedWorkerHours=netProgramBudgetUsd*p.peerFraction/directWorkerHourCashUsd;
 const offeredPackages=fundedWorkerHours/p.hoursPerOfferedPackage;
 const additionalPackages=offeredPackages*p.fundingAdditionality;
 const additionalWorkerHours=fundedWorkerHours*p.fundingAdditionality;
 const workerEquivalents=additionalWorkerHours/(p.paidHoursPerWorkerYear*p.jobYears);
 const delta=p.odHazard*p.addressableFraction*p.rescueEffect,h0=p.odHazard+p.otherDeathHazard,d=Math.log1p(p.discountRate);
 let s0=1,s1=1,q=0,ly=0;const schedule=[];
 for(let j=0;j<p.healthHorizonYears;j++){
  const h1=j===0?h0-delta:h0;
  const gain=p.healthUtility*Math.exp(-d*(p.startDelayYears+j))*(s1*integral(h1+d)-s0*integral(h0+d));
  const lifeGain=s1*integral(h1)-s0*integral(h0);q+=gain;ly+=lifeGain;s0*=Math.exp(-h0);s1*=Math.exp(-h1);
  schedule.push({careYear:j+1,calendarStartYears:p.startDelayYears+j,aliveNoGift:s0,aliveWithPeer:s1,incrementalLifeYearsPerPackage:lifeGain,discountedHealthYearsPerPackage:gain});
 }
 const grossHealthYears=p.portfolioAssignment*additionalPackages*q;
 const sharedHarmYears=p.portfolioAssignment*additionalPackages*p.sharedHarmYearsPerAdditionalPackage;
 // Direct analogue of frozen independent_harm_q, but explicitly gift-induced, not backgroundharm.
 const independentGiftHealthHarmYears=p.portfolioAssignment*p.independentGiftHealthHarmYears;
 const healthYears=grossHealthYears-sharedHarmYears-independentGiftHealthHarmYears;
 // Signed net wages: aftertax alternatives, benefitwithdrawal and monetaryworkcost, not grosspayroll.
 const netHourlyIncome=p.wageUsdPerHour*p.takeHomeFraction-p.counterfactualWageUsdPerHour*p.counterfactualTakeHomeFraction-p.benefitOffsetUsdPerHour-p.workCostUsdPerHour;
 const annualNetIncomePerWorkerUsd=netHourlyIncome*p.paidHoursPerWorkerYear;
 if(!Number.isFinite(annualNetIncomePerWorkerUsd)||annualNetIncomePerWorkerUsd<=-p.householdResourcesUsd)throw new RangeError('Signed income must leave positive annual resources');
 const incomeMidpointYears=p.startDelayYears+p.jobYears/2;
 const incomeEquivalentYears=p.portfolioAssignment*workerEquivalents*p.workerIncidence*p.jobYears*p.incomeWeight*Math.log1p(annualNetIncomePerWorkerUsd/p.householdResourcesUsd)/(1+p.discountRate)**incomeMidpointYears;
 // Applicant exposure deliberately independent of successfully additional service/jobs.
 const inducedApplicantEquivalents=fundedWorkerHours/(p.paidHoursPerWorkerYear*p.jobYears)*p.inducedApplicantExposure;
 const recipientBurdenYears=inducedApplicantEquivalents>0&&p.applicantBurdenUsd>0?p.portfolioAssignment*inducedApplicantEquivalents*p.incomeWeight*Math.log1p(-p.applicantBurdenUsd/p.householdResourcesUsd)/(1+p.discountRate)**p.startDelayYears:0;
 const combinedYears=healthYears+incomeEquivalentYears+recipientBurdenYears;
 const bayEquivalentYears=healthYears*p.healthBayShare+(incomeEquivalentYears+recipientBurdenYears)*p.incomeBayShare;
 const sfEquivalentYears=healthYears*p.healthSfShare+(incomeEquivalentYears+recipientBurdenYears)*p.incomeSfShare;
 for(const x of [directWorkerHourCashUsd,fundedWorkerHours,offeredPackages,additionalPackages,additionalWorkerHours,workerEquivalents,grossHealthYears,sharedHarmYears,healthYears,incomeEquivalentYears,recipientBurdenYears,combinedYears,bayEquivalentYears,sfEquivalentYears])if(!Number.isFinite(x))throw new RangeError('Nonfinite calculated effect');
 const price=q=>{if(q<=0)return null;const n=10*p.giftUsd/q;if(!Number.isFinite(n))throw new RangeError('Nonfinite ratio');return n;};
 return {modelVersion,inputs:p,netProgramBudgetUsd,directWorkerHourCashUsd,fundedWorkerHours,offeredPackages,additionalPackages,additionalWorkerHours,workerEquivalents,inducedApplicantEquivalents,
  odHazardReductionDuringServiceYear:delta,healthPerAdditionalPackage:q,incrementalLifeYears:p.portfolioAssignment*additionalPackages*ly,grossHealthYears,sharedHarmYears,independentGiftHealthHarmYears,healthYears,
  netHourlyIncome,annualNetIncomePerWorkerUsd,attributedNetWorkerDollars:p.portfolioAssignment*additionalWorkerHours*p.workerIncidence*netHourlyIncome,incomeMidpointYears,incomeEquivalentYears,recipientBurdenYears,combinedYears,
  bayEquivalentYears,sfEquivalentYears,bayUsdPerBetterLife:price(bayEquivalentYears),sfUsdPerBetterLife:price(sfEquivalentYears),allUsdPerBetterLife:price(combinedYears),schedule,
  completeSocietalResourcesUsd:null,completeSocietalCostPer10CombinedYears:null
 };
}
export const scenarios=Object.freeze([
 {name:'central',overrides:{}},
 {name:'health_only',overrides:{workerIncidence:0}},
 {name:'same_alternative',overrides:{counterfactualWageUsdPerHour:20.75}},
 {name:'full_offset',overrides:{benefitOffsetUsdPerHour:13.6,workCostUsdPerHour:0}},
 {name:'six_month_jobs',overrides:{jobYears:.5}},
 {name:'three_month_jobs',overrides:{jobYears:.25}},
 {name:'negative_worker_income',overrides:{counterfactualWageUsdPerHour:30}},
 {name:'literal_no_change',overrides:{fundingAdditionality:0,inducedApplicantExposure:0}},
 {name:'failed_induced_applicants',overrides:{fundingAdditionality:0,inducedApplicantExposure:1,applicantBurdenUsd:200}},
 {name:'income_only',overrides:{addressableFraction:0,sharedHarmYearsPerAdditionalPackage:0}},
 {name:'clinical_income_null_harm',overrides:{addressableFraction:0,workerIncidence:0}},
 {name:'strong_public_baseline',overrides:{addressableFraction:.03,fundingAdditionality:.2}},
 {name:'one_year_health',overrides:{healthHorizonYears:1}},
 {name:'resources_50000',overrides:{householdResourcesUsd:50000}},
 {name:'paid_hours_500',overrides:{paidHoursPerWorkerYear:500}},
 {name:'paid_hours_2000',overrides:{paidHoursPerWorkerYear:2000}},
 {name:'independent_gift_health_harm',overrides:{fundingAdditionality:0,independentGiftHealthHarmYears:.05}}
].map(s=>Object.freeze({...s,overrides:Object.freeze(s.overrides)})));
export function diagnostics(overrides={}){return scenarios.map(s=>({name:s.name,...calculate({...overrides,...s.overrides})}));}

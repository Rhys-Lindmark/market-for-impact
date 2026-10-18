// Isolated current calibration; never imports or mutates the frozen MELP engine.
// All recipient/clinical/economic fractions are explicit judgments, not measured effects.
export const modelVersion='melp-health-income-calibrated-2026-10-01';
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
export const defaultInputs=freeze({
 giftUsd:10000,paymentFeeUsd:0,maxSupportedGiftUsd:10000,
 plannedWholeOrgExpenseUsd:169269,districtClientEquivalents:960,districtShare:.28,
 planRealization:.75,uniqueEpisodeFraction:.8,giftAdditionality:.3,portfolioAssignment:1,
 applicantRealization:.75,inducedApplicantExposure:0,applicantBurdenUsd:0,
 householdResourcesUsd:50000,incomeWeight:.5,incomeWindowYears:1,receiptDelayYears:.125,
 discountRate:.03,deviceHarmYearsPerAdditionalEpisode:.00015,
 healthBayShare:.95,healthSfShare:.03,incomeBayShare:.95,incomeSfShare:.03,
 categories:[
  {name:'adult_mobility',share:.45,unmetFraction:.4,purchaserFraction:.3,safeUse:.8,utility:.03,incrementalYears:.125,netSavingUsd:40},
  {name:'bathing_transfer',share:.30,unmetFraction:.35,purchaserFraction:.35,safeUse:.8,utility:.02,incrementalYears:.125,netSavingUsd:25},
  {name:'pediatric_adaptive',share:.10,unmetFraction:.4,purchaserFraction:.15,safeUse:.8,utility:.01,incrementalYears:.25,netSavingUsd:100},
  {name:'consumables_other',share:.15,unmetFraction:.25,purchaserFraction:.60,safeUse:.85,utility:.002,incrementalYears:.025,netSavingUsd:20}
 ]
});
export const inputs=defaultInputs;
export const evidence=freeze({
 financialBasis:'2025–26 whole-organization forecast, not actual or binding marginal tranche; narrative169269/table166269.',
 outputBasis:'960/.28 inferred planning equivalents, not actual unique recipient census.',
 clinicalBasis:'Shared adult utility priors .03/.02/.002; separately weak pediatric .01. Conditional incremental duration, not permitted loan term. All judgments.',
 incomeBasis:'Disjoint counterfactual purchasers; one-off net OOP savings40/25/100/20 and annual resources50000 are judgments, not measured incomes or retail replacement value.',
 burdenBasis:'Only gift-induced applicant exposure, independent of completion/funding; unchanged baseline pickup has no donor-attributed burden.',
 missing:'Complete societal resources, comparable third recent original financial year, measured unique recipients/incidence/use/capacity remain unknown.'
});
export const assumptionBasis=evidence;
const finite=(v,key,min=0,max=Infinity)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new RangeError(`Invalid ${key}`);};
const fraction=(v,k)=>finite(v,k,0,1);
function validate(p){
 for(const [key,value] of Object.entries(p))if(key!=='categories')finite(value,key);
 if(p.maxSupportedGiftUsd!==10000||p.giftUsd>10000)throw new RangeError('Supported gross gift maximum is10000');
 if(p.paymentFeeUsd>p.giftUsd)throw new RangeError('Fee exceeds gross donor budget');
 for(const k of ['plannedWholeOrgExpenseUsd','districtClientEquivalents','districtShare','householdResourcesUsd','incomeWindowYears'])if(p[k]<=0)throw new RangeError(`${k} must be positive`);
 for(const k of ['districtShare','planRealization','uniqueEpisodeFraction','giftAdditionality','portfolioAssignment','applicantRealization','inducedApplicantExposure','healthBayShare','healthSfShare','incomeBayShare','incomeSfShare'])fraction(p[k],k);
 if(p.healthSfShare>p.healthBayShare||p.incomeSfShare>p.incomeBayShare)throw new RangeError('SF attribution must be nested within Bay');
 if(p.applicantBurdenUsd>=p.householdResourcesUsd*p.incomeWindowYears)throw new RangeError('Burden must be smaller than window resources');
 if(!Array.isArray(p.categories)||p.categories.length!==4)throw new TypeError('Four exclusive primary-need categories required');
 const names=new Set();let shares=0;
 for(const c of p.categories){
  const allowed=['name','share','unmetFraction','purchaserFraction','safeUse','utility','incrementalYears','netSavingUsd'];
  if(Object.keys(c).some(k=>!allowed.includes(k))||allowed.some(k=>!(k in c)))throw new TypeError('Unknown or missing category input');
  if(typeof c.name!=='string'||!c.name.trim()||names.has(c.name))throw new TypeError('Unique category names required');names.add(c.name);
  for(const [k,v] of Object.entries(c))if(k!=='name')finite(v,k);
  for(const k of ['share','unmetFraction','purchaserFraction','safeUse','utility'])fraction(c[k],k);
  if(c.unmetFraction+c.purchaserFraction>1+1e-12)throw new RangeError('Health and purchaser strata must be disjoint');
  finite(c.incrementalYears,'incrementalYears',0,1);shares+=c.share;
 }
 if(Math.abs(shares-1)>1e-12)throw new RangeError('Category shares must sum to1');
}
export function calculate(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw new TypeError('Input overrides must be an object');
 if(Object.keys(overrides).some(k=>!(k in defaultInputs)))throw new TypeError('Unknown model input');
 const p={...defaultInputs,...overrides,categories:structuredClone(overrides.categories??defaultInputs.categories)};validate(p);
 const netProgramBudgetUsd=p.giftUsd-p.paymentFeeUsd;
 const planningClientEquivalents=p.districtClientEquivalents/p.districtShare;
 const plannedCostPerClientEquivalent=p.plannedWholeOrgExpenseUsd/planningClientEquivalents;
 const plannedEpisodes=netProgramBudgetUsd/plannedCostPerClientEquivalent;
 const realizedUniqueEpisodes=plannedEpisodes*p.planRealization*p.uniqueEpisodeFraction;
 const additionalUniqueEpisodes=realizedUniqueEpisodes*p.giftAdditionality*p.portfolioAssignment;
 // Applicant exposure is a separate gift-induced channel. No completion or funding multiplier.
 const inducedApplicantEpisodes=plannedEpisodes*p.applicantRealization*p.uniqueEpisodeFraction*p.inducedApplicantExposure*p.portfolioAssignment;
 const incomeWindowResourcesUsd=p.householdResourcesUsd*p.incomeWindowYears;
 if(!Number.isFinite(incomeWindowResourcesUsd)||incomeWindowResourcesUsd<=0)throw new RangeError('Invalid resource-window product');
 const incomeDiscount=(1+p.discountRate)**p.receiptDelayYears;
 const rows=p.categories.map(c=>({...c,
  grossHealthYears:additionalUniqueEpisodes*c.share*c.unmetFraction*c.safeUse*c.utility*c.incrementalYears/(1+p.discountRate)**(c.incrementalYears/2),
  incomeEquivalentYears:additionalUniqueEpisodes*c.share*c.purchaserFraction*p.incomeWeight*p.incomeWindowYears*Math.log1p(c.netSavingUsd/incomeWindowResourcesUsd)/incomeDiscount
 }));
 const grossHealthYears=rows.reduce((s,c)=>s+c.grossHealthYears,0);
 const deviceHarmYears=additionalUniqueEpisodes*p.deviceHarmYearsPerAdditionalEpisode;
 const netHealthYears=grossHealthYears-deviceHarmYears;
 const incomeEquivalentYears=rows.reduce((s,c)=>s+c.incomeEquivalentYears,0);
 const applicantBurdenYears=inducedApplicantEpisodes>0&&p.applicantBurdenUsd>0?inducedApplicantEpisodes*p.incomeWeight*p.incomeWindowYears*Math.log1p(-p.applicantBurdenUsd/incomeWindowResourcesUsd)/incomeDiscount:0;
 const netIncomeEquivalentYears=incomeEquivalentYears+applicantBurdenYears;
 const combinedYears=netHealthYears+netIncomeEquivalentYears;
 const bayYears=netHealthYears*p.healthBayShare+netIncomeEquivalentYears*p.incomeBayShare;
 const sfYears=netHealthYears*p.healthSfShare+netIncomeEquivalentYears*p.incomeSfShare;
 for(const x of [plannedEpisodes,realizedUniqueEpisodes,additionalUniqueEpisodes,inducedApplicantEpisodes,grossHealthYears,deviceHarmYears,netHealthYears,incomeEquivalentYears,applicantBurdenYears,combinedYears,bayYears,sfYears])if(!Number.isFinite(x))throw new RangeError('Nonfinite calculated effect');
 const price=x=>{if(x<=0)return null;const v=10*p.giftUsd/x;if(!Number.isFinite(v))throw new RangeError('Nonfinite donor ratio');return v;};
 return {modelVersion,inputs:p,planningClientEquivalents,plannedCostPerClientEquivalent,netProgramBudgetUsd,
  plannedEpisodes,realizedUniqueEpisodes,additionalUniqueEpisodes,inducedApplicantEpisodes,rows,
  grossHealthYears,deviceHarmYears,netHealthYears,incomeEquivalentYears,applicantBurdenYears,netIncomeEquivalentYears,
  combinedYears,bayYears,sfYears,donorCostPer10CombinedYears:price(combinedYears),bayDonorCostPer10CombinedYears:price(bayYears),sfDonorCostPer10CombinedYears:price(sfYears),
  healthYears:netHealthYears,recipientBurdenYears:applicantBurdenYears,totalEquivalentYears:combinedYears,bayEquivalentYears:bayYears,sfEquivalentYears:sfYears,
  bayUsdPerBetterLife:price(bayYears),sfUsdPerBetterLife:price(sfYears),allUsdPerBetterLife:price(combinedYears),additionalEpisodes:additionalUniqueEpisodes,exposedEpisodes:realizedUniqueEpisodes,categoryRows:rows,
  completeSocietalResourcesUsd:null,completeSocietalCostPer10CombinedYears:null
 };
}
const cats=fn=>defaultInputs.categories.map((c,i)=>fn({...c},i));
export const scenarios=freeze([
 {name:'central',description:'Unweighted planning judgment',overrides:{}},
 {name:'lower_utility',description:'Lower shared utility family; not empirical update',overrides:{categories:cats((c,i)=>({...c,utility:[.01,.01,.01,.001][i]}))}},
 {name:'health_only',description:'No incremental household saving',overrides:{categories:cats(c=>({...c,netSavingUsd:0}))}},
 {name:'income_only',description:'Clinical effect and device harm bothzero',overrides:{categories:cats(c=>({...c,utility:0})),deviceHarmYearsPerAdditionalEpisode:0}},
 {name:'literal_no_change',description:'No additional service or gift-induced applicant exposure',overrides:{giftAdditionality:0,inducedApplicantExposure:0}},
 {name:'attempted_access_burden',description:'Gift-induced applications, no additional equipment; not unchanged baselinepickup',overrides:{giftAdditionality:0,inducedApplicantExposure:1,applicantBurdenUsd:20}},
 {name:'clinical_cash_null_harm',description:'No positive effects; independent device harms retained',overrides:{categories:cats(c=>({...c,utility:0,netSavingUsd:0}))}},
 {name:'alternative_budget',description:'Wholeorganization plan table166269',overrides:{plannedWholeOrgExpenseUsd:166269}},
 {name:'half_additionality',description:'Giftadditionality.15',overrides:{giftAdditionality:.15}},
 {name:'higher',description:'Unweighted diagnostic;a.5,double conditionalduration/savings',overrides:{giftAdditionality:.5,categories:cats(c=>({...c,incrementalYears:c.incrementalYears*2,netSavingUsd:c.netSavingUsd*2}))}},
 {name:'pediatric_zero',description:'No pediatric positive utility or net savings',overrides:{categories:cats((c,i)=>i===2?{...c,utility:0,netSavingUsd:0}:c)}},
 {name:'resources_25000',description:'Alternative annual household resources',overrides:{householdResourcesUsd:25000}},
 {name:'resources_100000',description:'Alternative annual household resources',overrides:{householdResourcesUsd:100000}}
]);
export function calculateScenarios(baseOverrides={}){return scenarios.map(s=>({name:s.name,description:s.description,...calculate({...baseOverrides,...s.overrides})}));}
export const diagnostics=calculateScenarios;

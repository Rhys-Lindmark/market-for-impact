/** Conditional whole-gift SFAF calibration; no empirical scenario probabilities. */
import {calculate as clinicalCalculate, INPUT_BOUNDS} from './sfaf-portfolio-model.mjs';
import frozen from '../data/san-francisco/sfaf-portfolio-model-v1.json' with {type:'json'};
export const modelVersion='sfaf-health-income-calibrated-2026-10-01';
export const assumptionBasis=Object.freeze({
 clinical:'Frozen finite recurrent-OD and HIV-free-state engine retained; local hazards, utility, allocation, offer costs and realization remain judgments.',
 resource:'No measured marginal household resource distribution. Central net0 is unidentified, not proof of zero benefit; p=.25, Y50K, unique1 are diagnostic assumptions.',
 timing:'One resource-year window, midpoint calendar .75=.25 service lag+.5; applicant one-off at .25. No repeated earnings over health horizons.',
 overlap:'Only positive resources and positive PrEP-health may overlap, using the regional minimum. Negative money and harms never receive overlap credit.',
 burden:'Only independently gift-induced applicant exposure; excludes unchanged baseline visits and costs already in net resources. Can survive failed funding/placement.',
 fee:'Fee is an extra donor-paid numerator, not a reduction in available service budget.',
 funding:'Gift<=100K exploratory; no verified tranche. Portfolio assignment applies once to all signed effects, not cost.',
 payer:'Public/insurance/340B payments and payroll are not automatic participant income.'
});
export const defaultInputs=Object.freeze({...frozen.scenarios[0].inputs,
 baselineAnnualResources:50000, coefficient:.5, prepResourceIncidence:.25,
 prepResourceUniqueFraction:1, prepNetResourceUsd:0, resourceReceiptYear:.75,
 resourceBayShare:.95, resourceSfShare:.75, portfolioAssignment:1, feeRate:0,
 applicantExposureAdditionality:0, applicantBurdenUsd:50, applicantReceiptYear:.25,
 applicantBayShare:.95, applicantSfShare:.75, positiveResourceHealthOverlap:0
});
const extraBounds=Object.freeze({
 baselineAnnualResources:[1,1e9],coefficient:[0,1],prepResourceIncidence:[0,1],
 prepResourceUniqueFraction:[0,1],prepNetResourceUsd:[-1e9,1e9],
 resourceReceiptYear:[0,10],resourceBayShare:[0,1],resourceSfShare:[0,1],
 portfolioAssignment:[0,1],feeRate:[0,1],applicantExposureAdditionality:[0,1],
 applicantBurdenUsd:[0,1e9],applicantReceiptYear:[0,10],
 applicantBayShare:[0,1],applicantSfShare:[0,1],positiveResourceHealthOverlap:[0,1]
});
const bounds={...INPUT_BOUNDS,...extraBounds,gift_usd:[0,100000]};
function validate(overrides){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw new TypeError('Overrides must be an object.');
 for(const key of Object.keys(overrides))if(!Object.hasOwn(defaultInputs,key))throw new TypeError('Unknown input: '+key);
 const p={...defaultInputs,...overrides};
 for(const [key,[lo,hi]] of Object.entries(bounds)){
  if(typeof p[key]!=='number'||!Number.isFinite(p[key]))throw new TypeError(key+' must be finite.');
  if(p[key]<lo||p[key]>hi)throw new RangeError(key+' out of bounds.');
 }
 if(p.prepNetResourceUsd<=-p.baselineAnnualResources)throw new RangeError('Net resources must exceed -baseline resources.');
 if(p.applicantBurdenUsd>=p.baselineAnnualResources)throw new RangeError('Burden must be below baseline resources.');
 for(const prefix of ['resource','applicant'])if(p[prefix+'SfShare']>p[prefix+'BayShare'])throw new RangeError('SF must nest in Bay per '+prefix+' stream.');
 return p;
}
const price=(cost,q)=>q>0&&Number.isFinite(10*cost/q)?10*cost/q:null;
export function calculate(overrides={}){
 const p=validate(overrides), clinicalInputs=Object.fromEntries(Object.keys(INPUT_BOUNDS).map(key=>[key,p[key]]));
 const h=clinicalCalculate(clinicalInputs),k=p.portfolioAssignment;
 // Resource population precedes clinical-only OD/PrEP health deduplication.
 const financialPrepOffers=h.prep_offers*p.prep_funding_additionality;
 const resourceRecipients=financialPrepOffers*p.prepResourceIncidence*p.prepResourceUniqueFraction;
 const income=resourceRecipients*p.coefficient*Math.log1p(p.prepNetResourceUsd/p.baselineAnnualResources)/(1+p.discount)**p.resourceReceiptYear;
 // Explicit extra applicants, NOT baseline visits; no completion/funding multiplier.
 const exposed=h.prep_offers*p.applicantExposureAdditionality;
 const burden=exposed*p.coefficient*(-Math.log1p(-p.applicantBurdenUsd/p.baselineAnnualResources))/(1+p.discount)**p.applicantReceiptYear;
 const region=(clinicalRegion,resourceShare,burdenShare,prepShare)=>{
  const i=income*resourceShare,b=burden*burdenShare;
  const overlap=p.positiveResourceHealthOverlap*Math.min(Math.max(0,i),Math.max(0,h.prep_net_qaly*prepShare));
  return {healthYears:k*clinicalRegion.qaly,incomeEquivalentYears:k*i,
   recipientBurdenYears:k*b,overlapYears:k*overlap,
   totalEquivalentYears:k*(clinicalRegion.qaly+i-b-overlap)};
 };
 const all=region(h.us,1,1,1),bay=region(h.bay,p.resourceBayShare,p.applicantBayShare,p.prep_bay_share),
 sf=region(h.sf,p.resourceSfShare,p.applicantSfShare,p.prep_sf_share);
 const donorCost=p.gift_usd*(1+p.feeRate);
 return {modelVersion,inputs:p,clinical:h,financialPrepOffers,resourceRecipients,
  exposedApplicants:exposed,healthYears:all.healthYears,incomeEquivalentYears:all.incomeEquivalentYears,
  recipientBurdenYears:all.recipientBurdenYears,overlapYears:all.overlapYears,
  combinedYears:all.totalEquivalentYears,totalEquivalentYears:all.totalEquivalentYears,
  bayEquivalentYears:bay.totalEquivalentYears,sfEquivalentYears:sf.totalEquivalentYears,
  donorCostUsd:donorCost,grossAssociatedResourceUsd:h.gross_resource_usd,
  allUsdPerBetterLife:price(donorCost,all.totalEquivalentYears),
  bayUsdPerBetterLife:price(donorCost,bay.totalEquivalentYears),
  sfUsdPerBetterLife:price(donorCost,sf.totalEquivalentYears),all,bay,sf};
}
const cases=Object.freeze([
 ['central',{}],['positive net150',{prepNetResourceUsd:150}],
 ['adverse net-100',{prepNetResourceUsd:-100}],
 ['positive full overlap',{prepNetResourceUsd:150,positiveResourceHealthOverlap:1}],
 ['positive Y25000',{prepNetResourceUsd:150,baselineAnnualResources:25000}],
 ['literal no change',{od_funding_additionality:0,prep_funding_additionality:0}],
 ['failed extra applicants',{od_funding_additionality:0,prep_funding_additionality:0,applicantExposureAdditionality:.25}],
 ['no assignment',{portfolioAssignment:0}],['fee3pct',{feeRate:.03}],
 ['no clinical increment',{od_rescue_increment:0,prep_extra_coverage_fraction:0}],
 ['short health tails',{od_horizon_years:5,prep_horizon_years:5}],
 ['donor pays outside inputs',{od_cash_per_offer:380,prep_cash_per_offer:1900,od_outside_resources_per_offer:0,prep_outside_resources_per_offer:0}],
 ['adverse rescue',{od_rescue_increment:-.1}],['adverse coverage',{prep_extra_coverage_fraction:-.25}],
 ['independent induced clinical harm',{od_funding_additionality:0,prep_funding_additionality:0,independent_harm_qaly:.01}]
].map(([name,overrides])=>Object.freeze({name,overrides:Object.freeze(overrides)})));
export function scenarios(){return cases.map(({name,overrides})=>({name,overrides,result:calculate(overrides)}));}
export const diagnostics=scenarios;

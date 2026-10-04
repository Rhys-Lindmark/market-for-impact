// Root-corrected legacy model; independent acceptance pending.
// No imports from the accepted CA engine: same identity is NOT acceptance.
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export const version='vtl-legacy-national-bay-sf-net-household-cohorts-20261004';
export const defaults={gift:100000,cost:300,additionality:.5,caDonorFraction:.4,publicPerCADonor:0,publicAdditionality:.5,unmet:.6,wear:.6,utility:.01,years:1,delay:.25,discount:.03,harm:.00005,independentDonorHarm:0,bay:.08,sf:.015,matchBay:.2,matchSf:.0375,householdBay:.08,householdSf:.015,matchHouseholdBay:.2,matchHouseholdSf:.0375,households:.8,purchasers:.05,purchaseSaving:50,purchaseFees:0,purchaseTravel:0,purchaseCare:0,positiveIndependentShare:1,baseline:50000,caregiverShare:0,caregiverNetPay:0,caregiverFees:0,caregiverTravel:0,caregiverCare:0,participationLoss:0,educationShare:0,educationNetPay:0,educationFees:0,educationYears:1,educationDelay:10,inducedHouseholds:0,inducedLoss:0,assignment:1,donorFee:0,externalPerFundedCourse:null};
export function positiveOnlyNet(rows,share){
 if(!Array.isArray(rows)||rows.some(x=>!Number.isFinite(x))||!Number.isFinite(share)||share<0||share>1)throw Error('Invalid resource rows/overlap');
 return rows.reduce((s,v)=>s+(v>0?v*share:v),0);
}
function finiteTree(x){if(typeof x==='number'&&!Number.isFinite(x))throw Error('Nonfinite output');if(x&&typeof x==='object')Object.values(x).forEach(finiteTree);}
function validate(x){
 for(const[k,v]of Object.entries(x)){if(!Object.hasOwn(defaults,k))throw Error('Unknown '+k);if(k==='externalPerFundedCourse'&&v===null)continue;if(!Number.isFinite(v))throw Error('Nonfinite '+k);}
 for(const k of ['additionality','caDonorFraction','publicAdditionality','unmet','wear','bay','sf','matchBay','matchSf','householdBay','householdSf','matchHouseholdBay','matchHouseholdSf','households','purchasers','positiveIndependentShare','caregiverShare','educationShare','assignment','donorFee'])if(x[k]<0||x[k]>1)throw Error('Fraction '+k);
 if(x.unmet+x.purchasers+x.caregiverShare>1)throw Error('Overlapping counterfactual strata');
 if(x.gift<=0||x.gift>100000||x.cost<=0||x.baseline<=0||x.years<0||x.years>2||x.delay<0||x.delay>5||x.discount<0||x.discount>1||Math.abs(x.utility)>1||x.publicPerCADonor<0||x.publicPerCADonor>5||x.harm<0||x.independentDonorHarm<0||x.sf>x.bay||x.matchSf>x.matchBay)throw Error('Clinical/cost/geography domain');
 for(const k of ['purchaseFees','purchaseTravel','purchaseCare','caregiverFees','caregiverTravel','caregiverCare','participationLoss','educationFees','inducedHouseholds','inducedLoss'])if(x[k]<0)throw Error('Loss magnitudes '+k);
 if(x.externalPerFundedCourse!==null&&x.externalPerFundedCourse<0)throw Error('External resources');
 if(x.householdSf>x.householdBay||x.matchHouseholdSf>x.matchHouseholdBay)throw Error('Household geography nesting');
 if(x.educationYears<=0||x.educationYears>5||x.educationDelay<0||x.educationDelay>30||x.inducedLoss>=x.baseline||x.participationLoss>=x.baseline)throw Error('Resource duration/loss');
 if(x.educationShare>0&&positiveOnlyNet([x.educationNetPay,-x.educationFees],x.positiveIndependentShare)>0&&x.educationDelay<x.delay+x.years)throw Error('Positive NET education overlaps clinical window');
}
export function calculate(overrides={}){
 if(!overrides||typeof overrides!=='object'||Array.isArray(overrides)||![Object.prototype,null].includes(Object.getPrototypeOf(overrides)))throw Error('Overrides must be plain object');
 const x={...defaults,...overrides};validate(x);
 const publicUSD=x.gift*x.caDonorFraction*x.publicPerCADonor;
 const baseFundedCourses=x.gift/x.cost,matchFundedCourses=publicUSD/x.cost;
 const baseAdditionalCourses=baseFundedCourses*x.additionality,matchAdditionalCourses=matchFundedCourses*x.publicAdditionality;
 const L=(1+x.discount)**(-x.delay),rate=Math.log1p(x.discount),exposure=L*(rate?-Math.expm1(-rate*x.years)/rate:x.years);
 const perClinical=x.unmet*x.wear*x.utility*exposure-x.harm*L;
 const purchaseNet=positiveOnlyNet([x.purchaseSaving,-x.purchaseFees,-x.purchaseTravel,-x.purchaseCare],x.positiveIndependentShare);
 const caregiverNet=positiveOnlyNet([x.caregiverNetPay,-x.caregiverFees,-x.caregiverTravel,-x.caregiverCare],x.positiveIndependentShare);
 const educationNet=positiveOnlyNet([x.educationNetPay,-x.educationFees],x.positiveIndependentShare);
 for(const net of [purchaseNet,caregiverNet,educationNet])if(x.baseline+net<=0)throw Error('Nonpositive post-change resources');
 // No joint time/cohort ledger is identified for overlapping education and participation cash.
 if(x.participationLoss>0&&x.educationShare>0&&educationNet!==0&&x.educationDelay<x.delay+1&&x.delay<x.educationDelay+x.educationYears)throw Error('Overlapping education/participation resource cohorts unsupported');
 for(const net of [purchaseNet-x.participationLoss,caregiverNet-x.participationLoss])if(x.baseline+net<=0)throw Error('Nonpositive cohort net resources');
 const eq=(people,gain,years=1,delay=x.delay)=>people===0?0:incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD:x.baseline,annualIncomeGainUSD:gain,years,delayYears:delay,discountRate:x.discount,causalShare:1,editionShare:1,independentShare:1});
 function tranche(n){
  const hh=n*x.households,purchaserHouseholds=hh*x.purchasers,caregiverHouseholds=hh*x.caregiverShare;
  const residualHouseholds=hh*(1-x.purchasers-x.caregiverShare);
  // Contemporaneous flows for each disjoint household cohort sum BEFORE log.
  const purchases=eq(purchaserHouseholds,purchaseNet-x.participationLoss);
  const caregiver=eq(caregiverHouseholds,caregiverNet-x.participationLoss);
  const participation=eq(residualHouseholds,-x.participationLoss);
  // A hypothetical future receipt for unique households, not one new household per child.
  const educationHouseholds=hh*x.unmet*x.educationShare;
  const education=eq(educationHouseholds,educationNet,x.educationYears,x.educationDelay);
  return {additionalCourses:n,distinctHouseholds:hh,purchaserHouseholds,caregiverHouseholds,residualHouseholds,educationHouseholds,clinical:n*perClinical,purchases,caregiver,education,participation,incomeEquivalent:purchases+caregiver+education+participation};
 }
 const base=tranche(baseAdditionalCourses),match=tranche(matchAdditionalCourses);
 const induced=eq(x.inducedHouseholds,-x.inducedLoss);
 const donorUSD=x.gift*(1+x.donorFee),grossResourceFloorUSD=donorUSD+publicUSD;
 // Unknown associated external resources remain null, not empirically zero.
 // When specified, cost ALL funded courses before financial additionality.
 const grossResourceUSD=x.externalPerFundedCourse===null?null:grossResourceFloorUSD+(baseFundedCourses+matchFundedCourses)*x.externalPerFundedCourse;
 const price=(cost,benefit)=>cost!==null&&benefit>0?10*cost/benefit:null;
 const geography={};
 for(const[g,b,m,hb,hm]of [['us',1,1,1,1],['bay',x.bay,x.matchBay,x.householdBay,x.matchHouseholdBay],['sf',x.sf,x.matchSf,x.householdSf,x.matchHouseholdSf]]){
  const health=x.assignment*(base.clinical*b+match.clinical*m-x.independentDonorHarm*b);
  const resource=x.assignment*(base.incomeEquivalent*hb+match.incomeEquivalent*hm+induced*hb);
  const total=health+resource;
  geography[g]={healthYears:health,incomeEquivalentYears:resource,combinedEquivalentYears:total,donorPer10Health:price(donorUSD,health),donorPer10Combined:price(donorUSD,total),grossPer10Combined:price(grossResourceUSD,total),grossFloorPer10Combined:price(grossResourceFloorUSD,total),residenceShareStatus:g==='us'?'national service scope':'conditional unverified marginal resident-share prior'};
 }
 const result={version,inputs:x,status:'conditional proposal; not accepted',ordinaryWholeGiftExpectedValue:null,publicUSD,baseFundedCourses,matchFundedCourses,baseAdditionalCourses,matchAdditionalCourses,discountedExposureYears:exposure,dispensingDiscount:L,calendarHealthEnd:x.delay+x.years,netResourceRows:{purchaseNet,caregiverNet,educationNet},base,match,inducedResourceEquivalentYears:induced*x.assignment,donorUSD,grossResourceFloorUSD,grossResourceUSD,externalResourceStatus:x.externalPerFundedCourse===null?'unpriced/unknown':'specified conditional associated-resource envelope',geography,unknownChannels:['current marginal unrestricted-gift capacity/allocation','generic pediatric causal utility','net purchaser incidence/resources','caregiver realized take-home pay','education-to-future earnings','unpriced external school/partner resources','local Bay/SF next-gift residence']};finiteTree(result);return result;
}
export const cases={
 central:{},
 favorable:{cost:600,additionality:.8,unmet:.8,wear:.8,utility:.02,years:2,delay:.125,harm:.00002,bay:.15,sf:.04,householdBay:.15,householdSf:.04,purchasers:.1,purchaseSaving:100},
 pessimistic:{cost:400,additionality:.2,unmet:.3,wear:.3,utility:.005,years:.5,delay:.25,bay:.03,sf:.003,householdBay:.03,householdSf:.003,purchasers:.02,purchaseSaving:20},
 central_conditional_public_match:{publicPerCADonor:1},
 zero_financial_additionality:{additionality:0},
 zero_clinical_gain:{utility:0,harm:0},
 no_gain_shared_harm:{utility:0},
 zero_additionality_independent_harm:{additionality:0,independentDonorHarm:.1},
 central_three_month_catchup:{years:.25},
 central_no_sf_residents:{sf:0,householdSf:0},
 central_zero_dispensing_delay:{delay:0},
 noIncomeEvidence:{purchaseSaving:0},
 explicitExternalResources:{externalPerFundedCourse:40},
 lowerUtility:{utility:.005},
 upperUtilityProxy:{utility:.02},
 adverseClinical:{utility:-.005},
 cost250:{cost:250},cost400:{cost:400},lowWear:{wear:.4},highWear:{wear:.8},lowUnmet:{unmet:.3},highUnmet:{unmet:.8},
 twoYearSupportedCourse:{years:2,cost:600},
 householdResources25000:{baseline:25000},householdResources100000:{baseline:100000},
 negativePurchaseSavings:{purchaseSaving:-50},
 mixedPositiveFees:{purchaseSaving:50,purchaseFees:30,positiveIndependentShare:.5},
 zeroPositiveOverlapWithCosts:{positiveIndependentShare:0,purchaseFees:10,purchaseTravel:5},
 caregiverConditional:{caregiverShare:.2,caregiverNetPay:20},
 educationConditional:{educationShare:.05,educationNetPay:500},
 educationAdverse:{educationShare:.05,educationNetPay:-500,educationDelay:0},
 educationMixedNetHarm:{educationShare:.05,educationNetPay:1,educationFees:10,educationDelay:0},
 inducedFailedAccess:{additionality:0,inducedHouseholds:20,inducedLoss:10},
 participationCosts:{participationLoss:10},
 noChange:{additionality:0,inducedHouseholds:0},
 noBayResidents:{bay:0,sf:0,householdBay:0,householdSf:0},noAssignment:{assignment:0},noPurchasers:{purchasers:0},
 differentHouseholdResidence:{householdBay:.04,householdSf:.005},
 twoWeekAfterGift:{delay:2/52},eightWeekAfterGift:{delay:8/52},donationMobilizationHalfYear:{delay:.5},
};
export function calculateAll(){return Object.fromEntries(Object.entries(cases).map(([id,o])=>[id,calculate(o)]));}
export function selfTest(){let n=0;const check=(p,m)=>{n++;if(!p)throw Error(m);};const reject=(o)=>{let ok=false;try{calculate(o);}catch{ok=true;}check(ok,'Expected rejection '+JSON.stringify(o));};
 check(positiveOnlyNet([50,-30,-10],0)===-40,'full downside at zero overlap');check(positiveOnlyNet([50,-30],.5)===-5,'mixed rows');check(positiveOnlyNet([-50],.5)===-50,'negative unchanged');
 const before=JSON.stringify(defaults),c=calculate(),all=calculateAll();check(before===JSON.stringify(defaults),'default purity');check(c.grossResourceUSD===null&&c.ordinaryWholeGiftExpectedValue===null,'unknown not zero');
 check(all.zero_financial_additionality.geography.us.combinedEquivalentYears===0,'no expanded delivery');check(all.inducedFailedAccess.geography.us.combinedEquivalentYears<0,'induced burden survives zero delivery');check(all.zero_additionality_independent_harm.geography.us.healthYears===-.1,'independent clinical harm');check(all.adverseClinical.geography.us.healthYears<0,'negative utility survives');check(all.zeroPositiveOverlapWithCosts.base.incomeEquivalent<0,'positive-only overlap');check(all.educationMixedNetHarm.base.education<0&&all.educationMixedNetHarm.netResourceRows.educationNet===-9,'gross-positive NET-negative future harm allowed');
 for(const s of Object.values(all)){check(s.geography.us.combinedEquivalentYears===s.geography.us.healthYears+s.geography.us.incomeEquivalentYears,'signed total');check(s.geography.us.donorPer10Combined===null||s.geography.us.combinedEquivalentYears>0,'signed price');}
 const h=calculate({gift:50000});check(Math.abs(c.geography.us.combinedEquivalentYears-2*h.geography.us.combinedEquivalentYears)<1e-12,'tranche scaling');
 check(all.central_conditional_public_match.publicUSD===40000,'whole all-in CA donor share');check(all.central_conditional_public_match.geography.bay.healthYears>c.geography.bay.healthYears,'match CA tranche locality');check(all.explicitExternalResources.grossResourceUSD===100000+100000/300*40,'associated costs pre additionality');
 for(const o of [null,[],new Date(),{toString:1},{cost:0},{gift:100001},{unmet:.95,purchasers:.1},{sf:.2},{matchSf:.3},{years:3},{delay:6},{discount:2},{utility:2},{externalPerFundedCourse:-1},{purchaseSaving:-50000},{purchaseFees:50051},{educationShare:.1,educationNetPay:1,educationDelay:0},{inducedLoss:50000},{cost:1e-320}])reject(o);
 return {passed:n,cases:Object.keys(all).length};}

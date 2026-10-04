// Current independently reassessed California health/resource model; priors remain judgmental.
export const defaults={gift:100000,cost:300,additionality:.5,ca:.4,unmet:.6,wear:.6,utility:.01,years:1,delay:.125,discount:.03,harm:.00005,households:.8,purchasers:.05,saving:50,baseline:50000,caregiverShare:0,caregiverGain:0,educationShare:0,educationGain:0,educationYears:1,educationDelay:10,inducedApplicants:0,applicantLoss:0,assignment:1,fee:0,externalPerCourse:0};
export function calculate(o={}){
 if(o===null||typeof o!=='object'||Array.isArray(o)||![Object.prototype,null].includes(Object.getPrototypeOf(o)))throw Error('Overrides must be a plain object');
 const x={...defaults,...o}; for(const [k,v]of Object.entries(x)){if(!Object.hasOwn(defaults,k)||!Number.isFinite(v))throw Error('Invalid '+k);}
 for(const k of ['additionality','ca','unmet','wear','households','purchasers','caregiverShare','educationShare','assignment'])if(x[k]<0||x[k]>1)throw Error(k);
 if(x.unmet+x.purchasers+x.caregiverShare>1)throw Error('Counterfactual strata overlap');
 if(x.gift<=0||x.gift>100000||x.cost<=0||x.baseline<=0||x.years<=0||x.years>2||x.educationYears<=0||x.educationYears>5||Math.abs(x.utility)>1||x.delay<0||x.educationDelay<0||x.discount<0||x.harm<0||x.fee<0||x.inducedApplicants<0||x.applicantLoss<0||x.applicantLoss>=x.baseline||x.saving<=-x.baseline||x.caregiverGain<=-x.baseline||x.educationGain<=-x.baseline)throw Error('Domain');
 if(Math.abs(x.utility)>1||x.years>2||x.educationYears>5||x.delay>5||x.educationDelay>30||x.discount>1||x.fee>1)throw Error('Outside supported finite model domain');
 if(x.externalPerCourse<0)throw Error('External resources must be nonnegative');
 if(x.educationShare>0&&x.educationGain>0&&x.educationDelay<x.delay+x.years)throw Error('Positive education income must begin after clinical exposure');
 const n=x.gift/x.cost*x.additionality;
 const rate=Math.log1p(x.discount),exposure=(rate? -Math.expm1(-rate*x.years)/rate:x.years)/(1+x.discount)**x.delay;
 const health=x.assignment*n*(x.unmet*x.wear*x.utility*exposure-x.harm/(1+x.discount)**x.delay);
 const hh=n*x.households;
 const purchases=x.assignment*.5*hh*x.purchasers*Math.log1p(x.saving/x.baseline)/(1+x.discount)**x.delay;
 const caregiver=x.assignment*.5*hh*x.caregiverShare*Math.log1p(x.caregiverGain/x.baseline)/(1+x.discount)**x.delay;
 // Explicitly conditional future recipient distribution; not a test-score-to-wage estimate.
 let incomeDuration=0;for(let i=0;i<Math.ceil(x.educationYears);i++)incomeDuration+=Math.min(1,x.educationYears-i)/(1+x.discount)**(x.educationDelay+i);
 const education=x.assignment*.5*n*x.unmet*x.educationShare*Math.log1p(x.educationGain/x.baseline)*incomeDuration;
 const burden=x.assignment*.5*x.inducedApplicants*Math.log1p(-x.applicantLoss/x.baseline)/(1+x.discount)**x.delay;
 const income=purchases+caregiver+education,all=health+income+burden,ca=all*x.ca;
 const price=v=>v>0?10*x.gift*(1+x.fee)/v:null;
 const grossResourceUSD=x.gift*(1+x.fee)+x.gift/x.cost*x.externalPerCourse;
 const result={grossResourceUSD,grossResourceCaUsdPerBetterLife:ca>0?10*grossResourceUSD/ca:null,inputs:x,additionalCourses:n,distinctHouseholds:hh,clinicalExposureYears:exposure,healthYearsAll:health,healthYearsCA:health*x.ca,purchaseIncomeYearsAll:purchases,caregiverIncomeYearsAll:caregiver,educationIncomeYearsAll:education,incomeEquivalentYearsAll:income,incomeEquivalentYearsCA:income*x.ca,inducedBurdenYearsAll:burden,combinedYearsAll:all,combinedYearsCA:ca,caUsdPerBetterLife:price(ca),allUsdPerBetterLife:price(all)};
 const finite=v=>{if(typeof v==='number'&&!Number.isFinite(v))throw Error('Nonfinite model output');if(v&&typeof v==='object')Object.values(v).forEach(finite);};finite(result);return result;
}
export const cases={central:{},extraResources:{externalPerCourse:40},healthOnly:{saving:0},noIncomeEvidence:{saving:0},noHealth:{utility:0,harm:0},lowerUtility:{utility:.005},hospitalMildProxy:{utility:.02},noGenericUtility:{utility:0},higherCost:{cost:400},lowerCost:{cost:250},lowUnmet:{unmet:.3},highUnmet:{unmet:.8},lowWear:{wear:.4},highWear:{wear:.8},shortExposure:{years:.5},longerSupportedExposure:{years:2,cost:600},noFunding:{additionality:0},noCA:{ca:0},noAssignment:{assignment:0},noPurchasers:{purchasers:0},highPurchaserSavings:{purchasers:.2,saving:100},lowerHouseholdResources:{baseline:25000},highHouseholdResources:{baseline:100000},caregiverConditional:{caregiverShare:.2,caregiverGain:20},educationConditional:{educationShare:.05,educationGain:500},negativeResources:{saving:-50},inducedFailedAccess:{additionality:0,inducedApplicants:20,applicantLoss:10},allNoChange:{additionality:0,inducedApplicants:0},adverseClinical:{utility:-.005},twoWeekReceipt:{delay:2/52},eightWeekReceipt:{delay:8/52}};
if(process.argv[1]?.endsWith('vtl-ca-calibrated-model.mjs'))console.log(JSON.stringify({prior:{healthYearsCA:.49910387587274496,caUsdPerBetterLife:2003590.9323512588},financial:{expenses:[19589987,24131355,25497887],mean:23073076.333333332,grossExpensePerFY25Pair:25497887/93225,cashExpensePerFY25Pair:(25497887-1359892)/93225},cases:Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,calculate(v)]))},null,2));

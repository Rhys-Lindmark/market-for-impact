// Proposed destination lib/ymca-current-calibrated-model.mjs. Original engine/data remain unchanged.
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export const version='ymca-finite-health-disjoint-household-net-resources-20261004';
export const allocation={fitness:.20,mental:.25,family:.20,dpp:.05,youth:.15,aquatics:.05,campOther:.10};
const route=(cost,unit,extra={})=>({cost,unit,additionality:.4,resourceAdditionality:.4,healthPerUnit:0,healthYears:1,healthDelay:0,positiveHealthIndependentShare:1,clinicalHarm:0,healthSfShare:.65,householdSfShare:.65,householdsPerUnit:1,resourceShare:1,baseline:50000,resourceYears:1,resourceDelay:0,positiveResourceIndependentShare:1,accessSaving:0,realizedTakeHomePay:0,netTransfer:0,medicalSaving:0,fees:0,travel:0,care:0,lostActualPay:0,displacedResources:0,externalPerUnit:null,...extra});
export const defaults={gift:100000,discount:.03,disjointHouseholdRoutes:[],distinctClinicalRoutes:['fitness','dpp'],independentClinicalHarmSF:0,independentClinicalHarmRestBay:0,inducedHouseholds:0,inducedNetResources:0,inducedSfShare:.65,routes:{
 fitness:route(600,'one supported exercise-referral course',{healthPerUnit:.027*.2,healthDelay:.75}),
 mental:route(1500,'one individual finite therapy course/year allowance'),
 family:route(500,'one unique household finite support episode allowance',{healthSfShare:1,householdSfShare:1}),
 dpp:route(600,'one adult one-year DPP course',{healthPerUnit:.08*.3*.05,healthYears:2,healthDelay:3}),
 youth:route(1500,'one child school-year support/childcare allowance'),
 aquatics:route(250,'one participant 6–8-lesson course allowance'),
 campOther:route(1000,'one participant-season allowance; capital/other allocation unresolved')
}};
export function positiveOnlyNet(rows,share){return rows.reduce((s,v)=>s+(v>0?v*share:v),0);}
const numericKeys=['cost','additionality','resourceAdditionality','healthPerUnit','healthYears','healthDelay','positiveHealthIndependentShare','clinicalHarm','healthSfShare','householdSfShare','householdsPerUnit','resourceShare','baseline','resourceYears','resourceDelay','positiveResourceIndependentShare','accessSaving','realizedTakeHomePay','netTransfer','medicalSaving','fees','travel','care','lostActualPay','displacedResources'];
const moneyRows=r=>[r.accessSaving,r.realizedTakeHomePay,r.netTransfer,r.medicalSaving,-r.fees,-r.travel,-r.care,-r.lostActualPay,-r.displacedResources];
function plain(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;}
function finiteTree(x){if(typeof x==='number'&&!Number.isFinite(x))throw Error('Nonfinite result');if(x&&typeof x==='object')for(const v of Object.values(x))finiteTree(v);}
function exposure(years,delay,discount){let s=0;for(let i=0;i<Math.ceil(years);i++)s+=Math.min(1,years-i)/(1+discount)**(delay+i);return s;}
function income(people,net,r,discount){if(people===0)return 0;return incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD:r.baseline,annualIncomeGainUSD:net,years:r.resourceYears,delayYears:r.resourceDelay,discountRate:discount,independentShare:1});}
export function calculate(overrides={}){
 if(!plain(overrides)||('routes' in overrides&&!plain(overrides.routes)))throw Error('Plain overrides required');
 for(const k of Object.keys(overrides))if(!(k in defaults))throw Error('Unknown override '+k);
 const x={...defaults,...overrides,routes:{}};
 for(const k of Object.keys(overrides.routes||{}))if(!(k in defaults.routes))throw Error('Unknown route '+k);
 for(const [k,base]of Object.entries(defaults.routes)){
  const o=Object.hasOwn(overrides.routes||{},k)?overrides.routes[k]:{};if(!plain(o))throw Error('Plain route');for(const key of Object.keys(o))if(!(key in base))throw Error('Unknown route field '+key);
  const r=x.routes[k]={...base,...o};if(typeof r.unit!=='string'||!r.unit.trim())throw Error('Native unit label');for(const key of numericKeys)if(!Number.isFinite(r[key]))throw Error('Nonfinite '+k+'.'+key);
  if(r.cost<=0||r.baseline<=0||r.healthYears<=0||r.healthYears>5||r.resourceYears<=0||r.resourceYears>2||r.healthDelay<0||r.healthDelay>10||r.resourceDelay<0||r.resourceDelay>5||Math.abs(r.healthPerUnit)>1||r.clinicalHarm<0||r.clinicalHarm>1)throw Error('Finite route bounds');
  if(k==='fitness'&&(r.healthYears!==1||r.healthDelay<.5))throw Error('Fitness is one integrated months6–12 course increment, not annual utility');
  for(const key of ['additionality','resourceAdditionality','positiveHealthIndependentShare','healthSfShare','householdSfShare','householdsPerUnit','resourceShare','positiveResourceIndependentShare'])if(r[key]<0||r[key]>1)throw Error('Fraction');
  for(const key of ['fees','travel','care','lostActualPay','displacedResources'])if(r[key]<0)throw Error('Negative burden magnitude');
  if(r.externalPerUnit!==null&&(!Number.isFinite(r.externalPerUnit)||r.externalPerUnit<0))throw Error('External resource allowance');
  if(r.baseline+positiveOnlyNet(moneyRows(r),r.positiveResourceIndependentShare)<=0)throw Error('Nonpositive post-change household resources');
 }
 for(const k of ['gift','discount','independentClinicalHarmSF','independentClinicalHarmRestBay','inducedHouseholds','inducedNetResources','inducedSfShare'])if(!Number.isFinite(x[k]))throw Error('Finite top input');
 if(x.gift<0||x.gift>100000||x.discount<0||x.discount>1||x.independentClinicalHarmSF<0||x.independentClinicalHarmRestBay<0||x.inducedHouseholds<0||x.inducedHouseholds>100000||x.inducedSfShare<0||x.inducedSfShare>1||50000+x.inducedNetResources<=0)throw Error('Top bounds');
 // Positive generic clinical utilities also require explicitly distinct increments.
 // The reference declares fitness/DPP distinct by time; this is not observed independence.
 const activeClinical=Object.entries(x.routes).filter(([k,r])=>x.gift*allocation[k]/r.cost*r.additionality>0&&r.healthPerUnit>0&&r.positiveHealthIndependentShare>0).map(([k])=>k);
 const clinicalDeclared=x.distinctClinicalRoutes;
 if(!Array.isArray(clinicalDeclared)||clinicalDeclared.length>7||new Set(clinicalDeclared).size!==clinicalDeclared.length||clinicalDeclared.some(k=>typeof k!=='string'||!Object.keys(x.routes).includes(k)))throw Error('Bounded distinct clinical declaration required');
 if(clinicalDeclared.length&&(clinicalDeclared.length!==activeClinical.length||activeClinical.some(k=>!clinicalDeclared.includes(k))))throw Error('Clinical declaration must identify every and only active positive increment');
 if(activeClinical.length>1&&clinicalDeclared.length===0)throw Error('Overlapping positive clinical increments unsupported without explicit distinct-increment hypothesis');
 // Separate logs across overlapping household routes are unsupported. Explicit disjoint
 // incidence is a conditional hypothesis, never established by a positive overlap factor.
 const activeCash=Object.entries(x.routes).filter(([k,r])=>x.gift*allocation[k]/r.cost*r.resourceAdditionality*r.householdsPerUnit*r.resourceShare>0&&moneyRows(r).some(v=>v!==0)).map(([k])=>k);
 if(x.inducedHouseholds>0&&x.inducedNetResources!==0)activeCash.push('induced');
 const declared=x.disjointHouseholdRoutes;
 if(!Array.isArray(declared)||declared.length>8||new Set(declared).size!==declared.length||declared.some(k=>typeof k!=='string'||![...Object.keys(x.routes),'induced'].includes(k)))throw Error('Bounded disjoint household declaration required');
 if(declared.length&& (declared.length!==activeCash.length||activeCash.some(k=>!declared.includes(k))))throw Error('Disjoint declaration must identify every and only active cash cohort');
 if(activeCash.length>1&&declared.length===0)throw Error('Cross-route household netting unsupported without explicit disjoint incidence hypothesis');
 const routes={};let healthSF=-x.independentClinicalHarmSF,healthRest=-x.independentClinicalHarmRestBay,incomeSF=0,incomeRest=0,knownExternal=0,completeGross=true;
 for(const[k,r]of Object.entries(x.routes)){
  const donorUSD=x.gift*allocation[k],fundedUnits=donorUSD/r.cost,additionalUnits=fundedUnits*r.additionality;
  // Fitness .027 is one AUC increment, never re-integrated. .75 discounts at the observed months6–12 midpoint, with zero donor activation delay assumed; alternative total delays >=.5 are conditional.
  const healthWeight=k==='fitness'?(1+x.discount)**(-r.healthDelay):exposure(r.healthYears,r.healthDelay,x.discount);
  const health=additionalUnits*(positiveOnlyNet([r.healthPerUnit],r.positiveHealthIndependentShare)*healthWeight-r.clinicalHarm);
  const net=positiveOnlyNet(moneyRows(r),r.positiveResourceIndependentShare),households=fundedUnits*r.resourceAdditionality*r.householdsPerUnit*r.resourceShare,resourceEquivalent=income(households,net,r,x.discount);
  healthSF+=health*r.healthSfShare;healthRest+=health*(1-r.healthSfShare);incomeSF+=resourceEquivalent*r.householdSfShare;incomeRest+=resourceEquivalent*(1-r.householdSfShare);
  if(r.externalPerUnit===null){if(fundedUnits>0)completeGross=false;}else knownExternal+=fundedUnits*r.externalPerUnit;
  routes[k]={unit:r.unit,donorUSD,fundedUnits,additionalUnits,clinicalHealthyYears:health,netHouseholdAnnualResourcesUSD:net,households,incomeEquivalentYears:resourceEquivalent,healthSfShare:r.healthSfShare,householdSfShare:r.householdSfShare,externalResourceStatus:r.externalPerUnit===null?'unknown/unpriced':'specified conditional allowance'};
 }
 // Failed access, referral travel, or displacement may harm households even with zero successful delivery.
 const induced=income(x.inducedHouseholds,x.inducedNetResources,{...defaults.routes.family,resourceYears:1,resourceDelay:0,baseline:50000},x.discount);incomeSF+=induced*x.inducedSfShare;incomeRest+=induced*(1-x.inducedSfShare);
 const geo=(h,i)=>({clinicalHealthyYears:h,incomeEquivalentYears:i,combinedEquivalentYears:h+i,donorUSDPer10ClinicalHealthyYears:h>0?10*x.gift/h:null,donorUSDPer10CombinedEquivalentYears:h+i>0?10*x.gift/(h+i):null});
 const out={version,clinicalIncidence:{activePositiveRoutes:activeClinical,distinctClinicalRoutes:[...clinicalDeclared],status:activeClinical.length>1?'explicit unverified distinct clinical-increment hypothesis':'at most one positive clinical route'},householdIncidence:{activeCashRoutes:activeCash,disjointHouseholdRoutes:[...declared],status:activeCash.length>1?'explicit unverified disjoint-household hypothesis':'at most one active cash cohort; cross-route overlap unsupported'},classification:'conditional finite portfolio sensitivity; not ordinary unrestricted-gift expected value',donorUSD:x.gift,grossResourceFloorUSD:x.gift+knownExternal,grossResourceUSD:completeGross?x.gift+knownExternal:null,completeGrossKnown:completeGross,ordinaryGiftExpectedValue:null,weightedExpectedValue:null,routes,inducedIncomeEquivalentYears:induced,geography:{sf:geo(healthSF,incomeSF),restBay:geo(healthRest,incomeRest),bayIncludingSF:geo(healthSF+healthRest,incomeSF+incomeRest)},unknownChannels:['ordinary gift allocation/capacity and financial additionality','actual full supported-course marginal costs','local causal clinical utility, retention, counterfactual access and overlap','net household earnings/transfers/access/medical savings and burdens','distinct child households and cross-program duplication','external school/government/provider/capital costs and rest-of-US displacement']};finiteTree(out);return out;
}
const allAdditionality=a=>Object.fromEntries(Object.keys(defaults.routes).map(k=>[k,{additionality:a}]));
const externalZero=()=>Object.fromEntries(Object.keys(defaults.routes).map(k=>[k,{externalPerUnit:0}]));
export const cases={
 central:{},
 nullAdditionality:{distinctClinicalRoutes:[],routes:allAdditionality(0)},
 nullClinical:{distinctClinicalRoutes:[],routes:Object.fromEntries(Object.keys(defaults.routes).map(k=>[k,{healthPerUnit:0}]))},
 therapyConditional:{distinctClinicalRoutes:['fitness','dpp','mental'],routes:{mental:{healthPerUnit:.2*.1,healthYears:.5}}},
 legacyFamilyUtilityConditional:{distinctClinicalRoutes:['fitness','dpp','family'],routes:{family:{healthPerUnit:.2*.02,healthYears:.25}}},
 familyFoodAccessConditional:{routes:{family:{accessSaving:100,travel:20,care:10}}},
 youthChildcareSubstitution:{routes:{youth:{accessSaving:500,fees:100,travel:50,care:25}}},
 youthActualTakeHomePay:{routes:{youth:{realizedTakeHomePay:500,fees:100,travel:50,care:25}}},
 feeReliefNoNewClinicalAccess:{routes:{aquatics:{additionality:0,resourceAdditionality:1,accessSaving:51}}},
 swimPriceSubstitution:{routes:{aquatics:{accessSaving:216,fees:165,travel:20,care:10}}},
 medicalOutOfPocketConditional:{routes:{dpp:{medicalSaving:100,resourceDelay:3}}},
 familyNetTransferConditional:{routes:{family:{netTransfer:100,displacedResources:50,travel:20}}},
 participationBurdens:{disjointHouseholdRoutes:Object.keys(defaults.routes),routes:Object.fromEntries(Object.keys(defaults.routes).map(k=>[k,{travel:20,care:20,lostActualPay:20}]))},
 positiveOverlapZeroBurdenRetained:{routes:{family:{accessSaving:100,positiveResourceIndependentShare:0,travel:20,care:10}}},
 mixedPositiveGrossNegativeNet:{routes:{youth:{realizedTakeHomePay:1,fees:10,resourceDelay:0}}},
 negativeClinical:{routes:{mental:{healthPerUnit:-.01},family:{clinicalHarm:.005}}},
 healthOverlapHalf:{routes:{fitness:{positiveHealthIndependentShare:.5},dpp:{positiveHealthIndependentShare:.5}}},
 nullWithIndependentHarm:{distinctClinicalRoutes:[],routes:allAdditionality(0),independentClinicalHarmSF:.1,independentClinicalHarmRestBay:.1,inducedHouseholds:1,inducedNetResources:-100},
 knownConditionalGross:{routes:externalZero()},
 partialKnownGross:{routes:{fitness:{externalPerUnit:100}}},
 distinctHouseholdGeography:{disjointHouseholdRoutes:['family','youth'],routes:{family:{accessSaving:100,healthSfShare:.5,householdSfShare:1},youth:{accessSaving:100,householdSfShare:.4}}},
 campFiniteAccessConditional:{routes:{campOther:{accessSaving:100,travel:30,care:20}}},
 aquaticsFiniteClinicalConditional:{distinctClinicalRoutes:['fitness','dpp','aquatics'],routes:{aquatics:{healthPerUnit:.001,healthYears:.25,clinicalHarm:.0001}}},
 zeroGift:{gift:0,distinctClinicalRoutes:[]},
 smallGift:{gift:1000},
 dppNoEffect:{distinctClinicalRoutes:['fitness'],routes:{dpp:{healthPerUnit:0}}},
 clinicalDelay:{routes:{fitness:{healthDelay:1},dpp:{healthDelay:4}}}
};
export function selfTest(){let assertions=0;const check=(b,label)=>{assertions++;if(!b)throw Error(label);};const all=Object.fromEntries(Object.entries(cases).map(([k,v])=>[k,calculate(v)]));
 check(all.central.grossResourceUSD===null&&!all.central.completeGrossKnown,'unknown complete gross');check(all.knownConditionalGross.completeGrossKnown,'conditional specified gross');check(all.partialKnownGross.grossResourceFloorUSD===100000+20000/600*100&&all.partialKnownGross.grossResourceUSD===null,'known floor not false total');
 check(all.nullAdditionality.geography.bayIncludingSF.combinedEquivalentYears===0,'null successful delivery');check(all.feeReliefNoNewClinicalAccess.routes.aquatics.clinicalHealthyYears===0&&all.feeReliefNoNewClinicalAccess.routes.aquatics.incomeEquivalentYears>0,'fee relief independent of new clinical access');check(all.nullWithIndependentHarm.geography.bayIncludingSF.combinedEquivalentYears<-.2,'induced burden independent');check(all.positiveOverlapZeroBurdenRetained.routes.family.netHouseholdAnnualResourcesUSD===-30,'negative rows not attenuated');check(all.mixedPositiveGrossNegativeNet.routes.youth.netHouseholdAnnualResourcesUSD===-9,'mixed negative net');check(all.negativeClinical.routes.mental.clinicalHealthyYears<0,'adverse clinical');check(all.zeroGift.donorUSD===0&&all.zeroGift.geography.sf.combinedEquivalentYears===0,'zero gift');
 for(const r of Object.values(all))check(Math.abs(r.geography.sf.combinedEquivalentYears+r.geography.restBay.combinedEquivalentYears-r.geography.bayIncludingSF.combinedEquivalentYears)<1e-12,'geographic conservation');
 for(const o of [null,[],{gift:100001},{discount:NaN},{unknown:1},{routes:{unknown:{}}},{routes:{family:{cost:0}}},{routes:{mental:{healthYears:100}}},{routes:{youth:{resourceYears:20}}},{routes:{family:{travel:50001}}},{routes:{family:{externalPerUnit:-1}}},{routes:{family:{householdsPerUnit:3}}},{routes:{family:{cost:1e-320}}}]){let rejected=false;try{calculate(o);}catch{rejected=true;}check(rejected,'rejected bad input');}
 return {caseCount:Object.keys(all).length,assertions,all};}

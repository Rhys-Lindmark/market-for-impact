import {incomeHealthyYearEquivalent as equivalence} from './income-health-equivalence.mjs';

export const central={id:'central-judgment',activityStatus:'judgment',healthStatus:'judgment',resourceStatus:'judgment',institutionalStatus:'judgment',G:10000,cashCase:3000,funding:.5,capacity:5,g:1,delay:.25,discount:.03,purchaseShare:.1,du:.04,T:3,mortality:.01,clinicalAdditionality:.6,h:.01,donorHarm:0,purchaseCash:600,recipientIncome:30000,nonbuyerTravel:30,nonbuyerLostPay:150,nonbuyerMedication:20,buyerIncrementalBurden:30,recoveryShare:.25,earningsGain:500,incomeYears:2,incomeIndependent:.25,volunteersPerCase:5,volunteerCash:10,volunteerIncome:60000,volunteerIndependent:1,donatedResourcePerAddedCase:5000,complicationResourcePerAddedCase:200};
const activity=['G','cashCase','funding','capacity','g','delay','discount','purchaseShare'];
const health=['du','T','mortality','clinicalAdditionality','h','donorHarm'];
const resources=['purchaseCash','recipientIncome','nonbuyerTravel','nonbuyerLostPay','nonbuyerMedication','buyerIncrementalBurden','recoveryShare','earningsGain','incomeYears','incomeIndependent','volunteersPerCase','volunteerCash','volunteerIncome','volunteerIndependent'];
const institutional=['donatedResourcePerAddedCase','complicationResourcePerAddedCase'];
const groups={activityStatus:activity,healthStatus:health,resourceStatus:resources,institutionalStatus:institutional};
const fractions=['funding','g','purchaseShare','mortality','clinicalAdditionality','recoveryShare','incomeIndependent','volunteerIndependent'];
const nonnegative=['G','capacity','delay','discount','h','donorHarm','purchaseCash','nonbuyerTravel','nonbuyerLostPay','nonbuyerMedication','buyerIncrementalBurden','volunteersPerCase','volunteerCash','donatedResourcePerAddedCase','complicationResourcePerAddedCase'];
export function validate(p){
 if(!p||Object.getPrototypeOf(p)!==Object.prototype||typeof p.id!=='string'||!p.id)throw Error('Required plain scenario object/id');
 const allowed=new Set(['id',...Object.keys(groups),...Object.values(groups).flat()]);
 for(const key of Object.keys(p))if(!allowed.has(key))throw Error(`Unexpected parameter ${key}`);
 for(const [status,keys] of Object.entries(groups)){
  if(!Object.hasOwn(p,status)||!['observed','derived','judgment','unknown'].includes(p[status]))throw Error(`Required valid ${status}`);
  for(const key of keys){if(!Object.hasOwn(p,key))throw Error(`Missing required ${key}`);if(p[key]===null&&p[status]==='unknown')continue;if(typeof p[key]!=='number'||!Number.isFinite(p[key]))throw Error(`Required finite ${key} (or explicit unknown/null)`);}
 }
 for(const key of fractions)if(p[key]!==null&&(p[key]<0||p[key]>1))throw Error(`Fraction ${key}`);
 for(const key of nonnegative)if(p[key]!==null&&p[key]<0)throw Error(`Negative ${key}`);
 if(!Number.isFinite(p.G)||p.G<0||p.G>25000)throw Error('Gift domain0–25000USD; not verified capacity');
 if(p.cashCase!==null&&p.cashCase<=0)throw Error('Positive case cash cost');
 if(p.du!==null&&(p.du< -1||p.du>1))throw Error('Signed utility domain');
 for(const key of ['T','incomeYears'])if(p[key]!==null&&(!Number.isInteger(p[key])||p[key]<0||p[key]>(key==='T'?40:10)))throw Error(`Finite integer horizon ${key}`);
 if(p.resourceStatus!=='unknown'){
  const burden=p.nonbuyerTravel+p.nonbuyerLostPay+p.nonbuyerMedication;
  if(p.recipientIncome<=0||p.volunteerIncome<=0||p.recipientIncome-burden<=0||p.recipientIncome-burden+p.earningsGain<=0||p.recipientIncome+p.purchaseCash-p.buyerIncrementalBurden<=0||p.volunteerIncome-p.volunteerCash<=0||p.recipientIncome+p.earningsGain<=0)throw Error('All post-cash incomes must remain positive');
 }
}
const price=(cost,q)=>q!==null&&q>0&&Number.isFinite(10*cost/q)?10*cost/q:null;
function eq(people,before,gain,years,p,delay=p.delay){return people>0&&years>0?equivalence({people,annualIncomeBeforeUSD:before,annualIncomeGainUSD:gain,years,causalShare:1,editionShare:p.g,independentShare:1,delayYears:delay,discountRate:p.discount}):0;}
export function calculate(p){
 validate(p);
 if(p.activityStatus==='unknown')return {id:p.id,status:'unknown-activity',parameters:p,healthQalysUSA:null,resourceEquivalentUSA:null,combinedEquivalentUSA:null,healthDonationPricePer10USD:null,combinedDonationPricePer10USD:null,grossInstitutionalEnvelopeUSD:null};
 const nominal=p.G/p.cashCase,uncapped=nominal*p.funding,N=Math.min(uncapped,p.capacity),buyers=N*p.purchaseShare,nonbuyers=N-buyers;
 let gross=null,netCase=null,H=null;
 if(p.healthStatus!=='unknown'){gross=0;for(let y=1;y<=p.T;y++)gross+=p.du*(1-p.mortality)**y/(1+p.discount)**(y+p.delay);netCase=p.clinicalAdditionality*gross-p.h/(1+p.discount)**p.delay;H=p.g*(nonbuyers*netCase-p.donorHarm);}
 let I=null,cash=null,earningsCash=null,retainedEarn=null,volunteerCash=null,directI=null,earningsI=null,volunteerI=null;
 if(p.resourceStatus!=='unknown'){
  const burden=p.nonbuyerTravel+p.nonbuyerLostPay+p.nonbuyerMedication;
  directI=eq(buyers,p.recipientIncome,p.purchaseCash-p.buyerIncrementalBurden,1,p)+eq(nonbuyers,p.recipientIncome,-burden,1,p);
  cash=p.g*(buyers*(p.purchaseCash-p.buyerIncrementalBurden)-nonbuyers*burden);
  // Only common-alive nonpurchasers with incremental functional recovery earn.
  // Clinical additionality is required to identify that counterfactual cohort.
  if(p.healthStatus==='unknown'){earningsCash=null;earningsI=null;retainedEarn=null;}
  else{
   const recovered=nonbuyers*p.recoveryShare*p.clinicalAdditionality;
   earningsCash=p.g*recovered*p.earningsGain*p.incomeYears;
   // First-year log increment uses income AFTER the contemporaneous burden,
   // so first-year burden plus earnings is not incorrectly log-averaged.
   earningsI=p.incomeYears>0?eq(recovered,p.recipientIncome-burden,p.earningsGain,1,p):0;
   for(let y=1;y<p.incomeYears;y++)earningsI+=eq(recovered,p.recipientIncome,p.earningsGain,1,p,p.delay+y);
   earningsI*=p.incomeIndependent;retainedEarn=earningsCash*p.incomeIndependent;
  }
  const volunteers=N*p.volunteersPerCase;
  volunteerCash=-p.g*volunteers*p.volunteerCash;
  volunteerI=eq(volunteers,p.volunteerIncome,-p.volunteerCash,1,p)*p.volunteerIndependent;
  I=earningsI===null?null:directI+earningsI+volunteerI;
 }
 const C=p.institutionalStatus==='unknown'?null:p.G+N*(p.donatedResourcePerAddedCase+p.complicationResourcePerAddedCase);
 const combined=H===null||I===null?null:H+I;
 const out={id:p.id,parameters:p,nominalPatientEquivalents:nominal,uncappedAddedPatientEquivalents:uncapped,additionalPatientEquivalents:N,capacityBinding:N<uncapped,buyersWithEquivalentAlternativeCare:buyers,healthEligibleNonbuyers:nonbuyers,grossQalyPerNonbuyer:gross,netQalyPerNonbuyer:netCase,healthQalysUSA:H,directRecipientNetCashUSA:cash,functionalRecoveryGrossCashUSA:earningsCash,overlapRetainedFunctionalCashDiagnosticUSA:retainedEarn,volunteerNetCashUSA:volunteerCash,directRecipientEquivalentUSA:directI,functionalRecoveryIndependentEquivalentUSA:earningsI,volunteerEquivalentUSA:volunteerI,resourceEquivalentUSA:I,combinedEquivalentUSA:combined,grossInstitutionalEnvelopeUSD:C,healthDonationPricePer10USD:price(p.G,H),resourceDonationPricePer10USD:price(p.G,I),combinedDonationPricePer10USD:price(p.G,combined),healthGrossResourcePricePer10USD:C===null?null:price(C,H),combinedGrossResourcePricePer10USD:C===null?null:price(C,combined)};
 for(const [key,value] of Object.entries(out))if(typeof value==='number'&&!Number.isFinite(value))throw Error(`Nonfinite output ${key}`);
 return out;
}
export function originalUSA(){const scenarios=[['central',3000,.6,.6,.05,5,.01,.01,1,10000],['favorable',1500,.9,.9,.12,10,.01,.01,1,10000],['pessimistic',5000,.2,.2,.01,2,.02,.005,.99,10000],['zero-additionality',3000,0,.6,.05,5,.01,.01,1,10000],['equivalent-care-harm',3000,.6,0,.05,5,.01,.01,1,10000],['one-year-relief',3000,.6,.6,.05,1,.01,.01,1,10000],['timing-only-one-year',3000,.6,1,.05,1,.01,.01,1,10000],['higher-treatment-burden',3000,.6,.6,.05,5,.01,.05,1,10000],['resource-cost-added',3000,.6,.6,.05,5,.01,.01,1,20000],['resource-cost',3000,.6,.6,.05,5,.01,.01,1,26666.666666666668]];return scenarios.map(([id,c,b,s,u,T,m,h,g,cost])=>{let gross=0;for(let t=1;t<=T;t++)gross+=u*(1-m)**t/1.03**t;let Q=(10000/c)*b*(s*gross-h)*g;return {id,costUSD:cost,editionQalys:Q,pricePer10USD:price(cost,Q)};});}
export const scenarios=[central,
 {...central,id:'prior-utility-.05',du:.05},
 {...central,id:'prior-funding-.6',funding:.6},
 {...central,id:'no-purchaser-partition',purchaseShare:0},
 {...central,id:'no-procedure-delay',delay:0},
 {...central,id:'prior-clinical-assumptions',funding:.6,du:.05,T:5,purchaseShare:0,delay:0},
 {...central,id:'favorable-severe-selection',cashCase:1500,funding:.85,du:.1,T:8,clinicalAdditionality:.85,h:.005,purchaseShare:.05,incomeIndependent:.5,earningsGain:1500,volunteerCash:5},
 {...central,id:'mild-delayed-access-downside',cashCase:5000,funding:.2,du:.015,T:1,clinicalAdditionality:.2,h:.015,recoveryShare:.05,incomeIndependent:0,purchaseShare:0,nonbuyerTravel:100,nonbuyerLostPay:300},
 {...central,id:'zero-funding',funding:0},
 {...central,id:'zero-capacity',capacity:0},
 {...central,id:'zero-gift',G:0},
 {...central,id:'clinical-null-with-treatment-harm',du:0},
 {...central,id:'equivalent-benefit-elsewhere-harm',clinicalAdditionality:0},
 {...central,id:'all-purchased-equivalent-care',purchaseShare:1},
 {...central,id:'no-actual-purchase-savings',purchaseShare:0,purchaseCash:0},
 {...central,id:'one-year-relief',T:1},
 {...central,id:'two-year-relief',T:2},
 {...central,id:'five-year-relief',T:5},
 {...central,id:'ten-year-relief',T:10},
 {...central,id:'higher-treatment-harm',h:.05},
 {...central,id:'negative-functional-cash',earningsGain:-500,incomeIndependent:1},
 {...central,id:'no-independent-earnings',incomeIndependent:0},
 {...central,id:'full-independent-earnings',incomeIndependent:1},
 {...central,id:'no-recipient-burden',nonbuyerTravel:0,nonbuyerLostPay:0,nonbuyerMedication:0,buyerIncrementalBurden:0},
 {...central,id:'cash-positive-purchaser-heavy',purchaseShare:.3,purchaseCash:1500,nonbuyerLostPay:50},
 {...central,id:'volunteer-paid-work-displacement-stress',volunteerCash:200},
 {...central,id:'independent-harm-no-activity',funding:0,donorHarm:.01},
 {...central,id:'survival-.03',mortality:.03},
 {...central,id:'discount-.05',discount:.05},
 {...central,id:'domestic-share-.99',g:.99},
 {...central,id:'lower-cash-cost',cashCase:2000},
 {...central,id:'higher-cash-cost',cashCase:4500},
 {...central,id:'no-donated-resource-opportunity-cost',donatedResourcePerAddedCase:0},
 {...central,id:'higher-donated-resource-cost',donatedResourcePerAddedCase:10000},
 {...central,id:'income-unknown',resourceStatus:'unknown',...Object.fromEntries(resources.map(k=>[k,null]))},
 {...central,id:'clinical-unknown',healthStatus:'unknown',...Object.fromEntries(health.map(k=>[k,null]))},
 {...central,id:'institutional-resource-unknown',institutionalStatus:'unknown',...Object.fromEntries(institutional.map(k=>[k,null]))},
 {...central,id:'whole-route-unknown',activityStatus:'unknown',cashCase:null,funding:null,capacity:null}
];
export function packet(){return {domain:{giftMaximumUSD:25000,capacityCapAddedPatients:5,capIsJudgmentNotVerifiedOffer:true,noUnlimitedLinearScaling:true},originalUSA:originalUSA(),scenarios:scenarios.map(calculate)};}

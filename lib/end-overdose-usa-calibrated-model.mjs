// Candidate implementation only: not accepted or wired to public report until
// independent source/model review and release checks pass.
import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export const central={id:'central-judgment',G:10000,a:.65,c:40,b:.45,q:.75,e:.007,k:.55,t:.35,d:.6,f:.12,m1:.08,m:.05,T:20,u:.8,g:.995,delay:.5,discount:.03,h:0,donorHarm:0,stock:15,unpaid:8,ems:500,purchaseShare:.05,purchaseCash:20,shippingShare:.4,incrementalShippingCash:6,incomeBefore:30000,incomeIndependent:1,commonAliveShare:0,commonAliveIncomeDelta:0,commonAliveIncomeBefore:22000,commonAliveIndependent:0};
export function validate(p){
 if(p===null||typeof p!=='object'||Array.isArray(p)||Object.getPrototypeOf(p)!==Object.prototype)throw new TypeError('Plain inputs required');
 for(const key of Object.keys(central)){
  if(!Object.hasOwn(p,key))throw new TypeError(`Missing ${key}`);
  if(key==='id'){if(typeof p.id!=='string')throw new TypeError('Scenario ID must be text');}
  else if(typeof p[key]!=='number'||!Number.isFinite(p[key]))throw new TypeError(`Invalid ${key}`);
 }
 for(const key of Object.keys(p))if(!Object.hasOwn(central,key))throw new TypeError(`Unknown ${key}`);
 for(const [key,v] of Object.entries(p))if(key!=='id'&&(!Number.isFinite(v)))throw new TypeError(`Nonfinite ${key}`);
 for(const key of ['a','b','q','e','k','t','d','m1','m','u','g','purchaseShare','shippingShare','incomeIndependent','commonAliveShare','commonAliveIndependent'])if(p[key]<0||p[key]>1)throw new RangeError(key);
 if(p.G<0||p.G>100000||p.c<=0||p.f < -1||p.f>1||!Number.isInteger(p.T)||p.T<0||p.T>120||p.discount<0||p.delay<0||p.incomeBefore<=0||p.commonAliveIncomeBefore<=0)throw new RangeError('Domain');
 for(const key of ['h','donorHarm','stock','unpaid','ems','purchaseCash','incrementalShippingCash'])if(p[key]<0)throw new RangeError(key);
 if(p.incomeBefore-p.incrementalShippingCash<=0||p.commonAliveIncomeBefore+p.commonAliveIncomeDelta<=0)throw new RangeError('Positive income required');
 if(p.commonAliveShare>1-Math.abs(p.f))throw new RangeError('Common-alive and survival-changed cohorts must not overlap');
}
const price=(cost,q)=>q>0&&Number.isFinite(10*cost/q)?10*cost/q:null;
export function life(p){let survival=1,L=0;for(let y=1;y<=p.T;y++){let next=survival*(1-(y===1?p.m1:p.m));L+=p.u*(survival+next)/2/(1+p.discount)**(y-.5+p.delay);survival=next;}return {L,survivalAtHorizon:survival};}
export function calculate(p,unknown={}){
 if(unknown===null||typeof unknown!=='object'||Array.isArray(unknown))throw new TypeError('Unknown-state flags required');
 for(const [key,value] of Object.entries(unknown))if(!['health','income','response'].includes(key)||typeof value!=='boolean')throw new TypeError('Invalid unknown-state flag');
 validate(p);const N=p.G*p.a/p.c,A=N*p.b,D=A*p.q;
 // Would-be actual purchasers are excluded BEFORE applying other-responder t.
 // t is conditional on this nonpurchaser pool; this is not an additional
 // discount on a t parameter already defined as including purchaser alternatives.
 const healthEligible=D*(1-p.purchaseShare),R=healthEligible*p.e*p.k*p.t*p.d,Z=R*p.f;
 const {L,survivalAtHorizon}=life(p),H=p.g*(Z*L-R*p.h-p.donorHarm);
 let income=0,netCash=0;
 for(const [buyer,buyerShare] of [[true,p.purchaseShare],[false,1-p.purchaseShare]])for(const [mailed,mailShare] of [[true,p.shippingShare],[false,1-p.shippingShare]]){
  const people=D*buyerShare*mailShare,gain=(buyer?p.purchaseCash:0)-(mailed?p.incrementalShippingCash:0);
  if(people>0){income+=incomeHealthyYearEquivalent({people,annualIncomeBeforeUSD:p.incomeBefore,annualIncomeGainUSD:gain,years:1,causalShare:1,editionShare:p.g,independentShare:p.incomeIndependent,delayYears:p.delay,discountRate:p.discount});netCash+=people*gain*p.g;}
 }
 const commonAlivePeople=R*p.commonAliveShare;
 const aliveResource=commonAlivePeople>0?incomeHealthyYearEquivalent({people:commonAlivePeople,annualIncomeBeforeUSD:p.commonAliveIncomeBefore,annualIncomeGainUSD:p.commonAliveIncomeDelta,years:1,causalShare:1,editionShare:p.g,independentShare:p.commonAliveIndependent,delayYears:p.delay,discountRate:p.discount}):0;
 const costs=p.G+N*(p.stock+p.unpaid)+R*p.ems;
 const result={id:p.id,parameters:p,nominalOffers:N,additionalOffers:A,additionalDeliveredKits:D,doses:2*D,healthEligibleNonpurchaserKits:healthEligible,uniqueCreditedAdditionalAdministrations:R,additionalThreeDaySurvivors:Z,finiteQalyPerThreeDaySurvivorAtGift:L,survivalAtHorizon,healthQalysUSA:H,directHouseholdNetCashUSA:netCash,householdPurchaseCashUSA:D*p.purchaseShare*p.purchaseCash*p.g,householdIncrementalShippingCashUSA:D*p.shippingShare*p.incrementalShippingCash*p.g,directHouseholdHealthyYearEquivalentUSA:income,conditionalAliveCashUSA:commonAlivePeople*p.commonAliveIncomeDelta*p.g,conditionalAliveHealthyYearEquivalentUSA:aliveResource,resourceEquivalentUSA:income+aliveResource,combinedEquivalentUSA:H+income+aliveResource,grossInstitutionalEnvelopeUSD:costs,healthDonationPricePer10USD:price(p.G,H),healthResourcePricePer10USD:price(costs,H),resourceDonationPricePer10USD:price(p.G,income+aliveResource),combinedDonationPricePer10USD:price(p.G,H+income+aliveResource),combinedResourcePricePer10USD:price(costs,H+income+aliveResource)};
 if(unknown.response){
  for(const key of ['nominalOffers','additionalOffers','additionalDeliveredKits','doses','healthEligibleNonpurchaserKits','uniqueCreditedAdditionalAdministrations','additionalThreeDaySurvivors','directHouseholdNetCashUSA','householdPurchaseCashUSA','householdIncrementalShippingCashUSA','conditionalAliveCashUSA','grossInstitutionalEnvelopeUSD'])result[key]=null;
 }
 if(unknown.health||unknown.response){result.healthQalysUSA=null;result.additionalThreeDaySurvivors=null;result.healthDonationPricePer10USD=null;result.healthResourcePricePer10USD=null;}
 if(unknown.income||unknown.response){result.directHouseholdHealthyYearEquivalentUSA=null;result.conditionalAliveHealthyYearEquivalentUSA=null;result.resourceEquivalentUSA=null;result.resourceDonationPricePer10USD=null;}
 if(unknown.health||unknown.income||unknown.response){result.combinedEquivalentUSA=null;result.combinedDonationPricePer10USD=null;result.combinedResourcePricePer10USD=null;}
 result.unknown={health:Boolean(unknown.health||unknown.response),income:Boolean(unknown.income||unknown.response),response:Boolean(unknown.response)};
 return result;
}
export const scenarios=[central,
 {...central,id:'favorable-targeting',a:.8,c:30,b:.75,q:.9,e:.025,k:.75,t:.5,d:.75,f:.2,m1:.055,m:.03,T:30,u:.85,purchaseShare:.1,purchaseCash:30,shippingShare:.2,incrementalShippingCash:4,stock:15,unpaid:5},
 {...central,id:'downside',a:.4,c:75,b:.2,q:.5,e:.002,k:.3,t:.15,d:.4,f:.05,m1:.12,m:.08,T:10,u:.7,purchaseShare:0,shippingShare:.6,incrementalShippingCash:10,unpaid:15},
 {...central,id:'zero-funding',b:0},
 {...central,id:'zero-completion',q:0},
 {...central,id:'zero-allocation',a:0},
 {...central,id:'no-added-rescue',t:0},
 {...central,id:'mortality-null',f:0},
 {...central,id:'independent-harm-at-zero-activity',b:0,donorHarm:.01},
 {...central,id:'acute-harm-only',f:0,h:.001},
 {...central,id:'cash-savings-positive',purchaseShare:.15,purchaseCash:30,shippingShare:.2,incrementalShippingCash:4},
 {...central,id:'no-actual-purchase-savings',purchaseShare:0,purchaseCash:0},
 {...central,id:'common-alive-financial-burden',commonAliveShare:.5,commonAliveIncomeDelta:-200,commonAliveIndependent:1},
 {...central,id:'common-alive-financial-gain',commonAliveShare:.5,commonAliveIncomeDelta:200,commonAliveIndependent:.5},
 {...central,id:'Ontario-first-year-stress',m1:.09},
 {...central,id:'ten-year-survival',T:10},
 {...central,id:'five-percent-discount',discount:.05},
 {...central,id:'utility-.6',u:.6},
 {...central,id:'complete-alternative-purchase',purchaseShare:1},
 {...central,id:'no-conditional-alive-independent-credit',commonAliveShare:.5,commonAliveIncomeDelta:200,commonAliveIndependent:0}
];
export function originalUSA(){const p={...central,G:100000,a:.75,c:50,b:.5,q:.8,e:.005,k:.5,t:.5,d:.5,f:.2,m1:.075,m:.04,T:20,u:.75,g:.99,delay:.5};const N=p.G*p.a/p.c,D=N*p.b*p.q,R=D*p.e*p.k*p.t*p.d,Z=R*p.f;const L=life(p).L,Q=Z*L*p.g;return {N,D,R,Z,L,Q,donorPricePer10USD:10*p.G/Q};}

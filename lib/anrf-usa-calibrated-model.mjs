// Conditional scientific proposal; no capacity promise. USD2024 cost proxy.
export const central={G:10000,C:3927527,N:25000,dp:.5,a:.2,f:.6,e:.9,T:5,retention:.95,cohortSurvival:.99,discount:.03,lag:1,rD:.0006,rM:.0015,excessRisk:.25,exposureRemoval:.5,transport:.5,lifeYears:20,rescuedSurvival:.98,utility:.85,qM:.3,h:.00002,g:.99,workerShare:.3,income:30000,wageRate:-.001,medicalCash:300,recoveryPay:500,recoveryIndependent:.5,attemptShare:.01,attemptCash:5,extraInstitutionalPerProtectionYear:25,reachKnown:true,healthKnown:true,resourcesKnown:true,grossKnown:true};
const ratios=['dp','a','f','e','retention','cohortSurvival','excessRisk','exposureRemoval','transport','rescuedSurvival','utility','g','workerShare','recoveryIndependent','attemptShare'];
function guard(p){if(!p||Object.getPrototypeOf(p)!==Object.prototype)throw Error('Plain complete inputs required');for(const k of Object.keys(p))if(!Object.hasOwn(central,k))throw Error('Unexpected input '+k);for(const k of Object.keys(central)){if(typeof central[k]==='boolean'){if(typeof p[k]!=='boolean')throw Error('Required boolean '+k);}else if(!Number.isFinite(p[k]))throw Error('Required finite '+k);}for(const k of ratios)if(p[k]<0||p[k]>1)throw Error('Invalid fraction '+k);if(p.G<0||p.G>25000||p.C<100000||p.C>1e9||p.N<0||p.N>1e6||!Number.isInteger(p.T)||p.T<1||p.T>20||!Number.isInteger(p.lifeYears)||p.lifeYears<1||p.lifeYears>40||p.discount<0||p.discount>.2||p.lag<0||p.lag>10||p.income<1000||p.income>1e6||p.wageRate<-.1||p.wageRate>.1)throw Error('Outside fixed comparison domain');for(const k of ['rD','rM','qM','h','medicalCash','recoveryPay','attemptCash','extraInstitutionalPerProtectionYear'])if(p[k]<0||p[k]>({rD:.02,rM:.1,qM:10,h:.1,medicalCash:10000,recoveryPay:10000,attemptCash:500,extraInstitutionalPerProtectionYear:1000}[k]))throw Error('Outside '+k);if(p.income-p.attemptCash<=0)throw Error('Nonpositive disposable resources');}
export function calculate(p){guard(p);let L=0;for(let k=1;k<=p.lifeYears;k++)L+=p.utility*p.rescuedSurvival**k/(1+p.discount)**k;const supported=p.G/p.C*p.N*p.a*p.f;const initial=supported*p.dp*p.e;let protection=0,clinicalYears=0,health=0,medicalEquivalent=0,earningsEquivalent=0,medicalUSD=0,earningsUSD=0,fatal=0,nonfatal=0;for(let t=1;t<=p.T;t++){const at=p.lag+t;const n=initial*(p.retention*p.cohortSurvival)**(t-1);const d=(1+p.discount)**at;const ramp=Math.min(1,t*.25);const event=p.rM*p.excessRisk*p.exposureRemoval*p.transport*ramp;const death=p.rD*p.excessRisk*p.exposureRemoval*p.transport*ramp;protection+=n/d;clinicalYears+=n*ramp/d;fatal+=n*death/d;nonfatal+=n*event/d;health+=n*(death*L+event*p.qM-p.h)/d;
 // Explicit worker/nonworker x avoided/nonavoided Bernoulli states per protection year.
 for(const worker of [false,true]){const share=worker?p.workerShare:1-p.workerShare;const wage=worker?p.income*p.wageRate:0;const afterWage=p.income+wage;earningsEquivalent+=n*share*.5*Math.log1p(wage/p.income)/d;medicalEquivalent+=n*share*event*.5*Math.log1p(p.medicalCash/afterWage)/d;const afterMedical=afterWage+p.medicalCash;earningsEquivalent+=n*share*event*(worker?1:0)*.5*Math.log1p(p.recoveryPay/afterMedical)*p.recoveryIndependent/d;medicalUSD+=n*share*event*p.medicalCash/d;earningsUSD+=n*share*(wage+event*(worker?p.recoveryPay:0))/d;}}
 const attempts=supported*p.attemptShare;
 const attemptEq=attempts*.5*Math.log1p(-p.attemptCash/p.income)/(1+p.discount)**.5;
 const harmCash=-attempts*p.attemptCash/(1+p.discount)**.5;
 // Unknown reach can have a numeric placeholder N=0; that is not a known zero.
 const noSupport=p.G===0||p.f===0||p.a===0||(p.reachKnown&&p.N===0);
 const noProtection=noSupport||p.dp===0||p.e===0;
 const noAttempts=noSupport||p.attemptShare===0||(p.resourcesKnown&&p.attemptCash===0);
 const reachKnown=p.reachKnown||noSupport;
 const protectedKnown=reachKnown||noProtection;
 const healthKnown=noProtection||(reachKnown&&p.healthKnown);
 const noEvents=noProtection||(p.healthKnown&&p.rM===0);
 const noWages=noProtection||p.workerShare===0||(p.resourcesKnown&&p.wageRate===0);
 const noMedical=noEvents||(p.resourcesKnown&&p.medicalCash===0);
 const noRecovery=noEvents||p.workerShare===0||(p.resourcesKnown&&p.recoveryPay===0);
 const wageKnown=noWages||(reachKnown&&p.resourcesKnown);
 const medicalKnown=noMedical||(reachKnown&&p.healthKnown&&p.resourcesKnown);
 const recoveryKnown=noRecovery||p.recoveryIndependent===0||(reachKnown&&p.healthKnown&&p.resourcesKnown);
 const rawRecoveryKnown=noRecovery||(reachKnown&&p.healthKnown&&p.resourcesKnown);
 const attemptKnown=noAttempts||(reachKnown&&p.resourcesKnown);
 const medicalUSA=medicalKnown?(noMedical?0:medicalEquivalent*p.g):null;
 const earningsUSA=wageKnown&&recoveryKnown?(noProtection?0:earningsEquivalent*p.g):null;
 const attemptUSA=attemptKnown?(noAttempts?0:attemptEq*p.g):null;
 const healthUSA=healthKnown?(noProtection?0:health*p.g):null;
 const resourcesUSA=[medicalUSA,earningsUSA,attemptUSA].includes(null)?null:medicalUSA+earningsUSA+attemptUSA;
 const combinedUSA=healthUSA===null||resourcesUSA===null?null:healthUSA+resourcesUSA;
 const gross=noProtection?p.G:(p.grossKnown&&reachKnown?p.G+protection*p.extraInstitutionalPerProtectionYear:null);
 const price=x=>x!==null&&x>0?10*p.G/x:null;
 const out={initialProtectedAll:protectedKnown?(noProtection?0:initial):null,discountedProtectionYearsAll:protectedKnown?(noProtection?0:protection):null,discountedClinicalExposureYearsAll:protectedKnown?(noProtection?0:clinicalYears):null,discountedFatalEventsAvoidedUSA:healthKnown?(noProtection?0:fatal*p.g):null,discountedNonfatalEventsAvoidedUSA:healthKnown?(noProtection?0:nonfatal*p.g):null,finiteLifeQALYs:p.healthKnown?L:null,healthUSA,medicalEquivalentUSA:medicalUSA,earningsEquivalentUSA:earningsUSA,attemptEquivalentUSA:attemptUSA,resourcesUSA,combinedUSA,householdMedicalPVUSDUSA:medicalKnown?(noMedical?0:medicalUSD*p.g):null,householdPayPVUSDUSA:wageKnown&&rawRecoveryKnown?(noProtection?0:earningsUSD*p.g):null,householdAttemptPVUSDUSA:attemptKnown?(noAttempts?0:harmCash*p.g):null,donorCostUSD:p.G,grossInstitutionalCostUSD:gross,donorHealthPrice10:price(healthUSA),donorCombinedPrice10:price(combinedUSA),grossCombinedPrice10:gross!==null&&combinedUSA!==null&&combinedUSA>0?10*gross/combinedUSA:null};
 if(Object.values(out).some(v=>typeof v==='number'&&!Number.isFinite(v)))throw Error('Nonfinite output');
 return out;
}
export function resourceFlows(p){
 const out=calculate(p);if(out.resourcesUSA===null)return null;
 const supported=p.G/p.C*p.N*p.a*p.f,initial=supported*p.dp*p.e,flows=[];
 const add=(id,people,before,gain,delay,independentShare=1)=>{
  if(people>0&&gain!==0&&independentShare>0)flows.push({id,people,annualIncomeBeforeUSD:before,annualIncomeGainUSD:gain,years:1,causalShare:1,editionShare:p.g,independentShare,delayYears:delay,discountRate:p.discount});
 };
 for(let t=1;t<=p.T;t++){
  const n=initial*(p.retention*p.cohortSurvival)**(t-1),at=p.lag+t,event=p.rM*p.excessRisk*p.exposureRemoval*p.transport*Math.min(1,t*.25);
  for(const worker of [false,true]){
   const share=worker?p.workerShare:1-p.workerShare,wage=worker?p.income*p.wageRate:0,afterWage=p.income+wage;
   add(`pay-${t}-${worker}`,n*share,p.income,wage,at);
   add(`medical-${t}-${worker}`,n*share*event,afterWage,p.medicalCash,at);
   if(worker)add(`recovery-${t}`,n*share*event,afterWage+p.medicalCash,p.recoveryPay,at,p.recoveryIndependent);
  }
 }
 add('attempt',supported*p.attemptShare,p.income,-p.attemptCash,.5);
 return flows;
}
export const scenarios={central:{},reachLow:{N:5000},reachHigh:{N:100000},positiveIncome:{wageRate:.001},noPayChange:{wageRate:0},germanFullTransportStress:{wageRate:-.024},zeroFunding:{f:0},noNewCapacity:{f:0},equivalentAlternative:{dp:0,attemptShare:0},failedAdvocacyOnly:{dp:0},nullClinical:{rD:0,rM:0,h:0},mortalityNull:{rD:0},healthHarm:{transport:0,h:.001},resourceUnknown:{resourcesKnown:false},healthUnknown:{healthKnown:false},reachUnknown:{reachKnown:false},zeroGift:{G:0},oneYearAcceleration:{T:1},lowRisk:{rD:.0002,rM:.0005},olderRisk:{rD:.002,rM:.003,lifeYears:8,rescuedSurvival:.95},noLatency:{lag:0},highImplementationBurden:{attemptCash:300,attemptShare:.2},grossUnknown:{grossKnown:false},recoveryOverlapFull:{recoveryIndependent:0}};
export function historical(p){let D=0,L=0;for(let t=1;t<=p.T;t++)D+=(p.retention*p.cohortSurvival)**(t-1)/(1+p.discount)**t;for(let k=1;k<=p.lifeYears;k++)L+=p.utility*p.rescuedSurvival**k/(1+p.discount)**k;const P=p.G/(p.C*p.annualCostMultiplier)*p.N*p.dp*p.a*p.f*p.e*D;const Q=P*((p.rD*L+p.rM*p.qM)*p.excessRisk*p.exposureRemoval*p.transport-p.h)*p.g;const cost=p.G+P*p.extraResourcePerPersonYear;return {healthUSA:Q,costUSD:cost,price10:Q>0?10*cost/Q:null};}

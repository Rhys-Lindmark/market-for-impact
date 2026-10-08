// Research candidate, not an accepted or verified marginal donation offer.
import {fileURLToPath} from 'node:url';
export const central=Object.freeze({G:10000,maxGift:25000,c:1500,b:.5,capacity:8,r:.65,purchaseShare:.05,s:.75,u:.025,T:3,L:1,m:.04,loss:.0625,catchup:.06,h:.0025,ha:.0002,g:1,d:.03,baseline:22000,applicationCash:20,applicationTime:.5,purchaseCash:300,purchaserTravel:20,freeAlternativeTravel:20,newCareTravel:80,newCareLostPay:30,maintenanceCash:40,maintenanceYears:2,workerShare:.1,annualNetPayGain:300,earningsYears:2,earningsDelay:1.5,incomeIndependent:.25,volunteerCash:0,volunteerBaseline:50000,volunteerTime:1,completedOpportunity:2000,unfinishedOpportunity:200,healthKnown:true,cashKnown:true,earningsKnown:true,fundingKnown:true,grossKnown:true});
const keys=Object.keys(central),flags=keys.filter(k=>typeof central[k]==='boolean');
const shares=['b','r','purchaseShare','s','g','workerShare','incomeIndependent'];
const signed=['annualNetPayGain'];
export function validate(p){
 if(!p||Object.getPrototypeOf(p)!==Object.prototype)throw Error('Inputs must be a plain object');
 if(Object.keys(p).length!==keys.length||keys.some(k=>!Object.hasOwn(p,k))||Object.keys(p).some(k=>!keys.includes(k)))throw Error('Missing or unexpected input');
 for(const k of keys){if(flags.includes(k)){if(typeof p[k]!=='boolean')throw Error('Invalid flag '+k);}else if(typeof p[k]!=='number'||!Number.isFinite(p[k])||(!signed.includes(k)&&p[k]<0))throw Error('Invalid numeric input '+k);}
 for(const k of shares)if(p[k]>1)throw Error('Invalid fraction '+k);
 if(p.c<=0||p.baseline<=0||p.volunteerBaseline<=0||p.maxGift<=0||p.G>p.maxGift||p.T>30||p.maintenanceYears>30||p.earningsYears>30||p.L>30||p.earningsDelay>60)throw Error('Outside finite model domain');
 if(p.baseline-p.applicationCash<=0||p.baseline-p.newCareTravel-p.newCareLostPay<=0||p.baseline-p.maintenanceCash<=0||p.baseline-p.purchaserTravel+p.purchaseCash<=0||p.baseline-p.freeAlternativeTravel<=0||p.volunteerBaseline-p.volunteerCash<=0||p.baseline-Math.max(p.newCareTravel+p.newCareLostPay,p.maintenanceCash)+p.annualNetPayGain<=0)throw Error('Nonpositive disposable resource denominator');
 return p;
}
function welfare(n,delta,baseline,time,d,ind=1){return n===0||delta===0?0:n*.5*Math.log1p(delta/baseline)/(1+d)**time*ind;}
const price=(cost,q)=>q===null?{status:'unknown',value:null}:q>0?{status:'positive',value:10*cost/q}:q===0?{status:'zero',value:null}:{status:'negative',value:null};
export function calculate(input){
 const p=validate(input),discount=Math.log1p(p.d),k=discount+p.m+p.loss+p.catchup;
 if(!p.fundingKnown&&p.G!==0)return {status:'unknown',healthUSA:null,resourcesUSA:null,combinedUSA:null,donorUSD:p.G,donorCombinedPrice:price(p.G,null)};
 const candidates=Math.min(p.G/p.c*p.b,p.capacity),completed=candidates*p.r,buyers=completed*p.purchaseShare,freeAlternative=completed*(1-p.purchaseShare)*(1-p.s),additional=completed*(1-p.purchaseShare)*p.s;
 const exposure=k===0?p.T:-Math.expm1(-k*p.T)/k,grossBenefit=p.u*Math.exp(-discount*p.L)*exposure;
 const clinical=additional*(grossBenefit-p.h*Math.exp(-discount*p.L))-candidates*p.ha;
 const healthUSA=candidates===0?0:p.healthKnown?p.g*clinical:null;
 let direct=welfare(candidates,-p.applicationCash,p.baseline,p.applicationTime,p.d)+welfare(buyers,p.purchaseCash-p.purchaserTravel,p.baseline,p.L,p.d)+welfare(freeAlternative,-p.freeAlternativeTravel,p.baseline,p.L,p.d)+welfare(additional,-p.newCareTravel-p.newCareLostPay,p.baseline,p.L,p.d);
 let rawCash=-candidates*p.applicationCash+buyers*(p.purchaseCash-p.purchaserTravel)-freeAlternative*p.freeAlternativeTravel-additional*(p.newCareTravel+p.newCareLostPay);
 for(let i=0;i<Math.ceil(p.maintenanceYears);i++){const f=Math.min(1,p.maintenanceYears-i),alive=Math.exp(-p.m*(i+1));direct+=welfare(additional*alive,-p.maintenanceCash*f,p.baseline,p.L+1+i,p.d);rawCash-=additional*alive*p.maintenanceCash*f;}
 direct+=welfare(completed,-p.volunteerCash,p.volunteerBaseline,p.volunteerTime,p.d);rawCash-=completed*p.volunteerCash;
 let earnings=0,rawPay=0;
 for(let i=0;i<Math.ceil(p.earningsYears);i++){const f=Math.min(1,p.earningsYears-i),postCompletion=Math.max(0,p.earningsDelay+i-p.L),active=Math.exp(-(p.m+p.loss+p.catchup)*postCompletion),workers=additional*p.workerShare*active,afterBurden=p.baseline-(i===0?p.newCareTravel+p.newCareLostPay:p.maintenanceCash);earnings+=welfare(workers,p.annualNetPayGain*f,afterBurden,p.earningsDelay+i,p.d,p.incomeIndependent);rawPay+=workers*p.annualNetPayGain*f;}
 const directKnown=candidates===0||p.cashKnown,zeroEarnings=additional*p.workerShare===0||p.annualNetPayGain===0||p.earningsYears===0,earningKnown=candidates===0||zeroEarnings||(p.earningsKnown&&p.healthKnown&&p.cashKnown);
 const resourcesUSA=directKnown&&earningKnown?p.g*(direct+earnings):null,combinedUSA=healthUSA!==null&&resourcesUSA!==null?healthUSA+resourcesUSA:null;
 const grossInstitutionalUSD=p.grossKnown?p.G+completed*p.completedOpportunity+(candidates-completed)*p.unfinishedOpportunity:null;
 return {status:combinedUSA===null?'unknown':combinedUSA>0?'positive':combinedUSA===0?'zero':'negative',candidates,completed,buyers,freeAlternative,additional,activeWorkerEquivalents:additional*p.workerShare,grossClinicalBenefitPerAdditionalCompletion:grossBenefit,healthUSA,directResourceEquivalentUSA:directKnown?p.g*direct:null,earningsEquivalentUSA:earningKnown?p.g*earnings:null,resourcesUSA,combinedUSA,rawDirectCashUSD:directKnown?p.g*rawCash:null,rawNetPayUSD:earningKnown?p.g*rawPay:null,donorUSD:p.G,grossInstitutionalUSD,donorHealthPrice:price(p.G,healthUSA),donorResourcePrice:price(p.G,resourcesUSA),donorCombinedPrice:price(p.G,combinedUSA),grossInstitutionalCombinedPrice:price(grossInstitutionalUSD, grossInstitutionalUSD===null?null:combinedUSA)};
}
export const historicalBase=Object.freeze({G:10000,c:1300,b:.5,r:.65,u:.03,T:3,L:.75,m:.04,loss:.0625,catchup:.06,s:.75,h:.001,ha:.0002,g:1,d:.03,resource:0,unfinishedResource:0,patientResource:0});
export function historical(p){const z=Math.log1p(p.d),k=z+p.m+p.loss+p.catchup,q=p.u*Math.exp(-z*p.L)*(k===0?p.T:-Math.expm1(-k*p.T)/k),N=p.G/p.c*p.b,C=N*p.r,Q=p.g*(C*(p.s*q-p.h*Math.exp(-z*p.L))-N*p.ha),cost=p.G+N*(p.r*p.resource+(1-p.r)*p.unfinishedResource+p.patientResource);return {Q,cost,price:price(cost,Q)};}
export const historicalCases=[
 ['central',{},.12224162318811595,10000],
 ['favorable',{c:675,b:.85,r:.9,u:.067,T:5,L:.25,m:.02,loss:.035,catchup:.05,s:.9,ha:.0001},2.456374588026909,10000],
 ['pessimistic',{c:2500,b:.2,r:.35,u:.005,T:1,L:1,m:.1,loss:.2,catchup:.7,s:.4,h:.0005,ha:.00005,g:.98},.00016027525659475825,10000],
 ['zero-capacity',{b:0},0,10000],['zero-completion',{r:0},-.0007692307692307693,10000],
 ['no-health-benefit',{u:0},-.0032144178366524515,10000],['same-time-alternative',{s:0},-.0032144178366524515,10000],
 ['low-completion',{r:.35},.06546738290010977,10000],['high-completion',{r:.9},.16955349009478776,10000],
 ['low-funding-response',{b:.1},.02444832463762319,10000],['one-year',{T:1},.04684166367487355,10000],
 ['high-mortality',{m:.1},.11258663209762748,10000],['fast-catchup',{catchup:1},.04375627621104104,10000],
 ['long-delay',{L:2,r:.6182991259254641,s:.6958076147464146},.1036876879976083,10000],
 ['more-burden',{h:.01,ha:.001},.09715801650439772,10000],
 ['resource-cost',{resource:2000,unfinishedResource:200,patientResource:100},.12224162318811595,15653.846153846154],
 ['resource-high',{resource:5000,unfinishedResource:400,patientResource:250},.12224162318811595,24000],['near-boundary',{g:.98},.11979679072435363,10000]
];
export const cases={central:{},favorable:{c:900,b:.8,r:.9,u:.05,L:.25,T:5,h:.001,workerShare:.2,annualNetPayGain:1000},pessimistic:{c:2500,b:.2,r:.35,u:.005,T:1,L:2,s:.4,m:.1,loss:.2,catchup:.7},zeroFunding:{b:0},zeroCompletion:{r:0},zeroGift:{G:0},purchasersOnly:{purchaseShare:1},sameTimeFreeCare:{s:0},clinicalNull:{u:0},noIncomeRecovery:{annualNetPayGain:0},incomeOverlap:{incomeIndependent:0},incomeIndependent:{incomeIndependent:1},incomeLoss:{annualNetPayGain:-1000},burdens:{newCareTravel:300,newCareLostPay:300,maintenanceCash:200,volunteerCash:50},healthUnknown:{healthKnown:false},incomeUnknown:{cashKnown:false,earningsKnown:false},fundingUnknown:{fundingKnown:false},grossUnknown:{grossKnown:false},fastAlternative:{catchup:1},shortBenefit:{T:1},longDelay:{L:2,earningsDelay:2.5},highMortality:{m:.15},capacityZero:{capacity:0},highOpportunity:{completedOpportunity:5000,unfinishedOpportunity:400},noClinicalOrResourceBurden:{u:0,h:0,ha:0,purchaseShare:0,applicationCash:0,newCareTravel:0,newCareLostPay:0,freeAlternativeTravel:0,maintenanceCash:0,volunteerCash:0,annualNetPayGain:0}};
export function selfTest(){
 const old=historicalCases.map(([id,override,Q,cost])=>{const result=historical({...historicalBase,...override});if(Math.abs(result.Q-Q)>1e-12||Math.abs(result.cost-cost)>1e-8)throw Error('Historical mismatch '+id);return {id,...result};});
 for(const bad of [{...central,c:0},{...central,G:25001},{...central,r:2},{...central,baseline:1},{...central,u:NaN},{...central,fundingKnown:'false'},Object.assign(Object.create(null),central),{...central,extra:1}]){let threw=false;try{calculate(bad);}catch{threw=true;}if(!threw)throw Error('Guard failed');}const missing={...central};delete missing.r;let caught=false;try{calculate(missing);}catch{caught=true;}if(!caught)throw Error('Missing input accepted');
 const scenarios=Object.fromEntries(Object.entries(cases).map(([id,over])=>[id,calculate({...central,...over})]));
 if(scenarios.purchasersOnly.healthUSA>=0||scenarios.zeroFunding.combinedUSA!==0||scenarios.healthUnknown.combinedUSA!==null||scenarios.noClinicalOrResourceBurden.combinedUSA!==0)throw Error('Boundary failed');
 return {historicalVerified:old.length,guardTests:9,historical:old,scenarios};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(selfTest(),null,2));

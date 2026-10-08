export const defaults={costUSD:980346,issues:365,tenantShare:.9,uniqueShare:.8,response:.4,geography:1,clinicalSuccess:.2,utility:.04,healthYears:.5,delay:.25,discount:.03,resourceSuccess:.15,moveGain:800,depositGain:300,workGain:200,positiveOverlap:.5,processCost:50,baseline:20000,resourceYears:1,harmPerHousehold:0,landlordIncidence:0,landlordPeople:20,landlordBaseline:50000,externalCost:0};
const positive=(x,k)=>x>0?x*k:x;
const years=(t,d,r)=>{let out=0;for(let i=0;i<t;i++){out+=Math.min(1,t-i)/(1+r)**(d+i)}return out};
export function calculate(overrides={}){
 const p={...defaults,...overrides};
 for(const [k,v] of Object.entries(p))if(!Number.isFinite(v))throw Error(k+' must be finite');
 for(const k of ['issues','costUSD','processCost','harmPerHousehold','externalCost','delay','discount','healthYears','resourceYears','landlordIncidence','landlordPeople'])if(p[k]<0)throw Error(k+' must be nonnegative');
 for(const k of ['tenantShare','uniqueShare','response','geography','clinicalSuccess','resourceSuccess','positiveOverlap','landlordIncidence'])if(p[k]<0||p[k]>1)throw Error(k+' must be in [0,1]');
 if(p.baseline<=0||p.landlordBaseline<=0)throw Error('positive consumption baseline required');
 const union=p.issues*p.tenantShare*p.uniqueShare*p.response*p.geography, clinicalPeople=union*p.clinicalSuccess, successPeople=union*p.resourceSuccess;
 const clinicalBenefit=clinicalPeople*p.utility*years(p.healthYears,p.delay,p.discount);
 const clinicalHarm=union*p.harmPerHousehold/(1+p.discount)**p.delay;
 const editionQalys=clinicalBenefit-clinicalHarm;
 // All gains are one-off, duration is exposure fraction (capped at one year), not repeated wages.
 const gainExposure=Math.min(1,p.resourceYears);
 const jointGain=(positive(p.moveGain,p.positiveOverlap)+positive(p.depositGain,p.positiveOverlap)+positive(p.workGain,p.positiveOverlap))*gainExposure;
 const incomePathways=[];
 const add=(id,people,net,baseline,rationale)=>{if(!people)return;if(net<=-baseline)throw Error('nonpositive after-consumption');incomePathways.push({id,people,annualIncome:baseline,annualIncomeGain:net,years:1,delayYears:p.delay,discountRate:p.discount,rationale,counterfactual:'Judged incremental versus existing city contract, alternative legal help and household resources; unknown wider incidence.',sourceIds:['mto-city26','mto-99025','cg-cost']})};
 add('successful-household-joint',successPeople,jointGain-p.processCost,p.baseline,'One household log: finite moving, deposit and net work components after positive-only overlap, less full one-off process burden.');
 add('other-exposed-households',union-successPeople,-p.processCost,p.baseline,'Full process burden retained without clinical or resource success.');
 if(p.landlordIncidence>0&&successPeople>0){if(p.landlordPeople<=0)throw Error('landlord units required');add('landlord-transfer-counterparty',p.landlordPeople,-successPeople*p.depositGain*gainExposure*p.landlordIncidence/p.landlordPeople,p.landlordBaseline,'Disjoint landlord households bear full deposit-transfer loss; no positive overlap discount.')}
 for(const x of incomePathways){x.annualIncomeBeforeUSD=x.annualIncome;x.annualIncomeGainUSD=x.annualIncomeGain;x.causalShare=1;x.editionShare=1;x.independentShare=1;delete x.annualIncome;delete x.annualIncomeGain;}
 const incomeEquivalent=incomePathways.reduce((s,x)=>s+.5*x.people*years(x.years,x.delayYears,x.discountRate)*Math.log1p(x.annualIncomeGainUSD/x.annualIncomeBeforeUSD),0);
 const totalEquivalent=editionQalys+incomeEquivalent,costUSD=p.costUSD+p.externalCost;
 return {costUSD,editionQalys,incomeEquivalent,incomeEquivalentYears:incomeEquivalent,incomePathways,totalEquivalent,combinedEquivalentYears:totalEquivalent,price10:totalEquivalent>0?10*costUSD/totalEquivalent:null,costPer10Qalys:totalEquivalent>0?10*costUSD/totalEquivalent:null,union,clinicalPeople,successPeople,clinicalBenefit,clinicalHarm,jointGain,inputs:p};
}
export const cases=[
 ['central',{}],['clinical-null',{utility:0}],['financial-only',{utility:0,harmPerHousehold:0}],['no-resource-gain',{moveGain:0,depositGain:0,workGain:0}],['zero-resource-duration',{resourceYears:0}],['zero-response',{response:0}],['no-positive-overlap',{positiveOverlap:0}],['full-positive-overlap-retention',{positiveOverlap:1}],['adverse',{utility:-.04,moveGain:-800,depositGain:-300,workGain:-200,harmPerHousehold:.005}],['negative-work-mixed',{workGain:-200}],['landlord-full-incidence',{landlordIncidence:1}],['historical-cost',{costUSD:795803}],['three-year-cost',{costUSD:880844.3333333334}],['broader-8000-high-duplication',{issues:8000,uniqueShare:.2}],['broader-10000-high-duplication',{issues:10000,uniqueShare:.2}],['union-harm',{harmPerHousehold:.005}],['extra-resource-cost',{externalCost:100000}],['unknown-total',null]
 ,['geography-half',{geography:.5}],['delay-two-years',{delay:2}],['resource-success-null',{resourceSuccess:0}],['negative-components-overlap-zero',{moveGain:-800,depositGain:-300,workGain:-200,positiveOverlap:0}],['negative-components-overlap-one',{moveGain:-800,depositGain:-300,workGain:-200,positiveOverlap:1}]
].map(([id,overrides])=>({id,overrides}));

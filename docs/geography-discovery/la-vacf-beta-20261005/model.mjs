import {incomeHealthyYearEquivalent} from './income-health-equivalence.mjs';
export const defaults={costUSD:2205208,activities:2499,hbvShare:.25,uniqueShare:.8,appropriateShare:1,additionalCare:.5,capacityShare:.25,clinicalTransfer:.25,qRef:.081,localShare:.95,members:1,baseline:30000,commonCost:50,resourceCareShare:.25,resourceGain:300,positiveOverlap:.5,disruption:200,falseAlarmShare:.05,falseAlarmCost:200,resourceYears:1,delay:0,discount:.03,providerUnits:10,providerMargin:0,clinicalHarmPerService:0,payerCostPerOffer:0,payerPeople:100};
export function calculate(overrides={}) {
 const p={...defaults,...overrides};for(const [k,v] of Object.entries(p))if(typeof v==='number'&&!Number.isFinite(v))throw Error(k);
 for(const k of ['hbvShare','uniqueShare','appropriateShare','additionalCare','capacityShare','clinicalTransfer','localShare','resourceCareShare','positiveOverlap','falseAlarmShare'])if(p[k]<0||p[k]>1)throw Error(k);
 if(p.resourceCareShare*p.additionalCare+p.falseAlarmShare>1||p.members<=0||p.baseline<=0||p.resourceYears<=0||p.delay<0||p.costUSD<=0||p.activities<0||p.providerUnits<=0||p.payerPeople<=0)throw Error('Invalid cohort');
 const servicePeople=p.activities*p.hbvShare*p.uniqueShare*p.capacityShare;
 const appropriatePeople=servicePeople*p.appropriateShare;
 const allHealth=(appropriatePeople*p.additionalCare*p.clinicalTransfer*p.qRef-servicePeople*p.clinicalHarmPerService)/(1+p.discount)**p.delay;
 const probability=p.additionalCare*p.resourceCareShare;
 const branches=[{id:'resource-care',share:probability,net:p.resourceGain*p.positiveOverlap-p.disruption-p.commonCost},{id:'false-alarm',share:p.falseAlarmShare,net:-p.falseAlarmCost-p.commonCost},{id:'other-service-users',share:1-probability-p.falseAlarmShare,net:-p.commonCost}];
 const pathways=branches.filter(x=>x.share>0&&servicePeople>0).map(x=>({id:x.id,households:servicePeople*x.share,membersPerHousehold:p.members,people:servicePeople*x.share*p.members,annualIncomeBeforeUSD:p.baseline,annualIncomeGainUSD:x.net,years:p.resourceYears,editionShare:p.localShare,delayYears:p.delay,discountRate:p.discount}));
 if(servicePeople>0&&p.providerMargin!==0)pathways.push({id:'private-provider-counterparty',people:p.providerUnits,annualIncomeBeforeUSD:60000,annualIncomeGainUSD:servicePeople*p.providerMargin/p.providerUnits,years:p.resourceYears,editionShare:p.localShare,delayYears:p.delay,discountRate:p.discount});
 if(servicePeople>0&&p.payerCostPerOffer!==0)pathways.push({id:'partner-payer-stress',people:p.payerPeople,annualIncomeBeforeUSD:50000,annualIncomeGainUSD:-appropriatePeople*p.additionalCare*p.clinicalTransfer*p.payerCostPerOffer/p.payerPeople,years:1,editionShare:p.localShare,delayYears:p.delay,discountRate:p.discount});
 for(const path of pathways){path.rationale='Conditional signed joint household resources; full costs and positive-only overlap before log. Participant branches are disjoint; counterparty stress cohorts are separate.';path.counterfactual='Existing care and public assistance without the additional ordinary-gift capacity; costs persist when clinical benefit fails. No survivor earnings.';path.sourceIds=['vacf-programs','vacf-99024','hbv-model'];}
 const income=pathways.reduce((a,x)=>a+incomeHealthyYearEquivalent(x),0);
 const health=p.clinicalUnknown?null:allHealth*p.localShare;
 const total=health===null||p.incomeUnknown?null:health+income;
 return {inputs:p,servicePeople,appropriatePeople,branches,incomePathways:pathways,allPopulationQalys:p.clinicalUnknown?null:allHealth,editionQalys:health,incomeUnknown:!!p.incomeUnknown,incomeEquivalent:income,totalEquivalent:total,price10:total>0?10*p.costUSD/total:null};
}
export const cases=[
 ['central',{}],['clinical-null',{clinicalTransfer:0}],['financial-only',{qRef:0}],['complete-unknown',{clinicalUnknown:true,incomeUnknown:true}],['income-unknown',{incomeUnknown:true}],['zero-expansion',{capacityShare:0}],['no-additional-care',{additionalCare:0}],
 ['low-clinical',{hbvShare:.1,uniqueShare:.5,additionalCare:.25,capacityShare:.1,clinicalTransfer:.1,localShare:.9}],
 ['high-clinical',{hbvShare:.5,uniqueShare:.95,additionalCare:.75,capacityShare:.5,clinicalTransfer:.75,localShare:1}],
 ['financial-gain',{resourceGain:1000,disruption:100}],['high-burden',{commonCost:200,falseAlarmCost:1000,disruption:1000}],
 ['zero-resource-gain',{resourceGain:0}],['no-positive-overlap',{positiveOverlap:1}],['all-positive-overlap',{positiveOverlap:0}],['poor-households',{baseline:15000}],['higher-baseline',{baseline:50000}],
 ['delay-two-years',{delay:2}],['three-year-resource-stress',{resourceYears:3}],['false-alarm-20pct',{falseAlarmShare:.2}],['clinical-adverse',{clinicalTransfer:0,clinicalHarmPerService:.005}],
 ['provider-margin-stress',{providerMargin:25}],['provider-loss-stress',{providerMargin:-25}],['unique-half',{uniqueShare:.5}],['half-appropriate',{appropriateShare:.5}],
 ['three-year-mean-cost',{costUSD:1531013.3333333333}],['no-resource-care',{resourceCareShare:0}],['vaccination-only-clinical',{qRef:.007}],['refugee-clinical',{qRef:.087}],['partner-cost-1459-stress',{payerCostPerOffer:1459}],['partner-cost-5000-stress',{payerCostPerOffer:5000}]
];
export function serializedScenarios(){return cases.map(([id,inputs])=>({id,label:id.replaceAll('-',' '),costUSD:calculate(inputs).inputs.costUSD,...calculate(inputs),assumptions:'Conditional judgment-led reference; resource branches are mutually exclusive household-year outcomes, not observed patient cohorts.'}));}
